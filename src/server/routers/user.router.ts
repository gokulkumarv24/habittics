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
