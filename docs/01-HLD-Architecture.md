# Habit Tracker - High Level Design (HLD) & Architecture

## 1. Project Overview

**Application Name:** HabitFlow - Smart Habit Tracker  
**Type:** Full-Stack Web Application (Progressive Web App)  
**Purpose:** A comprehensive habit tracking platform that enables users to create, monitor, and achieve daily habits, weekly goals, monthly goals, and yearly goals with detailed analytics and progress dashboards.

---

## 2. Core Features & Requirements

### 2.1 Functional Requirements

| ID    | Feature                   | Description                                                          |
| ----- | ------------------------- | -------------------------------------------------------------------- |
| FR-01 | User Authentication       | Sign up, Login, OAuth (Google/GitHub), Password Reset                |
| FR-02 | Daily Habit Tracking      | Create/Edit/Delete habits, Mark complete/incomplete, Streak tracking |
| FR-03 | Weekly Goals              | Set weekly goals, Assign actions, Track weekly progress              |
| FR-04 | Monthly Goals             | Set monthly goals, Break into weekly actions, Monthly analytics      |
| FR-05 | Yearly Goals              | Set yearly goals, Break into monthly/weekly milestones               |
| FR-06 | Dashboard & Statistics    | Visual charts, Progress bars, Streak calendar, Completion rates      |
| FR-07 | Reminders & Notifications | Push notifications, Email reminders, Custom schedules                |
| FR-08 | Categories & Tags         | Organize habits by category (Health, Work, Learning, etc.)           |
| FR-09 | Habit Templates           | Pre-built habit templates for quick start                            |
| FR-10 | Data Export               | Export progress data as CSV/PDF                                      |
| FR-11 | Dark/Light Theme          | Theme toggle with system preference detection                        |
| FR-12 | Mobile Responsive         | PWA support for mobile-like experience                               |

### 2.2 Non-Functional Requirements

| ID     | Requirement   | Target                                 |
| ------ | ------------- | -------------------------------------- |
| NFR-01 | Performance   | Page load < 2s, API response < 200ms   |
| NFR-02 | Scalability   | Support 10K+ concurrent users          |
| NFR-03 | Availability  | 99.9% uptime                           |
| NFR-04 | Security      | OWASP Top 10 compliant, encrypted data |
| NFR-05 | Accessibility | WCAG 2.1 AA compliant                  |
| NFR-06 | SEO           | Server-side rendering for public pages |

---

## 3. Tech Stack (Final Decision)

### 3.1 Frontend

| Layer            | Technology                     | Reason                                                   |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| Framework        | **Next.js 15 (App Router)**    | SSR/SSG, File-based routing, Server Components           |
| Language         | **TypeScript**                 | Type safety, Better DX, Fewer runtime errors             |
| UI Library       | **shadcn/ui + Tailwind CSS 4** | Best-in-class components, Fully customizable, Accessible |
| State Management | **Zustand**                    | Lightweight, Simple API, No boilerplate                  |
| Charts/Analytics | **Recharts + Framer Motion**   | Beautiful animations, React-native charts                |
| Forms            | **React Hook Form + Zod**      | Performance, Validation, Type-safe                       |
| Date Handling    | **date-fns**                   | Lightweight, Tree-shakeable                              |
| Icons            | **Lucide React**               | Consistent, Lightweight icon set                         |

### 3.2 Backend

| Layer      | Technology                    | Reason                                              |
| ---------- | ----------------------------- | --------------------------------------------------- |
| Runtime    | **Node.js 22**                | JavaScript ecosystem, Non-blocking I/O              |
| Framework  | **Next.js API Routes + tRPC** | End-to-end type safety, Co-located with frontend    |
| ORM        | **Prisma**                    | Type-safe queries, Auto-generated types, Migrations |
| Auth       | **NextAuth.js v5 (Auth.js)**  | Multiple providers, Session management, JWT         |
| Validation | **Zod**                       | Runtime validation, Shared schemas                  |
| Email      | **Resend**                    | Modern email API, React email templates             |
| Cron Jobs  | **Vercel Cron / node-cron**   | Scheduled reminders, Streak calculations            |

### 3.3 Database

| Layer        | Technology                   | Reason                                               |
| ------------ | ---------------------------- | ---------------------------------------------------- |
| Primary DB   | **PostgreSQL (via Neon DB)** | Relational data, ACID compliance, Serverless scaling |
| Caching      | **Redis (Upstash)**          | Session cache, Rate limiting, Leaderboards           |
| File Storage | **Cloudflare R2 / AWS S3**   | Profile images, Export files                         |

### 3.4 DevOps & Deployment

| Layer      | Technology              | Reason                                         |
| ---------- | ----------------------- | ---------------------------------------------- |
| Hosting    | **Vercel**              | Zero-config Next.js deployment, Edge functions |
| CI/CD      | **GitHub Actions**      | Automated testing, Linting, Deployment         |
| Monitoring | **Sentry**              | Error tracking, Performance monitoring         |
| Analytics  | **PostHog**             | Product analytics, Feature flags               |
| Testing    | **Vitest + Playwright** | Unit + E2E testing                             |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/PWA)                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Next.js App Router (React Server Components + Client)      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│  │  │Dashboard │ │ Habits   │ │  Goals   │ │  Analytics   │  │ │
│  │  │  Page    │ │  CRUD    │ │  System  │ │  & Reports   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│  │  │ shadcn/  │ │ Recharts │ │  Zustand │ │ React Hook   │  │ │
│  │  │   ui     │ │  Charts  │ │  Store   │ │    Form      │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTPS / WebSocket
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Next.js + tRPC)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  API Routes  │  │   tRPC       │  │   Auth.js (NextAuth) │  │
│  │  /api/*      │  │   Router     │  │   Sessions / JWT     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                      │              │
│  ┌──────▼──────────────────▼──────────────────────▼───────────┐ │
│  │              Business Logic Layer                            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│  │  │  Habit   │ │   Goal   │ │ Analytics│ │ Notification │  │ │
│  │  │ Service  │ │  Service │ │  Service │ │   Service    │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   Cloudflare R2      │  │
│  │  (Neon DB)   │  │  (Upstash)   │  │   (File Storage)     │  │
│  │              │  │              │  │                       │  │
│  │  - Users     │  │  - Sessions  │  │  - Profile Images    │  │
│  │  - Habits    │  │  - Cache     │  │  - Export Files      │  │
│  │  - Goals     │  │  - Rate Limit│  │  - Attachments       │  │
│  │  - Tracking  │  │  - Streaks   │  │                       │  │
│  │  - Analytics │  │              │  │                       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Application Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Auth    │────▶│Dashboard │────▶│  Track   │
│  Lands   │     │  Flow    │     │  View    │     │  Habits  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                       │                  │
                                       ▼                  ▼
                                  ┌──────────┐     ┌──────────┐
                                  │  Goals   │     │Analytics │
                                  │  System  │     │  View    │
                                  └──────────┘     └──────────┘
                                       │
                        ┌──────────────┼──────────────┐
                        ▼              ▼              ▼
                  ┌──────────┐  ┌──────────┐  ┌──────────┐
                  │  Weekly  │  │ Monthly  │  │  Yearly  │
                  │  Goals   │  │  Goals   │  │  Goals   │
                  └──────────┘  └──────────┘  └──────────┘
```

---

## 6. Page Structure & Routing

```
/                          → Landing Page (public)
/login                     → Login Page
/register                  → Registration Page
/dashboard                 → Main Dashboard (protected)
/habits                    → All Habits List
/habits/[id]               → Single Habit Detail + History
/habits/new                → Create New Habit
/goals                     → Goals Overview
/goals/weekly              → Weekly Goals
/goals/monthly             → Monthly Goals
/goals/yearly              → Yearly Goals
/goals/[id]                → Goal Detail + Actions
/analytics                 → Full Analytics & Reports
/analytics/habits          → Habit-specific analytics
/analytics/goals           → Goal-specific analytics
/settings                  → User Settings
/settings/profile          → Profile Management
/settings/notifications    → Notification Preferences
/settings/export           → Data Export
```

---

## 7. Key Design Decisions

| Decision                | Choice                           | Rationale                                                                |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Monorepo vs Separate    | **Monorepo (Next.js fullstack)** | Faster development, Shared types, Simpler deployment                     |
| REST vs GraphQL vs tRPC | **tRPC**                         | End-to-end type safety, No code generation, Works perfectly with Next.js |
| SQL vs NoSQL            | **PostgreSQL (SQL)**             | Relational data (habits→logs→goals), ACID, Complex queries for analytics |
| Server vs Serverless    | **Serverless (Vercel)**          | Auto-scaling, No server management, Cost-effective                       |
| CSS Framework           | **Tailwind + shadcn/ui**         | Utility-first, Pre-built accessible components, Best DX                  |
| Auth Strategy           | **JWT + Session (hybrid)**       | Security + Performance balance                                           |

---

## 8. Security Architecture

- **Authentication:** Auth.js with JWT tokens + HTTP-only cookies
- **Authorization:** Role-based (User/Admin) + Resource ownership checks
- **Input Validation:** Zod schemas on both client and server
- **SQL Injection:** Prisma ORM (parameterized queries)
- **XSS Prevention:** React auto-escaping + CSP headers
- **CSRF Protection:** SameSite cookies + CSRF tokens
- **Rate Limiting:** Upstash Redis rate limiter
- **Data Encryption:** TLS in transit, AES-256 at rest (Neon)
- **CORS:** Strict origin policy

---

## 9. Performance Strategy

- **Server Components:** Reduce client JS bundle
- **Streaming SSR:** Progressive page loading
- **Edge Caching:** Vercel Edge Network
- **Database Pooling:** Prisma connection pooling via Neon
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Dynamic imports for heavy components (charts)
- **Prefetching:** Link prefetching for common navigation paths
- **Service Worker:** PWA offline support for habit check-ins

---

## 10. Monitoring & Observability

- **Error Tracking:** Sentry (frontend + backend)
- **Performance:** Vercel Analytics + Web Vitals
- **Logging:** Structured JSON logs (Pino)
- **Uptime:** Better Uptime / Checkly
- **User Analytics:** PostHog (privacy-friendly)
