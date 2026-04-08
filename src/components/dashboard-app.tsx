"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  defaultAnalyticsHistory,
  defaultSettings,
  importMethods,
  workflows,
} from "@/lib/mock-data";
import {
  buildAnalyticsSeries,
  formatMinutes,
  getCompletionStats,
  getNextLesson,
  recalculateCourse,
} from "@/lib/product";
import type {
  AnalyticsEventRecord,
  Course,
  DashboardPayload,
  DemoSettings,
  NavSection,
  NoteMap,
  TodayPlanItem,
  Workflow,
} from "@/lib/types";

const nav: NavSection[] = [
  { id: "home", label: "Home" },
  { id: "courses", label: "Courses" },
  { id: "focus", label: "Focus mode" },
  { id: "analytics", label: "Analytics" },
  { id: "workflows", label: "Workflows" },
  { id: "imports", label: "Course import" },
  { id: "settings", label: "Settings" },
];

const STORAGE_KEYS = {
  courses: "focusflow-demo-courses",
  todayPlan: "focusflow-demo-plan",
  settings: "focusflow-demo-settings",
  notes: "focusflow-demo-notes",
  analyticsHistory: "focusflow-demo-analytics-history",
};

const settingToastCopy: Record<keyof DemoSettings, string> = {
  darkMode: "Theme updated.",
  reduceAnimations: "Motion preference updated.",
  gentleReminders: "Reminder tone updated.",
  autoBreakdown: "Task breakdown preference updated.",
  hyperfocusProtection: "Focus safety preference updated.",
};

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }

  return (await response.json()) as T;
}

function ThemeToggleIcon({ darkMode }: { darkMode: boolean }) {
  return darkMode ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M4.93 4.93 6.7 6.7" />
      <path d="M17.3 17.3 19.07 19.07" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="m4.93 19.07 1.77-1.77" />
      <path d="m17.3 6.7 1.77-1.77" />
    </svg>
  );
}

function Shell({
  active,
  navigate,
  children,
  settings,
  toast,
  dismissToast,
  toggleTheme,
}: {
  active: string;
  navigate: (view: string, options?: { courseId?: number; lessonId?: number }) => void;
  children: React.ReactNode;
  settings: DemoSettings;
  toast: {
    text: string;
  } | null;
  dismissToast: () => void;
  toggleTheme: () => void;
}) {
  const themeClass = settings.darkMode
    ? "bg-[#09111d]"
    : "bg-[linear-gradient(180deg,#15202f_0%,#1f3145_100%)]";
  const asideClass = settings.darkMode
    ? "bg-slate-950/90"
    : "bg-[#132131]/90";

  return (
    <div className={`min-h-screen text-slate-100 ${themeClass}`}>
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className={`border-r border-white/10 p-5 backdrop-blur ${asideClass}`}>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <button
              onClick={() => navigate("home")}
              className="block w-full text-left transition hover:opacity-90"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                FocusFlow
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-white">
                ADHD learning system
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {settings.gentleReminders
                  ? "Built to reduce guilt, shorten activation energy, and protect returning users from overwhelm."
                  : "Built to show progress clearly and keep task execution structured."}
              </p>
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {nav.map((item) => {
              const selected = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    selected
                      ? "bg-white text-slate-950"
                      : "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      selected ? "bg-slate-950" : "bg-slate-700"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm font-semibold text-emerald-200">
              {settings.gentleReminders ? "Gentle reminder" : "Progress reminder"}
            </p>
            <p className="mt-2 text-sm leading-7 text-emerald-100/90">
              {settings.gentleReminders
                ? "Small progress still counts. The product should reward re-entry, not punish missed days."
                : "Keep the next task visible and make progress measurable."}
            </p>
          </div>

        </aside>

        <main className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,76,255,0.14),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(42,157,143,0.16),transparent_24%)]" />
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${settings.darkMode ? "light" : "dark"} mode`}
            className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-slate-950/85 text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur transition hover:scale-[1.02] hover:bg-slate-900"
          >
            <ThemeToggleIcon darkMode={settings.darkMode} />
          </button>
          {toast ? (
            <div className="pointer-events-none fixed right-5 top-5 z-50 w-[min(24rem,calc(100vw-2rem))]">
              <div className="pointer-events-auto overflow-hidden rounded-[1.5rem] border border-cyan-300/20 bg-slate-950/90 shadow-2xl shadow-slate-950/40 backdrop-blur">
                <div className="flex items-start justify-between gap-4 px-4 pb-3 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-cyan-100">
                      Notification
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-200">
                      {toast.text}
                    </p>
                  </div>
                  <button
                    onClick={dismissToast}
                    aria-label="Dismiss notification"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur ${className}`}
    >
      {(title || description) && (
        <header className="mb-5">
          {title ? <h3 className="text-xl font-semibold text-white">{title}</h3> : null}
          {description ? (
            <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function HomeView({
  courses,
  todayPlan,
  onPlanStatus,
  onPlanStart,
  onStartFocus,
  navigate,
}: {
  courses: Course[];
  todayPlan: TodayPlanItem[];
  onPlanStatus: (id: string, status: TodayPlanItem["status"]) => void;
  onPlanStart: (item: TodayPlanItem) => void;
  onStartFocus: () => void;
  navigate: (view: string, options?: { courseId?: number; lessonId?: number }) => void;
}) {
  const stats = useMemo(() => getCompletionStats(courses), [courses]);
  const primaryCourse = [...courses].sort((a, b) => b.progress - a.progress)[0];

  return (
    <div className="space-y-6">
      <Header
        title="Command center"
        subtitle="The homepage now routes into the actual demo flows. Every task card can start, skip, or complete real state transitions."
        action={
          <button
            onClick={onStartFocus}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Start focus session
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active courses" value={stats.totalCourses} />
        <StatCard
          label="Lessons completed"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
        />
        <StatCard label="Average progress" value={`${stats.avgProgress}%`} />
        <StatCard
          label="Tasks done today"
          value={todayPlan.filter((item) => item.status === "done").length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Today's focus plan"
          description="These controls are live. Start routes into focus mode, done updates state, and skip marks a task as intentionally deferred."
        >
          <div className="space-y-3">
            {todayPlan.map((item) => {
              const isDone = item.status === "done";
              const isSkipped = item.status === "skipped";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onPlanStatus(item.id, isDone ? "pending" : "done")}
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                        isDone
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/20 bg-white/5 text-slate-400"
                      }`}
                    >
                      {isDone ? "✓" : ""}
                    </button>
                    <div>
                      <p
                        className={`font-medium ${
                          isDone
                            ? "text-slate-500 line-through"
                            : isSkipped
                              ? "text-amber-200"
                              : "text-white"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.minutes} min · {item.type}
                        {isSkipped ? " · skipped for now" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        onPlanStatus(
                          item.id,
                          item.status === "skipped" ? "pending" : "skipped",
                        )
                      }
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                    >
                      {item.status === "skipped" ? "Unskip" : "Skip"}
                    </button>
                    <button
                      onClick={() => onPlanStart(item)}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="bg-[linear-gradient(135deg,rgba(111,76,255,0.26),rgba(45,212,191,0.12))]">
            <span className="inline-flex rounded-full bg-slate-950/60 px-3 py-1 text-sm text-slate-100">
              Resume next
            </span>
            <h3 className="mt-5 text-2xl font-semibold text-white">
              {primaryCourse.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-200/80">
              {primaryCourse.note}
            </p>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                <span>{primaryCourse.nextTask}</span>
                <span>{primaryCourse.progress}%</span>
              </div>
              <ProgressBar value={primaryCourse.progress} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("courses", { courseId: primaryCourse.id })}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Open course
              </button>
              <button
                onClick={() => {
                  const nextLesson = getNextLesson(primaryCourse);
                  navigate("focus", {
                    courseId: primaryCourse.id,
                    lessonId: nextLesson?.id,
                  });
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Resume in focus mode
              </button>
            </div>
          </Panel>

          <Panel
            title="Behavior insight"
            description="This panel updates from your course state rather than staying static."
          >
            <div className="rounded-[1.5rem] bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
              {stats.avgProgress >= 60
                ? "Momentum is healthy. Keep surfacing quick wins before heavier lessons."
                : "Progress is still early. Shorten entry tasks and lean on focus mode for faster activation."}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CoursesView({
  courses,
  selectedCourse,
  setSelectedCourse,
  toggleLessonDone,
  openLessonNotes,
  resumeLesson,
  activeNoteLessonId,
  noteDraft,
  setNoteDraft,
  saveNote,
  requestCloseNoteEditor,
  confirmCloseNoteEditor,
  discardAndCloseNoteEditor,
  pendingNoteClose,
}: {
  courses: Course[];
  selectedCourse: number;
  setSelectedCourse: (id: number) => void;
  toggleLessonDone: (courseId: number, lessonId: number) => void;
  openLessonNotes: (lessonId: number) => void;
  resumeLesson: (courseId: number, lessonId: number) => void;
  activeNoteLessonId: number | null;
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  saveNote: () => void;
  requestCloseNoteEditor: () => void;
  confirmCloseNoteEditor: () => void;
  discardAndCloseNoteEditor: () => void;
  pendingNoteClose: boolean;
}) {
  const activeCourse =
    courses.find((course) => course.id === selectedCourse) ?? courses[0];
  const activeLesson =
    activeCourse.lessons.find((lesson) => lesson.id === activeNoteLessonId) ?? null;

  return (
    <div className="space-y-6">
      <Header
        title="Courses"
        subtitle="Course cards, lesson completion, note capture, and resume actions are now connected to live state and navigation."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className="text-left"
            >
              <Panel
                className={
                  selectedCourse === course.id
                    ? "border-cyan-300/40 bg-white/10"
                    : "hover:bg-white/10"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {course.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {course.provider}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                    {course.progress}%
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={course.progress} />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  {formatMinutes(course.remainingMinutes)} left · {course.streak}
                  -day streak
                </p>
                <div className="mt-4 rounded-[1.25rem] bg-slate-950/50 p-3 text-sm text-slate-300">
                  Next: {course.nextTask}
                </div>
              </Panel>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <Panel
            title={activeCourse.title}
            description="The lesson buttons now update progress, notes, and routing."
          >
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                <span>Progress</span>
                <span>{activeCourse.progress}%</span>
              </div>
              <ProgressBar value={activeCourse.progress} />
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {activeCourse.note}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {activeCourse.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleLessonDone(activeCourse.id, lesson.id)}
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                        lesson.done
                          ? "border-emerald-400 bg-emerald-400 text-slate-950"
                          : "border-white/20 bg-white/5 text-slate-400"
                      }`}
                    >
                      {lesson.done ? "✓" : index + 1}
                    </button>
                    <div>
                      <p
                        className={`font-medium ${
                          lesson.done ? "text-slate-500 line-through" : "text-white"
                        }`}
                      >
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {lesson.type} · {lesson.duration} min
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openLessonNotes(lesson.id)}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => resumeLesson(activeCourse.id, lesson.id)}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title={activeLesson ? `Notes: ${activeLesson.title}` : "Lesson notes"}
            description="This editor is connected to local demo persistence, so notes survive refreshes in the browser."
          >
            {activeLesson ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    Capture the important idea before you lose context.
                  </p>
                  <button
                    onClick={requestCloseNoteEditor}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    Close notes
                  </button>
                </div>
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  className="min-h-32 w-full rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4 text-sm text-white outline-none"
                  placeholder="Capture the important idea before you lose context."
                />
                {pendingNoteClose ? (
                  <div className="rounded-[1.25rem] border border-amber-300/20 bg-amber-300/10 p-4">
                    <p className="text-sm font-medium text-amber-100">
                      Do you want to save notes or discard them?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        onClick={confirmCloseNoteEditor}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                      >
                        Save and close
                      </button>
                      <button
                        onClick={discardAndCloseNoteEditor}
                        className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button
                    onClick={saveNote}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Save note
                  </button>
                  <button
                    onClick={() => setNoteDraft("")}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    Clear draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
                Select a lesson note button to open the note editor.
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function FocusView({
  course,
  lessonId,
  sessionMinutes,
  remainingSeconds,
  updateSessionMinutes,
  customMinutes,
  setCustomMinutes,
  sessionActive,
  toggleSessionActive,
  resetSession,
  markDone,
  smallerStep,
  onSmallerStepAction,
  settings,
}: {
  course: Course;
  lessonId: number | null;
  sessionMinutes: number;
  remainingSeconds: number;
  updateSessionMinutes: (value: number) => void;
  customMinutes: string;
  setCustomMinutes: (value: string) => void;
  sessionActive: boolean;
  toggleSessionActive: () => void;
  resetSession: () => void;
  markDone: (lessonId: number) => void;
  smallerStep: string;
  onSmallerStepAction: () => void;
  settings: DemoSettings;
}) {
  const activeLesson =
    course.lessons.find((lesson) => lesson.id === lessonId) ??
    getNextLesson(course) ??
    course.lessons[course.lessons.length - 1];
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="space-y-6">
      <Header
        title="Focus mode"
        subtitle="This view now responds to the selected lesson, settings, and completion flow. Marking done advances course progress immediately."
        action={
          <button
            onClick={toggleSessionActive}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            {sessionActive ? "Pause session" : "Start session"}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel className="bg-[linear-gradient(145deg,rgba(111,76,255,0.22),rgba(45,212,191,0.1))]">
          <span className="inline-flex rounded-full bg-slate-950/60 px-3 py-1 text-sm text-slate-100">
            Current sprint
          </span>
          <h3 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {activeLesson.title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Keep only this step visible. The rest of the course should disappear
            until the student is ready for it.
          </p>

          <div className="my-10 flex flex-col items-center gap-6">
            <button
              onClick={toggleSessionActive}
              className="flex h-56 w-56 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-center shadow-2xl shadow-slate-950/40 transition hover:scale-[1.01] hover:bg-slate-950/70"
            >
              <div className="text-center">
                <div className="text-5xl font-semibold tabular-nums text-white">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {sessionActive
                    ? "Focus session running"
                    : remainingSeconds === sessionMinutes * 60
                      ? "Ready when you are"
                      : "Session paused"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                  Click to {sessionActive ? "pause" : "start"}
                </p>
              </div>
            </button>

            <div className="flex flex-wrap justify-center gap-3">
              {[15, 20, 25, 45].map((minute) => (
                <button
                  key={minute}
                  onClick={() => {
                    updateSessionMinutes(minute);
                    setCustomMinutes(String(minute));
                  }}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    sessionMinutes === minute
                      ? "border-white bg-white text-slate-950"
                      : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  }`}
                >
                  {minute} min
                </button>
              ))}
            </div>

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min="1"
                step="1"
                value={customMinutes}
                onChange={(event) => setCustomMinutes(event.target.value)}
                className="flex-1 rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Custom minutes"
              />
              <button
                onClick={() => {
                  const parsed = Number(customMinutes);

                  if (Number.isFinite(parsed) && parsed > 0) {
                    updateSessionMinutes(Math.round(parsed));
                  }
                }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-100 transition hover:bg-white/10"
              >
                Set custom timer
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={toggleSessionActive}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              {sessionActive ? "Pause session" : "Start session"}
            </button>
            <button
              onClick={resetSession}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-100 transition hover:bg-white/5"
            >
              Reset session
            </button>
            <button
              onClick={() => markDone(activeLesson.id)}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-100 transition hover:bg-white/5"
            >
              Mark task done
            </button>
            <button
              onClick={onSmallerStepAction}
              className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-100 transition hover:bg-white/5"
            >
              {smallerStep}
            </button>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Session context"
            description="The details below update from the currently selected course and lesson."
          >
            <div className="grid gap-3">
              {[
                ["Course", course.title],
                ["Lesson type", activeLesson.type],
                ["Estimated time", `${activeLesson.duration} minutes`],
                ["Resume behavior", "Return to exact lesson and timestamp"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.5rem] bg-slate-950/50 p-4"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="mt-1 font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="ADHD-specific safeguards"
            description="These now react to settings instead of remaining static copy."
          >
            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <div className="rounded-[1.5rem] bg-slate-950/50 p-4">
                {settings.autoBreakdown
                  ? `Smaller-step suggestion: ${smallerStep}`
                  : "Automatic smaller-step generation is disabled. Use your own manual breakdown."}
              </div>
              <div className="rounded-[1.5rem] bg-slate-950/50 p-4">
                Restarting after distraction is normal. Resume without penalty.
              </div>
              <div className="rounded-[1.5rem] bg-slate-950/50 p-4">
                {settings.hyperfocusProtection
                  ? "Hyperfocus protection is on. After unusually long sessions, the real product should recommend a break."
                  : "Hyperfocus protection is off. The product will not interrupt long sessions."}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({
  courses,
  todayPlan,
  analyticsHistory,
}: {
  courses: Course[];
  todayPlan: TodayPlanItem[];
  analyticsHistory: AnalyticsEventRecord[];
}) {
  const [range, setRange] = useState<"7d" | "6m" | "12m">("7d");
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const completedToday = todayPlan.filter((item) => item.status === "done").length;
  const skippedToday = todayPlan.filter((item) => item.status === "skipped").length;
  const momentum = useMemo(
    () => buildAnalyticsSeries(analyticsHistory, range),
    [analyticsHistory, range],
  );
  const peak = Math.max(...momentum.map((entry) => entry.value), 1);
  const selectedBar = momentum.find((entry) => entry.key === activeBar) ?? null;
  const totalInRange = momentum.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="space-y-6">
      <Header
        title="Analytics"
        subtitle="These charts now respond to actual completion events. Switch ranges to inspect recent activity or year-long progress history."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={range === "12m" ? "Progress this year" : "Progress in range"}
          value={`${totalInRange} pts`}
        />
        <StatCard label="Tasks completed today" value={`${completedToday}/3`} />
        <StatCard label="Tasks skipped today" value={skippedToday} />
        <StatCard
          label="Courses near completion"
          value={courses.filter((course) => course.progress >= 75).length}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Momentum history"
          description="Interactive range switching lets long-term users inspect the last week, last month, or the full past year."
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl text-sm text-slate-400">
              Select a range to inspect short-term or long-term progress.
            </div>
            <div className="relative w-full sm:w-32">
              <select
                value={range}
                onChange={(event) =>
                  setRange(event.target.value as "7d" | "6m" | "12m")
                }
                className="w-full appearance-none rounded-full border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-slate-100 outline-none"
              >
                <option value="7d">7D</option>
                <option value="6m">6M</option>
                <option value="12m">1Y</option>
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 7.5 5 5 5-5" />
              </svg>
            </div>
          </div>
          <div
            onMouseLeave={() => setActiveBar(null)}
            className="flex h-72 items-end gap-3 rounded-[1.75rem] bg-slate-950/50 p-5"
          >
            {momentum.map((entry) => (
              <button
                key={entry.key}
                onMouseEnter={() => setActiveBar(entry.key)}
                onFocus={() => setActiveBar(entry.key)}
                onClick={() => setActiveBar(entry.key)}
                className="relative flex h-full flex-1 flex-col items-center justify-end gap-3 rounded-2xl px-1 transition hover:bg-white/5"
              >
                {selectedBar?.key === entry.key ? (
                  <div className="absolute -top-14 rounded-2xl border border-cyan-300/20 bg-slate-950/95 px-3 py-2 text-left shadow-xl shadow-slate-950/30">
                    <p className="text-xs font-medium text-cyan-100">
                      {entry.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {entry.value} progress points
                    </p>
                  </div>
                ) : null}
                <div
                  className={`w-full rounded-t-2xl bg-gradient-to-t from-violet-400 to-cyan-300 transition ${
                    selectedBar?.key === entry.key ? "opacity-100" : "opacity-75"
                  }`}
                  style={{ height: `${(entry.value / peak) * 100}%` }}
                />
                <span className="text-xs text-slate-400">
                  {entry.label}
                </span>
              </button>
            ))}
          </div>
          {selectedBar ? (
            <div className="mt-4 rounded-[1.25rem] bg-slate-950/50 p-4 text-sm text-slate-300">
              <span className="font-medium text-white">{selectedBar.label}</span>
              : {selectedBar.value} progress points recorded in this period.
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Progress archive"
          description="Users who stay for a year should be able to move beyond weekly summaries. This panel keeps longer-range context visible."
        >
          <div className="space-y-3">
            {[
              ["Recorded completion events", String(analyticsHistory.length)],
              ["Selected range", range === "12m" ? "Last 12 months" : range === "6m" ? "Last 6 months" : "Last 7 days"],
              ["Long lessons over 25 minutes", "High"],
              ["Text-heavy modules", "Medium"],
              [`Skipped tasks today`, String(skippedToday)],
              [
                "Courses under 40 percent progress",
                String(courses.filter((course) => course.progress < 40).length),
              ],
            ].map(([label, level]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[1.5rem] bg-slate-950/50 p-4"
              >
                <p className="text-sm text-slate-300">{label}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                  {level}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ImportView({
  onImport,
}: {
  onImport: (payload: { method: string; source: string; title: string }) => Promise<void>;
}) {
  const [method, setMethod] = useState(importMethods[0].id);
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);

    try {
      await onImport({ method, source, title });
      setSource("");
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Course import system"
        subtitle="This screen now has a working demo import flow backed by a local API route."
      />

      <Panel
        title="Add a course"
        description="Try a course link, a syllabus title, or a manual course name. The demo API creates a normalized mock course and adds it to the list."
      >
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr_1fr_auto]">
          <div className="relative">
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="w-full appearance-none rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-4 py-3 pr-11 text-sm text-white outline-none"
            >
              {importMethods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            placeholder="Course title"
          />
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
            placeholder="Link or source text"
          />
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add course"}
          </button>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        {importMethods.map((item) => (
          <Panel key={item.id} title={item.name} description={item.summary}>
            <div className="rounded-[1.5rem] bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
              <p>
                <span className="font-semibold text-white">Primary role:</span>{" "}
                {item.role}
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Edge cases:</span>{" "}
                {item.edgeCases.join(", ")}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function WorkflowsView({
  workflows,
  navigate,
}: {
  workflows: Workflow[];
  navigate: (view: string, options?: { courseId?: number; lessonId?: number }) => void;
}) {
  return (
    <div className="space-y-6">
      <Header
        title="Production workflows"
        subtitle="A production-ready product needs end-to-end user journeys, not just isolated screens. These workflow cards describe the core operating loops and route into the relevant parts of the demo."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {workflows.map((workflow) => (
          <Panel
            key={workflow.id}
            title={workflow.name}
            description={workflow.objective}
          >
            <div className="space-y-4">
              <div className="rounded-[1.5rem] bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
                <p>
                  <span className="font-semibold text-white">Trigger:</span>{" "}
                  {workflow.trigger}
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-white">Success metric:</span>{" "}
                  {workflow.successMetric}
                </p>
              </div>

              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4"
                  >
                    <p className="font-semibold text-white">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {step.detail}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(workflow.targetView)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Open related screen
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function SettingsView({
  settings,
  updateSetting,
}: {
  settings: DemoSettings;
  updateSetting: (key: keyof DemoSettings) => void;
}) {
  const items: Array<{
    key: keyof DemoSettings;
    label: string;
    description: string;
  }> = [
    {
      key: "reduceAnimations",
      label: "Reduce animations",
      description: "Disables motion and transition effects across the demo.",
    },
    {
      key: "gentleReminders",
      label: "Gentle reminders",
      description: "Changes motivational copy throughout the navigation and focus states.",
    },
    {
      key: "autoBreakdown",
      label: "Automatic task breakdown",
      description: "Controls whether focus mode generates smaller-step guidance.",
    },
    {
      key: "hyperfocusProtection",
      label: "Hyperfocus protection",
      description: "Changes the focus safety messaging for long sessions.",
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Settings"
        subtitle="These toggles are now connected to live demo behavior and saved in browser storage."
      />

      <div className="mx-auto max-w-4xl">
        <Panel
          title="Accessibility and behavior"
          description="Toggle a control, then navigate through the app to see the effect persist."
        >
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4"
              >
                <div className="max-w-2xl">
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-7 text-slate-400">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => updateSetting(item.key)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    settings[item.key] ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-slate-950 transition ${
                      settings[item.key] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function DashboardApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [bootstrapped, setBootstrapped] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [todayPlan, setTodayPlan] = useState<TodayPlanItem[]>([]);
  const [settings, setSettings] = useState<DemoSettings>(defaultSettings);
  const [notes, setNotes] = useState<NoteMap>({});
  const [analyticsHistory, setAnalyticsHistory] = useState<AnalyticsEventRecord[]>(
    defaultAnalyticsHistory,
  );
  const [toast, setToast] = useState<{
    text: string;
    duration: number;
    createdAt: number;
  } | null>(null);
  const [sessionMinutes, setSessionMinutes] = useState(20);
  const [remainingSeconds, setRemainingSeconds] = useState(20 * 60);
  const [customMinutes, setCustomMinutes] = useState("20");
  const [sessionActive, setSessionActive] = useState(false);
  const [noteLessonId, setNoteLessonId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [pendingNoteClose, setPendingNoteClose] = useState(false);

  const active = searchParams.get("view") ?? "home";
  const selectedCourse = Number(searchParams.get("course") ?? courses[0]?.id ?? 1);
  const selectedLesson = searchParams.get("lesson")
    ? Number(searchParams.get("lesson"))
    : null;

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const response = await fetch("/api/dashboard");
      const payload = (await response.json()) as DashboardPayload;

      if (!mounted) {
        return;
      }

      setCourses(readStorage(STORAGE_KEYS.courses, payload.courses));
      setTodayPlan(readStorage(STORAGE_KEYS.todayPlan, payload.todayPlan));
      setSettings(readStorage(STORAGE_KEYS.settings, payload.settings));
      setNotes(readStorage(STORAGE_KEYS.notes, payload.notes));
      setAnalyticsHistory(
        readStorage(
          STORAGE_KEYS.analyticsHistory,
          payload.analyticsHistory ?? defaultAnalyticsHistory,
        ),
      );
      setBootstrapped(true);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses));
  }, [bootstrapped, courses]);

  useEffect(() => {
    if (!bootstrapped || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.todayPlan, JSON.stringify(todayPlan));
  }, [bootstrapped, todayPlan]);

  useEffect(() => {
    if (!bootstrapped || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    document.documentElement.classList.toggle(
      "reduce-motion",
      settings.reduceAnimations,
    );
  }, [bootstrapped, settings]);

  useEffect(() => {
    if (!bootstrapped || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [bootstrapped, notes]);

  useEffect(() => {
    if (!bootstrapped || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEYS.analyticsHistory,
      JSON.stringify(analyticsHistory),
    );
  }, [analyticsHistory, bootstrapped]);

  const showToast = (text: string, duration = 3200) => {
    setToast({
      text,
      duration,
      createdAt: Date.now(),
    });
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const interval = window.setInterval(() => {
      if (Date.now() - toast.createdAt >= toast.duration) {
        setToast(null);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [toast]);

  useEffect(() => {
    if (!sessionActive) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setSessionActive(false);
          showToast("Focus session complete.");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sessionActive]);

  const dismissToast = () => {
    setToast(null);
  };

  const navigate = (
    view: string,
    options?: { courseId?: number; lessonId?: number },
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);

    if (options?.courseId) {
      params.set("course", String(options.courseId));
    }

    if (options?.lessonId) {
      params.set("lesson", String(options.lessonId));
    } else if (view !== "focus") {
      params.delete("lesson");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const track = async (event: string, payload: Record<string, unknown>) => {
    try {
      await postJson("/api/events", { event, payload });
    } catch {
      showToast("Action completed locally, but event logging failed.");
    }
  };

  const appendAnalyticsEvent = (
    type: AnalyticsEventRecord["type"],
    points: number,
  ) => {
    setAnalyticsHistory((current) => [
      ...current,
      {
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        points,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const setSelectedCourse = (courseId: number) => {
    navigate("courses", { courseId });
  };

  const updatePlanStatus = (id: string, status: TodayPlanItem["status"]) => {
    setTodayPlan((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    void track("plan_status_changed", { id, status });
  };

  const startPlanItem = (item: TodayPlanItem) => {
    setTodayPlan((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status: "done" } : entry,
      ),
    );
    appendAnalyticsEvent("task_completed", 2);
    navigate("focus", { courseId: item.courseId, lessonId: item.lessonId });
    showToast(`Started "${item.title}" in focus mode.`);
    void track("plan_started", { id: item.id, courseId: item.courseId });
  };

  const toggleLessonDone = (courseId: number, lessonId: number) => {
    const previousLesson = courses
      .find((course) => course.id === courseId)
      ?.lessons.find((lesson) => lesson.id === lessonId);

    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course;
        }

        const lessons = course.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, done: !lesson.done } : lesson,
        );

        return recalculateCourse({ ...course, lessons });
      }),
    );

    if (previousLesson && !previousLesson.done) {
      appendAnalyticsEvent("lesson_completed", 4);
    }

    void track("lesson_toggled", { courseId, lessonId });
  };

  const openLessonNotes = (lessonId: number) => {
    setPendingNoteClose(false);
    setNoteLessonId(lessonId);
    setNoteDraft(notes[lessonId] ?? "");
    showToast("Note editor opened.");
  };

  const saveNote = (options?: { silent?: boolean }) => {
    if (!noteLessonId) {
      return;
    }

    setNotes((current) => ({
      ...current,
      [noteLessonId]: noteDraft,
    }));
    setPendingNoteClose(false);
    if (!options?.silent) {
      showToast("Note saved in the demo.");
    }
    void track("note_saved", { lessonId: noteLessonId });
  };

  const closeNoteEditor = () => {
    setPendingNoteClose(false);
    setNoteLessonId(null);
    setNoteDraft("");
  };

  const requestCloseNoteEditor = () => {
    if (noteDraft.trim()) {
      setPendingNoteClose(true);
      return;
    }

    closeNoteEditor();
  };

  const confirmCloseNoteEditor = () => {
    saveNote({ silent: true });
    closeNoteEditor();
    showToast("Note saved and editor closed.");
  };

  const discardAndCloseNoteEditor = () => {
    closeNoteEditor();
    showToast("Note discarded.");
  };

  const resumeLesson = (courseId: number, lessonId: number) => {
    navigate("focus", { courseId, lessonId });
    showToast("Resumed lesson in focus mode.");
    void track("lesson_resumed", { courseId, lessonId });
  };

  const onImport = async (payload: {
    method: string;
    source: string;
    title: string;
  }) => {
    const response = await postJson<{ course: Course }>("/api/courses", payload);
    setCourses((current) => [...current, response.course]);
    navigate("courses", { courseId: response.course.id });
    showToast(`Imported "${response.course.title}".`);
    await track("course_imported", payload);
  };

  const updateSetting = async (key: keyof DemoSettings) => {
    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(nextSettings);
    showToast(settingToastCopy[key]);

    try {
      await postJson("/api/preferences", nextSettings);
    } catch {
      showToast("Setting changed locally, but sync failed.");
    }
  };

  const toggleSessionActive = () => {
    if (sessionActive) {
      setSessionActive(false);
      return;
    }

    if (remainingSeconds <= 0) {
      setRemainingSeconds(sessionMinutes * 60);
    }

    setSessionActive(true);
  };

  const resetSession = () => {
    setSessionActive(false);
    setRemainingSeconds(sessionMinutes * 60);
    showToast("Session reset.");
  };

  const toggleTheme = async () => {
    const nextSettings = {
      ...settings,
      darkMode: !settings.darkMode,
    };

    setSettings(nextSettings);
    showToast(`Switched to ${nextSettings.darkMode ? "dark" : "light"} mode.`);

    try {
      await postJson("/api/preferences", nextSettings);
    } catch {
      showToast("Theme changed locally, but sync failed.");
    }
  };

  const updateSessionMinutes = (value: number) => {
    setSessionMinutes(value);

    if (!sessionActive) {
      setRemainingSeconds(value * 60);
    }
  };

  const currentCourse =
    courses.find((course) => course.id === selectedCourse) ?? courses[0];

  const currentLesson =
    currentCourse?.lessons.find((lesson) => lesson.id === selectedLesson) ?? null;

  const smallerStep =
    settings.autoBreakdown && currentLesson
      ? `Smaller step: work on the first ${Math.max(
          5,
          Math.min(10, Math.ceil(currentLesson.duration / 2)),
        )} minutes only.`
      : "Need a smaller step? Enable automatic task breakdown in settings.";

  if (!bootstrapped || !currentCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111d] text-white">
        Loading demo...
      </div>
    );
  }

  return (
    <Shell
      active={active}
      navigate={navigate}
      settings={settings}
      toast={
        toast
          ? {
              text: toast.text,
            }
          : null
      }
      dismissToast={dismissToast}
      toggleTheme={toggleTheme}
    >
      {active === "home" ? (
        <HomeView
          courses={courses}
          todayPlan={todayPlan}
          onPlanStatus={updatePlanStatus}
          onPlanStart={startPlanItem}
          onStartFocus={() =>
            navigate("focus", {
              courseId: currentCourse.id,
              lessonId: getNextLesson(currentCourse)?.id,
            })
          }
          navigate={navigate}
        />
      ) : null}

      {active === "courses" ? (
        <CoursesView
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          toggleLessonDone={toggleLessonDone}
          openLessonNotes={openLessonNotes}
          resumeLesson={resumeLesson}
          activeNoteLessonId={noteLessonId}
          noteDraft={noteDraft}
          setNoteDraft={setNoteDraft}
          saveNote={saveNote}
          requestCloseNoteEditor={requestCloseNoteEditor}
          confirmCloseNoteEditor={confirmCloseNoteEditor}
          discardAndCloseNoteEditor={discardAndCloseNoteEditor}
          pendingNoteClose={pendingNoteClose}
        />
      ) : null}

      {active === "focus" ? (
        <FocusView
          course={currentCourse}
          lessonId={selectedLesson}
          sessionMinutes={sessionMinutes}
          remainingSeconds={remainingSeconds}
          updateSessionMinutes={updateSessionMinutes}
          customMinutes={customMinutes}
          setCustomMinutes={setCustomMinutes}
          sessionActive={sessionActive}
          toggleSessionActive={toggleSessionActive}
          resetSession={resetSession}
          markDone={(lessonId) => {
            toggleLessonDone(currentCourse.id, lessonId);
            showToast("Lesson marked complete.");
          }}
          smallerStep={smallerStep}
          onSmallerStepAction={() => {
            navigate("settings");
            showToast("Opened settings for task breakdown options.");
          }}
          settings={settings}
        />
      ) : null}

      {active === "analytics" ? (
        <AnalyticsView
          courses={courses}
          todayPlan={todayPlan}
          analyticsHistory={analyticsHistory}
        />
      ) : null}

      {active === "workflows" ? (
        <WorkflowsView workflows={workflows} navigate={navigate} />
      ) : null}

      {active === "imports" ? <ImportView onImport={onImport} /> : null}

      {active === "settings" ? (
        <SettingsView settings={settings} updateSetting={updateSetting} />
      ) : null}
    </Shell>
  );
}
