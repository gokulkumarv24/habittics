import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { startOfDay, getDay } from "date-fns";
import type { HabitFrequency } from "@prisma/client";

function isHabitScheduledForDate(
  frequency: HabitFrequency,
  customDays: number[],
  date: Date
): boolean {
  const jsDay = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
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

export const habitRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().default(false),
        categoryId: z.string().optional(),
        todayOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const today = new Date();
      const habits = await ctx.db.habit.findMany({
        where: {
          userId,
          isArchived: input?.includeArchived ? undefined : false,
          categoryId: input?.categoryId || undefined,
        },
        include: {
          category: true,
          streak: true,
          logs: {
            where: { date: startOfDay(today) },
            take: 1,
          },
        },
        orderBy: { order: "asc" },
      });

      if (input?.todayOnly) {
        return habits.filter((h) =>
          isHabitScheduledForDate(h.frequency, h.customDays, today)
        );
      }
      return habits;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({
        where: { id: input.id, userId: ctx.session.user.id! },
        include: {
          category: true,
          streak: true,
          logs: { orderBy: { date: "desc" }, take: 90 },
        },
      });
      if (!habit) throw new Error("Habit not found");
      return habit;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        icon: z.string().default("check-circle"),
        color: z.string().default("#10b981"),
        frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"]).default("DAILY"),
        customDays: z.array(z.number().min(0).max(6)).default([]),
        targetPerDay: z.number().min(1).default(1),
        unit: z.string().optional(),
        reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        categoryId: z.string().optional(),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const maxOrder = await ctx.db.habit.aggregate({
        where: { userId },
        _max: { order: true },
      });

      const habit = await ctx.db.habit.create({
        data: {
          ...input,
          userId,
          order: (maxOrder._max.order ?? 0) + 1,
        },
      });

      // Create initial streak record
      await ctx.db.habitStreak.create({
        data: { habitId: habit.id },
      });

      return habit;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"]).optional(),
        customDays: z.array(z.number().min(0).max(6)).optional(),
        targetPerDay: z.number().min(1).optional(),
        unit: z.string().optional(),
        reminderTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
        categoryId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.habit.update({
        where: { id, userId: ctx.session.user.id! },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.habit.update({
        where: { id: input.id, userId: ctx.session.user.id! },
        data: { isArchived: true },
      });
    }),

  toggleComplete: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        date: z.date(),
        value: z.number().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dateOnly = startOfDay(input.date);

      // Check if log exists
      const existing = await ctx.db.habitLog.findUnique({
        where: { habitId_date: { habitId: input.habitId, date: dateOnly } },
      });

      let log;
      if (existing) {
        log = await ctx.db.habitLog.update({
          where: { id: existing.id },
          data: { completed: !existing.completed, value: input.value ?? existing.value },
        });
      } else {
        log = await ctx.db.habitLog.create({
          data: {
            habitId: input.habitId,
            date: dateOnly,
            completed: true,
            value: input.value ?? 1,
            note: input.note,
          },
        });
      }

      // Update streak
      const streak = await updateStreak(ctx.db, input.habitId);
      return { log, streak };
    }),

  getLogsForRange: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.habitLog.findMany({
        where: {
          habitId: input.habitId,
          date: { gte: input.startDate, lte: input.endDate },
        },
        orderBy: { date: "asc" },
      });
    }),
});

async function updateStreak(db: any, habitId: string) {
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    select: { frequency: true, customDays: true },
  });

  const logs = await db.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    take: 365,
  });

  const completedDates = new Set(
    logs.map((l: any) => startOfDay(new Date(l.date)).getTime())
  );

  let currentStreak = 0;
  const today = startOfDay(new Date());
  const checkDate = new Date(today);

  // Walk backwards day by day, skipping non-scheduled days
  for (let i = 0; i < 400; i++) {
    const d = new Date(checkDate);
    d.setDate(d.getDate() - i);
    const dayStart = startOfDay(d);

    if (!isHabitScheduledForDate(habit.frequency, habit.customDays, dayStart)) {
      continue; // skip non-scheduled days (e.g. weekends for WEEKDAYS habits)
    }

    if (completedDates.has(dayStart.getTime())) {
      currentStreak++;
    } else {
      // Today is allowed to be incomplete without breaking streak
      if (i === 0) continue;
      break;
    }
  }

  const existing = await db.habitStreak.findUnique({ where: { habitId } });
  const longestStreak = Math.max(currentStreak, existing?.longestStreak ?? 0);

  return db.habitStreak.upsert({
    where: { habitId },
    update: {
      currentStreak,
      longestStreak,
      lastCompletedAt: logs[0]?.date || null,
    },
    create: { habitId, currentStreak, longestStreak },
  });
}
