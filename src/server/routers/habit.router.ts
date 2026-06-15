import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { startOfDay } from "date-fns";

export const habitRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().default(false),
        categoryId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      return ctx.db.habit.findMany({
        where: {
          userId,
          isArchived: input?.includeArchived ? undefined : false,
          categoryId: input?.categoryId || undefined,
        },
        include: {
          category: true,
          streak: true,
          logs: {
            where: { date: startOfDay(new Date()) },
            take: 1,
          },
        },
        orderBy: { order: "asc" },
      });
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
  const logs = await db.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    take: 365,
  });

  let currentStreak = 0;
  const today = startOfDay(new Date());

  for (let i = 0; i < logs.length; i++) {
    const logDate = startOfDay(new Date(logs[i].date));
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (logDate.getTime() === startOfDay(expectedDate).getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  return db.habitStreak.upsert({
    where: { habitId },
    update: {
      currentStreak,
      longestStreak: { set: undefined },
      lastCompletedAt: logs[0]?.date || null,
    },
    create: { habitId, currentStreak, longestStreak: currentStreak },
  });
}
