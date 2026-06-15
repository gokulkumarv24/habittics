"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CheckCircle2, Circle, Flame, Archive } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const { data: habits, isLoading } = trpc.habit.getAll.useQuery();
  const utils = trpc.useUtils();

  const toggleMutation = trpc.habit.toggleComplete.useMutation({
    onSuccess: () => {
      utils.habit.getAll.invalidate();
      utils.analytics.getDailyStats.invalidate();
    },
  });

  const deleteMutation = trpc.habit.delete.useMutation({
    onSuccess: () => utils.habit.getAll.invalidate(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">Manage your daily habits and track progress.</p>
        </div>
        <Link href="/habits/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Habit
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : habits && habits.length > 0 ? (
        <div className="grid gap-3">
          {habits.map((habit) => {
            const isCompleted = habit.logs.length > 0 && habit.logs[0].completed;
            return (
              <Card key={habit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Check button */}
                    <button
                      onClick={() => toggleMutation.mutate({ habitId: habit.id, date: new Date() })}
                      className="flex-shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>

                    {/* Habit info */}
                    <Link href={`/habits/${habit.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {habit.title}
                        </span>
                        {habit.category && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: habit.category.color + "20", color: habit.category.color }}
                          >
                            {habit.category.name}
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {habit.description}
                        </p>
                      )}
                    </Link>

                    {/* Streak */}
                    {habit.streak && habit.streak.currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="text-sm font-mono font-medium">
                          {habit.streak.currentStreak}
                        </span>
                      </div>
                    )}

                    {/* Target */}
                    {habit.unit && (
                      <span className="text-sm text-muted-foreground hidden md:block">
                        {habit.targetPerDay} {habit.unit}/day
                      </span>
                    )}

                    {/* Archive button */}
                    <button
                      onClick={() => deleteMutation.mutate({ id: habit.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Archive habit"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building better routines by creating your first habit.
            </p>
            <Link href="/habits/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Habit
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
