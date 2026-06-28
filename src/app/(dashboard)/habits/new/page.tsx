"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#ec4899", "#14b8a6"];

// Quick-start templates for common habits
const TEMPLATES = [
  { title: "Morning Meditation", description: "Start the day with mindfulness", icon: "brain", color: "#8b5cf6", targetPerDay: 1, unit: "session", reminderTime: "06:30", category: "Mindfulness" },
  { title: "Drink Water", description: "Stay hydrated throughout the day", icon: "droplet", color: "#3b82f6", targetPerDay: 8, unit: "glasses", reminderTime: "", category: "Health" },
  { title: "Exercise", description: "Move your body daily", icon: "dumbbell", color: "#ef4444", targetPerDay: 30, unit: "minutes", reminderTime: "07:00", category: "Fitness" },
  { title: "Read", description: "Read something every day", icon: "book-open", color: "#f59e0b", targetPerDay: 20, unit: "pages", reminderTime: "21:00", category: "Learning" },
  { title: "Journal", description: "Reflect on your day", icon: "pencil", color: "#10b981", targetPerDay: 1, unit: "entry", reminderTime: "22:00", category: "Mindfulness" },
  { title: "No Phone Before Bed", description: "Better sleep hygiene", icon: "moon", color: "#6366f1", targetPerDay: 1, unit: "", reminderTime: "21:30", category: "Health" },
];

export default function NewHabitPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: categories } = trpc.category.getAll.useQuery();

  const [showTemplates, setShowTemplates] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    color: "#10b981",
    frequency: "DAILY" as "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM",
    customDays: [] as number[],
    targetPerDay: 1,
    unit: "",
    reminderTime: "",
    scheduledTime: "",
    categoryId: "",
  });

  const createMutation = trpc.habit.create.useMutation({
    onSuccess: () => {
      utils.habit.getAll.invalidate();
      router.push("/habits");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      customDays: form.frequency === "CUSTOM" ? form.customDays : [],
      categoryId: form.categoryId || undefined,
      unit: form.unit || undefined,
      reminderTime: form.reminderTime || undefined,
      scheduledTime: form.scheduledTime || undefined,
    });
  };

  const applyTemplate = (template: typeof TEMPLATES[number]) => {
    const matchedCategory = categories?.find((c) => c.name === template.category);
    setForm({
      title: template.title,
      description: template.description,
      color: template.color,
      frequency: "DAILY",
      customDays: [],
      targetPerDay: template.targetPerDay,
      unit: template.unit,
      reminderTime: template.reminderTime,
      scheduledTime: template.reminderTime,
      categoryId: matchedCategory?.id || "",
    });
    setShowTemplates(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/habits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Habit</h1>
          <p className="text-muted-foreground">Build a new daily routine.</p>
        </div>
      </div>

      {/* Quick-Start Templates */}
      {showTemplates && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Quick Start</CardTitle>
            </div>
            <CardDescription>Pick a template or start from scratch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="p-3 rounded-lg border text-left hover:bg-muted hover:border-primary/50 transition-all group"
                >
                  <div className="w-6 h-6 rounded-md mb-2 flex items-center justify-center" style={{ backgroundColor: t.color + "20" }}>
                    <Zap className="w-3.5 h-3.5" style={{ color: t.color }} />
                  </div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.targetPerDay} {t.unit}/day</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setShowTemplates(false)}>
              Start from scratch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Habit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Habit Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Meditation"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Why is this habit important to you?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={500}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex gap-2 flex-wrap">
                {(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setForm({ ...form, frequency: freq })}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      form.frequency === freq
                        ? "bg-primary text-white border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {freq.charAt(0) + freq.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Days Picker (shown when CUSTOM is selected) */}
            {form.frequency === "CUSTOM" && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 1, label: "Mon" },
                    { value: 2, label: "Tue" },
                    { value: 3, label: "Wed" },
                    { value: 4, label: "Thu" },
                    { value: 5, label: "Fri" },
                    { value: 6, label: "Sat" },
                    { value: 0, label: "Sun" },
                  ].map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        const days = form.customDays.includes(day.value)
                          ? form.customDays.filter((d) => d !== day.value)
                          : [...form.customDays, day.value];
                        setForm({ ...form, customDays: days });
                      }}
                      className={`w-10 h-10 text-sm rounded-lg border transition-colors ${
                        form.customDays.includes(day.value)
                          ? "bg-primary text-white border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {form.customDays.length === 0 && (
                  <p className="text-xs text-destructive">Select at least one day</p>
                )}
              </div>
            )}

            {/* Target & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Daily Target</Label>
                <Input
                  id="target"
                  type="number"
                  min={1}
                  value={form.targetPerDay}
                  onChange={(e) => setForm({ ...form, targetPerDay: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit (optional)</Label>
                <Input
                  id="unit"
                  placeholder="e.g., minutes, pages, glasses"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
            </div>

            {/* Reminder Time (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="reminderTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Reminder Time (optional)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="reminderTime"
                  type="time"
                  value={form.reminderTime}
                  onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                  className="w-40"
                />
                {form.reminderTime && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, reminderTime: "" })}>
                    Clear
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {form.reminderTime ? `Reminder at ${form.reminderTime} daily` : "No reminder set"}
                </span>
              </div>
            </div>

            {/* Scheduled Time (When to do this habit) */}
            <div className="space-y-2">
              <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Scheduled Time (optional)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="scheduledTime"
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-40"
                />
                {form.scheduledTime && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, scheduledTime: "" })}>
                    Clear
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {form.scheduledTime ? `Do this at ${form.scheduledTime}` : "Shows in day planner when set"}
                </span>
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      form.color === color ? "scale-125 ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">No category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={!form.title || createMutation.isPending || (form.frequency === "CUSTOM" && form.customDays.length === 0)}>
                {createMutation.isPending ? "Creating..." : "Create Habit"}
              </Button>
              <Link href="/habits">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
