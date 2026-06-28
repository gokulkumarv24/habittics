"use client";

import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { ActiveGoals } from "@/components/dashboard/active-goals";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { MilestoneBanner } from "@/components/dashboard/milestone-banner";
import { getGreeting } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { Plant } from "@/components/garden/plant";

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const { data: habits } = trpc.habit.getAll.useQuery();

  const topStreak = habits
    ?.filter((h) => (h.streak?.currentStreak ?? 0) > 0)
    .sort((a, b) => (b.streak?.currentStreak ?? 0) - (a.streak?.currentStreak ?? 0))[0];

  return (
    <div className="space-y-6 animate-stagger relative">
      <div className="greenhouse-atmosphere" />

      <MilestoneBanner habits={habits ?? []} />

      {/* Hero greeting with streak leader */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mt-1">
            {getGreeting()},{" "}
            <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s how your garden is growing today.
          </p>
        </div>

        {topStreak && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl glass border border-primary/10">
            <div className="w-10 h-12">
              <Plant
                streak={topStreak.streak?.currentStreak ?? 0}
                animated
                phaseOffset={0}
              />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Streak leader</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">
                {topStreak.title}
              </p>
              <p className="text-lg font-bold font-mono text-primary">
                {topStreak.streak?.currentStreak ?? 0}d
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <StatsOverview />

      {/* Main Grid — bento layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayHabits />
        </div>
        <div className="space-y-6">
          <TodayPlan />
          <ActiveGoals />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakCalendar />
        <WeeklyChart />
      </div>
    </div>
  );
}
