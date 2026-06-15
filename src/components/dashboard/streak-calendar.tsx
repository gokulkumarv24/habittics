"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { subDays, format, startOfDay } from "date-fns";

export function StreakCalendar() {
  const { data: heatmap, isLoading } = trpc.analytics.getMonthlyHeatmap.useQuery();

  // Generate last 84 days (12 weeks)
  const days = Array.from({ length: 84 }, (_, i) => {
    const date = subDays(new Date(), 83 - i);
    return format(startOfDay(date), "yyyy-MM-dd");
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Streak Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...Object.values(heatmap || {}), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Streak Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {days.map((day) => {
            const count = heatmap?.[day] || 0;
            const intensity = count / maxCount;
            return (
              <div
                key={day}
                title={`${day}: ${count} habits completed`}
                className={cn(
                  "w-full aspect-square rounded-sm transition-colors",
                  intensity === 0 && "bg-muted",
                  intensity > 0 && intensity <= 0.25 && "bg-emerald-200 dark:bg-emerald-900",
                  intensity > 0.25 && intensity <= 0.5 && "bg-emerald-300 dark:bg-emerald-700",
                  intensity > 0.5 && intensity <= 0.75 && "bg-emerald-400 dark:bg-emerald-600",
                  intensity > 0.75 && "bg-emerald-500 dark:bg-emerald-500"
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-xs text-muted-foreground mr-1">Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-xs text-muted-foreground ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
