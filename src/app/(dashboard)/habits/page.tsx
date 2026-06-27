"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Droplet, Archive } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plant, getGrowthLabel } from "@/components/garden/plant";

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
    <div className="space-y-6 animate-stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Garden</h1>
          <p className="text-muted-foreground">Tend your habits and watch them grow.</p>
        </div>
        <Link href="/habits/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Plant New
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 shimmer rounded-2xl" />
          ))}
        </div>
      ) : habits && habits.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {habits.map((habit) => {
            const isCompleted = Boolean(
              habit.logs.length > 0 && habit.logs[0].completed
            );
            const streak = habit.streak?.currentStreak ?? 0;
            const isWilted = !isCompleted && streak === 0;

            return (
              <Card
                key={habit.id}
                className={cn(
                  "relative group overflow-hidden transition-all duration-300 hover:shadow-lg",
                  isCompleted && "ring-1 ring-primary/20 bg-primary/[0.03]"
                )}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  {/* Plant visualization */}
                  <div className="w-20 h-24 mb-3">
                    <Plant streak={streak} wilted={isWilted} />
                  </div>

                  {/* Habit name */}
                  <Link href={`/habits/${habit.id}`} className="block w-full">
                    <h3
                      className={cn(
                        "text-sm font-semibold truncate",
                        isCompleted && "text-muted-foreground"
                      )}
                    >
                      {habit.title}
                    </h3>
                  </Link>

                  {/* Growth stage label */}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {streak > 0
                      ? `${streak}d · ${getGrowthLabel(streak)}`
                      : isWilted
                      ? "Needs water"
                      : "Ready to plant"}
                  </p>

                  {/* Category badge */}
                  {habit.category && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full mt-2"
                      style={{
                        backgroundColor: habit.category.color + "20",
                        color: habit.category.color,
                      }}
                    >
                      {habit.category.name}
                    </span>
                  )}

                  {/* Water button */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleMutation.mutate({
                        habitId: habit.id,
                        date: new Date(),
                      })
                    }
                    disabled={toggleMutation.isPending}
                    aria-label={
                      isCompleted
                        ? `Unwater "${habit.title}"`
                        : `Water "${habit.title}"`
                    }
                    className={cn(
                      "mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50",
                      isCompleted
                        ? "bg-primary/15 text-primary"
                        : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                    )}
                  >
                    <Droplet
                      className={cn(
                        "w-3.5 h-3.5",
                        isCompleted && "animate-pop"
                      )}
                      fill={isCompleted ? "currentColor" : "none"}
                    />
                    {isCompleted ? "Watered" : "Water"}
                  </button>

                  {/* Archive — visible on hover */}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate({ id: habit.id })}
                    disabled={deleteMutation.isPending}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                    title="Archive habit"
                    aria-label={`Archive "${habit.title}"`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-32 mb-4 opacity-50">
              <Plant streak={0} animated={false} />
            </div>
            <h3 className="text-lg font-semibold">Your garden is empty</h3>
            <p className="text-muted-foreground mb-4">
              Plant your first seed and start growing.
            </p>
            <Link href="/habits/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Plant First Seed
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
