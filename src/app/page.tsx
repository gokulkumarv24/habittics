import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Droplets,
  TrendingUp,
  Flower2,
  ArrowRight,
  BarChart3,
  Shield,
  Leaf,
} from "lucide-react";
import { Plant } from "@/components/garden/plant";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-heavy rounded-2xl px-5 py-3 flex items-center justify-between shadow-card">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark w-8 h-8 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight font-display">
              HabitFlow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-sm font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-xl text-sm font-semibold btn-glow"
              >
                Start Growing
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-mesh" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-emerald-500/8 blur-3xl animate-float" />
        <div className="pointer-events-none absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-teal-400/8 blur-3xl animate-float [animation-delay:3s]" />
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />

        <div className="relative container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-4 py-2 rounded-full glass border-primary/20 text-sm font-medium">
            <Sprout className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Every habit starts as a</span>
            <span className="text-primary font-semibold">seed</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto mb-6">
            Grow Something{" "}
            <span className="text-gradient-animate">Real.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Every habit is a seed. Water it daily and watch it grow. Skip a day,
            and it wilts. After thirty days, it flowers. Your dashboard is a
            garden that reflects your discipline.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl btn-glow gap-2"
              >
                Plant Your First Seed <ArrowRight className="w-4 h-4" />
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

          {/* Garden illustration */}
          <div className="hidden sm:flex justify-center">
            <div className="flex items-end justify-center gap-8 px-10 py-8 rounded-2xl glass-card">
              {[
                { streak: 35, name: "Read", label: "35d · In Bloom" },
                { streak: 12, name: "Exercise", label: "12d · Growing" },
                { streak: 3, name: "Meditate", label: "3d · Sprout" },
                {
                  streak: 0,
                  name: "Water",
                  label: "Missed",
                  wilted: true,
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-20">
                    <Plant
                      streak={item.streak}
                      wilted={item.wilted}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold ${item.wilted ? "text-muted-foreground" : ""}`}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Growth Stages ─────────────────────────────────────── */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-primary uppercase tracking-widest mb-10">
            How It Grows
          </p>
          <div className="flex flex-wrap items-end justify-center gap-8 md:gap-12">
            {[
              { streak: 0, label: "Seed", days: "Day 0" },
              { streak: 2, label: "Sprout", days: "1–3 days" },
              { streak: 6, label: "Seedling", days: "4–7 days" },
              { streak: 12, label: "Growing", days: "8–14 days" },
              { streak: 22, label: "Mature", days: "15–29 days" },
              { streak: 35, label: "Bloom", days: "30+ days" },
            ].map((stage) => (
              <div
                key={stage.label}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-16 md:w-16 md:h-20">
                  <Plant streak={stage.streak} animated={false} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold">{stage.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stage.days}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tend your garden, grow your life
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A living system that grows with you. Every completion feeds the
              garden.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: Sprout,
                title: "Plant",
                desc: "Each habit becomes a living plant in your personal garden.",
                color: "text-emerald-500",
                bg: "from-emerald-500/15 to-emerald-500/5",
                border: "border-emerald-500/20",
              },
              {
                icon: Droplets,
                title: "Water",
                desc: "Complete your habit daily to water your plant and watch it grow.",
                color: "text-teal-500",
                bg: "from-teal-500/15 to-teal-500/5",
                border: "border-teal-500/20",
              },
              {
                icon: TrendingUp,
                title: "Grow",
                desc: "Track your streak as your plant grows from seed to bloom.",
                color: "text-green-500",
                bg: "from-green-500/15 to-green-500/5",
                border: "border-green-500/20",
              },
              {
                icon: Flower2,
                title: "Bloom",
                desc: "Hit 30 days and your plant flowers — a living trophy of discipline.",
                color: "text-amber-500",
                bg: "from-amber-500/15 to-amber-500/5",
                border: "border-amber-500/20",
              },
              {
                icon: BarChart3,
                title: "Harvest",
                desc: "Weekly and monthly reports on your garden’s health and growth.",
                color: "text-sky-500",
                bg: "from-sky-500/15 to-sky-500/5",
                border: "border-sky-500/20",
              },
              {
                icon: Shield,
                title: "Protected",
                desc: "Your garden is yours alone — encrypted and never sold.",
                color: "text-stone-500",
                bg: "from-stone-500/15 to-stone-500/5",
                border: "border-stone-500/20",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded-2xl border bg-card card-lift transition-all"
              >
                <div
                  className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${feature.bg} border ${feature.border} mb-4`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-sm font-bold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-emerald-500/8 to-teal-500/12" />
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/12 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <Leaf className="w-3.5 h-3.5" />
                Free forever for personal use
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Start growing today
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Join people who are building better habits, one day at a time.
                No credit card required.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-13 px-8 text-base font-semibold rounded-xl btn-glow gap-2"
                >
                  Plant Your First Seed <ArrowRight className="w-4 h-4" />
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
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold font-display">HabitFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 HabitFlow. Built with Next.js &amp; care.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/login"
                className="hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="hover:text-foreground transition-colors"
              >
                Start Growing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
