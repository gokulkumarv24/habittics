"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plant, getGrowthLabel } from "@/components/garden/plant";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";

type HabitWithRelations = inferRouterOutputs<AppRouter>["habit"]["getAll"][number];

export function TodayHabits() {
  const { data: habits, isLoading } = trpc.habit.getAll.useQuery({ todayOnly: true });
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
          <CardTitle className="text-lg">Your Garden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 shimmer rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = habits?.length ?? 0;
  const done =
    habits?.filter((h) => h.logs.length > 0 && h.logs[0].completed).length ??
    0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Your Garden</CardTitle>
        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
              {done} watered
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {habits && habits.length > 0 ? (
          habits.map((habit: HabitWithRelations) => {
            const isCompleted = Boolean(
              habit.logs.length > 0 && habit.logs[0].completed
            );
            const streak = habit.streak?.currentStreak ?? 0;
            const isWilted = !isCompleted && streak === 0;

            return (
              <button
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                disabled={toggleMutation.isPending}
                type="button"
                aria-pressed={isCompleted}
                aria-label={
                  isCompleted
                    ? `Unwater "${habit.title}"`
                    : `Water "${habit.title}"`
                }
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm active:scale-[0.99] disabled:opacity-60",
                  isCompleted
                    ? "bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40"
                    : "hover:bg-muted/50 border-transparent"
                )}
              >
                {/* Plant indicator */}
                <div className="w-8 h-10 flex-shrink-0">
                  <Plant streak={streak} wilted={isWilted} animated={false} />
                </div>

                {/* Habit info */}
                <div className="flex-1 text-left min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium block truncate",
                      isCompleted && "text-muted-foreground"
                    )}
                  >
                    {habit.title}
                  </span>
                  {streak > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {streak}d &middot; {getGrowthLabel(streak)}
                    </span>
                  )}
                </div>

                {/* Unit target */}
                {habit.unit && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {habit.targetPerDay} {habit.unit}
                  </span>
                )}

                {/* Water drop action */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isCompleted
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Droplet
                    className={cn("w-4 h-4", isCompleted && "animate-pop")}
                    fill={isCompleted ? "currentColor" : "none"}
                  />
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-display italic">No seeds planted yet.</p>
            <p className="text-sm mt-1">Create your first habit to start growing.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
