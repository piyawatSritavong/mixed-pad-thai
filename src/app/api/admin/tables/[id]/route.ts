import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { table_number, capacity, status, is_active, note } = await req.json();
  const row = await queryOne(
    `UPDATE restaurant_tables
     SET table_number = COALESCE($1, table_number),
         capacity     = COALESCE($2, capacity),
         status       = COALESCE($3, status),
         is_active    = COALESCE($4, is_active),
         note         = COALESCE($5, note),
         updated_at   = NOW()
     WHERE id = $6 RETURNING *`,
    [table_number, capacity, status, is_active, note, id]
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM restaurant_tables WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/tables/:id – update status only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const row = await queryOne(
    "UPDATE restaurant_tables SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [status, id]
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
