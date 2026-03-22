import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, unit, quantity, min_quantity, cost_per_unit } = await req.json();
  const row = await queryOne(
    `UPDATE inventory
     SET name = COALESCE($1, name), unit = COALESCE($2, unit),
         quantity = COALESCE($3, quantity), min_quantity = COALESCE($4, min_quantity),
         cost_per_unit = COALESCE($5, cost_per_unit), updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [name, unit, quantity, min_quantity, cost_per_unit, id]
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM inventory WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
