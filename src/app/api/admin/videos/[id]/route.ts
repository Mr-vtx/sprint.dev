import { NextResponse } from "next/server";
import { guardAdmin, errorJson } from "@/lib/server/adminGuard";
import { deleteObject, isLessonId, objectExists, storageConfigured, videoKey } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guardAdmin(req, { mutating: true });
  if (denied) return denied;
  if (!storageConfigured()) return errorJson("Storage is not configured.", 503);

  const { id } = await ctx.params;
  if (!isLessonId(id)) return errorJson("Unknown lesson.", 400);
  const key = videoKey(id);
  if (!(await objectExists(key))) return errorJson("Not found.", 404);
  await deleteObject(key);
  return NextResponse.json({ deleted: true, key }, { headers: { "Cache-Control": "no-store" } });
}
