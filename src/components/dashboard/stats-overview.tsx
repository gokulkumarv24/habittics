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
      title: "Today",
      value: `${stats?.completedToday ?? 0}/${stats?.totalHabits ?? 0}`,
      subtitle: "habits done",
      icon: CheckCircle2,
      color: "text-emerald-500",
      tile: "from-emerald-500/20 to-emerald-500/5",
      glow: "before:from-emerald-500/10",
    },
    {
      title: "Streak",
      value: `${stats?.longestStreak?.streak ?? 0}`,
      subtitle: "day streak",
      icon: Flame,
      color: "text-orange-500",
      tile: "from-orange-500/20 to-orange-500/5",
      glow: "before:from-orange-500/10",
    },
    {
      title: "Weekly",
      value: `${stats?.completionRate ?? 0}%`,
      subtitle: "completion",
      icon: TrendingUp,
      color: "text-blue-500",
      tile: "from-blue-500/20 to-blue-500/5",
      glow: "before:from-blue-500/10",
    },
    {
      title: "Goals",
      value: `${stats?.activeGoals ?? 0}`,
      subtitle: "active",
      icon: Target,
      color: "text-violet-500",
      tile: "from-violet-500/20 to-violet-500/5",
      glow: "before:from-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`card-lift relative overflow-hidden before:content-[''] before:absolute before:-top-8 before:-right-8 before:h-24 before:w-24 before:rounded-full before:bg-gradient-to-br before:to-transparent before:blur-2xl ${card.glow}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold font-mono mt-1.5 tracking-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.tile} ring-1 ring-inset ring-white/10`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
