"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Calendar, Target } from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

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

  // Build calendar data from logs
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(startOfDay(date), "yyyy-MM-dd");
    const log = habit.logs.find(
      (l) => format(startOfDay(new Date(l.date)), "yyyy-MM-dd") === dateStr
    );
    return { date, dateStr, completed: log?.completed ?? false };
  });

  const completedDays = last30Days.filter((d) => d.completed).length;
  const completionRate = Math.round((completedDays / 30) * 100);

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
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{habit.streak?.currentStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold font-mono">{habit.streak?.longestStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
        <Card>
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
            {completedDays} of 30 days completed
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
                title={`${format(day.date, "MMM d")} - ${day.completed ? "Done" : "Missed"}`}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-xs",
                  day.completed
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {format(day.date, "d")}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
