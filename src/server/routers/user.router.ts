import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id! },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id! },
        data: input,
      });
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.userSettings.findUnique({
      where: { userId: ctx.session.user.id! },
    });
    if (!settings) {
      settings = await ctx.db.userSettings.create({
        data: { userId: ctx.session.user.id! },
      });
    }
    return settings;
  }),

  /** Full account data export — habits, logs, goals, plans, categories, settings. */
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const [profile, habits, goals, dayPlans, categories, settings] = await Promise.all([
      ctx.db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
      }),
      ctx.db.habit.findMany({
        where: { userId },
        include: { logs: { orderBy: { date: "asc" } }, streak: true, category: true },
        orderBy: { order: "asc" },
      }),
      ctx.db.goal.findMany({
        where: { userId },
        include: { actions: { orderBy: { order: "asc" } }, category: true },
        orderBy: { createdAt: "asc" },
      }),
      ctx.db.dayPlan.findMany({
        where: { userId },
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { date: "asc" },
      }),
      ctx.db.category.findMany({ where: { userId }, orderBy: { order: "asc" } }),
      ctx.db.userSettings.findUnique({ where: { userId } }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      profile,
      habits,
      goals,
      dayPlans,
      categories,
      settings,
    };
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        theme: z.string().optional(),
        timezone: z.string().optional(),
        weekStartDay: z.number().min(0).max(6).optional(),
        reminderTime: z.string().optional(),
        emailNotify: z.boolean().optional(),
        pushNotify: z.boolean().optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userSettings.upsert({
        where: { userId: ctx.session.user.id! },
        update: input,
        create: { userId: ctx.session.user.id!, ...input },
      });
    }),
});
