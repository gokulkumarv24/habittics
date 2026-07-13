"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Sprout, TrendingUp, Flower2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { localDateKey } from "@/lib/dates";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    const duration = 600;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevRef.current = to;
  }, [value]);

  return (
    <span className="number-pop">
      {display}{suffix}
    </span>
  );
}

export function StatsOverview() {
  const { data: stats, isLoading } = trpc.analytics.getDailyStats.useQuery({
    dateKey: localDateKey(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 shimmer rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Watered",
      value: stats?.completedToday ?? 0,
      total: stats?.totalHabits ?? 0,
      showTotal: true,
      subtitle: "today",
      icon: Droplets,
      color: "text-teal-500",
      bg: "from-teal-500/20 to-teal-500/5",
      ring: "ring-teal-500/10",
    },
    {
      title: "Growth",
      value: stats?.longestStreak?.streak ?? 0,
      showTotal: false,
      subtitle: "day streak",
      icon: Sprout,
      color: "text-emerald-500",
      bg: "from-emerald-500/20 to-emerald-500/5",
      ring: "ring-emerald-500/10",
    },
    {
      title: "Rate",
      value: stats?.completionRate ?? 0,
      showTotal: false,
      suffix: "%",
      subtitle: "today",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "from-green-500/20 to-green-500/5",
      ring: "ring-green-500/10",
    },
    {
      title: "In Bloom",
      value: stats?.activeGoals ?? 0,
      showTotal: false,
      subtitle: "goals active",
      icon: Flower2,
      color: "text-amber-500",
      bg: "from-amber-500/20 to-amber-500/5",
      ring: "ring-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="card-lift group"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold font-mono mt-1.5 tracking-tight">
                  <AnimatedNumber value={card.value} suffix={"suffix" in card ? (card as { suffix: string }).suffix : ""} />
                  {card.showTotal && (
                    <span className="text-lg text-muted-foreground font-normal">/{card.total}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.bg} ring-1 ring-inset ${card.ring} transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
