import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { userId: ctx.session.user.id! },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { habits: true, goals: true } },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().default("#6366f1"),
        icon: z.string().default("folder"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const maxOrder = await ctx.db.category.aggregate({
        where: { userId },
        _max: { order: true },
      });
      return ctx.db.category.create({
        data: { ...input, userId, order: (maxOrder._max.order ?? 0) + 1 },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.category.update({
        where: { id, userId: ctx.session.user.id! },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.delete({
        where: { id: input.id, userId: ctx.session.user.id! },
      });
    }),
});
