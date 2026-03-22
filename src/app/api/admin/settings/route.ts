import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query<{ key: string; value: string }>("SELECT key, value FROM settings ORDER BY key");
  const result: Record<string, string> = {};
  rows.forEach((r) => (result[r.key] = r.value));
  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  if (!await getAuthFromRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: Record<string, string> = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await query(
      "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
      [key, value]
    );
  }
  return NextResponse.json({ ok: true });
}
