"use client";

import { useEffect, useState } from "react";

const MILESTONES = [
  { days: 7, label: "One week strong", emoji: "🌱" },
  { days: 30, label: "One month of growth", emoji: "🌿" },
  { days: 100, label: "Century bloom", emoji: "🌸" },
] as const;

function getStorageKey(habitId: string, days: number) {
  return `milestone-${habitId}-${days}`;
}

interface MilestoneBannerProps {
  habits: Array<{
    id: string;
    title: string;
    streak?: { currentStreak: number } | null;
  }>;
}

export function MilestoneBanner({ habits }: MilestoneBannerProps) {
  const [banner, setBanner] = useState<{
    title: string;
    label: string;
    emoji: string;
    days: number;
  } | null>(null);

  useEffect(() => {
    if (!habits?.length) return;

    for (const habit of habits) {
      const streak = habit.streak?.currentStreak ?? 0;
      for (const milestone of MILESTONES) {
        if (streak >= milestone.days) {
          const key = getStorageKey(habit.id, milestone.days);
          try {
            if (!localStorage.getItem(key)) {
              localStorage.setItem(key, "1");
              setBanner({
                title: habit.title,
                label: milestone.label,
                emoji: milestone.emoji,
                days: milestone.days,
              });
              return;
            }
          } catch {
            // localStorage unavailable
          }
        }
      }
    }
  }, [habits]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;

  return (
    <div className="milestone-banner fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl glass-heavy shadow-xl">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{banner.emoji}</span>
        <div>
          <p className="text-sm font-bold">
            {banner.days}-day milestone!
          </p>
          <p className="text-xs text-muted-foreground">
            {banner.title} — {banner.label}
          </p>
        </div>
      </div>
      <div className="golden-petals absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
        <span /><span /><span /><span /><span />
      </div>
    </div>
  );
}
