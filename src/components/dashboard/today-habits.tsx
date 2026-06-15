"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {habits && habits.length > 0 ? (
          habits.map((habit) => {
            const isCompleted = habit.logs.length > 0 && habit.logs[0].completed;
            return (
              <button
                key={habit.id}
                onClick={() => handleToggle(habit.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:shadow-sm",
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
                  <span className="text-xs font-mono text-orange-500">
                    {habit.streak.currentStreak}🔥
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
