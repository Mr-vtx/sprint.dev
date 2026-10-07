import { NextResponse } from "next/server";
import { isCourseId, isPdfName, objectExists, pdfKey, signedReadUrl, storageConfigured } from "@/lib/server/storage";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const file = new URL(req.url).searchParams.get("file") ?? "";
  if (!isCourseId(id) || !isPdfName(file)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!storageConfigured()) return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });

  const key = pdfKey(id, file);
  if (!(await objectExists(key))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.redirect(await signedReadUrl(key, 3600), { status: 302, headers: { "Cache-Control": "private, max-age=300" } });
}
