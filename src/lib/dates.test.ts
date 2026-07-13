import { describe, it, expect } from "vitest";
import {
  addDaysToKey,
  dateKeyInTimezone,
  dateKeyToUtcDate,
  dayOfWeekOfKey,
  localDateKey,
  monthOfKey,
  utcDateToKey,
} from "./dates";

describe("date keys", () => {
  it("round-trips key -> UTC date -> key", () => {
    expect(utcDateToKey(dateKeyToUtcDate("2026-07-13"))).toBe("2026-07-13");
    expect(utcDateToKey(dateKeyToUtcDate("2026-01-01"))).toBe("2026-01-01");
    expect(utcDateToKey(dateKeyToUtcDate("2026-12-31"))).toBe("2026-12-31");
  });

  it("stores keys as UTC midnight", () => {
    const d = dateKeyToUtcDate("2026-07-13");
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
    expect(d.toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("computes day of week independent of local timezone", () => {
    expect(dayOfWeekOfKey("2026-07-13")).toBe(1); // Monday
    expect(dayOfWeekOfKey("2026-07-12")).toBe(0); // Sunday
    expect(dayOfWeekOfKey("2026-07-18")).toBe(6); // Saturday
  });

  it("adds and subtracts days across month/year boundaries", () => {
    expect(addDaysToKey("2026-07-13", 1)).toBe("2026-07-14");
    expect(addDaysToKey("2026-07-01", -1)).toBe("2026-06-30");
    expect(addDaysToKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDaysToKey("2026-02-28", 1)).toBe("2026-03-01"); // not a leap year
    expect(addDaysToKey("2028-02-28", 1)).toBe("2028-02-29"); // leap year
  });

  it("extracts month buckets", () => {
    expect(monthOfKey("2026-07-13")).toBe("2026-07");
  });

  it("resolves today in a named timezone", () => {
    // 2026-07-13T20:00Z is already 2026-07-14 in Tokyo (UTC+9)
    const instant = new Date("2026-07-13T20:00:00.000Z");
    expect(dateKeyInTimezone("Asia/Tokyo", instant)).toBe("2026-07-14");
    expect(dateKeyInTimezone("America/Los_Angeles", instant)).toBe("2026-07-13");
    // Invalid timezone falls back to UTC rather than crashing
    expect(dateKeyInTimezone("Not/AZone", instant)).toBe("2026-07-13");
  });

  it("localDateKey matches the local calendar date", () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    expect(localDateKey(now)).toBe(expected);
  });
});
