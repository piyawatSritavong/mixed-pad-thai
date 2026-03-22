import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from "crypto";
import { query, queryOne } from "./db";
import { SessionUser } from "@/types";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Password helpers ──────────────────────────────────────────────────────────

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  try {
    const hashBuf = Buffer.from(hash, "hex");
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuf, candidate);
  } catch {
    return false;
  }
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function createSession(userId: number): Promise<string> {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await query(
    "INSERT INTO admin_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [id, userId, expiresAt]
  );
  return id;
}

export async function getSessionUser(
  sessionId: string
): Promise<SessionUser | null> {
  return queryOne<SessionUser>(
    `SELECT s.user_id, u.username, u.role, u.full_name
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.user_id
     WHERE s.id = $1
       AND s.expires_at > NOW()
       AND u.is_active = TRUE`,
    [sessionId]
  );
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query("DELETE FROM admin_sessions WHERE id = $1", [sessionId]);
}

// ── Request auth helper (API routes) ─────────────────────────────────────────

import { NextRequest } from "next/server";

export async function getAuthFromRequest(
  req: NextRequest
): Promise<SessionUser | null> {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSessionUser(sessionId);
}
