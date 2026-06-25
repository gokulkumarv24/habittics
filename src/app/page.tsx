import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tilt } from "@/components/ui/tilt";
import {
  CheckCircle2,
  Target,
  BarChart3,
  Flame,
  ArrowRight,
  Circle,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-heavy rounded-2xl px-5 py-3 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark w-8 h-8 rounded-lg flex items-center justify-center shadow-glow-sm">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight">HabitFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-xl text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-xl text-sm font-semibold shadow-glow-sm btn-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 bg-mesh" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl animate-float [animation-delay:3s]" />

        {/* Dot grid background */}
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" />

        <div className="relative container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full glass border-primary/20 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Build the life you want,</span>
            <span className="text-primary font-semibold">one habit at a time</span>
            <span className="relative flex h-1.5 w-1.5 ml-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto mb-6">
            Build Better Habits.{" "}
            <span className="text-gradient-animate">
              Achieve Your Goals.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Track daily habits, set weekly&nbsp;/ monthly&nbsp;/ yearly goals, and visualize your
            progress with stunning analytics — all in one beautiful platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl shadow-glow btn-glow gap-2"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-xl border-border/60 hover:border-primary/30 hover:bg-primary/5 gap-2"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* App mockup */}
          <div className="hidden sm:flex justify-center perspective">
            <div className="relative preserve-3d animate-float-3d">
              {/* Main card */}
              <div className="w-80 rounded-2xl glass-card p-5 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Today&apos;s Habits</p>
                    <p className="text-sm font-bold mt-0.5">3 of 4 done</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">75%</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500" />
                </div>

                <div className="space-y-2">
                  {[
                    { name: "Morning run",   done: true },
                    { name: "Read 20 pages", done: true },
                    { name: "Meditate",      done: true },
                    { name: "Drink water",   done: false },
                  ].map((h) => (
                    <div
                      key={h.name}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                        h.done
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40"
                          : "bg-muted/50 border border-border/60"
                      }`}
                    >
                      {h.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={h.done ? "line-through text-muted-foreground" : "font-medium"}>
                        {h.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak chip */}
              <div
                className="absolute -right-12 -top-5 flex items-center gap-2 rounded-xl glass-card px-3 py-2 tz-70"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold font-mono">12</p>
                  <p className="text-[10px] text-muted-foreground">day streak</p>
                </div>
              </div>

              {/* Goal chip */}
              <div
                className="absolute -left-14 bottom-8 flex items-center gap-2 rounded-xl glass-card px-3 py-2 tz-50"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-500/5">
                  <Target className="w-4 h-4 text-violet-500" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold">Goal 86%</p>
                  <p className="text-[10px] text-muted-foreground">Monthly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="py-10 border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+",   label: "Active Users" },
              { value: "2.4M",   label: "Habits Tracked" },
              { value: "98%",    label: "Completion Rate" },
              { value: "365",    label: "Days Available" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to thrive</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful tools that work together to help you build lasting habits and reach your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: CheckCircle2,
                title: "Daily Tracking",
                desc: "Check off habits daily with streaks, progress bars, and completion rates.",
                color: "text-emerald-500",
                bg: "from-emerald-500/15 to-emerald-500/5",
                border: "border-emerald-500/20",
              },
              {
                icon: Target,
                title: "Goal System",
                desc: "Set weekly, monthly, and yearly goals with actionable milestones.",
                color: "text-violet-500",
                bg: "from-violet-500/15 to-violet-500/5",
                border: "border-violet-500/20",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Beautiful charts and insights showing your growth over time.",
                color: "text-indigo-500",
                bg: "from-indigo-500/15 to-indigo-500/5",
                border: "border-indigo-500/20",
              },
              {
                icon: Flame,
                title: "Streaks",
                desc: "Stay motivated with streak tracking and milestone celebrations.",
                color: "text-orange-500",
                bg: "from-orange-500/15 to-orange-500/5",
                border: "border-orange-500/20",
              },
              {
                icon: CalendarDays,
                title: "Day Planner",
                desc: "Plan your day with intention using the built-in planner.",
                color: "text-sky-500",
                bg: "from-sky-500/15 to-sky-500/5",
                border: "border-sky-500/20",
              },
              {
                icon: TrendingUp,
                title: "Progress View",
                desc: "Visual progress across all timeframes — weekly, monthly, yearly.",
                color: "text-teal-500",
                bg: "from-teal-500/15 to-teal-500/5",
                border: "border-teal-500/20",
              },
              {
                icon: Zap,
                title: "Smart Insights",
                desc: "Automatic insights on your best days, times, and patterns.",
                color: "text-amber-500",
                bg: "from-amber-500/15 to-amber-500/5",
                border: "border-amber-500/20",
              },
              {
                icon: Shield,
                title: "Private & Secure",
                desc: "Your data stays yours — encrypted and never sold.",
                color: "text-rose-500",
                bg: "from-rose-500/15 to-rose-500/5",
                border: "border-rose-500/20",
              },
            ].map((feature) => (
              <Tilt key={feature.title} className="rounded-2xl h-full">
                <div
                  className={`h-full p-5 rounded-2xl border bg-card card-lift card-shine transition-all`}
                >
                  <div
                    className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${feature.bg} border ${feature.border} mb-4 tz-40`}
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-bold mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* ── THRIVE section ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-violet-500/5 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Our Philosophy</p>
          <h2 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            <span className="text-gradient">THRIVE</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16 leading-relaxed">
            Transform your life with purpose. Empower yourself through intentional habits,
            meaningful goals, and consistent daily progress.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              { letter: "T", value: "Track",        color: "from-indigo-500 to-indigo-600" },
              { letter: "H", value: "Habit",         color: "from-violet-500 to-violet-600" },
              { letter: "R", value: "Resilient",     color: "from-purple-500 to-purple-600" },
              { letter: "I", value: "Intentional",   color: "from-fuchsia-500 to-fuchsia-600" },
              { letter: "V", value: "Visualize",     color: "from-pink-500 to-pink-600" },
              { letter: "E", value: "Evolve",        color: "from-rose-500 to-rose-600" },
            ].map((item) => (
              <div
                key={item.letter}
                className="group flex flex-col items-center p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg group-hover:-translate-y-0.5 transition-transform duration-300`}>
                  <span className="text-xl font-black text-white">{item.letter}</span>
                </div>
                <p className="text-xs font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────────── */}
      <section className="py-16 border-t border-border/40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-8">Trusted by people who build better habits every day</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/40">
            {["Next.js", "TypeScript", "PostgreSQL", "Prisma", "tRPC", "Tailwind CSS"].map((tech) => (
              <div key={tech} className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-violet-500/10 to-purple-500/15" />
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Free forever for personal use
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Start your journey today
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Join thousands of people building better habits with HabitFlow. No credit card required.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold rounded-xl shadow-glow-sm btn-glow gap-2"
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="logo-mark w-7 h-7 rounded-lg flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">HabitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 HabitFlow. Built with Next.js, TypeScript &amp; PostgreSQL.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
