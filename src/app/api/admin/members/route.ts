import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query(
    "SELECT id, username, full_name, role, permissions, is_active, created_at, updated_at FROM admin_users ORDER BY id"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { username, password, full_name, role, permissions } = await req.json();
  if (!username || !password) return NextResponse.json({ error: "username and password required" }, { status: 400 });
  const { hash, salt } = hashPassword(password);
  const row = await query(
    `INSERT INTO admin_users (username, password_hash, password_salt, full_name, role, permissions)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name, role, permissions, is_active, created_at`,
    [username, hash, salt, full_name ?? "", role ?? "staff", JSON.stringify(permissions ?? {})]
  );
  return NextResponse.json(row[0], { status: 201 });
}
