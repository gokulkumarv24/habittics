# Habit Tracker - API Design (tRPC Routers)

## API Architecture Overview

All APIs use **tRPC** for end-to-end type safety. No REST endpoints needed except for Auth.js and Cron webhooks.

---

## Router Structure

```
appRouter
├── habit
│   ├── getAll          → List user's habits (with filters)
│   ├── getById         → Single habit with logs
│   ├── create          → Create new habit
│   ├── update          → Update habit details
│   ├── delete          → Soft delete (archive)
│   ├── reorder         → Update habit order
│   ├── toggleComplete  → Mark habit done/undone for date
│   ├── getLogsForRange → Get logs between dates
│   └── getStreak       → Get streak info
│
├── goal
│   ├── getAll          → List goals (filter by type/status)
│   ├── getById         → Single goal with actions + children
│   ├── create          → Create new goal
│   ├── update          → Update goal
│   ├── delete          → Delete goal
│   ├── updateProgress  → Update current value
│   ├── getHierarchy    → Get full goal tree (Year→Month→Week)
│   │
│   └── action
│       ├── create      → Add action to goal
│       ├── update      → Update action
│       ├── delete      → Delete action
│       ├── toggle      → Mark action complete/incomplete
│       └── reorder     → Reorder actions
│
├── analytics
│   ├── getDailyStats       → Today's completion summary
│   ├── getWeeklyStats      → This week's data
│   ├── getMonthlyStats     → This month's data
│   ├── getCompletionRate   → Rate over date range
│   ├── getStreakLeaderboard → Top streaks
│   ├── getCategoryBreakdown → By category stats
│   ├── getTrendData        → Trend over time
│   └── getGoalProgress     → Goal completion stats
│
├── category
│   ├── getAll     → List categories
│   ├── create     → Create category
│   ├── update     → Update category
│   ├── delete     → Delete category
│   └── reorder    → Reorder categories
│
├── notification
│   ├── getAll       → List notifications
│   ├── markRead     → Mark as read
│   ├── markAllRead  → Mark all as read
│   └── delete       → Delete notification
│
└── user
    ├── getProfile     → Get user profile
    ├── updateProfile  → Update profile
    ├── getSettings    → Get settings
    ├── updateSettings → Update settings
    └── exportData     → Export all data (CSV/JSON)
```

---

## Detailed API Specifications

### Habit Router

```typescript
// Input/Output Types

// CREATE HABIT
input: {
  title: string;           // Required, 1-100 chars
  description?: string;    // Optional, max 500 chars
  icon?: string;           // Icon name
  color?: string;          // Hex color
  frequency: "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";
  customDays?: number[];   // Required if frequency is CUSTOM
  targetPerDay?: number;   // Default: 1
  unit?: string;           // e.g., "minutes"
  categoryId?: string;     // Optional category
  startDate?: Date;        // Default: today
}

output: Habit              // Full habit object with relations

// TOGGLE COMPLETE
input: {
  habitId: string;
  date: Date;              // The date to toggle
  value?: number;          // For quantifiable habits
  note?: string;           // Optional note
}

output: {
  log: HabitLog;
  streak: HabitStreak;     // Updated streak info
}
```

### Goal Router

```typescript
// CREATE GOAL
input: {
  title: string;
  description?: string;
  type: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: Date;
  endDate: Date;
  targetValue?: number;
  unit?: string;
  color?: string;
  categoryId?: string;
  parentGoalId?: string;   // Link to parent goal
  actions?: {              // Initial actions
    title: string;
    dueDate?: Date;
  }[];
}

output: Goal               // Full goal with actions

// GET HIERARCHY
input: {
  goalId: string;          // Yearly goal ID
}

output: {
  goal: Goal;
  children: {              // Monthly goals
    goal: Goal;
    children: {            // Weekly goals
      goal: Goal;
      actions: GoalAction[];
    }[];
  }[];
}
```

### Analytics Router

```typescript
// GET COMPLETION RATE
input: {
  startDate: Date;
  endDate: Date;
  habitId?: string;        // Optional: specific habit
  categoryId?: string;     // Optional: by category
  granularity: "day" | "week" | "month";
}

output: {
  data: {
    date: string;
    total: number;
    completed: number;
    rate: number;          // Percentage
  }[];
  average: number;         // Overall average rate
  trend: "up" | "down" | "stable";
}

// GET DAILY STATS (Dashboard)
input: {
  date?: Date;             // Default: today
}

output: {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  currentStreaks: { habitId: string; title: string; streak: number }[];
  activeGoals: number;
  goalsCompletedThisWeek: number;
  longestStreak: { habitId: string; title: string; streak: number };
}
```

---

## Cron Job APIs (REST)

```
POST /api/cron/streak-calculator
  - Runs: Daily at 00:05 UTC
  - Auth: Bearer CRON_SECRET
  - Action: Calculate and update all streaks
  - Resets streaks for missed days

POST /api/cron/reminders
  - Runs: Every hour
  - Auth: Bearer CRON_SECRET
  - Action: Send pending reminders based on user timezone
```

---

## Error Handling

```typescript
// Standard error codes used across all routers
{
  UNAUTHORIZED: "Must be logged in",
  FORBIDDEN: "Not your resource",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Invalid input",
  CONFLICT: "Resource already exists",
  RATE_LIMITED: "Too many requests"
}
```

---

## Rate Limiting

| Endpoint Group                   | Limit       |
| -------------------------------- | ----------- |
| Auth (login/register)            | 5 req/min   |
| Mutations (create/update/delete) | 30 req/min  |
| Queries (read)                   | 100 req/min |
| Analytics                        | 20 req/min  |
| Export                           | 3 req/hour  |
