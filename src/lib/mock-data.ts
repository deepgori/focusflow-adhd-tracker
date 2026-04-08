import type {
  AnalyticsEventRecord,
  BlueprintApi,
  BlueprintEdgeCase,
  BlueprintEntity,
  Course,
  DemoSettings,
  ImportMethod,
  NoteMap,
  TodayPlanItem,
  Workflow,
} from "@/lib/types";

export const courses: Course[] = [
  {
    id: 1,
    title: "Psychology 101",
    provider: "Coursera",
    progress: 62,
    remainingMinutes: 185,
    streak: 4,
    note: "Dense topic. Best done in one 20-minute sprint.",
    nextTask: "Finish Attention Systems",
    lessons: [
      { id: 101, title: "Intro to Cognitive Models", duration: 18, done: true, type: "video" },
      { id: 102, title: "Working Memory and ADHD", duration: 22, done: true, type: "video" },
      { id: 103, title: "Attention Systems", duration: 16, done: false, type: "reading" },
      { id: 104, title: "Quiz: Executive Function", duration: 12, done: false, type: "quiz" },
    ],
  },
  {
    id: 2,
    title: "Statistics for Research",
    provider: "YouTube Playlist",
    progress: 31,
    remainingMinutes: 420,
    streak: 2,
    note: "Try using focus mode before attempting exercises.",
    nextTask: "Watch Variance Basics",
    lessons: [
      { id: 201, title: "Mean, Median, Mode", duration: 14, done: true, type: "video" },
      { id: 202, title: "Variance Basics", duration: 20, done: false, type: "video" },
      { id: 203, title: "Standard Deviation Practice", duration: 28, done: false, type: "exercise" },
      { id: 204, title: "Mini Quiz", duration: 10, done: false, type: "quiz" },
    ],
  },
  {
    id: 3,
    title: "UI Design Foundations",
    provider: "Udemy",
    progress: 84,
    remainingMinutes: 58,
    streak: 7,
    note: "Almost done. This is a good candidate for a same-day finish.",
    nextTask: "Complete Final Module Review",
    lessons: [
      { id: 301, title: "Typography Hierarchy", duration: 17, done: true, type: "video" },
      { id: 302, title: "Color Systems", duration: 15, done: true, type: "video" },
      { id: 303, title: "Spacing and Layout", duration: 14, done: true, type: "reading" },
      { id: 304, title: "Final Module Review", duration: 12, done: false, type: "exercise" },
    ],
  },
];

export const todayPlanTemplate: TodayPlanItem[] = [
  {
    id: "t1",
    title: "Resume Attention Systems",
    minutes: 16,
    type: "Deep focus",
    status: "pending",
    courseId: 1,
    lessonId: 103,
  },
  {
    id: "t2",
    title: "Watch Variance Basics",
    minutes: 20,
    type: "Quick win",
    status: "pending",
    courseId: 2,
    lessonId: 202,
  },
  {
    id: "t3",
    title: "Complete Final Module Review",
    minutes: 12,
    type: "Finish line",
    status: "pending",
    courseId: 3,
    lessonId: 304,
  },
];

export const todayPlan = todayPlanTemplate;

export const defaultSettings: DemoSettings = {
  darkMode: true,
  reduceAnimations: false,
  gentleReminders: true,
  autoBreakdown: true,
  hyperfocusProtection: true,
};

export const defaultNotes: NoteMap = {
  103: "Dense concept. Best handled in one uninterrupted sprint.",
};

export const defaultAnalyticsHistory: AnalyticsEventRecord[] = [
  { id: "hist-1", type: "lesson_completed", points: 4, createdAt: "2025-05-12T14:00:00.000Z" },
  { id: "hist-2", type: "task_completed", points: 2, createdAt: "2025-06-03T16:00:00.000Z" },
  { id: "hist-3", type: "session_completed", points: 5, createdAt: "2025-07-18T18:15:00.000Z" },
  { id: "hist-4", type: "lesson_completed", points: 4, createdAt: "2025-08-09T12:40:00.000Z" },
  { id: "hist-5", type: "task_completed", points: 3, createdAt: "2025-09-21T15:30:00.000Z" },
  { id: "hist-6", type: "session_completed", points: 6, createdAt: "2025-10-10T20:00:00.000Z" },
  { id: "hist-7", type: "lesson_completed", points: 4, createdAt: "2025-11-04T13:20:00.000Z" },
  { id: "hist-8", type: "task_completed", points: 2, createdAt: "2025-12-16T11:00:00.000Z" },
  { id: "hist-9", type: "session_completed", points: 5, createdAt: "2026-01-08T19:00:00.000Z" },
  { id: "hist-10", type: "lesson_completed", points: 4, createdAt: "2026-02-14T14:10:00.000Z" },
  { id: "hist-11", type: "task_completed", points: 3, createdAt: "2026-03-11T09:45:00.000Z" },
  { id: "hist-12", type: "session_completed", points: 5, createdAt: "2026-04-03T17:30:00.000Z" },
  { id: "hist-13", type: "lesson_completed", points: 4, createdAt: "2026-04-07T14:15:00.000Z" },
];

export const importMethods: ImportMethod[] = [
  {
    id: "url-import",
    name: "Paste course link",
    role: "Primary onboarding path for external learning platforms such as Udemy, Coursera, and YouTube playlists.",
    summary: "Lowest-friction option. Import the course structure, estimate time, and create an immediate resume path.",
    edgeCases: ["provider layout changes", "duplicate imports", "missing durations", "locked lessons"],
  },
  {
    id: "manual-entry",
    name: "Add manually",
    role: "Fallback for private classes, school curricula, or content that cannot be scraped safely.",
    summary: "Should stay simple: course title, modules, lessons, and optional bulk input without high setup cost.",
    edgeCases: ["incomplete structures", "no module hierarchy", "very large course entry", "user abandonment during setup"],
  },
  {
    id: "ai-assisted-import",
    name: "Generate with AI",
    role: "Differentiation layer for syllabi, copied outlines, and rough course titles.",
    summary: "Generate lessons, estimate effort, and break larger items into micro-tasks for easier starts.",
    edgeCases: ["hallucinated structure", "wrong duration estimates", "overly granular tasks", "needs user correction"],
  },
];

const entities: BlueprintEntity[] = [
  { name: "User", purpose: "Identity, ADHD preferences, notification settings, timezone, and accessibility flags." },
  { name: "Course", purpose: "Normalized course shell with provider metadata, import source, and sync identifiers." },
  { name: "Module", purpose: "Ordered grouping layer for platforms that expose sections or chapters." },
  { name: "Lesson", purpose: "Atomic learning item with type, duration, order, and completion thresholds." },
  { name: "Task", purpose: "Micro-step breakdown for ADHD-friendly execution and adaptive planning." },
  { name: "Progress", purpose: "Current state, exact resume point, completion status, and per-device sync markers." },
  { name: "Session", purpose: "Focus timer runs, idle periods, pauses, completions, and hyperfocus detection." },
  { name: "Note", purpose: "Quick capture notes attached to lessons, modules, or sessions." },
  { name: "AnalyticsEvent", purpose: "Immutable event stream for behavioral reporting, funnels, and interventions." },
];

const apis: BlueprintApi[] = [
  { name: "Auth API", description: "Email, OAuth, magic link, and session continuation with last-active restore." },
  { name: "Course ingestion API", description: "URL import, manual entry, AI-assisted generation, deduplication, and normalization." },
  { name: "Progress API", description: "Lesson completion, partial completion thresholds, and idempotent status updates." },
  { name: "Focus session API", description: "Start, pause, resume, idle detection, abandonment, and break suggestions." },
  { name: "Analytics API", description: "Dashboard metrics, drop-off analysis, recovery cohorts, and intervention triggers." },
  { name: "Notification API", description: "Reminder scheduling, quiet hours, restart campaigns, and message experimentation." },
];

const edgeCases: BlueprintEdgeCase[] = [
  {
    title: "Mid-session abandonment",
    detail:
      "Users may leave without clicking pause or done. Auto-save timer state, task context, lesson timestamp, and restore on next open.",
  },
  {
    title: "Too many visible tasks",
    detail:
      "Showing the full backlog can create paralysis. Always constrain the command center to one to three recommended actions.",
  },
  {
    title: "Long inactivity comeback",
    detail:
      "After seven or more missed days, switch from streak framing to restart framing with one gentle re-entry task.",
  },
  {
    title: "Hyperfocus and fatigue",
    detail:
      "Very long sessions are not always healthy wins. Detect abnormal duration and suggest a pause instead of stacking more work.",
  },
  {
    title: "Offline progress drift",
    detail:
      "Queue writes locally, replay in order, and merge conflict-safe when the same lesson changes on multiple devices.",
  },
  {
    title: "Duplicate completion events",
    detail:
      "Lesson completion and imported course creation both need idempotency keys to prevent double counts and duplicate records.",
  },
  {
    title: "Timezone boundary errors",
    detail:
      "Streaks, daily plans, and weekly analytics should store UTC and compute user-local presentation separately.",
  },
  {
    title: "Partial video thresholds",
    detail:
      "Define completion rules clearly, such as 85 percent watched, and expose them consistently in analytics and progress logic.",
  },
  {
    title: "Course structure variability",
    detail:
      "Some courses have no modules, hidden lessons, or changing order. Normalize internally and preserve source metadata for resyncs.",
  },
  {
    title: "Avoidance mode",
    detail:
      "Repeated app opens without progress should trigger smaller recommended steps, not stronger reminders.",
  },
  {
    title: "Perfectionism loops",
    detail:
      "Students may rewatch the same lesson repeatedly. Detect repetition and suggest forward movement when mastery is already likely.",
  },
  {
    title: "Skip-heavy behavior",
    detail:
      "If tasks are skipped often, the planner should reduce size and complexity rather than assuming low motivation.",
  },
];

export const productBlueprint = {
  entities,
  apis,
  edgeCases,
  events: [
    "lesson_started",
    "lesson_completed",
    "lesson_resumed",
    "session_started",
    "session_paused",
    "session_abandoned",
    "resume_clicked",
    "course_imported",
    "task_skipped",
    "restart_flow_started",
  ],
};

export const workflows: Workflow[] = [
  {
    id: "onboarding",
    name: "First-run onboarding",
    objective: "Get a new student from signup to a first focus session in under five minutes.",
    trigger: "New account or empty-state dashboard",
    successMetric: "First course added and first session started on day zero",
    targetView: "imports",
    steps: [
      {
        title: "Choose import path",
        detail: "Default to link import, but keep manual entry and AI generation visible as fallbacks.",
      },
      {
        title: "Normalize course structure",
        detail: "Create lessons, estimate duration, and set the first incomplete lesson as the resume target.",
      },
      {
        title: "Generate three-task plan",
        detail: "Show only the first few tasks rather than the full backlog to reduce overwhelm.",
      },
    ],
  },
  {
    id: "daily-plan",
    name: "Daily learning loop",
    objective: "Let returning students resume quickly without navigating across multiple screens.",
    trigger: "Normal daily return visit",
    successMetric: "At least one task started or completed per return session",
    targetView: "home",
    steps: [
      {
        title: "Show today's top tasks",
        detail: "Limit recommendations to one to three items with clear duration estimates.",
      },
      {
        title: "Launch focus mode",
        detail: "Route directly into a single active lesson with timer controls and smaller-step guidance.",
      },
      {
        title: "Log progress instantly",
        detail: "Sync task status, lesson completion, and analytics events without requiring extra confirmation steps.",
      },
    ],
  },
  {
    id: "comeback",
    name: "Comeback workflow",
    objective: "Recover students after inactivity without guilt-driven messaging.",
    trigger: "Three or more inactive days",
    successMetric: "User starts one restart task within the comeback session",
    targetView: "focus",
    steps: [
      {
        title: "Suppress streak loss messaging",
        detail: "Replace any missed-day framing with a calm restart state and one suggested entry task.",
      },
      {
        title: "Shrink the task size",
        detail: "Recommend a shorter lesson slice or note review instead of the full unfinished lesson.",
      },
      {
        title: "Record recovery analytics",
        detail: "Track restart flow opens, restarted tasks, and bounce rate after inactivity.",
      },
    ],
  },
  {
    id: "settings-personalization",
    name: "Preference personalization",
    objective: "Let the student adapt the product to their attention profile and keep those choices persistent.",
    trigger: "User opens settings or shows avoidance/friction behavior",
    successMetric: "Preferences saved and reflected across the next session",
    targetView: "settings",
    steps: [
      {
        title: "Apply visual and behavioral preferences",
        detail: "Persist theme, motion, reminder tone, task breakdown, and hyperfocus controls.",
      },
      {
        title: "Reflect changes immediately",
        detail: "Update navigation copy, motion behavior, focus suggestions, and safety messaging live.",
      },
      {
        title: "Save preference telemetry",
        detail: "Use settings usage to understand which interventions correlate with retention.",
      },
    ],
  },
];
