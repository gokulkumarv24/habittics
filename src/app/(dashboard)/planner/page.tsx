"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, getDay } from "date-fns";
import type { HabitFrequency } from "@prisma/client";
import { ChevronLeft, ChevronRight, Plus, Clock, Check, Trash2, Calendar, Sprout } from "lucide-react";

const PRIORITY_LABELS = ["Normal", "High", "Urgent"];
const PRIORITY_COLORS = ["border-l-muted-foreground", "border-l-yellow-500", "border-l-red-500"];

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;

  const { data: plan } = trpc.dayPlan.getByDate.useQuery({ date: dateStr });
  const { data: habits } = trpc.habit.getAll.useQuery();
  const { data: upcomingPlans } = trpc.dayPlan.getUpcoming.useQuery({ days: 30 });
  const utils = trpc.useUtils();

  const updateNote = trpc.dayPlan.updateNote.useMutation({
    onSuccess: () => utils.dayPlan.getByDate.invalidate({ date: dateStr }),
  });
  const addItem = trpc.dayPlan.addItem.useMutation({
    onSuccess: () => utils.dayPlan.getByDate.invalidate({ date: dateStr }),
  });
  const toggleItem = trpc.dayPlan.toggleItem.useMutation({
    onSuccess: () => utils.dayPlan.getByDate.invalidate({ date: dateStr }),
  });
  const deleteItem = trpc.dayPlan.deleteItem.useMutation({
    onSuccess: () => utils.dayPlan.getByDate.invalidate({ date: dateStr }),
  });

  const [newItem, setNewItem] = useState({ title: "", startTime: "", endTime: "", priority: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [dayNote, setDayNote] = useState("");

  // Scheduled habits for the selected day — respects frequency
  const scheduledHabits = useMemo(() => {
    if (!habits) return [];
    const day = getDay(selectedDate);
    return habits.filter((h) => {
      if (!h.scheduledTime || h.isArchived) return false;
      const freq = h.frequency as HabitFrequency;
      if (freq === "DAILY") return true;
      if (freq === "WEEKDAYS") return day >= 1 && day <= 5;
      if (freq === "WEEKENDS") return day === 0 || day === 6;
      if (freq === "CUSTOM") return (h.customDays as number[]).includes(day);
      return true;
    });
  }, [habits, selectedDate]);

  // Dates that have plans with items
  const datesWithPlans = useMemo(() => {
    const set = new Set<string>();
    upcomingPlans?.forEach((p) => {
      if (p.items.length > 0) {
        set.add(format(new Date(p.date), "yyyy-MM-dd"));
      }
    });
    return set;
  }, [upcomingPlans]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [calendarMonth]);

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    addItem.mutate({
      date: dateStr,
      title: newItem.title,
      startTime: newItem.startTime || undefined,
      endTime: newItem.endTime || undefined,
      priority: newItem.priority,
    });
    setNewItem({ title: "", startTime: "", endTime: "", priority: 0 });
    setShowAdd(false);
  };

  const handleSaveNote = () => {
    if (dayNote) updateNote.mutate({ date: dateStr, note: dayNote });
  };

  const currentNote = plan?.note || "";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Day Planner
        </h1>
        <p className="text-muted-foreground">Plan your day, commit to actions. Click a date to see/add tasks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Left side */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-sm font-semibold">
                {format(calendarMonth, "MMMM yyyy")}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const isSelected = isSameDay(day, selectedDate);
                const isDayToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, calendarMonth);
                const hasPlan = datesWithPlans.has(dayStr);

                return (
                  <button
                    key={dayStr}
                    onClick={() => setSelectedDate(day)}
                    className={`relative aspect-square flex items-center justify-center rounded-md text-xs transition-all
                      ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"}
                      ${isDayToday && !isSelected ? "ring-1 ring-primary font-semibold" : ""}
                    `}
                  >
                    {format(day, "d")}
                    {hasPlan && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick jump */}
            <div className="mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setSelectedDate(new Date());
                  setCalendarMonth(new Date());
                }}
              >
                Go to Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Day Details - Right side */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected date header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d")}</p>
              {isToday && <span className="text-xs text-primary font-medium">Today</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Intention / Note */}
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Day Intention</p>
              <Input
                placeholder="What's your focus for this day?"
                value={dayNote || currentNote}
                onChange={(e) => setDayNote(e.target.value)}
                onBlur={handleSaveNote}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
              />
            </CardContent>
          </Card>

          {/* Scheduled Habits */}
          {scheduledHabits.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sprout className="w-3.5 h-3.5" />
                  Scheduled Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {scheduledHabits
                  .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""))
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30"
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">{habit.scheduledTime}</span>
                      <span className="text-sm font-medium">{habit.title}</span>
                      {habit.unit && (
                        <span className="text-xs text-muted-foreground">
                          ({habit.targetPerDay} {habit.unit})
                        </span>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Planned Activities */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Planned Activities
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Add Form */}
              {showAdd && (
                <div className="p-3 border rounded-lg bg-muted/30 space-y-3 mb-3">
                  <Input
                    placeholder="What do you plan to do?"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    autoFocus
                  />
                  <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="time"
                        className="w-28 h-8 text-sm"
                        value={newItem.startTime}
                        onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <Input
                        type="time"
                        className="w-28 h-8 text-sm"
                        value={newItem.endTime}
                        onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                      />
                    </div>
                    <select
                      className="h-8 px-2 rounded border bg-background text-xs"
                      value={newItem.priority}
                      onChange={(e) => setNewItem({ ...newItem, priority: parseInt(e.target.value) })}
                    >
                      <option value={0}>Normal</option>
                      <option value={1}>High</option>
                      <option value={2}>Urgent</option>
                    </select>
                    <Button size="sm" onClick={handleAddItem} disabled={!newItem.title.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* Items List */}
              {plan?.items && plan.items.length > 0 ? (
                plan.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border border-l-4 ${PRIORITY_COLORS[item.priority]} ${
                      item.completed ? "opacity-60 bg-muted/20" : "bg-card"
                    } transition-all`}
                  >
                    <button
                      onClick={() => toggleItem.mutate({ itemId: item.id })}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        item.completed ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </p>
                      {(item.startTime || item.endTime) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                      {PRIORITY_LABELS[item.priority]}
                    </span>
                    <button
                      onClick={() => deleteItem.mutate({ itemId: item.id })}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                !showAdd && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <p>No activities planned for this day.</p>
                    <p className="text-xs mt-1">Click &quot;Add&quot; to plan tasks!</p>
                  </div>
                )
              )}

              {/* Completion summary */}
              {plan?.items && plan.items.length > 0 && (
                <div className="pt-2 border-t mt-3">
                  <p className="text-xs text-muted-foreground">
                    {plan.items.filter((i) => i.completed).length}/{plan.items.length} completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
