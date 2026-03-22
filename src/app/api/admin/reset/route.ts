import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await query("DELETE FROM order_items");
  await query("DELETE FROM orders");
  await query("UPDATE restaurant_tables SET status = 'vacant'");

  return NextResponse.json({ ok: true });
}
