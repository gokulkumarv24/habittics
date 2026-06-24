import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, BarChart3, Flame, ArrowRight } from "lucide-react";

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
            <div key={feature.title} className="card-lift p-6 rounded-xl border bg-card">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.tile} ring-1 ring-inset ring-white/10 mb-4`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
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
