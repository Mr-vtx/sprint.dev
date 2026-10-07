import "server-only";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "./session";

const json = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

function cookieFrom(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
}

/** Same-origin check for state-changing requests (defence in depth on top of SameSite=Strict). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

/** Returns a response to send back when the request must be rejected, or null when it may proceed. */
export function guardAdmin(req: Request, opts: { mutating?: boolean } = {}): NextResponse | null {
  if (!verifySession(cookieFrom(req, COOKIE_NAME))) return json("Unauthorized", 401);
  if (opts.mutating && !sameOrigin(req)) return json("Bad origin", 403);
  return null;
}

export const errorJson = json;
