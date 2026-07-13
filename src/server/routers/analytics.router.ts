import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import {
  DATE_KEY_REGEX,
  addDaysToKey,
  dateKeyInTimezone,
  dateKeyToUtcDate,
  dayOfWeekOfKey,
  utcDateToKey,
  type DateKey,
} from "@/lib/dates";
import { isScheduledOnKey, type Frequency } from "@/lib/streak";

const dateKeySchema = z.string().regex(DATE_KEY_REGEX, "Expected yyyy-MM-dd");
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DbClient = typeof import("@/server/db/client").db;

/**
 * The user's "today". Prefer the calendar date the client sends (it knows its
 * own timezone); fall back to the timezone saved in settings.
 */
async function resolveTodayKey(
  db: DbClient,
  userId: string,
  clientKey?: DateKey
): Promise<DateKey> {
  if (clientKey) return clientKey;
  const settings = await db.userSettings.findUnique({ where: { userId } });
  return dateKeyInTimezone(settings?.timezone ?? "UTC");
}

export const analyticsRouter = createTRPCRouter({
  getDailyStats: protectedProcedure
    .input(z.object({ dateKey: dateKeySchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const todayKey = await resolveTodayKey(ctx.db, userId, input?.dateKey);

      const allHabits = await ctx.db.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          streak: true,
          logs: { where: { date: dateKeyToUtcDate(todayKey) } },
        },
      });

      // Only count habits scheduled for today
      const habits = allHabits.filter((h) =>
        isScheduledOnKey(h.frequency as Frequency, h.customDays, todayKey)
      );

      const totalHabits = habits.length;
      const completedToday = habits.filter((h) => h.logs.some((l) => l.completed)).length;
      const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

      const streaks = habits
        .filter((h) => h.streak)
        .map((h) => ({
          habitId: h.id,
          title: h.title,
          streak: h.streak!.currentStreak,
        }))
        .sort((a, b) => b.streak - a.streak);

      const activeGoals = await ctx.db.goal.count({
        where: { userId, status: "IN_PROGRESS" },
      });

      const settings = await ctx.db.userSettings.findUnique({ where: { userId } });
      const weekStartDay = settings?.weekStartDay ?? 1;
      const weekStartKey = startOfWeekKey(todayKey, weekStartDay);
      const goalsCompletedThisWeek = await ctx.db.goal.count({
        where: {
          userId,
          status: "COMPLETED",
          updatedAt: {
            gte: dateKeyToUtcDate(weekStartKey),
            lte: new Date(`${addDaysToKey(weekStartKey, 6)}T23:59:59.999Z`),
          },
        },
      });

      return {
        totalHabits,
        completedToday,
        completionRate,
        currentStreaks: streaks.slice(0, 5),
        longestStreak: streaks[0] ?? null,
        activeGoals,
        goalsCompletedThisWeek,
      };
    }),

  getWeeklyStats: protectedProcedure
    .input(z.object({ dateKey: dateKeySchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const todayKey = await resolveTodayKey(ctx.db, userId, input?.dateKey);
      const settings = await ctx.db.userSettings.findUnique({ where: { userId } });
      const weekStartKey = startOfWeekKey(todayKey, settings?.weekStartDay ?? 1);

      const habits = await ctx.db.habit.findMany({
        where: { userId, isArchived: false },
      });

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: {
            gte: dateKeyToUtcDate(weekStartKey),
            lte: dateKeyToUtcDate(addDaysToKey(weekStartKey, 6)),
          },
        },
      });

      const logsByKey = new Map<DateKey, typeof logs>();
      for (const log of logs) {
        const key = utcDateToKey(new Date(log.date));
        const list = logsByKey.get(key) ?? [];
        list.push(log);
        logsByKey.set(key, list);
      }

      const days = [];
      for (let i = 0; i < 7; i++) {
        const key = addDaysToKey(weekStartKey, i);
        const scheduledForDay = habits.filter((h) =>
          isScheduledOnKey(h.frequency as Frequency, h.customDays, key)
        );
        const scheduledIds = new Set(scheduledForDay.map((h) => h.id));
        const completedCount = (logsByKey.get(key) ?? []).filter(
          (l) => l.completed && scheduledIds.has(l.habitId)
        ).length;
        days.push({
          dateKey: key,
          day: DAY_NAMES[dayOfWeekOfKey(key)],
          isToday: key === todayKey,
          total: scheduledForDay.length,
          completed: completedCount,
          rate:
            scheduledForDay.length > 0
              ? Math.round((completedCount / scheduledForDay.length) * 100)
              : 0,
        });
      }

      return days;
    }),

  getCompletionRate: protectedProcedure
    .input(
      z.object({
        startKey: dateKeySchema,
        endKey: dateKeySchema,
        habitId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const habits = await ctx.db.habit.findMany({
        where: {
          userId,
          isArchived: false,
          id: input.habitId || undefined,
        },
        select: { id: true, frequency: true, customDays: true, createdAt: true },
      });

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: {
            gte: dateKeyToUtcDate(input.startKey),
            lte: dateKeyToUtcDate(input.endKey),
          },
          completed: true,
        },
        select: { habitId: true, date: true },
      });

      const completedByHabit = new Map<string, Set<DateKey>>();
      for (const log of logs) {
        const set = completedByHabit.get(log.habitId) ?? new Set<DateKey>();
        set.add(utcDateToKey(new Date(log.date)));
        completedByHabit.set(log.habitId, set);
      }

      // Rate = completions / days the habit was actually scheduled (not just logged)
      let scheduledTotal = 0;
      let completed = 0;
      for (
        let key = input.startKey;
        key <= input.endKey;
        key = addDaysToKey(key, 1)
      ) {
        for (const habit of habits) {
          if (!isScheduledOnKey(habit.frequency as Frequency, habit.customDays, key)) continue;
          scheduledTotal++;
          if (completedByHabit.get(habit.id)?.has(key)) completed++;
        }
      }

      return {
        total: scheduledTotal,
        completed,
        rate: scheduledTotal > 0 ? Math.round((completed / scheduledTotal) * 100) : 0,
      };
    }),

  getMonthlyHeatmap: protectedProcedure
    .input(z.object({ dateKey: dateKeySchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const todayKey = await resolveTodayKey(ctx.db, userId, input?.dateKey);
      const startKey = addDaysToKey(todayKey, -90);

      const habits = await ctx.db.habit.findMany({
        where: { userId, isArchived: false },
        select: { id: true },
      });

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: { gte: dateKeyToUtcDate(startKey) },
          completed: true,
        },
      });

      // Group by calendar date — stored dates ARE the calendar date (UTC midnight)
      const heatmap: Record<string, number> = {};
      logs.forEach((log) => {
        const key = utcDateToKey(new Date(log.date));
        heatmap[key] = (heatmap[key] || 0) + 1;
      });

      return heatmap;
    }),

  getInsights: protectedProcedure
    .input(z.object({ dateKey: dateKeySchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const todayKey = await resolveTodayKey(ctx.db, userId, input?.dateKey);
      const startKey = addDaysToKey(todayKey, -59); // last 60 days

      const habits = await ctx.db.habit.findMany({
        where: { userId, isArchived: false },
        select: { id: true, title: true, frequency: true, customDays: true },
      });
      if (habits.length === 0) {
        return { bestDay: null, worstDay: null, habitInsights: [], weekTrend: null };
      }

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: { gte: dateKeyToUtcDate(startKey) },
          completed: true,
        },
        select: { habitId: true, date: true },
      });

      const completedByHabit = new Map<string, Set<DateKey>>();
      for (const log of logs) {
        const set = completedByHabit.get(log.habitId) ?? new Set<DateKey>();
        set.add(utcDateToKey(new Date(log.date)));
        completedByHabit.set(log.habitId, set);
      }

      // Completion rate per day-of-week across all habits
      const dowScheduled = new Array(7).fill(0);
      const dowCompleted = new Array(7).fill(0);
      const perHabit = new Map<
        string,
        { weekdayDone: number; weekdaySched: number; weekendDone: number; weekendSched: number }
      >();

      for (let key = startKey; key <= todayKey; key = addDaysToKey(key, 1)) {
        const dow = dayOfWeekOfKey(key);
        const isWeekend = dow === 0 || dow === 6;
        for (const habit of habits) {
          if (!isScheduledOnKey(habit.frequency as Frequency, habit.customDays, key)) continue;
          const done = completedByHabit.get(habit.id)?.has(key) ?? false;
          dowScheduled[dow]++;
          if (done) dowCompleted[dow]++;
          const stats =
            perHabit.get(habit.id) ??
            { weekdayDone: 0, weekdaySched: 0, weekendDone: 0, weekendSched: 0 };
          if (isWeekend) {
            stats.weekendSched++;
            if (done) stats.weekendDone++;
          } else {
            stats.weekdaySched++;
            if (done) stats.weekdayDone++;
          }
          perHabit.set(habit.id, stats);
        }
      }

      const dowRates = DAY_NAMES.map((day, i) => ({
        day,
        rate: dowScheduled[i] > 0 ? Math.round((dowCompleted[i] / dowScheduled[i]) * 100) : null,
      })).filter((d) => d.rate !== null) as { day: string; rate: number }[];

      const bestDay = dowRates.length
        ? dowRates.reduce((a, b) => (b.rate > a.rate ? b : a))
        : null;
      const worstDay = dowRates.length
        ? dowRates.reduce((a, b) => (b.rate < a.rate ? b : a))
        : null;

      // Habits with the biggest weekday/weekend gap
      const habitInsights = habits
        .map((h) => {
          const s = perHabit.get(h.id);
          if (!s || s.weekdaySched < 5 || s.weekendSched < 2) return null;
          const weekdayRate = Math.round((s.weekdayDone / s.weekdaySched) * 100);
          const weekendRate = Math.round((s.weekendDone / s.weekendSched) * 100);
          return {
            habitId: h.id,
            title: h.title,
            weekdayRate,
            weekendRate,
            gap: Math.abs(weekdayRate - weekendRate),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null && x.gap >= 15)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3);

      // This week vs last week
      const rateBetween = (from: DateKey, to: DateKey) => {
        let sched = 0;
        let done = 0;
        for (let key = from; key <= to; key = addDaysToKey(key, 1)) {
          for (const habit of habits) {
            if (!isScheduledOnKey(habit.frequency as Frequency, habit.customDays, key)) continue;
            sched++;
            if (completedByHabit.get(habit.id)?.has(key)) done++;
          }
        }
        return sched > 0 ? Math.round((done / sched) * 100) : null;
      };
      const thisWeek = rateBetween(addDaysToKey(todayKey, -6), todayKey);
      const lastWeek = rateBetween(addDaysToKey(todayKey, -13), addDaysToKey(todayKey, -7));
      const weekTrend =
        thisWeek !== null && lastWeek !== null
          ? { thisWeek, lastWeek, delta: thisWeek - lastWeek }
          : null;

      return { bestDay, worstDay, habitInsights, weekTrend };
    }),
});

function startOfWeekKey(todayKey: DateKey, weekStartDay: number): DateKey {
  const dow = dayOfWeekOfKey(todayKey);
  const diff = (dow - weekStartDay + 7) % 7;
  return addDaysToKey(todayKey, -diff);
}
