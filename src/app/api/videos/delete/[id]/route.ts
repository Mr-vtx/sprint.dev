
import { NextRequest, NextResponse } from "next/server";
import { deleteObject, videoKey, isAdminAuthed, objectExists } from "@/lib/storage";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
){
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[\w-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  const key = videoKey(id);
  if (!(await objectExists(key))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteObject(key);
  return NextResponse.json({ deleted: true, key });
}
