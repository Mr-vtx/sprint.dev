/**
 * POST /api/videos/upload
 * Admin-only. Returns a pre-signed PUT URL so the admin dashboard can upload
 * a video file directly to R2/S3 without routing bytes through this server.
 *
 * Request body (JSON):
 *   { lessonId: string, contentType: string, size: number }
 *
 * Response:
 *   { uploadUrl: string, key: string, expiresAt: number }
 *
 * The client then does:
 *   fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": contentType } })
 * directly against the bucket — no bandwidth cost on your serverless function.
 */

import { NextRequest, NextResponse } from "next/server";
import { signedUploadUrl, videoKey, isAdminAuthed } from "@/lib/storage";

export const runtime = "edge";

const MAX_SIZE = 4 * 1024 * 1024 * 1024; // 4 GB hard limit

export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lessonId?: string; contentType?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lessonId, contentType, size } = body;

  if (!lessonId || !/^[\w-]+$/.test(lessonId)) {
    return NextResponse.json({ error: "Invalid lessonId" }, { status: 400 });
  }
  if (!contentType || !contentType.startsWith("video/")) {
    return NextResponse.json(
      { error: "contentType must be a video/* MIME type" },
      { status: 400 },
    );
  }
  if (typeof size === "number" && size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_SIZE / 1e9} GB)` },
      { status: 413 },
    );
  }

  const key = videoKey(lessonId);
  const uploadUrl = await signedUploadUrl(key, contentType, 900); // 15-min window
  const expiresAt = Date.now() + 900_000;

  return NextResponse.json({ uploadUrl, key, expiresAt });
}
