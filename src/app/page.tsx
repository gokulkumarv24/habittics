import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, BarChart3, Flame, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          Build Better Habits.{" "}
          <span className="text-primary">Achieve Your Goals.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Track daily habits, set weekly/monthly/yearly goals, and visualize your progress
          with beautiful analytics. The all-in-one habit tracking platform.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="text-base">
              Start Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base">
              Sign In
            </Button>
          </Link>
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
            },
            {
              icon: Target,
              title: "Goal System",
              desc: "Set weekly, monthly, and yearly goals with actionable steps.",
              color: "text-violet-500",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Beautiful charts showing your progress and trends over time.",
              color: "text-blue-500",
            },
            {
              icon: Flame,
              title: "Streaks",
              desc: "Stay motivated with streak tracking and milestone celebrations.",
              color: "text-orange-500",
            },
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 HabitFlow. Built with Next.js, TypeScript & PostgreSQL.</p>
      </footer>
    </div>
  );
}
