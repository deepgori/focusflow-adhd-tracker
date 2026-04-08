import { NextResponse } from "next/server";
import { defaultSettings } from "@/lib/mock-data";
import type { DemoSettings } from "@/lib/types";

export async function GET() {
  return NextResponse.json(defaultSettings);
}

export async function POST(request: Request) {
  const body = (await request.json()) as DemoSettings;
  return NextResponse.json({
    ok: true,
    settings: body,
  });
}
