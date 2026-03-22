import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tables = await query(
    `SELECT t.*,
            (SELECT COUNT(*) FROM orders o WHERE o.table_number = t.table_number AND o.status = 'active')::int AS active_orders,
            (SELECT COALESCE(SUM(final_total), 0) FROM orders o WHERE o.table_number = t.table_number AND o.status = 'active')::float AS pending_total
     FROM restaurant_tables t
     WHERE t.is_active = TRUE
     ORDER BY t.table_number::INTEGER NULLS LAST, t.table_number`
  );

  return NextResponse.json(tables);
}
