import { NextRequest, NextResponse } from "next/server";
import { signedReadUrl, pdfKey, objectExists } from "@/lib/storage";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const file = req.nextUrl.searchParams.get("file");

  if (!file || !/^[\w\-. ]+\.pdf$/i.test(file)) {
    return NextResponse.json(
      { error: "Invalid file parameter" },
      { status: 400 },
    );
  }

  if (!/^[\w-]+$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid course ID" },
      { status: 400 },
    );
  }

  const key = pdfKey(id, file);

  if (!(await objectExists(key))) {
    return NextResponse.json(
      { error: "PDF not found" },
      { status: 404 },
    );
  }

  const url = await signedReadUrl(key, 3600);

  return NextResponse.redirect(url, { status: 302 });
}