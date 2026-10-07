import { NextResponse } from "next/server";
import { COOKIE_NAME, cookieOptions } from "@/lib/server/session";
import { errorJson, sameOrigin } from "@/lib/server/adminGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return errorJson("Bad origin", 403);
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set(COOKIE_NAME, "", cookieOptions(0));
  return res;
}
