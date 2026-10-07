import { NextResponse } from "next/server";
import { guardAdmin, errorJson } from "@/lib/server/adminGuard";
import { deleteObject, isCourseId, isPdfName, objectExists, pdfKey, storageConfigured } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guardAdmin(req, { mutating: true });
  if (denied) return denied;
  if (!storageConfigured()) return errorJson("Storage is not configured.", 503);

  const { id } = await ctx.params;
  const file = new URL(req.url).searchParams.get("file") ?? "";
  if (!isCourseId(id) || !isPdfName(file)) return errorJson("Invalid course or file.", 400);
  const key = pdfKey(id, file);
  if (!(await objectExists(key))) return errorJson("Not found.", 404);
  await deleteObject(key);
  return NextResponse.json({ deleted: true, key }, { headers: { "Cache-Control": "no-store" } });
}
