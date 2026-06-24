import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tilt } from "@/components/ui/tilt";
import { CheckCircle2, Target, BarChart3, Flame, ArrowRight, Circle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="logo-mark w-9 h-9 rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">HabitFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh">
        {/* Floating ambient glows */}
        <div className="pointer-events-none absolute -top-20 -left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-10 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border bg-card/60 backdrop-blur-sm text-sm font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Build the life you want, one day at a time
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
            Build Better Habits.{" "}
            <span className="text-gradient-animate">Achieve Your Goals.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track daily habits, set weekly/monthly/yearly goals, and visualize your progress
            with beautiful analytics. The all-in-one habit tracking platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base shadow-lg shadow-primary/25">
                Start Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-base">
                Sign In
              </Button>
            </Link>
          </div>

          {/* 3D floating app preview */}
          <div className="mt-20 hidden sm:flex justify-center perspective">
            <div className="relative preserve-3d animate-float-3d">
              {/* Main card */}
              <div className="w-80 rounded-2xl border bg-card/90 backdrop-blur-md shadow-2xl shadow-primary/20 p-5 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Today&apos;s Habits</span>
                  <span className="text-xs font-mono text-muted-foreground">3/4</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-violet-500" />
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Morning run", done: true },
                    { name: "Read 20 pages", done: true },
                    { name: "Meditate", done: true },
                    { name: "Drink water", done: false },
                  ].map((h) => (
                    <div
                      key={h.name}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                        h.done ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800" : ""
                      }`}
                    >
                      {h.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={h.done ? "line-through text-muted-foreground" : ""}>{h.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating streak chip (pops toward viewer) */}
              <div
                className="absolute -right-8 -top-6 flex items-center gap-2 rounded-xl border bg-card/95 backdrop-blur px-3 py-2 shadow-xl"
                style={{ transform: "translateZ(70px)" }}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold font-mono">12</p>
                  <p className="text-[10px] text-muted-foreground">day streak</p>
                </div>
              </div>

              {/* Floating goal chip */}
              <div
                className="absolute -left-10 bottom-10 flex items-center gap-2 rounded-xl border bg-card/95 backdrop-blur px-3 py-2 shadow-xl"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-500/5">
                  <Target className="w-4 h-4 text-violet-500" />
                </div>
                <p className="text-xs font-medium">Goal 86%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: CheckCircle2,
              title: "Daily Tracking",
              desc: "Check off habits daily with streaks and completion tracking.",
              color: "text-emerald-500",
              tile: "from-emerald-500/20 to-emerald-500/5",
            },
            {
              icon: Target,
              title: "Goal System",
              desc: "Set weekly, monthly, and yearly goals with actionable steps.",
              color: "text-violet-500",
              tile: "from-violet-500/20 to-violet-500/5",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Beautiful charts showing your progress and trends over time.",
              color: "text-blue-500",
              tile: "from-blue-500/20 to-blue-500/5",
            },
            {
              icon: Flame,
              title: "Streaks",
              desc: "Stay motivated with streak tracking and milestone celebrations.",
              color: "text-orange-500",
              tile: "from-orange-500/20 to-orange-500/5",
            },
          ].map((feature) => (
            <Tilt key={feature.title} className="rounded-xl h-full">
              <div className="h-full p-6 rounded-xl border bg-card hover:shadow-xl hover:shadow-primary/5 transition-shadow">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.tile} ring-1 ring-inset ring-white/10 mb-4`}
                  style={{ transform: "translateZ(50px)" }}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* THRIVE Section */}
      <section className="w-full bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold tracking-wider mb-6">
              <span className="text-primary">THRIVE</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your life with purpose. We empower you to thrive through intentional habits, meaningful goals, and consistent progress.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { letter: "T", value: "Track" },
              { letter: "H", value: "Habit" },
              { letter: "R", value: "Resilient" },
              { letter: "I", value: "Intentional" },
              { letter: "V", value: "Visualize" },
              { letter: "E", value: "Evolve" },
            ].map((item) => (
              <div key={item.letter} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-primary mb-3">
                  {item.letter}
                </div>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 HabitFlow. Built with Next.js, TypeScript & PostgreSQL.</p>
      </footer>
    </div>
  );
}
