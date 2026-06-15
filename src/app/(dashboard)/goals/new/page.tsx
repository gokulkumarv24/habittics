"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

export default function NewGoalPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { data: existingGoals } = trpc.goal.getAll.useQuery();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "WEEKLY" as "WEEKLY" | "MONTHLY" | "YEARLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    targetValue: "",
    unit: "",
    color: "#8b5cf6",
    categoryId: "",
    parentGoalId: "",
  });

  const [actions, setActions] = useState<{ title: string }[]>([]);
  const [newAction, setNewAction] = useState("");

  const createMutation = trpc.goal.create.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
      router.push("/goals");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: form.title,
      description: form.description || undefined,
      type: form.type,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      targetValue: form.targetValue ? parseFloat(form.targetValue) : undefined,
      unit: form.unit || undefined,
      color: form.color,
      categoryId: form.categoryId || undefined,
      parentGoalId: form.parentGoalId || undefined,
      actions: actions.length > 0 ? actions : undefined,
    });
  };

  const addAction = () => {
    if (newAction.trim()) {
      setActions([...actions, { title: newAction.trim() }]);
      setNewAction("");
    }
  };

  const parentGoals = existingGoals?.filter((g) => {
    if (form.type === "MONTHLY") return g.type === "YEARLY";
    if (form.type === "WEEKLY") return g.type === "MONTHLY";
    return false;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/goals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Goal</h1>
          <p className="text-muted-foreground">Define your goal and break it into actions.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Read 12 Books"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Why is this goal important?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Goal Type */}
            <div className="space-y-2">
              <Label>Goal Type *</Label>
              <div className="flex gap-2">
                {(["WEEKLY", "MONTHLY", "YEARLY"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      form.type === type
                        ? "bg-primary text-white border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent Goal */}
            {parentGoals && parentGoals.length > 0 && (
              <div className="space-y-2">
                <Label>Parent Goal (optional)</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                  value={form.parentGoalId}
                  onChange={(e) => setForm({ ...form, parentGoalId: e.target.value })}
                >
                  <option value="">None (standalone goal)</option>
                  {parentGoals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Target */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value (optional)</Label>
                <Input
                  id="targetValue"
                  type="number"
                  placeholder="e.g., 12"
                  value={form.targetValue}
                  onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit (optional)</Label>
                <Input
                  id="unit"
                  placeholder="e.g., books, km, hours"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Label>Actions / Steps</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an action step..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAction())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addAction}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {actions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
                      <span className="text-sm flex-1">{action.title}</span>
                      <button
                        type="button"
                        onClick={() => setActions(actions.filter((_, idx) => idx !== i))}
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={!form.title || !form.endDate || createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
              <Link href="/goals">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
