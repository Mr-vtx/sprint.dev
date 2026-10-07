import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}