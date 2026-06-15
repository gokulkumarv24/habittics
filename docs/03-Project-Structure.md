# Habit Tracker - Project Structure & Folder Architecture

## Complete Project Tree

```
habit-tracker/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + Test + Type-check
│       └── deploy.yml                # Auto-deploy to Vercel
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Seed data (categories, templates)
│   └── migrations/                   # Auto-generated migrations
│
├── public/
│   ├── icons/                        # PWA icons
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Main dashboard
│   │   │   ├── habits/
│   │   │   │   ├── page.tsx          # Habits list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create habit
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Habit detail
│   │   │   ├── goals/
│   │   │   │   ├── page.tsx          # Goals overview
│   │   │   │   ├── weekly/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── monthly/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── yearly/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Goal detail + actions
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx          # Analytics dashboard
│   │   │   │   ├── habits/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── goals/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── notifications/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx            # Dashboard layout (sidebar + nav)
│   │   │
│   │   ├── api/
│   │   │   ├── trpc/
│   │   │   │   └── [trpc]/
│   │   │   │       └── route.ts      # tRPC handler
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # Auth.js handler
│   │   │   └── cron/
│   │   │       ├── streak-calculator/
│   │   │       │   └── route.ts      # Daily streak update
│   │   │       └── reminders/
│   │   │           └── route.ts      # Send reminders
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── loading.tsx               # Global loading
│   │   ├── error.tsx                 # Global error
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx           # Main sidebar navigation
│   │   │   ├── header.tsx            # Top header bar
│   │   │   ├── mobile-nav.tsx        # Mobile navigation
│   │   │   └── theme-toggle.tsx      # Dark/Light mode
│   │   │
│   │   ├── habits/
│   │   │   ├── habit-card.tsx        # Single habit card
│   │   │   ├── habit-list.tsx        # Habits list view
│   │   │   ├── habit-form.tsx        # Create/Edit form
│   │   │   ├── habit-check-button.tsx # Daily check-off
│   │   │   ├── habit-streak-badge.tsx # Streak display
│   │   │   └── habit-calendar.tsx    # Contribution calendar
│   │   │
│   │   ├── goals/
│   │   │   ├── goal-card.tsx         # Goal progress card
│   │   │   ├── goal-form.tsx         # Create/Edit goal
│   │   │   ├── goal-actions-list.tsx # Actions checklist
│   │   │   ├── goal-progress-ring.tsx # Circular progress
│   │   │   └── goal-hierarchy.tsx    # Year→Month→Week tree
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-overview.tsx    # Key metrics cards
│   │   │   ├── today-habits.tsx      # Today's habits widget
│   │   │   ├── streak-calendar.tsx   # GitHub-style calendar
│   │   │   ├── weekly-chart.tsx      # Weekly completion chart
│   │   │   ├── active-goals.tsx      # Active goals summary
│   │   │   └── motivation-quote.tsx  # Daily motivation
│   │   │
│   │   ├── analytics/
│   │   │   ├── completion-chart.tsx  # Line/Bar chart
│   │   │   ├── category-breakdown.tsx # Pie chart
│   │   │   ├── trend-analysis.tsx    # Trend indicators
│   │   │   ├── best-worst-habits.tsx # Performance ranking
│   │   │   └── goal-timeline.tsx     # Timeline view
│   │   │
│   │   └── shared/
│   │       ├── empty-state.tsx       # Empty state illustrations
│   │       ├── loading-skeleton.tsx  # Loading skeletons
│   │       ├── confirm-dialog.tsx    # Confirmation modal
│   │       ├── date-range-picker.tsx # Date picker
│   │       └── color-picker.tsx      # Color selector
│   │
│   ├── server/
│   │   ├── trpc/
│   │   │   ├── index.ts             # tRPC initialization
│   │   │   ├── router.ts            # Root router
│   │   │   └── context.ts           # Request context
│   │   │
│   │   ├── routers/
│   │   │   ├── habit.router.ts      # Habit CRUD + tracking
│   │   │   ├── goal.router.ts       # Goal CRUD + actions
│   │   │   ├── analytics.router.ts  # Analytics queries
│   │   │   ├── category.router.ts   # Category management
│   │   │   ├── notification.router.ts # Notifications
│   │   │   └── user.router.ts       # User settings
│   │   │
│   │   ├── services/
│   │   │   ├── habit.service.ts     # Habit business logic
│   │   │   ├── goal.service.ts      # Goal business logic
│   │   │   ├── streak.service.ts    # Streak calculation
│   │   │   ├── analytics.service.ts # Analytics aggregation
│   │   │   └── notification.service.ts # Notification dispatch
│   │   │
│   │   ├── auth/
│   │   │   ├── config.ts            # Auth.js configuration
│   │   │   └── middleware.ts        # Auth middleware
│   │   │
│   │   └── db/
│   │       └── client.ts            # Prisma client singleton
│   │
│   ├── lib/
│   │   ├── utils.ts                 # Utility functions (cn, formatDate)
│   │   ├── constants.ts             # App constants
│   │   ├── validations/
│   │   │   ├── habit.schema.ts      # Zod schemas for habits
│   │   │   ├── goal.schema.ts       # Zod schemas for goals
│   │   │   └── user.schema.ts       # Zod schemas for user
│   │   └── helpers/
│   │       ├── date.helpers.ts      # Date utility functions
│   │       ├── streak.helpers.ts    # Streak calculation helpers
│   │       └── analytics.helpers.ts # Analytics computation
│   │
│   ├── hooks/
│   │   ├── use-habits.ts            # Habit data hooks
│   │   ├── use-goals.ts             # Goal data hooks
│   │   ├── use-analytics.ts         # Analytics hooks
│   │   ├── use-theme.ts             # Theme toggle hook
│   │   └── use-media-query.ts       # Responsive hook
│   │
│   ├── stores/
│   │   ├── habit.store.ts           # Zustand habit store
│   │   ├── ui.store.ts              # UI state (sidebar, modals)
│   │   └── filter.store.ts          # Filter/sort preferences
│   │
│   ├── types/
│   │   ├── habit.types.ts           # Habit TypeScript types
│   │   ├── goal.types.ts            # Goal TypeScript types
│   │   └── analytics.types.ts       # Analytics types
│   │
│   └── config/
│       ├── site.ts                  # Site metadata
│       ├── navigation.ts            # Nav menu items
│       └── habit-templates.ts       # Pre-built templates
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── habit.service.test.ts
│   │   │   └── streak.service.test.ts
│   │   └── helpers/
│   │       └── date.helpers.test.ts
│   ├── integration/
│   │   ├── habit.router.test.ts
│   │   └── goal.router.test.ts
│   └── e2e/
│       ├── auth.spec.ts
│       ├── habits.spec.ts
│       └── goals.spec.ts
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (gitignored)
├── .eslintrc.json                   # ESLint config
├── .prettierrc                      # Prettier config
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
├── vitest.config.ts                 # Vitest config
├── playwright.config.ts             # Playwright E2E config
├── components.json                  # shadcn/ui config
├── package.json                     # Dependencies
├── docker-compose.yml               # Local PostgreSQL + Redis
└── README.md                        # Project documentation
```

---

## Environment Variables

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/habittracker?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/habittracker?schema=public"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Redis (Upstash)
REDIS_URL=""
REDIS_TOKEN=""

# Email (Resend)
RESEND_API_KEY=""

# File Storage
R2_ACCOUNT_ID=""
R2_ACCESS_KEY=""
R2_SECRET_KEY=""
R2_BUCKET_NAME=""

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=""
SENTRY_DSN=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret"
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "recharts": "^2.13.0",
    "framer-motion": "^11.0.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.460.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "resend": "^4.0.0",
    "@upstash/redis": "^1.34.0",
    "@upstash/ratelimit": "^2.0.0",
    "pino": "^9.5.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "prisma": "^6.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.4.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.49.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```
