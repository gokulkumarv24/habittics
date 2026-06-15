"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateProgress } from "@/lib/utils";
import Link from "next/link";

export default function MonthlyGoalsPage() {
  const { data: goals, isLoading } = trpc.goal.getAll.useQuery({ type: "MONTHLY" });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Monthly Goals</h1>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : goals && goals.length > 0 ? (
        <div className="grid gap-3">
          {goals.map((goal) => {
            const progress = goal.targetValue
              ? calculateProgress(goal.currentValue, goal.targetValue)
              : goal.actions.length > 0
                ? Math.round((goal.actions.filter((a) => a.completed).length / goal.actions.length) * 100)
                : 0;
            return (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm font-mono">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {goal.childGoals && goal.childGoals.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {goal.childGoals.length} sub-goals
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No monthly goals set.</p>
      )}
    </div>
  );
}
