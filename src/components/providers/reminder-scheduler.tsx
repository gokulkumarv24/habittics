"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { localDateKey } from "@/lib/dates";
import { isScheduledOnKey, type Frequency } from "@/lib/streak";

const CHECK_INTERVAL_MS = 30_000;

function currentTimeHHmm(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    // Prefer the service worker so notifications work in the installed PWA
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" })
      );
    } else {
      new Notification(title, { body, icon: "/icons/icon-192.png" });
    }
  } catch {
    // Notifications unavailable — the in-app toast already covers it
  }
}

/**
 * Fires habit reminders while the app is open (tab or installed PWA):
 * an in-app toast always, plus a browser notification when permission is
 * granted and push notifications are enabled in settings.
 */
export function ReminderScheduler() {
  const { data: habits } = trpc.habit.getAll.useQuery(
    { dateKey: localDateKey() },
    { refetchInterval: 5 * 60_000 }
  );
  const { data: settings } = trpc.user.getSettings.useQuery();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      if (!habits) return;
      const nowHHmm = currentTimeHHmm();
      const todayKey = localDateKey();

      for (const habit of habits) {
        if (!habit.reminderTime || habit.isArchived) continue;
        if (!isScheduledOnKey(habit.frequency as Frequency, habit.customDays as number[], todayKey)) continue;
        if (habit.logs.length > 0 && habit.logs[0].completed) continue; // already done today

        const fireKey = `${todayKey}-${habit.id}-${habit.reminderTime}`;
        if (habit.reminderTime !== nowHHmm || firedRef.current.has(fireKey)) continue;

        firedRef.current.add(fireKey);
        const title = "Time to water a habit 🌱";
        const body = `"${habit.title}" is scheduled now${habit.unit ? ` — ${habit.targetPerDay} ${habit.unit}` : ""}.`;
        toast(title, { description: body });
        if (settings?.pushNotify !== false) {
          showBrowserNotification(title, body);
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [habits, settings?.pushNotify]);

  return null;
}
