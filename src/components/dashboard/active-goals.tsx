"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import Link from "next/link";
import { calculateProgress } from "@/lib/utils";

export function ActiveGoals() {
  const { data: goals, isLoading } = trpc.goal.getAll.useQuery({ status: "IN_PROGRESS" });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-lift">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Active Goals</CardTitle>
        <Link href="/goals" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals && goals.length > 0 ? (
          goals.slice(0, 4).map((goal) => {
            const progress = goal.targetValue
              ? calculateProgress(goal.currentValue, goal.targetValue)
              : Math.round(
                  (goal.actions.filter((a) => a.completed).length /
                    Math.max(goal.actions.length, 1)) *
                    100
                );
            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="block p-3 rounded-lg border hover:shadow-sm hover:border-primary/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{goal.title}</span>
                  <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active goals</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
