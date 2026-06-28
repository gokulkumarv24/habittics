"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plant, getGrowthLabel } from "@/components/garden/plant";
import { useState, useRef, useCallback } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";

type HabitWithRelations = inferRouterOutputs<AppRouter>["habit"]["getAll"][number];

const HOLD_DURATION = 600;

function HabitRow({
  habit,
  index,
  onToggle,
  isPending,
}: {
  habit: HabitWithRelations;
  index: number;
  onToggle: (id: string) => void;
  isPending: boolean;
}) {
  const isCompleted = Boolean(habit.logs.length > 0 && habit.logs[0].completed);
  const streak = habit.streak?.currentStreak ?? 0;
  const isWilted = !isCompleted && streak === 0;

  const [holding, setHolding] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [perkAnim, setPerkAnim] = useState(false);
  const [shakeAnim, setShakeAnim] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStart = useRef(0);

  const startHold = useCallback(() => {
    if (isPending) return;

    if (isCompleted) {
      setShakeAnim(true);
      onToggle(habit.id);
      setTimeout(() => setShakeAnim(false), 400);
      return;
    }

    holdStart.current = Date.now();
    setHolding(true);

    holdTimer.current = setTimeout(() => {
      setHolding(false);
      setShowRipple(true);
      setPerkAnim(true);
      onToggle(habit.id);
      setTimeout(() => setShowRipple(false), 700);
      setTimeout(() => setPerkAnim(false), 500);
    }, HOLD_DURATION);
  }, [isCompleted, isPending, habit.id, onToggle]);

  const cancelHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setHolding(false);
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(habit.id);
        }
      }}
      aria-pressed={isCompleted ? "true" : "false"}
      aria-label={
        isCompleted
          ? `Unwater "${habit.title}"`
          : `Hold to water "${habit.title}"`
      }
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all select-none cursor-pointer",
        "hover:shadow-sm active:scale-[0.99] disabled:opacity-60",
        isCompleted
          ? "bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40"
          : "hover:bg-muted/50 border-transparent"
      )}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="w-8 h-10 flex-shrink-0">
        <Plant
          streak={streak}
          wilted={isWilted}
          animated={isCompleted}
          phaseOffset={index * 0.8}
          perkAnimation={perkAnim}
          shakeAnimation={shakeAnim}
        />
      </div>

      <div className="flex-1 text-left min-w-0">
        <span
          className={cn(
            "text-sm font-medium block truncate",
            isCompleted && "text-muted-foreground"
          )}
        >
          {habit.title}
        </span>
        {streak > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {streak}d &middot; {getGrowthLabel(streak)}
          </span>
        )}
      </div>

      {habit.unit && (
        <span className="text-xs text-muted-foreground hidden sm:block">
          {habit.targetPerDay} {habit.unit}
        </span>
      )}

      <div className="flex-shrink-0 relative">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
            isCompleted
              ? "bg-primary/15 text-primary"
              : "bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Droplet
            className={cn("w-4 h-4", isCompleted && "animate-pop")}
            fill={isCompleted ? "currentColor" : "none"}
          />
        </div>
        <div className={cn("water-hold-ring", holding && "filling")} />
        {showRipple && (
          <>
            <div className="water-ripple" />
            <div className="water-ripple" />
          </>
        )}
      </div>
    </div>
  );
}

export function TodayHabits() {
  const { data: habits, isLoading } = trpc.habit.getAll.useQuery({ todayOnly: true });
  const utils = trpc.useUtils();
  const toggleMutation = trpc.habit.toggleComplete.useMutation({
    onSuccess: () => {
      utils.habit.getAll.invalidate();
      utils.analytics.getDailyStats.invalidate();
    },
  });

  const handleToggle = useCallback(
    (habitId: string) => {
      toggleMutation.mutate({ habitId, date: new Date() });
    },
    [toggleMutation]
  );

  if (isLoading) {
    return (
      <Card className="card-lift">
        <CardHeader>
          <CardTitle className="text-lg">Your Garden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 shimmer rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const total = habits?.length ?? 0;
  const done =
    habits?.filter((h) => h.logs.length > 0 && h.logs[0].completed).length ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="card-lift relative overflow-hidden">
      <div className="greenhouse-particles">
        <span /><span /><span /><span /><span />
      </div>
      <CardHeader className="flex flex-row items-center justify-between gap-4 relative z-10">
        <CardTitle className="text-lg">Your Garden</CardTitle>
        {total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
              {done}/{total}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2 relative z-10">
        {habits && habits.length > 0 ? (
          habits.map((habit: HabitWithRelations, i: number) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              index={i}
              onToggle={handleToggle}
              isPending={toggleMutation.isPending}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="font-display italic">No seeds planted yet.</p>
            <p className="text-sm mt-1">Create your first habit to start growing.</p>
          </div>
        )}

        {total > 0 && done === total && (
          <div className="text-center py-3 mt-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              All watered — your garden is thriving!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
