import { NextResponse } from "next/server";
import { courses } from "@/lib/mock-data";
import { recalculateCourse } from "@/lib/product";

export async function GET() {
  return NextResponse.json({
    items: courses.map(recalculateCourse),
    ingestionMethods: ["url-import", "manual-entry", "ai-assisted-import"],
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    method?: string;
    source?: string;
    title?: string;
  };

  const title =
    body.title?.trim() ||
    body.source?.trim() ||
    "Imported Course";

  const providerMap: Record<string, string> = {
    "url-import": "Imported link",
    "manual-entry": "Manual entry",
    "ai-assisted-import": "AI generated",
  };

  const nextId =
    courses.reduce((max, course) => Math.max(max, course.id), 0) + 1;

  const course = recalculateCourse({
    id: nextId,
    title,
    provider: providerMap[body.method ?? "manual-entry"] ?? "Manual entry",
    progress: 0,
    remainingMinutes: 43,
    streak: 0,
    note: "Imported into the demo. Replace this with provider-specific sync data in production.",
    nextTask: "Start first lesson",
    lessons: [
      {
        id: nextId * 100 + 1,
        title: "Getting Started",
        duration: 8,
        done: false,
        type: "video",
      },
      {
        id: nextId * 100 + 2,
        title: "Core concept review",
        duration: 15,
        done: false,
        type: "reading",
      },
      {
        id: nextId * 100 + 3,
        title: "Practice task",
        duration: 20,
        done: false,
        type: "exercise",
      },
    ],
  });

  return NextResponse.json({ course });
}
