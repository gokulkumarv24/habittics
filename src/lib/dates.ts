/**
 * Date-key convention used across the app.
 *
 * A habit-log "day" is identified by a calendar-date string ("2026-07-13")
 * in the USER's local timezone. In Postgres it is stored in a DATE column
 * as UTC midnight of that calendar date. Never run a stored date through a
 * local-timezone startOfDay — for UTC+ timezones that shifts it a day back.
 */

export type DateKey = string; // "yyyy-MM-dd"

export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date of `date` in the machine's local timezone. */
export function localDateKey(date: Date = new Date()): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Calendar date of `date` in an IANA timezone (falls back to UTC on bad tz). */
export function dateKeyInTimezone(timeZone: string, date: Date = new Date()): DateKey {
  try {
    // en-CA formats as yyyy-MM-dd
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return utcDateToKey(date);
  }
}

/** UTC midnight of a calendar date — the canonical DB representation. */
export function dateKeyToUtcDate(key: DateKey): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Calendar date of a stored (UTC-midnight) DATE value. */
export function utcDateToKey(date: Date): DateKey {
  return date.toISOString().slice(0, 10);
}

/** Day of week for a date key: 0=Sun … 6=Sat. Timezone-independent. */
export function dayOfWeekOfKey(key: DateKey): number {
  return dateKeyToUtcDate(key).getUTCDay();
}

/** Add (or subtract) whole days to a date key. */
export function addDaysToKey(key: DateKey, days: number): DateKey {
  const d = dateKeyToUtcDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateToKey(d);
}

/** "yyyy-MM" month bucket of a key (used for monthly streak freezes). */
export function monthOfKey(key: DateKey): string {
  return key.slice(0, 7);
}
