import { NextResponse } from "next/server";
import { guardAdmin, errorJson } from "@/lib/server/adminGuard";
import { isLessonId, signedUploadUrl, storageConfigured, videoKey } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VIDEO = 4 * 1024 ** 3;

/** Returns a short-lived presigned PUT URL. The file goes straight to the bucket, not through this server. */
export async function POST(req: Request) {
  const denied = guardAdmin(req, { mutating: true });
  if (denied) return denied;
  if (!storageConfigured()) return errorJson("Storage is not configured.", 503);

  const body = await req.json().catch(() => null);
  const { lessonId, contentType, size } = body ?? {};

  if (typeof lessonId !== "string" || !isLessonId(lessonId)) return errorJson("Unknown lesson.", 400);
  if (typeof contentType !== "string" || !/^video\/(mp4|webm|quicktime)$/.test(contentType)) return errorJson("Only mp4, webm or mov video files.", 400);
  if (!Number.isInteger(size) || size <= 0) return errorJson("File size is required.", 400);
  if (size > MAX_VIDEO) return errorJson("File too large (max 4 GB).", 413);

  const key = videoKey(lessonId);
  const uploadUrl = await signedUploadUrl(key, contentType, size, 900);
  return NextResponse.json({ uploadUrl, key }, { headers: { "Cache-Control": "no-store" } });
}
