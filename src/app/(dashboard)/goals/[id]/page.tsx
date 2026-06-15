"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { calculateProgress } from "@/lib/utils";

export default function GoalDetailPage() {
  const params = useParams();
  const utils = trpc.useUtils();
  const { data: goal, isLoading } = trpc.goal.getById.useQuery({ id: params.id as string });
  const [newAction, setNewAction] = useState("");

  const toggleAction = trpc.goal.toggleAction.useMutation({
    onSuccess: () => utils.goal.getById.invalidate({ id: params.id as string }),
  });

  const createAction = trpc.goal.createAction.useMutation({
    onSuccess: () => {
      utils.goal.getById.invalidate({ id: params.id as string });
      setNewAction("");
    },
  });

  const deleteAction = trpc.goal.deleteAction.useMutation({
    onSuccess: () => utils.goal.getById.invalidate({ id: params.id as string }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!goal) {
    return <div className="text-center py-12 text-muted-foreground">Goal not found</div>;
  }

  const progress = goal.targetValue
    ? calculateProgress(goal.currentValue, goal.targetValue)
    : goal.actions.length > 0
      ? Math.round((goal.actions.filter((a) => a.completed).length / goal.actions.length) * 100)
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/goals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }} />
            <h1 className="text-2xl font-bold tracking-tight">{goal.title}</h1>
          </div>
          {goal.description && <p className="text-muted-foreground mt-1">{goal.description}</p>}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          goal.status === "COMPLETED"
            ? "bg-emerald-100 text-emerald-700"
            : goal.status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-700"
              : "bg-muted text-muted-foreground"
        }`}>
          {goal.type} • {goal.status.replace("_", " ")}
        </span>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-2xl font-bold font-mono">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{format(new Date(goal.startDate), "MMM d, yyyy")}</span>
            <span>{format(new Date(goal.endDate), "MMM d, yyyy")}</span>
          </div>
          {goal.targetValue && (
            <p className="text-sm text-muted-foreground mt-2">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {goal.actions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <button onClick={() => toggleAction.mutate({ actionId: action.id })}>
                {action.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span className={`flex-1 text-sm ${action.completed ? "line-through text-muted-foreground" : ""}`}>
                {action.title}
              </span>
              {action.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(action.dueDate), "MMM d")}
                </span>
              )}
              <button
                onClick={() => deleteAction.mutate({ actionId: action.id })}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add action */}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Add new action..."
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newAction.trim()) {
                  e.preventDefault();
                  createAction.mutate({ goalId: goal.id, title: newAction.trim() });
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (newAction.trim()) {
                  createAction.mutate({ goalId: goal.id, title: newAction.trim() });
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Child goals */}
      {goal.childGoals && goal.childGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sub-Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goal.childGoals.map((child) => {
              const childProgress = child.actions.length > 0
                ? Math.round((child.actions.filter((a) => a.completed).length / child.actions.length) * 100)
                : 0;
              return (
                <Link key={child.id} href={`/goals/${child.id}`} className="block p-3 rounded-lg border hover:shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{child.title}</span>
                    <span className="text-xs font-mono">{childProgress}%</span>
                  </div>
                  <Progress value={childProgress} className="h-1.5" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
