import { NextResponse } from "next/server";
import { guardAdmin, errorJson } from "@/lib/server/adminGuard";
import { listPrefix, storageConfigured } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = guardAdmin(req);
  if (denied) return denied;
  if (!storageConfigured()) return NextResponse.json({ configured: false, videos: [], pdfs: [] }, { headers: { "Cache-Control": "no-store" } });
  try {
    const [videos, pdfs] = await Promise.all([listPrefix("videos/"), listPrefix("pdfs/")]);
    return NextResponse.json({ configured: true, videos, pdfs }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("admin files list failed", e);
    return errorJson("Could not list storage. Check the STORAGE_* settings.", 502);
  }
}
