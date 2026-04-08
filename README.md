# FocusFlow

Production-oriented ADHD course completion tracker and analytics dashboard built with Next.js.

## Links

- GitHub repository: [https://github.com/deepgori/focusflow-adhd-tracker](https://github.com/deepgori/focusflow-adhd-tracker)
- Live deployment: [https://focusflow-adhd-tracker-pygmgyo87-vedang-jadhavs-projects.vercel.app](https://focusflow-adhd-tracker-pygmgyo87-vedang-jadhavs-projects.vercel.app)

## Included

- Marketing landing page at `/`
- Interactive product demo at `/app`
- ADHD-first dashboard, course view, focus mode, analytics, workflow center, import system, and settings screens
- Typed mock backend models in `src/lib`
- Example API routes:
  - `/api/dashboard`
  - `/api/courses`
  - `/api/preferences`
  - `/api/events`
  - `/api/workflows`
  - `/api/product-blueprint`

## Product structure

### User-facing surfaces

1. Landing and onboarding
2. Authentication and session recovery
3. Home dashboard / command center
4. Course library and lesson detail
5. Focus mode
6. Analytics
7. Workflow center
8. Course import
9. Settings and accessibility

## Deployment

This project is deployed on Vercel as a production deployment.

- Platform: Vercel
- Project: `focusflow-adhd-tracker`
- Live URL: [https://focusflow-adhd-tracker-pygmgyo87-vedang-jadhavs-projects.vercel.app](https://focusflow-adhd-tracker-pygmgyo87-vedang-jadhavs-projects.vercel.app)

### Core product workflows

1. First-run onboarding to first focus session
2. Daily learning loop
3. Comeback after inactivity
4. Preference personalization and persistence

### Core backend entities

- User
- Course
- Module
- Lesson
- Task
- Progress
- Session
- Note
- AnalyticsEvent

### Core production edge cases

- Mid-session abandonment
- Overwhelm from too many visible tasks
- Long inactivity comeback flows
- Hyperfocus and fatigue protection
- Offline sync drift
- Duplicate completion events
- Timezone boundary errors
- Partial completion thresholds
- Variable course structures
- Avoidance mode
- Perfectionism loops
- Skip-heavy behavior

## Local development

```bash
npm run dev
```

## Recommended next implementation steps

1. Replace mock data with PostgreSQL models and route handlers backed by persistence.
2. Add real auth using magic links plus Google OAuth.
3. Persist sessions, progress, notes, and event analytics.
4. Add background jobs for reminders, restart flows, and re-import syncs.
5. Add offline caching and event replay for mobile and unreliable networks.
