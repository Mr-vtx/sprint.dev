
import { NextRequest, NextResponse } from "next/server";
import { signedReadUrl, videoKey, objectExists } from "@/lib/storage";

export const runtime = "edge"; 

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
){
  const { id } = await context.params;

  if (!/^[\w-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  const key = videoKey(id);

  const exists = await objectExists(key);
  if (!exists) {
    return NextResponse.json(
      { error: `Video for lesson "${id}" not found in storage` },
      { status: 404 },
    );
  }

  const url = await signedReadUrl(key, 3600);

  return NextResponse.redirect(url, { status: 302 });
}
