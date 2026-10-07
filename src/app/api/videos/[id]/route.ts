import { NextResponse } from "next/server";
import { isLessonId, objectExists, signedReadUrl, storageConfigured, videoKey } from "@/lib/server/storage";

export const runtime = "nodejs";

/** Public: hosted lesson videos are course content. Redirects to a short-lived signed URL. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isLessonId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!storageConfigured()) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const key = videoKey(id);
  if (!(await objectExists(key))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.redirect(await signedReadUrl(key, 3600), { status: 302, headers: { "Cache-Control": "private, max-age=300" } });
}
