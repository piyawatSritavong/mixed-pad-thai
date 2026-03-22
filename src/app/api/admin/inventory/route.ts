import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query("SELECT * FROM inventory ORDER BY name");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, unit, quantity, min_quantity, cost_per_unit } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const row = await query(
    `INSERT INTO inventory (name, unit, quantity, min_quantity, cost_per_unit)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, unit ?? "ชิ้น", quantity ?? 0, min_quantity ?? 0, cost_per_unit ?? 0]
  );
  return NextResponse.json(row[0], { status: 201 });
}
