import { describe, it, expect } from "vitest";
import {
  computeStreak,
  isScheduledOnKey,
  milestoneReached,
} from "./streak";
import { addDaysToKey } from "./dates";

// 2026-07-13 is a Monday
const MONDAY = "2026-07-13";

function keysBack(from: string, count: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < count; i++) set.add(addDaysToKey(from, -i));
  return set;
}

describe("isScheduledOnKey", () => {
  it("DAILY is always scheduled", () => {
    expect(isScheduledOnKey("DAILY", [], MONDAY)).toBe(true);
    expect(isScheduledOnKey("DAILY", [], "2026-07-12")).toBe(true); // Sunday
  });

  it("WEEKDAYS excludes weekends", () => {
    expect(isScheduledOnKey("WEEKDAYS", [], MONDAY)).toBe(true);
    expect(isScheduledOnKey("WEEKDAYS", [], "2026-07-11")).toBe(false); // Saturday
    expect(isScheduledOnKey("WEEKDAYS", [], "2026-07-12")).toBe(false); // Sunday
  });

  it("WEEKENDS only includes weekends", () => {
    expect(isScheduledOnKey("WEEKENDS", [], "2026-07-11")).toBe(true);
    expect(isScheduledOnKey("WEEKENDS", [], MONDAY)).toBe(false);
  });

  it("CUSTOM matches selected days", () => {
    expect(isScheduledOnKey("CUSTOM", [1, 3], MONDAY)).toBe(true); // Monday
    expect(isScheduledOnKey("CUSTOM", [3], MONDAY)).toBe(false);
  });
});

describe("computeStreak", () => {
  it("counts consecutive completed days", () => {
    const result = computeStreak({
      completedKeys: keysBack(MONDAY, 5),
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    expect(result.currentStreak).toBe(5);
    expect(result.freezesUsed).toHaveLength(0);
  });

  it("an incomplete today does not break the streak", () => {
    const completed = keysBack(addDaysToKey(MONDAY, -1), 3); // yesterday back 3 days
    const result = computeStreak({
      completedKeys: completed,
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    expect(result.currentStreak).toBe(3);
  });

  it("skips non-scheduled days for WEEKDAYS habits", () => {
    // Completed Mon(today), and previous Fri/Thu/Wed — weekend gap must not break it
    const completed = new Set([
      MONDAY,
      "2026-07-10", // Friday
      "2026-07-09", // Thursday
      "2026-07-08", // Wednesday
    ]);
    const result = computeStreak({
      completedKeys: completed,
      todayKey: MONDAY,
      frequency: "WEEKDAYS",
      customDays: [],
    });
    expect(result.currentStreak).toBe(4);
  });

  it("bridges one missed day per month with a streak freeze", () => {
    // Completed every day for 10 days except one miss in the middle
    const completed = keysBack(MONDAY, 10);
    completed.delete("2026-07-09");
    const result = computeStreak({
      completedKeys: completed,
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    expect(result.currentStreak).toBe(9); // freeze bridges, doesn't add
    expect(result.freezesUsed).toContain("2026-07-09");
  });

  it("breaks after a second miss in the same month", () => {
    const completed = keysBack(MONDAY, 10);
    completed.delete("2026-07-09");
    completed.delete("2026-07-07");
    const result = computeStreak({
      completedKeys: completed,
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    // Streak = Mon 13, Sun 12, Sat 11, Fri 10 (4 days), freeze on Jul 9, Jul 8 counts,
    // then second miss Jul 7 breaks it: 4 + 1 = 5
    expect(result.currentStreak).toBe(5);
  });

  it("returns 0 when nothing is completed", () => {
    const result = computeStreak({
      completedKeys: new Set(),
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    expect(result.currentStreak).toBe(0);
  });

  it("counts a same-day completion as streak 1", () => {
    const result = computeStreak({
      completedKeys: new Set([MONDAY]),
      todayKey: MONDAY,
      frequency: "DAILY",
      customDays: [],
    });
    expect(result.currentStreak).toBe(1);
  });

  it("CUSTOM habits only count scheduled days", () => {
    // Mon + Wed habit; completed last Mon 13th, Wed 8th, Mon 6th
    const completed = new Set([MONDAY, "2026-07-08", "2026-07-06"]);
    const result = computeStreak({
      completedKeys: completed,
      todayKey: MONDAY,
      frequency: "CUSTOM",
      customDays: [1, 3],
    });
    expect(result.currentStreak).toBe(3);
  });
});

describe("milestoneReached", () => {
  it("detects crossing a milestone", () => {
    expect(milestoneReached(6, 7)).toBe(7);
    expect(milestoneReached(29, 30)).toBe(30);
    expect(milestoneReached(7, 8)).toBeNull();
    expect(milestoneReached(0, 1)).toBeNull();
    expect(milestoneReached(99, 100)).toBe(100);
  });
});
