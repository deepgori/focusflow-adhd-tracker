export type LessonType = "video" | "reading" | "quiz" | "exercise";

export type Lesson = {
  id: number;
  title: string;
  duration: number;
  done: boolean;
  type: LessonType;
};

export type Course = {
  id: number;
  title: string;
  provider: string;
  progress: number;
  remainingMinutes: number;
  streak: number;
  lessons: Lesson[];
  nextTask: string;
  note: string;
};

export type TodayPlanItem = {
  id: string;
  title: string;
  minutes: number;
  type: string;
  status: "pending" | "done" | "skipped";
  courseId: number;
  lessonId: number;
};

export type NavSection = {
  id: string;
  label: string;
};

export type ImportMethod = {
  id: string;
  name: string;
  role: string;
  summary: string;
  edgeCases: string[];
};

export type BlueprintEntity = {
  name: string;
  purpose: string;
};

export type BlueprintApi = {
  name: string;
  description: string;
};

export type BlueprintEdgeCase = {
  title: string;
  detail: string;
};

export type DemoSettings = {
  darkMode: boolean;
  reduceAnimations: boolean;
  gentleReminders: boolean;
  autoBreakdown: boolean;
  hyperfocusProtection: boolean;
};

export type NoteMap = Record<number, string>;

export type DashboardPayload = {
  courses: Course[];
  todayPlan: TodayPlanItem[];
  settings: DemoSettings;
  notes: NoteMap;
  analyticsHistory: AnalyticsEventRecord[];
};

export type WorkflowStep = {
  title: string;
  detail: string;
};

export type Workflow = {
  id: string;
  name: string;
  objective: string;
  trigger: string;
  successMetric: string;
  targetView: string;
  steps: WorkflowStep[];
};

export type AnalyticsEventRecord = {
  id: string;
  type: "task_completed" | "lesson_completed" | "session_completed";
  points: number;
  createdAt: string;
};
