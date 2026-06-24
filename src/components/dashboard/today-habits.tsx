"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";

type HabitWithRelations = inferRouterOutputs<AppRouter>["habit"]["getAll"][number];

export function TodayHabits() {
  const { data: habits, isLoading } = trpc.habit.getAll.useQuery();
  const utils = trpc.useUtils();
  const toggleMutation = trpc.habit.toggleComplete.useMutation({
    onSuccess: () => {
      utils.habit.getAll.invalidate();
      utils.analytics.getDailyStats.invalidate();
    },
  });

  const handleToggle = (habitId: string) => {
    toggleMutation.mutate({ habitId, date: new Date() });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = habits?.length ?? 0;
  const done = habits?.filter((h) => h.logs.length > 0 && h.logs[0].completed).length ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Today&apos;s Habits</CardTitle>
        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
              {done}/{total}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {habits && habits.length > 0 ? (
          habits.map((habit: HabitWithRelations) => {
            const isCompleted = Boolean(habit.logs.length > 0 && habit.logs[0].completed);
            return (
              <button
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                disabled={toggleMutation.isPending}
                aria-pressed={isCompleted ? "true" : "false"}
                aria-label={isCompleted ? `Mark "${habit.title}" as not done` : `Mark "${habit.title}" as done`}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:shadow-sm disabled:opacity-60",
                  isCompleted
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "hover:bg-muted/50"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "flex-1 text-left text-sm font-medium",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {habit.title}
                </span>
                {habit.unit && (
                  <span className="text-xs text-muted-foreground">
                    {habit.targetPerDay} {habit.unit}
                  </span>
                )}
                {habit.streak && habit.streak.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-mono text-orange-500">
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    {habit.streak.currentStreak}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits yet. Create your first habit!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
