import "server-only";
import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Stateless admin session.
 *
 * Token = base64url(JSON{exp, n}) + "." + HMAC-SHA256(payload, SESSION_SECRET).
 * Stored in an httpOnly, SameSite=Strict cookie. The browser never sees the
 * password or the signing key. To revoke every session, rotate SESSION_SECRET.
 */
const TTL_MS = 8 * 60 * 60 * 1000;
const PROD = process.env.NODE_ENV === "production";

export const COOKIE_NAME = PROD ? "__Host-sprintdev-admin" : "sprintdev-admin";
export const SESSION_MAX_AGE_S = TTL_MS / 1000;

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

function key(): string | null {
  const k = process.env.SESSION_SECRET;
  return k && k.length >= 32 ? k : null;
}

/** True only when both secrets are set and strong enough. Everything fails closed otherwise. */
export function adminConfigured(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw && pw.length >= 12 && key());
}

/** Compare via SHA-256 digests so length differences don't leak and comparison is constant-time. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!adminConfigured() || !pw) return false;
  return safeEqual(input, pw);
}

const sign = (payload: string, k: string) => createHmac("sha256", k).update(payload).digest("base64url");

export function createSession(now = Date.now()): string | null {
  const k = key();
  if (!k) return null;
  const payload = b64(JSON.stringify({ exp: now + TTL_MS, n: randomBytes(8).toString("hex") }));
  return `${payload}.${sign(payload, k)}`;
}

export function verifySession(token: string | undefined | null, now = Date.now()): boolean {
  const k = key();
  if (!k || !token) return false;
  const [payload, sig, extra] = token.split(".");
  if (!payload || !sig || extra !== undefined) return false;
  const expected = sign(payload, k);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}

export function cookieOptions(maxAge = SESSION_MAX_AGE_S) {
  return { httpOnly: true, secure: PROD, sameSite: "strict" as const, path: "/", maxAge };
}
