import { NextResponse } from "next/server";
import {
  courses,
  defaultAnalyticsHistory,
  defaultNotes,
  defaultSettings,
  productBlueprint,
  todayPlan,
} from "@/lib/mock-data";
import { getCompletionStats, recalculateCourse } from "@/lib/product";

export async function GET() {
  return NextResponse.json({
    courses: courses.map(recalculateCourse),
    stats: getCompletionStats(courses),
    todayPlan,
    blueprint: productBlueprint,
    settings: defaultSettings,
    notes: defaultNotes,
    analyticsHistory: defaultAnalyticsHistory,
  });
}
