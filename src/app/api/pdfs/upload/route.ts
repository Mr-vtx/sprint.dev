
import { NextRequest, NextResponse } from "next/server";
import { signedUploadUrl, pdfKey, isAdminAuthed } from "@/lib/storage";

export const runtime = "edge";

const MAX_PDF = 100 * 1024 * 1024; 

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, filename, size } = await req.json().catch(() => ({}));

  if (!courseId || !/^[\w-]+$/.test(courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }
  if (!filename || !/^[\w\-. ]+\.pdf$/i.test(filename)) {
    return NextResponse.json({ error: "filename must be a .pdf file" }, { status: 400 });
  }
  if (typeof size === "number" && size > MAX_PDF) {
    return NextResponse.json({ error: "PDF too large (max 100 MB)" }, { status: 413 });
  }

  const key = pdfKey(courseId, filename);
  const uploadUrl = await signedUploadUrl(key, "application/pdf", 600);

  return NextResponse.json({ uploadUrl, key, expiresAt: Date.now() + 600_000 });
}
