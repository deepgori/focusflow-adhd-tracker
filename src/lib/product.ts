import type { AnalyticsEventRecord, Course } from "@/lib/types";

export function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  if (!minutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export function getCompletionStats(courses: Course[]) {
  const allLessons = courses.flatMap((course) => course.lessons);
  const completedLessons = allLessons.filter((lesson) => lesson.done).length;

  return {
    totalCourses: courses.length,
    completedLessons,
    totalLessons: allLessons.length,
    avgProgress: Math.round(
      courses.reduce((sum, course) => sum + course.progress, 0) / courses.length,
    ),
  };
}

export function getNextLesson(course: Course) {
  return course.lessons.find((lesson) => !lesson.done) ?? null;
}

export function recalculateCourse(course: Course) {
  const completedLessons = course.lessons.filter((lesson) => lesson.done).length;
  const remainingMinutes = course.lessons
    .filter((lesson) => !lesson.done)
    .reduce((sum, lesson) => sum + lesson.duration, 0);
  const nextLesson = getNextLesson(course);

  return {
    ...course,
    progress: Math.round((completedLessons / course.lessons.length) * 100),
    remainingMinutes,
    nextTask: nextLesson ? nextLesson.title : "Course complete",
  };
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildAnalyticsSeries(
  history: AnalyticsEventRecord[],
  range: "7d" | "6m" | "12m",
) {
  const now = new Date();

  if (range === "6m" || range === "12m") {
    const months = range === "6m" ? 6 : 12;
    const buckets = Array.from({ length: months }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleString("en-US", { month: "short" }),
        value: 0,
      };
    });

    history.forEach((event) => {
      const date = new Date(event.createdAt);
      const bucket = buckets.find(
        (entry) => entry.key === `${date.getFullYear()}-${date.getMonth()}`,
      );

      if (bucket) {
        bucket.value += event.points;
      }
    });

    return buckets;
  }

  const days = 7;
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() - (days - 1 - index));

    return {
      key: date.toISOString(),
      label:
        range === "7d"
          ? date.toLocaleString("en-US", { weekday: "short" }).slice(0, 1)
          : date.toLocaleString("en-US", { month: "short", day: "numeric" }),
      date,
      value: 0,
    };
  });

  history.forEach((event) => {
    const eventDate = new Date(event.createdAt);
    const bucket = buckets.find((entry) => sameDay(entry.date, eventDate));

    if (bucket) {
      bucket.value += event.points;
    }
  });

  return buckets;
}
