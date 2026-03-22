import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query(
    "SELECT * FROM restaurant_tables ORDER BY table_number::INTEGER NULLS LAST, table_number"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { table_number, capacity, note } = await req.json();
  if (!table_number) return NextResponse.json({ error: "table_number required" }, { status: 400 });
  const row = await query(
    `INSERT INTO restaurant_tables (table_number, capacity, note)
     VALUES ($1, $2, $3) RETURNING *`,
    [table_number, capacity ?? 4, note ?? ""]
  );
  return NextResponse.json(row[0], { status: 201 });
}
