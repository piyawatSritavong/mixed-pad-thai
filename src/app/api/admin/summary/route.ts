import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [todayStats, topItems, last7Days, lowStock] = await Promise.all([
    // Today totals
    queryOne<{ orders: string; revenue: string; discount: string }>(
      `SELECT COUNT(*)::text AS orders,
              COALESCE(SUM(final_total), 0)::float AS revenue,
              COALESCE(SUM(pair_discount_total + member_card_discount), 0)::float AS discount
       FROM orders WHERE created_at >= CURRENT_DATE`
    ),
    // Top 5 items today
    query<{ name: string; qty: string; revenue: string }>(
      `SELECT p.name, SUM(oi.quantity)::text AS qty,
              (SUM(oi.quantity * oi.unit_price))::float AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.created_at >= CURRENT_DATE
       GROUP BY p.name ORDER BY SUM(oi.quantity) DESC LIMIT 5`
    ),
    // Revenue last 7 days
    query<{ day: string; revenue: string; orders: string }>(
      `SELECT TO_CHAR(d, 'YYYY-MM-DD') AS day,
              COALESCE(SUM(o.final_total), 0)::float AS revenue,
              COUNT(o.id)::text AS orders
       FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day') d
       LEFT JOIN orders o ON o.created_at::date = d
       GROUP BY d ORDER BY d`
    ),
    // Low stock inventory
    query<{ name: string; quantity: string; min_quantity: string; unit: string }>(
      "SELECT name, quantity::float, min_quantity::float, unit FROM inventory WHERE quantity <= min_quantity ORDER BY name"
    ),
  ]);

  return NextResponse.json({ todayStats, topItems, last7Days, lowStock });
}
