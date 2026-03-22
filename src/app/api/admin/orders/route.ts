import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const table = searchParams.get("table");

  const conditions: string[] = [];
  const args: unknown[] = [];

  if (from) { args.push(from); conditions.push(`o.created_at >= $${args.length}::date`); }
  if (to)   { args.push(to);   conditions.push(`o.created_at <  ($${args.length}::date + interval '1 day')`); }
  if (table) { args.push(table); conditions.push(`o.table_number = $${args.length}`); }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const orders = await query(
    `SELECT o.id, o.table_number, o.member_card_number,
            o.total_before_discount::float, o.pair_discount_total::float,
            o.member_card_discount::float, o.final_total::float,
            o.status, o.created_at,
            json_agg(json_build_object(
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price::float
            ) ORDER BY oi.id) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p     ON p.id = oi.product_id
     ${where}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 500`,
    args
  );

  return NextResponse.json(orders);
}
