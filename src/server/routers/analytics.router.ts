import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, getDay } from "date-fns";
import type { HabitFrequency } from "@prisma/client";

function isHabitScheduledForDate(
  frequency: HabitFrequency,
  customDays: number[],
  date: Date
): boolean {
  const jsDay = getDay(date);
  switch (frequency) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return jsDay >= 1 && jsDay <= 5;
    case "WEEKENDS":
      return jsDay === 0 || jsDay === 6;
    case "CUSTOM":
      return customDays.includes(jsDay);
    default:
      return true;
  }
}

export const analyticsRouter = createTRPCRouter({
  getDailyStats: protectedProcedure
    .input(z.object({ date: z.date().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const today = startOfDay(input?.date ?? new Date());

      const allHabits = await ctx.db.habit.findMany({
        where: { userId, isArchived: false },
        include: {
          streak: true,
          logs: { where: { date: today } },
        },
      });

      // Only count habits scheduled for today
      const habits = allHabits.filter((h) =>
        isHabitScheduledForDate(h.frequency, h.customDays, today)
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

      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const goalsCompletedThisWeek = await ctx.db.goal.count({
        where: {
          userId,
          status: "COMPLETED",
          updatedAt: { gte: weekStart, lte: weekEnd },
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

  getWeeklyStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const habits = await ctx.db.habit.findMany({
      where: { userId, isArchived: false },
    });

    const logs = await ctx.db.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: weekStart, lte: today },
      },
    });

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const scheduledForDay = habits.filter((h) =>
        isHabitScheduledForDate(h.frequency, h.customDays, date)
      );
      const dayLogs = logs.filter(
        (l) => startOfDay(new Date(l.date)).getTime() === startOfDay(date).getTime()
      );
      const scheduledIds = new Set(scheduledForDay.map((h) => h.id));
      const completedCount = dayLogs.filter((l) => l.completed && scheduledIds.has(l.habitId)).length;
      days.push({
        date: date.toISOString(),
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        total: scheduledForDay.length,
        completed: completedCount,
        rate: scheduledForDay.length > 0
          ? Math.round((completedCount / scheduledForDay.length) * 100)
          : 0,
      });
    }

    return days;
  }),

  getCompletionRate: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        habitId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const habits = input.habitId
        ? [{ id: input.habitId }]
        : await ctx.db.habit.findMany({ where: { userId, isArchived: false }, select: { id: true } });

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: { gte: input.startDate, lte: input.endDate },
        },
        orderBy: { date: "asc" },
      });

      const total = logs.length;
      const completed = logs.filter((l) => l.completed).length;

      return {
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }),

  getMonthlyHeatmap: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const startDate = subDays(new Date(), 90);

    const habits = await ctx.db.habit.findMany({
      where: { userId, isArchived: false },
      select: { id: true },
    });

    const logs = await ctx.db.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: startDate },
        completed: true,
      },
    });

    // Group by date
    const heatmap: Record<string, number> = {};
    logs.forEach((log) => {
      const key = startOfDay(new Date(log.date)).toISOString().split("T")[0];
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return heatmap;
  }),
});
