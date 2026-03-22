import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getAuthFromRequest, hashPassword } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { full_name, role, permissions, is_active, password } = await req.json();

  let hashClause = "";
  const args: unknown[] = [full_name, role, JSON.stringify(permissions ?? {}), is_active, id];

  if (password) {
    const { hash, salt } = hashPassword(password);
    hashClause = ", password_hash = $6, password_salt = $7";
    args.push(hash, salt);
  }

  const row = await queryOne(
    `UPDATE admin_users
     SET full_name   = COALESCE($1, full_name),
         role        = COALESCE($2, role),
         permissions = COALESCE($3::jsonb, permissions),
         is_active   = COALESCE($4, is_active),
         updated_at  = NOW()
         ${hashClause}
     WHERE id = $5
     RETURNING id, username, full_name, role, permissions, is_active, updated_at`,
    args
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM admin_users WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
