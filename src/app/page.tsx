import Link from "next/link";

const pillars = [
  {
    title: "Low-friction course capture",
    description:
      "Import by link, add manually, or generate structure from a syllabus. The app starts simple and fills in details later.",
  },
  {
    title: "Focus-first learning flow",
    description:
      "Guide students into one next task, one timer, and one clear resume point instead of overwhelming dashboards.",
  },
  {
    title: "Behavior-aware analytics",
    description:
      "Track progress, drop-off points, avoidance patterns, and comeback recovery without guilt-driven messaging.",
  },
];

const sections = [
  "Landing and onboarding",
  "Authentication and session recovery",
  "Dashboard command center",
  "Course import and structure normalization",
  "Focus mode and session tracking",
  "Analytics and drop-off detection",
  "Settings, accessibility, and restart flows",
  "Backend APIs, data contracts, and production edge cases",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(111,76,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(42,157,143,0.18),transparent_24%),linear-gradient(180deg,#08111f_0%,#0f1728_48%,#f4efe6_48%,#f6f3ee_100%)] text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-16 pt-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold shadow-lg shadow-cyan-500/10 backdrop-blur">
              FF
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                FocusFlow
              </p>
              <p className="text-sm text-slate-400">
                ADHD-first course completion tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              Open demo app
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-10 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              Finish courses without burnout
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              A production-ready learning dashboard for ADHD students.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              This foundation combines a calm dashboard, focus mode, course
              import system, analytics, and recovery flows so students can keep
              momentum without getting buried in productivity clutter.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/app"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Launch product demo
              </Link>
              <a
                href="#blueprint"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Review product structure
              </a>
            </div>

            <dl className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["3", "Course ingestion paths"],
                ["7", "Core product surfaces"],
                ["20+", "Production edge cases mapped"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <dt className="text-sm text-slate-400">{label}</dt>
                  <dd className="mt-2 text-3xl font-semibold text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-violet-950/30 backdrop-blur">
            <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today&apos;s focus</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    Resume Attention Systems
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm text-emerald-200">
                  16 min
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {[
                  "One clear next action",
                  "Auto-save resume point",
                  "Break long lessons into smaller steps",
                  "Gentle restart flow after missed days",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] bg-[#101829] p-5">
                <div className="flex items-end gap-3">
                  {[45, 58, 39, 62, 53, 74, 66].map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-violet-400 to-cyan-300"
                        style={{ height: `${value * 1.5}px` }}
                      />
                      <span className="text-xs text-slate-500">
                        {["M", "T", "W", "T", "F", "S", "S"][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Analytics stay visible, but they never become the main task.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="blueprint"
        className="mx-auto max-w-7xl px-6 py-20 text-slate-900 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
              Product blueprint
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Whole website structure for a production-level build.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              The implementation includes the user-facing experience and the
              underlying operational structure you need to ship safely.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section, index) => (
              <div
                key={section}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-sm font-semibold text-teal-700">
                  0{index + 1}
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-900">
                  {section}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-slate-950">
                {pillar.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
