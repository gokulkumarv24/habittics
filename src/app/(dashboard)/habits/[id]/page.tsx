"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sprout, Calendar, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { addDaysToKey, dateKeyToUtcDate, localDateKey, utcDateToKey } from "@/lib/dates";
import { isScheduledOnKey, type Frequency } from "@/lib/streak";

export default function HabitDetailPage() {
  const params = useParams();
  const { data: habit, isLoading } = trpc.habit.getById.useQuery({ id: params.id as string });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!habit) {
    return <div className="text-center py-12 text-muted-foreground">Habit not found</div>;
  }

  const todayKey = localDateKey();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const dateStr = addDaysToKey(todayKey, -(29 - i));
    // Stored dates are UTC midnight of the calendar date — compare via UTC key
    const log = habit.logs.find((l) => utcDateToKey(new Date(l.date)) === dateStr);
    const scheduled = isScheduledOnKey(
      habit.frequency as Frequency,
      habit.customDays as number[],
      dateStr
    );
    return { date: dateKeyToUtcDate(dateStr), dateStr, completed: log?.completed ?? false, scheduled };
  });

  const scheduledDays = last30Days.filter((d) => d.scheduled).length;
  const completedDays = last30Days.filter((d) => d.completed && d.scheduled).length;
  const completionRate = scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/habits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{habit.title}</h1>
          {habit.description && <p className="text-muted-foreground">{habit.description}</p>}
        </div>
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn("card-lift", (habit.streak?.currentStreak ?? 0) >= 30 && "evergreen-shimmer")}>
          <CardContent className="p-4 text-center">
            <Sprout className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{habit.streak?.currentStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card className="card-lift">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{habit.streak?.longestStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
        <Card className="card-lift">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">30-Day Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">30-Day Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Progress value={completionRate} />
          </div>
          <p className="text-sm text-muted-foreground">
            {completedDays} of {scheduledDays} scheduled days completed
          </p>
        </CardContent>
      </Card>

      {/* Calendar view */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {last30Days.map((day) => (
              <div
                key={day.dateStr}
                title={`${day.dateStr} - ${!day.scheduled ? "Off day" : day.completed ? "Done" : "Missed"}`}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-xs",
                  !day.scheduled
                    ? "bg-muted/30 text-muted-foreground/40"
                    : day.completed
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {Number(day.dateStr.slice(8))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
