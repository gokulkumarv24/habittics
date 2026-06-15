"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Flame, TrendingUp, Target } from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = trpc.analytics.getDailyStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today",
      value: `${stats?.completedToday ?? 0}/${stats?.totalHabits ?? 0}`,
      subtitle: "habits done",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Streak",
      value: `${stats?.longestStreak?.streak ?? 0}`,
      subtitle: "days 🔥",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      title: "Weekly",
      value: `${stats?.completionRate ?? 0}%`,
      subtitle: "completion",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Goals",
      value: `${stats?.activeGoals ?? 0}`,
      subtitle: "active",
      icon: Target,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold font-mono mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
