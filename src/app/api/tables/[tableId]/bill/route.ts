import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;
  const row = await queryOne(
    "UPDATE restaurant_tables SET status = 'bill_requested', updated_at = NOW() WHERE table_number = $1 AND is_active = TRUE RETURNING id",
    [tableId]
  );
  if (!row) return NextResponse.json({ error: "Table not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
