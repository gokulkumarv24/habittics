"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Calendar, TrendingUp, Flower2 } from "lucide-react";
import Link from "next/link";
import { calculateProgress } from "@/lib/utils";

export default function GoalsPage() {
  const { data: goals, isLoading } = trpc.goal.getAll.useQuery();

  const goalsByType = {
    YEARLY: goals?.filter((g) => g.type === "YEARLY") || [],
    MONTHLY: goals?.filter((g) => g.type === "MONTHLY") || [],
    WEEKLY: goals?.filter((g) => g.type === "WEEKLY") || [],
  };

  const typeConfig = {
    YEARLY: { icon: Flower2, label: "Yearly Goals", color: "text-amber-500" },
    MONTHLY: { icon: TrendingUp, label: "Monthly Goals", color: "text-blue-500" },
    WEEKLY: { icon: Calendar, label: "Weekly Goals", color: "text-emerald-500" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Set and track your weekly, monthly, and yearly goals.</p>
        </div>
        <Link href="/goals/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {(["YEARLY", "MONTHLY", "WEEKLY"] as const).map((type) => {
            const config = typeConfig[type];
            const typeGoals = goalsByType[type];
            if (typeGoals.length === 0) return null;

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                  <h2 className="text-lg font-semibold">{config.label}</h2>
                  <span className="text-sm text-muted-foreground">({typeGoals.length})</span>
                </div>
                <div className="grid gap-3">
                  {typeGoals.map((goal) => {
                    const progress = goal.targetValue
                      ? calculateProgress(goal.currentValue, goal.targetValue)
                      : goal.actions.length > 0
                        ? Math.round(
                            (goal.actions.filter((a) => a.completed).length / goal.actions.length) * 100
                          )
                        : 0;

                    return (
                      <Link key={goal.id} href={`/goals/${goal.id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: goal.color }}
                                />
                                <span className="font-medium">{goal.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  goal.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                    : goal.status === "IN_PROGRESS"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                      : "bg-muted text-muted-foreground"
                                }`}>
                                  {goal.status.replace("_", " ")}
                                </span>
                              </div>
                              <span className="text-sm font-mono text-muted-foreground">
                                {progress}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {goal.targetValue && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </p>
                            )}
                            {goal.actions.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {goal.actions.filter((a) => a.completed).length}/{goal.actions.length} actions completed
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!goals || goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No goals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Set your first goal and break it into actionable steps.
                </p>
                <Link href="/goals/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Goal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
