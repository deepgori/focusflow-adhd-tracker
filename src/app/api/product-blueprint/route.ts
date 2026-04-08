import { NextResponse } from "next/server";
import { productBlueprint } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(productBlueprint);
}
