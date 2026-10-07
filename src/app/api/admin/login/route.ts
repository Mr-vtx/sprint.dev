import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, createSession, COOKIE_NAME, cookieOptions } from "@/lib/server/session";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { errorJson, sameOrigin } from "@/lib/server/adminGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return errorJson("Bad origin", 403);
  if (!adminConfigured()) return errorJson("Admin is not configured on this deployment.", 503);

  const limit = rateLimit(`login:${clientIp(req)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.ok) {
    const res = errorJson("Too many attempts. Try again later.", 429);
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password.slice(0, 256) : "";

  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return errorJson("Wrong password.", 401);
  }

  const token = createSession();
  if (!token) return errorJson("Admin is not configured on this deployment.", 503);

  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(COOKIE_NAME, token, cookieOptions());
  return res;
}
