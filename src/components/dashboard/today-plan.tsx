"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const PRIORITY_LABELS = ["Normal", "High", "Urgent"];
const PRIORITY_COLORS = ["text-muted-foreground", "text-yellow-500", "text-red-500"];

export function TodayPlan() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const { data: plan } = trpc.dayPlan.getByDate.useQuery({ date: todayStr });
  const { data: habits } = trpc.habit.getAll.useQuery();
  const utils = trpc.useUtils();

  const toggleItem = trpc.dayPlan.toggleItem.useMutation({
    onSuccess: () => utils.dayPlan.getByDate.invalidate({ date: todayStr }),
  });

  // Scheduled habits for today
  const scheduledHabits = habits?.filter((h) => h.scheduledTime && !h.isArchived) ?? [];
  const items = plan?.items ?? [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  const hasContent = items.length > 0 || scheduledHabits.length > 0 || plan?.note;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="w-5 h-5 text-primary" />
          Today&apos;s Plan
        </CardTitle>
        <Link href="/planner">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Open Planner <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Day Intention */}
        {plan?.note && (
          <div className="text-sm italic text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            &ldquo;{plan.note}&rdquo;
          </div>
        )}

        {/* Scheduled Habits */}
        {scheduledHabits.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Habits</p>
            {scheduledHabits
              .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""))
              .map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30 border"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                  <span className="text-xs text-muted-foreground font-mono">{habit.scheduledTime}</span>
                  <span className="text-sm">{habit.title}</span>
                </div>
              ))}
          </div>
        )}

        {/* Planned Activities */}
        {items.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activities</p>
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-all ${
                  item.completed ? "opacity-60 bg-muted/20" : "bg-card"
                }`}
              >
                <button
                  onClick={() => toggleItem.mutate({ itemId: item.id })}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/40 hover:border-primary"
                  }`}
                >
                  {item.completed && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </p>
                </div>
                {item.startTime && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {item.startTime}
                  </span>
                )}
                {item.priority > 0 && (
                  <span className={`text-[10px] font-medium ${PRIORITY_COLORS[item.priority]}`}>
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                )}
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-1">
              {completedCount}/{totalCount} done
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasContent && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>No plan for today yet.</p>
            <Link href="/planner">
              <Button variant="link" size="sm" className="mt-1 text-xs">
                Plan your day →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
