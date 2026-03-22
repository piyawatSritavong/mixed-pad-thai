import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Public – returns active tables with status for customer-facing pages
export async function GET() {
  const rows = await query<{ table_number: string; status: string }>(
    "SELECT table_number, status FROM restaurant_tables WHERE is_active = TRUE ORDER BY table_number::INTEGER NULLS LAST, table_number"
  );
  return NextResponse.json(rows);
}
