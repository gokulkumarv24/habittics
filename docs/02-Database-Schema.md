# Habit Tracker - Database Schema Design

## Database: PostgreSQL (Neon DB) + Prisma ORM

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    User      │       │      Habit       │       │   HabitLog       │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)          │──┐    │ id (PK)          │
│ email        │  │    │ userId (FK)      │  │    │ habitId (FK)     │
│ name         │  │    │ title            │  │    │ date             │
│ avatarUrl    │  │    │ description      │  │    │ completed        │
│ password     │  │    │ icon             │  │    │ note             │
│ provider     │  ├───▶│ color            │  ├───▶│ value            │
│ createdAt    │  │    │ frequency        │  │    │ createdAt        │
│ updatedAt    │  │    │ targetPerDay     │  │    └──────────────────┘
└──────────────┘  │    │ categoryId (FK)  │  │
                  │    │ startDate        │  │    ┌──────────────────┐
                  │    │ isArchived       │  │    │   HabitStreak    │
                  │    │ order            │  │    ├──────────────────┤
                  │    │ createdAt        │  │    │ id (PK)          │
                  │    │ updatedAt        │  ├───▶│ habitId (FK)     │
                  │    └──────────────────┘  │    │ currentStreak    │
                  │                          │    │ longestStreak    │
                  │    ┌──────────────────┐  │    │ lastCompletedAt  │
                  │    │    Category      │  │    └──────────────────┘
                  │    ├──────────────────┤  │
                  │    │ id (PK)          │  │
                  ├───▶│ userId (FK)      │  │
                  │    │ name             │  │
                  │    │ color            │  │
                  │    │ icon             │  │
                  │    │ order            │  │
                  │    └──────────────────┘  │
                  │                          │
                  │    ┌──────────────────┐  │    ┌──────────────────┐
                  │    │      Goal        │  │    │   GoalAction     │
                  │    ├──────────────────┤  │    ├──────────────────┤
                  │    │ id (PK)          │──┘    │ id (PK)          │
                  ├───▶│ userId (FK)      │       │ goalId (FK)      │
                  │    │ title            │──────▶│ title            │
                  │    │ description      │       │ description      │
                  │    │ type (ENUM)      │       │ dueDate          │
                  │    │ startDate        │       │ completed        │
                  │    │ endDate          │       │ completedAt      │
                  │    │ targetValue      │       │ order            │
                  │    │ currentValue     │       │ createdAt        │
                  │    │ unit             │       └──────────────────┘
                  │    │ status (ENUM)    │
                  │    │ parentGoalId(FK) │──── Self-referencing (Yearly→Monthly→Weekly)
                  │    │ categoryId (FK)  │
                  │    │ createdAt        │
                  │    │ updatedAt        │
                  │    └──────────────────┘
                  │
                  │    ┌──────────────────┐       ┌──────────────────┐
                  │    │  Notification    │       │  UserSettings    │
                  │    ├──────────────────┤       ├──────────────────┤
                  ├───▶│ id (PK)          │       │ id (PK)          │
                  │    │ userId (FK)      │       │ userId (FK)      │
                  ├───▶│ title            │  ┌───▶│ theme            │
                       │ message          │  │    │ timezone         │
                       │ type (ENUM)      │  │    │ weekStartDay     │
                       │ read             │  │    │ reminderTime     │
                       │ scheduledAt      │  │    │ emailNotify      │
                       │ createdAt        │  │    │ pushNotify       │
                       └──────────────────┘  │    │ language         │
                                             │    └──────────────────┘
                                             │
                              User ──────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============== ENUMS ==============

enum GoalType {
  WEEKLY
  MONTHLY
  YEARLY
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  FAILED
  PAUSED
}

enum HabitFrequency {
  DAILY
  WEEKDAYS
  WEEKENDS
  CUSTOM
}

enum NotificationType {
  REMINDER
  STREAK_MILESTONE
  GOAL_DEADLINE
  GOAL_COMPLETED
  SYSTEM
}

enum AuthProvider {
  EMAIL
  GOOGLE
  GITHUB
}

// ============== MODELS ==============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  passwordHash  String?
  provider      AuthProvider @default(EMAIL)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  habits        Habit[]
  goals         Goal[]
  categories    Category[]
  notifications Notification[]
  settings      UserSettings?
  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Category {
  id     String @id @default(cuid())
  userId String
  name   String
  color  String @default("#6366f1")
  icon   String @default("folder")
  order  Int    @default(0)

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  habits Habit[]
  goals  Goal[]

  @@unique([userId, name])
  @@map("categories")
}

model Habit {
  id           String         @id @default(cuid())
  userId       String
  categoryId   String?
  title        String
  description  String?
  icon         String         @default("check-circle")
  color        String         @default("#10b981")
  frequency    HabitFrequency @default(DAILY)
  customDays   Int[]          @default([]) // 0=Sun, 1=Mon, ..., 6=Sat
  targetPerDay Int            @default(1)
  unit         String?        // e.g., "minutes", "glasses", "pages"
  startDate    DateTime       @default(now())
  isArchived   Boolean        @default(false)
  order        Int            @default(0)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  // Relations
  user     User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category?    @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  logs     HabitLog[]
  streak   HabitStreak?

  @@index([userId, isArchived])
  @@index([userId, categoryId])
  @@map("habits")
}

model HabitLog {
  id        String   @id @default(cuid())
  habitId   String
  date      DateTime @db.Date
  completed Boolean  @default(false)
  value     Int      @default(0) // For quantifiable habits
  note      String?
  createdAt DateTime @default(now())

  habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([habitId, date])
  @@index([date])
  @@map("habit_logs")
}

model HabitStreak {
  id              String   @id @default(cuid())
  habitId         String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastCompletedAt DateTime?
  updatedAt       DateTime @updatedAt

  habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@map("habit_streaks")
}

model Goal {
  id           String     @id @default(cuid())
  userId       String
  categoryId   String?
  parentGoalId String?    // For goal hierarchy (Year→Month→Week)
  title        String
  description  String?
  type         GoalType
  status       GoalStatus @default(NOT_STARTED)
  startDate    DateTime
  endDate      DateTime
  targetValue  Float?     // Numeric target (optional)
  currentValue Float      @default(0)
  unit         String?    // e.g., "books", "km", "hours"
  color        String     @default("#8b5cf6")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category?    @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  parentGoal Goal?        @relation("GoalHierarchy", fields: [parentGoalId], references: [id], onDelete: SetNull)
  childGoals Goal[]       @relation("GoalHierarchy")
  actions    GoalAction[]

  @@index([userId, type, status])
  @@index([userId, parentGoalId])
  @@index([endDate])
  @@map("goals")
}

model GoalAction {
  id          String    @id @default(cuid())
  goalId      String
  title       String
  description String?
  dueDate     DateTime?
  completed   Boolean   @default(false)
  completedAt DateTime?
  order       Int       @default(0)
  createdAt   DateTime  @default(now())

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId, completed])
  @@map("goal_actions")
}

model Notification {
  id          String           @id @default(cuid())
  userId      String
  title       String
  message     String
  type        NotificationType
  read        Boolean          @default(false)
  scheduledAt DateTime?
  createdAt   DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([scheduledAt])
  @@map("notifications")
}

model UserSettings {
  id             String  @id @default(cuid())
  userId         String  @unique
  theme          String  @default("system") // "light" | "dark" | "system"
  timezone       String  @default("UTC")
  weekStartDay   Int     @default(1) // 0=Sun, 1=Mon
  reminderTime   String  @default("08:00")
  emailNotify    Boolean @default(true)
  pushNotify     Boolean @default(true)
  language       String  @default("en")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}
```

---

## Key Database Design Decisions

### 1. Goal Hierarchy (Self-Referencing)

```
Yearly Goal
  └── Monthly Goal (parentGoalId → Yearly)
       └── Weekly Goal (parentGoalId → Monthly)
            └── Goal Actions (individual tasks)
```

### 2. Habit Tracking Strategy

- **HabitLog:** One record per habit per day (unique constraint on habitId + date)
- **HabitStreak:** Denormalized streak data for fast dashboard rendering
- **Streak Calculation:** Cron job runs daily at midnight (user timezone)

### 3. Indexing Strategy

- Composite indexes on frequently queried combinations
- Date-based indexes for time-range queries (analytics)
- Status indexes for filtered goal views

### 4. Data Retention

- Habit logs: Kept indefinitely (core feature)
- Notifications: Auto-deleted after 90 days
- Sessions: Expire after 30 days

---

## Analytics Queries (Examples)

```sql
-- Daily completion rate for a user
SELECT
  date,
  COUNT(CASE WHEN completed THEN 1 END)::float / COUNT(*) * 100 as completion_rate
FROM habit_logs
WHERE habit_id IN (SELECT id FROM habits WHERE user_id = $1)
GROUP BY date
ORDER BY date DESC
LIMIT 30;

-- Weekly goal progress
SELECT
  g.title,
  g.target_value,
  g.current_value,
  (g.current_value / NULLIF(g.target_value, 0) * 100) as progress_pct,
  COUNT(ga.id) as total_actions,
  COUNT(CASE WHEN ga.completed THEN 1 END) as completed_actions
FROM goals g
LEFT JOIN goal_actions ga ON ga.goal_id = g.id
WHERE g.user_id = $1 AND g.type = 'WEEKLY'
GROUP BY g.id;
```
