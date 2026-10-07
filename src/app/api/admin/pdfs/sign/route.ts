import { NextResponse } from "next/server";
import { guardAdmin, errorJson } from "@/lib/server/adminGuard";
import { isCourseId, isPdfName, pdfKey, signedUploadUrl, storageConfigured } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF = 100 * 1024 * 1024;

export async function POST(req: Request) {
  const denied = guardAdmin(req, { mutating: true });
  if (denied) return denied;
  if (!storageConfigured()) return errorJson("Storage is not configured.", 503);

  const body = await req.json().catch(() => null);
  const { courseId, filename, size } = body ?? {};

  if (typeof courseId !== "string" || !isCourseId(courseId)) return errorJson("Unknown course.", 400);
  if (typeof filename !== "string" || !isPdfName(filename)) return errorJson("Use a .pdf file name with letters, numbers, spaces, dashes or dots.", 400);
  if (!Number.isInteger(size) || size <= 0) return errorJson("File size is required.", 400);
  if (size > MAX_PDF) return errorJson("PDF too large (max 100 MB).", 413);

  const key = pdfKey(courseId, filename);
  const uploadUrl = await signedUploadUrl(key, "application/pdf", size, 600);
  return NextResponse.json({ uploadUrl, key }, { headers: { "Cache-Control": "no-store" } });
}
