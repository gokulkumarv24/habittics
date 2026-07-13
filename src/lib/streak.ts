/**
 * Pure streak logic — no DB access so it can be unit-tested.
 *
 * Streaks are frequency-aware (non-scheduled days never break a streak) and
 * include a "streak freeze": up to GRACE_FREEZES_PER_MONTH missed scheduled
 * days per calendar month are forgiven, bridging the streak without adding
 * to its length.
 */

import {
  addDaysToKey,
  dayOfWeekOfKey,
  monthOfKey,
  type DateKey,
} from "@/lib/dates";

export type Frequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";

export const GRACE_FREEZES_PER_MONTH = 1;
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365] as const;

export function isScheduledOnKey(
  frequency: Frequency,
  customDays: number[],
  key: DateKey
): boolean {
  const day = dayOfWeekOfKey(key); // 0=Sun … 6=Sat
  switch (frequency) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return day >= 1 && day <= 5;
    case "WEEKENDS":
      return day === 0 || day === 6;
    case "CUSTOM":
      return customDays.includes(day);
    default:
      return true;
  }
}

export interface StreakInput {
  completedKeys: Set<DateKey>;
  todayKey: DateKey;
  frequency: Frequency;
  customDays: number[];
  maxLookbackDays?: number;
}

export interface StreakResult {
  currentStreak: number;
  /** Missed scheduled days that were bridged by a freeze. */
  freezesUsed: DateKey[];
}

export function computeStreak({
  completedKeys,
  todayKey,
  frequency,
  customDays,
  maxLookbackDays = 400,
}: StreakInput): StreakResult {
  let currentStreak = 0;
  const freezesUsed: DateKey[] = [];
  const freezesByMonth = new Map<string, number>();

  let key = todayKey;
  for (let i = 0; i < maxLookbackDays; i++) {
    if (isScheduledOnKey(frequency, customDays, key)) {
      if (completedKeys.has(key)) {
        currentStreak++;
      } else if (i === 0) {
        // Today is still in progress — an incomplete today never breaks a streak.
      } else {
        const month = monthOfKey(key);
        const used = freezesByMonth.get(month) ?? 0;
        if (used < GRACE_FREEZES_PER_MONTH) {
          freezesByMonth.set(month, used + 1);
          freezesUsed.push(key);
        } else {
          break;
        }
      }
    }
    key = addDaysToKey(key, -1);
  }

  // Freezes that bridged nothing (no completion further back) are not real bridges;
  // trim trailing freezes so an isolated freeze can't extend past the last completion.
  while (
    freezesUsed.length > 0 &&
    freezesUsed[freezesUsed.length - 1] < oldestCompletionAtOrBefore(completedKeys, todayKey)
  ) {
    freezesUsed.pop();
  }

  return { currentStreak, freezesUsed };
}

function oldestCompletionAtOrBefore(completedKeys: Set<DateKey>, todayKey: DateKey): DateKey {
  let oldest = todayKey;
  for (const k of completedKeys) {
    if (k <= todayKey && k < oldest) oldest = k;
  }
  return oldest;
}

/** Milestone crossed when a streak moves from `previous` to `current`, if any. */
export function milestoneReached(previous: number, current: number): number | null {
  for (const m of STREAK_MILESTONES) {
    if (previous < m && current >= m) return m;
  }
  return null;
}
