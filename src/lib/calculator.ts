/**
 * Pure calculation logic – no database access, fully unit-testable.
 *
 * Promotion for Members (สมาชิก)
 * ──────────────────────────────
 * Pair discount (ผัดไทยไฟส้ม / ผัดไทยไฟชมพู / ผัดไทยไฟเขียว only) – MEMBERS ONLY
 *   For every 2 items of the same discountable set the customer pays 5% less
 *   on that pair. Odd items have no discount.
 *   Requires a valid memberCardNumber.
 *
 *   e.g. ผัดไทยไฟส้ม  ×2  → (120+120) × 0.95  = 228
 *        ผัดไทยไฟชมพู ×4  → 2 × (80+80) × 0.95 = 304
 *        ผัดไทยไฟเขียว ×3 → (40+40) × 0.95 + 40 = 116
 */

import { Product, OrderItem, DiscountDetail, CalculationResponse } from "@/types";

// Round to 2 decimal places to avoid floating-point noise
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateOrder(
  products: Product[],
  orderItems: OrderItem[],
  memberCardNumber?: string
): CalculationResponse {
  // ── Resolve products for each line item ──────────────────────────────────
  const lines = orderItems
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product id=${item.productId} not found`);
      return { ...product, quantity: item.quantity };
    });

  // ── 1. Total before any discount ─────────────────────────────────────────
  const totalBeforeDiscount = round2(
    lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  );

  // ── 2. Pair discounts (members only, discountable items only) ─────────────
  const discountedItems: DiscountDetail[] = [];
  let totalPairDiscount = 0;

  const isMember = !!(memberCardNumber && memberCardNumber.trim());

  if (isMember) {
    for (const line of lines) {
      if (!line.discountable || line.quantity < 2) continue;

      const pairs = Math.floor(line.quantity / 2);
      const pairDiscount = round2(pairs * 2 * line.price * 0.05);
      totalPairDiscount += pairDiscount;

      discountedItems.push({ name: line.name, discount: -pairDiscount });
    }
  }

  // ── 3. Final total ────────────────────────────────────────────────────────
  const finalTotal = round2(totalBeforeDiscount - totalPairDiscount);

  return {
    totalBeforeDiscount,
    discountedItems,
    memberCardDiscount: 0,
    finalTotal,
  };
}
