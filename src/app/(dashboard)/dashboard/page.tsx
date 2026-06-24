"use client";

import { trpc } from "@/lib/trpc";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TodayHabits } from "@/components/dashboard/today-habits";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { ActiveGoals } from "@/components/dashboard/active-goals";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { getGreeting } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-stagger">
      {/* Greeting */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mt-1">
          {getGreeting()}, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s how your habits are looking today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsOverview />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Habits - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TodayHabits />
        </div>

        {/* Today's Plan + Active Goals */}
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
