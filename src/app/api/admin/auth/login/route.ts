import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, createSession, SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { username: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }

  const user = await queryOne<{
    id: number; username: string; password_hash: string;
    password_salt: string; role: string; full_name: string;
  }>(
    "SELECT id, username, password_hash, password_salt, role, full_name FROM admin_users WHERE username = $1 AND is_active = TRUE",
    [username]
  );

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const sessionId = await createSession(user.id);

  const res = NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
  });

  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });

  return res;
}
