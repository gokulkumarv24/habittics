# Habit Tracker - UI/UX Design & Implementation Plan

---

## 1. UI Design System

### Color Palette

```
Primary:     #6366f1 (Indigo)     - Main actions, active states
Secondary:   #8b5cf6 (Violet)     - Goals, accents
Success:     #10b981 (Emerald)    - Completed, streaks
Warning:     #f59e0b (Amber)      - Approaching deadline
Danger:      #ef4444 (Red)        - Missed, failed
Neutral:     #64748b (Slate)      - Text, borders

Background (Light): #ffffff / #f8fafc
Background (Dark):  #0f172a / #1e293b
```

### Typography

```
Font Family: Inter (Google Fonts)
Headings:    font-bold tracking-tight
Body:        font-normal
Mono:        JetBrains Mono (for stats/numbers)
```

### Component Variants (shadcn/ui)

- Cards with subtle shadows and hover effects
- Rounded corners (radius: 0.75rem)
- Micro-animations on interactions (Framer Motion)
- Skeleton loading states everywhere

---

## 2. Page Layouts & Wireframes

### Dashboard (Main Page)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────┐                                    🔔  👤  ☀️/🌙  │
│  │ Logo │  HabitFlow          Search...                      │
│  └──────┘                                                    │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ 📊 Dash  │  Good Morning, Gokul! 👋                         │
│          │                                                   │
│ ✅ Habits │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│          │  │ Today  │ │ Streak │ │ Weekly │ │ Goals  │   │
│ 🎯 Goals │  │  5/8   │ │  12🔥  │ │  78%   │ │  3/5   │   │
│  ├ Weekly│  │ habits │ │  days  │ │ done   │ │ active │   │
│  ├ Month │  └────────┘ └────────┘ └────────┘ └────────┘   │
│  └ Year  │                                                   │
│          │  ┌─── Today's Habits ────────────────────────┐   │
│ 📈 Stats │  │                                            │   │
│          │  │  ○ Morning Meditation    15 min    [ ✓ ]   │   │
│ ⚙️ Settin│  │  ○ Read Book             30 min    [ ✓ ]   │   │
│          │  │  ○ Exercise              45 min    [   ]   │   │
│          │  │  ○ Drink Water           8 glasses [5/8]   │   │
│          │  │  ○ Journal               10 min    [   ]   │   │
│          │  │                                            │   │
│          │  └────────────────────────────────────────────┘   │
│          │                                                   │
│          │  ┌─── Streak Calendar ───┐ ┌── Active Goals ──┐  │
│          │  │  ■ ■ ■ □ ■ ■ ■       │ │                   │  │
│          │  │  ■ ■ □ ■ ■ ■ ■       │ │  Read 12 Books    │  │
│          │  │  ■ ■ ■ ■ ■ □ ■       │ │  ████████░░ 75%   │  │
│          │  │  ■ ■ ■ ■ □ □ ■       │ │                   │  │
│          │  │  (GitHub-style)       │ │  Run 100km        │  │
│          │  └───────────────────────┘ │  █████░░░░░ 45%   │  │
│          │                            └───────────────────┘  │
│          │  ┌─── Weekly Progress Chart ─────────────────┐   │
│          │  │        ╭─╮                                 │   │
│          │  │   ╭─╮  │ │  ╭─╮                           │   │
│          │  │   │ │  │ │  │ │  ╭─╮  ╭─╮                │   │
│          │  │   │ │  │ │  │ │  │ │  │ │  ╭─╮  ╭─╮     │   │
│          │  │   Mon  Tue  Wed  Thu  Fri  Sat  Sun      │   │
│          │  └────────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────┘
```

### Goals Page (Hierarchy View)

```
┌──────────────────────────────────────────────────────────────┐
│  🎯 Goals                              [+ New Goal] [Filter] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌── Yearly Goals ─────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  📚 Read 24 Books (2026)              ████████░░ 75%     │ │
│  │  ├── 📅 January: Read 2 Books         ██████████ 100%   │ │
│  │  │   ├── Week 1: Read "Atomic Habits" ✅                │ │
│  │  │   └── Week 2: Read "Deep Work"     ✅                │ │
│  │  ├── 📅 February: Read 2 Books        ████████░░ 50%    │ │
│  │  │   ├── Week 1: Read "The Lean..."   ✅                │ │
│  │  │   └── Week 2: Read "Zero to One"   ⏳ In Progress    │ │
│  │  └── 📅 March: Read 2 Books           ░░░░░░░░░░ 0%     │ │
│  │                                                          │ │
│  │  🏃 Run 500km (2026)                  ███░░░░░░░ 30%    │ │
│  │  └── ...                                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Analytics Page

```
┌──────────────────────────────────────────────────────────────┐
│  📈 Analytics          [This Week ▼] [All Habits ▼] [Export] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Completion Rate Over Time (Line Chart)              │    │
│  │                     ╭──╮                             │    │
│  │            ╭──╮    ╭╯  ╰╮    ╭──╮                   │    │
│  │   ╭──╮   ╭╯  ╰──╮╯    ╰╮  ╭╯  ╰──╮                │    │
│  │  ╭╯  ╰──╯        ╰╮    ╰──╯       ╰╮               │    │
│  │  100% ─────────────────────────────────              │    │
│  │   75% ─────────────────────────────────              │    │
│  │   50% ─────────────────────────────────              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── By Category ────┐  ┌──── Best Habits ───────────┐   │
│  │                      │  │                             │   │
│  │    Health: 85%       │  │  1. 🧘 Meditation  95% 🔥  │   │
│  │    ████████░░        │  │  2. 📚 Reading     88%     │   │
│  │                      │  │  3. 💧 Water       82%     │   │
│  │    Learning: 72%     │  │  4. 🏃 Exercise    65%     │   │
│  │    ███████░░░        │  │  5. ✍️ Journal     45% ⚠️  │   │
│  │                      │  │                             │   │
│  │    Work: 60%         │  │                             │   │
│  │    ██████░░░░        │  │                             │   │
│  └──────────────────────┘  └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task                                            | Priority | Effort |
| ----------------------------------------------- | -------- | ------ |
| Project setup (Next.js + TypeScript + Tailwind) | P0       | 2h     |
| Database schema + Prisma setup                  | P0       | 3h     |
| Authentication (Auth.js + Google/GitHub)        | P0       | 4h     |
| shadcn/ui setup + Theme system                  | P0       | 2h     |
| Dashboard layout (sidebar + header)             | P0       | 3h     |
| Basic routing structure                         | P0       | 2h     |

### Phase 2: Core Habits (Week 2-3)

| Task                               | Priority | Effort |
| ---------------------------------- | -------- | ------ |
| Habit CRUD (create, edit, delete)  | P0       | 4h     |
| Daily habit check-off              | P0       | 3h     |
| Habit list view with categories    | P0       | 3h     |
| Streak calculation logic           | P0       | 4h     |
| Habit calendar view (GitHub-style) | P1       | 4h     |
| Category management                | P1       | 2h     |

### Phase 3: Goals System (Week 3-4)

| Task                              | Priority | Effort |
| --------------------------------- | -------- | ------ |
| Goal CRUD (weekly/monthly/yearly) | P0       | 5h     |
| Goal actions (sub-tasks)          | P0       | 3h     |
| Goal hierarchy (year→month→week)  | P0       | 5h     |
| Goal progress tracking            | P0       | 3h     |
| Goal timeline view                | P1       | 4h     |

### Phase 4: Dashboard & Analytics (Week 4-5)

| Task                      | Priority | Effort |
| ------------------------- | -------- | ------ |
| Dashboard stats cards     | P0       | 3h     |
| Today's habits widget     | P0       | 2h     |
| Weekly completion chart   | P0       | 3h     |
| Completion rate analytics | P0       | 4h     |
| Category breakdown        | P1       | 3h     |
| Trend analysis            | P1       | 3h     |
| Export functionality      | P2       | 3h     |

### Phase 5: Polish & Extras (Week 5-6)

| Task                        | Priority | Effort |
| --------------------------- | -------- | ------ |
| Notifications & reminders   | P1       | 5h     |
| PWA setup (offline support) | P1       | 4h     |
| Animations (Framer Motion)  | P2       | 3h     |
| Habit templates             | P2       | 2h     |
| Mobile responsive polish    | P1       | 4h     |
| Performance optimization    | P1       | 3h     |
| E2E tests (Playwright)      | P2       | 4h     |
| Deployment (Vercel)         | P0       | 2h     |

---

## 4. Dashboard Widgets Summary

| Widget                   | Data Source                     | Refresh     |
| ------------------------ | ------------------------------- | ----------- |
| Today's Stats (4 cards)  | analytics.getDailyStats         | Real-time   |
| Today's Habits Checklist | habit.getAll (today)            | On mutation |
| Streak Calendar          | habit.getLogsForRange (90 days) | Daily       |
| Weekly Bar Chart         | analytics.getWeeklyStats        | Daily       |
| Active Goals             | goal.getAll (IN_PROGRESS)       | On mutation |
| Motivation Quote         | Static JSON / API               | Daily       |

---

## 5. Responsive Breakpoints

```
Mobile:  < 640px   → Single column, bottom nav, cards stack
Tablet:  640-1024px → Collapsible sidebar, 2-column grid
Desktop: > 1024px   → Full sidebar, 3-column grid, all widgets
```

---

## 6. Key UI Interactions

| Interaction      | Implementation                                |
| ---------------- | --------------------------------------------- |
| Habit check-off  | Optimistic update + confetti animation        |
| Goal progress    | Animated circular progress ring               |
| Streak milestone | Toast notification + badge unlock             |
| Drag to reorder  | dnd-kit library                               |
| Theme toggle     | CSS variables + next-themes                   |
| Page transitions | Framer Motion layout animations               |
| Form validation  | Real-time Zod validation with React Hook Form |
| Empty states     | Illustrated SVG + CTA button                  |

---

## Summary: What Makes This "Best UI Ever"

1. **shadcn/ui** - Production-ready, accessible, beautiful components
2. **Tailwind CSS 4** - Utility-first, consistent design
3. **Framer Motion** - Smooth animations and transitions
4. **Recharts** - Beautiful, interactive data visualizations
5. **Dark/Light mode** - System-aware theme switching
6. **GitHub-style calendar** - Visual streak representation
7. **Progressive disclosure** - Simple by default, powerful when needed
8. **Skeleton loading** - No layout shift, feels instant
9. **Micro-interactions** - Haptic feedback, confetti on milestones
10. **Mobile-first** - PWA with offline habit check-ins
