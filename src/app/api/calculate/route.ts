import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { calculateOrder } from "@/lib/calculator";
import {
  CalculationRequest,
  CalculationResponse,
  OrderItem,
  Product,
} from "@/types";

/**
 * POST /api/calculate
 *
 * Body: { items: { productId, quantity }[], memberCardNumber?: string }
 *
 * Rules enforced here (beyond pure maths):
 *  - Red set is limited to one order per hour across all customers.
 *  - After a successful calculation the order is persisted for audit / rate-limit.
 */
export async function POST(req: NextRequest) {
  let body: CalculationRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, memberCardNumber } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "items must be a non-empty array" },
      { status: 400 }
    );
  }

  // Validate line-item shape
  for (const item of items as OrderItem[]) {
    if (
      typeof item.productId !== "number" ||
      typeof item.quantity !== "number" ||
      item.quantity < 0
    ) {
      return NextResponse.json(
        { error: "Each item must have a numeric productId and quantity ≥ 0" },
        { status: 400 }
      );
    }
  }

  try {
    // ── Load products ───────────────────────────────────────────────────────
    const products = await query<Product>(
      "SELECT id, name, price::float AS price, color, discountable FROM products"
    );

    // ── Red-set hourly restriction ──────────────────────────────────────────
    const redProduct = products.find((p) => p.name === "ผัดไทยไฟแดง");
    const wantsRedSet =
      redProduct &&
      items.some(
        (item) => item.productId === redProduct.id && item.quantity > 0
      );

    if (wantsRedSet) {
      const row = await queryOne<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM   orders      o
         JOIN   order_items oi ON oi.order_id   = o.id
         JOIN   products     p  ON p.id          = oi.product_id
         WHERE  p.name        = 'ผัดไทยไฟแดง'
           AND  o.created_at >= NOW() - INTERVAL '1 hour'`
      );

      if (row && parseInt(row.count, 10) > 0) {
        return NextResponse.json(
          {
            error:
              "ผัดไทยไฟแดง สามารถสั่งได้เพียง 1 ที่ต่อลูกค้า 1 ท่านภายใน 1 ชั่วโมง กรุณาลองใหม่ภายหลัง",
          },
          { status: 409 }
        );
      }
    }

    // ── Pure calculation (no side effects) ──────────────────────────────────
    const result: CalculationResponse = calculateOrder(
      products,
      items,
      memberCardNumber
    );

    // ── Persist order for audit + Red-set rate-limiting ─────────────────────
    const pairDiscountTotal = result.discountedItems.reduce(
      (sum, d) => sum + Math.abs(d.discount),
      0
    );

    const order = await queryOne<{ id: number }>(
      `INSERT INTO orders
         (member_card_number, total_before_discount, pair_discount_total, member_card_discount, final_total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        memberCardNumber ?? null,
        result.totalBeforeDiscount,
        pairDiscountTotal,
        result.memberCardDiscount,
        result.finalTotal,
      ]
    );

    if (order) {
      for (const item of items) {
        if (item.quantity <= 0) continue;
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.productId, item.quantity, product.price]
        );
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/calculate]", err);
    return NextResponse.json(
      { error: "Failed to calculate order" },
      { status: 500 }
    );
  }
}
