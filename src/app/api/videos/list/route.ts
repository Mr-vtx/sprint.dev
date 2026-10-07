import { NextRequest, NextResponse } from "next/server";
import { listPrefix, isAdminAuthed } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthed(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      !process.env.R2_ENDPOINT ||
      !process.env.R2_BUCKET
    ) {
      return NextResponse.json({
        videos: [],
        storageConfigured: false,
      });
    }

    const videos = await listPrefix("videos/");

    return NextResponse.json({
      videos,
      storageConfigured: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}