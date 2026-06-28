"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Sprout, TrendingUp, Flower2 } from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = trpc.analytics.getDailyStats.useQuery();

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
      value: `${stats?.completedToday ?? 0}/${stats?.totalHabits ?? 0}`,
      subtitle: "today",
      icon: Droplets,
      color: "text-teal-500",
      bg: "from-teal-500/20 to-teal-500/5",
    },
    {
      title: "Growth",
      value: `${stats?.longestStreak?.streak ?? 0}`,
      subtitle: "day streak",
      icon: Sprout,
      color: "text-emerald-500",
      bg: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "Rate",
      value: `${stats?.completionRate ?? 0}%`,
      subtitle: "today",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "from-green-500/20 to-green-500/5",
    },
    {
      title: "In Bloom",
      value: `${stats?.activeGoals ?? 0}`,
      subtitle: "goals active",
      icon: Flower2,
      color: "text-amber-500",
      bg: "from-amber-500/20 to-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold font-mono mt-1.5 tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.bg} ring-1 ring-inset ring-white/10`}
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
