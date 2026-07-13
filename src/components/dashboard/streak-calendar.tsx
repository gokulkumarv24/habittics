"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { localDateKey, addDaysToKey } from "@/lib/dates";

export function StreakCalendar() {
  const todayKey = localDateKey();
  const { data: heatmap, isLoading } = trpc.analytics.getMonthlyHeatmap.useQuery({
    dateKey: todayKey,
  });

  const days = Array.from({ length: 84 }, (_, i) => addDaysToKey(todayKey, -(83 - i)));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...Object.values(heatmap || {}), 1);

  return (
    <Card className="card-lift">
      <CardHeader>
        <CardTitle className="text-lg">Growth Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {days.map((day) => {
            const count = heatmap?.[day] || 0;
            const intensity = count / maxCount;
            return (
              <div
                key={day}
                title={`${day}: ${count} habits watered`}
                className={cn(
                  "w-full aspect-square rounded-sm transition-colors",
                  intensity === 0 && "bg-muted",
                  intensity > 0 && intensity <= 0.25 && "bg-green-200 dark:bg-green-900",
                  intensity > 0.25 && intensity <= 0.5 && "bg-green-300 dark:bg-green-700",
                  intensity > 0.5 && intensity <= 0.75 && "bg-green-400 dark:bg-green-600",
                  intensity > 0.75 && "bg-emerald-500 dark:bg-emerald-500"
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-xs text-muted-foreground mr-1">Dry</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-muted-foreground ml-1">Lush</span>
        </div>
      </CardContent>
    </Card>
  );
}
