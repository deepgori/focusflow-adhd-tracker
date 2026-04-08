import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    event?: string;
    payload?: Record<string, unknown>;
  };

  return NextResponse.json({
    ok: true,
    acceptedAt: new Date().toISOString(),
    event: body.event ?? "unknown",
    payload: body.payload ?? {},
  });
}
