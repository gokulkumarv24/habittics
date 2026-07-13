import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import {
  DATE_KEY_REGEX,
  dateKeyToUtcDate,
  utcDateToKey,
  localDateKey,
  type DateKey,
} from "@/lib/dates";
import {
  computeStreak,
  isScheduledOnKey,
  milestoneReached,
  type Frequency,
} from "@/lib/streak";

const dateKeySchema = z.string().regex(DATE_KEY_REGEX, "Expected yyyy-MM-dd");

export const habitRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().default(false),
        categoryId: z.string().optional(),
        todayOnly: z.boolean().default(false),
        // The client's local calendar date; falls back to the server's.
        dateKey: dateKeySchema.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const todayKey = input?.dateKey ?? localDateKey();
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
            where: { date: dateKeyToUtcDate(todayKey) },
            take: 1,
          },
        },
        orderBy: { order: "asc" },
      });

      if (input?.todayOnly) {
        return habits.filter((h) =>
          isScheduledOnKey(h.frequency as Frequency, h.customDays, todayKey)
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
      if (!habit) throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
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
        // The user's local calendar date being toggled (may be a past day).
        dateKey: dateKeySchema,
        // The user's actual "today" — anchors streak calculation on backfills.
        todayKey: dateKeySchema.optional(),
        value: z.number().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const date = dateKeyToUtcDate(input.dateKey);

      const habit = await ctx.db.habit.findFirst({
        where: { id: input.habitId, userId },
      });
      if (!habit) throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });

      const existing = await ctx.db.habitLog.findUnique({
        where: { habitId_date: { habitId: input.habitId, date } },
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
            date,
            completed: true,
            value: input.value ?? 1,
            note: input.note,
          },
        });
      }

      const previousStreak = (
        await ctx.db.habitStreak.findUnique({ where: { habitId: input.habitId } })
      )?.currentStreak ?? 0;

      // Streaks are measured from the user's real today, not the day being
      // (back)filled; without a client todayKey fall back to the later of the
      // toggled day and the server's local date.
      const serverToday = localDateKey();
      const anchorKey =
        input.todayKey ?? (input.dateKey > serverToday ? input.dateKey : serverToday);
      const streak = await updateStreak(ctx.db, input.habitId, anchorKey);

      // Streak milestone notification
      const milestone = milestoneReached(previousStreak, streak.currentStreak);
      if (log.completed && milestone) {
        await ctx.db.notification.create({
          data: {
            userId,
            type: "STREAK_MILESTONE",
            title: `${milestone}-day streak!`,
            message: `"${habit.title}" has a ${milestone}-day streak. Keep it growing!`,
          },
        });
      }

      // Auto-progress goals linked to this habit
      await applyLinkedGoalProgress(ctx.db, userId, habit, log.completed, input.dateKey);

      return { log, streak };
    }),

  getLogsForRange: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        startKey: dateKeySchema,
        endKey: dateKeySchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({
        where: { id: input.habitId, userId: ctx.session.user.id! },
      });
      if (!habit) throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });

      return ctx.db.habitLog.findMany({
        where: {
          habitId: input.habitId,
          date: {
            gte: dateKeyToUtcDate(input.startKey),
            lte: dateKeyToUtcDate(input.endKey),
          },
        },
        orderBy: { date: "asc" },
      });
    }),
});

type DbClient = typeof import("@/server/db/client").db;

async function updateStreak(db: DbClient, habitId: string, todayKey: DateKey) {
  const habit = await db.habit.findUnique({
    where: { id: habitId },
    select: { frequency: true, customDays: true },
  });
  if (!habit) throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });

  const logs = await db.habitLog.findMany({
    where: { habitId, completed: true },
    orderBy: { date: "desc" },
    take: 400,
    select: { date: true },
  });

  const completedKeys = new Set(logs.map((l) => utcDateToKey(new Date(l.date))));

  const { currentStreak } = computeStreak({
    completedKeys,
    todayKey,
    frequency: habit.frequency as Frequency,
    customDays: habit.customDays,
  });

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

/**
 * When a habit completion is toggled, adjust progress on any active goal
 * linked to that habit (one completion = +1 progress) and auto-complete
 * goals that reach their target.
 */
async function applyLinkedGoalProgress(
  db: DbClient,
  userId: string,
  habit: { id: string; title: string },
  completed: boolean,
  dateKey: DateKey
) {
  const day = dateKeyToUtcDate(dateKey);
  const goals = await db.goal.findMany({
    where: {
      userId,
      linkedHabitId: habit.id,
      status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
      startDate: { lte: new Date(`${dateKey}T23:59:59.999Z`) },
      endDate: { gte: day },
    },
  });

  for (const goal of goals) {
    const nextValue = Math.max(0, goal.currentValue + (completed ? 1 : -1));
    const reachedTarget = goal.targetValue != null && nextValue >= goal.targetValue;

    await db.goal.update({
      where: { id: goal.id },
      data: {
        currentValue: nextValue,
        status: reachedTarget ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    if (reachedTarget) {
      await db.notification.create({
        data: {
          userId,
          type: "GOAL_COMPLETED",
          title: "Goal completed!",
          message: `"${goal.title}" reached its target of ${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""} — powered by your "${habit.title}" habit.`,
        },
      });
    }
  }
}
