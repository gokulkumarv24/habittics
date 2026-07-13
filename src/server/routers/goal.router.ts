import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const goalRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        type: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).optional(),
        status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "FAILED", "PAUSED"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.goal.findMany({
        where: {
          userId: ctx.session.user.id!,
          type: input?.type || undefined,
          status: input?.status || undefined,
        },
        include: {
          category: true,
          linkedHabit: { select: { id: true, title: true, icon: true, color: true } },
          actions: { orderBy: { order: "asc" } },
          childGoals: {
            include: { actions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.findFirst({
        where: { id: input.id, userId: ctx.session.user.id! },
        include: {
          category: true,
          linkedHabit: { select: { id: true, title: true, icon: true, color: true } },
          actions: { orderBy: { order: "asc" } },
          parentGoal: true,
          childGoals: {
            include: {
              actions: { orderBy: { order: "asc" } },
              childGoals: {
                include: { actions: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      });
      if (!goal) throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });
      return goal;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        type: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
        startDate: z.date(),
        endDate: z.date(),
        targetValue: z.number().optional(),
        unit: z.string().optional(),
        color: z.string().default("#8b5cf6"),
        categoryId: z.string().optional(),
        parentGoalId: z.string().optional(),
        linkedHabitId: z.string().optional(),
        actions: z
          .array(z.object({ title: z.string(), dueDate: z.date().optional() }))
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.endDate <= input.startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      // A linked habit must belong to the same user
      if (input.linkedHabitId) {
        const habit = await ctx.db.habit.findFirst({
          where: { id: input.linkedHabitId, userId: ctx.session.user.id! },
        });
        if (!habit) throw new TRPCError({ code: "NOT_FOUND", message: "Linked habit not found" });
      }

      const { actions, ...goalData } = input;
      const goal = await ctx.db.goal.create({
        data: {
          ...goalData,
          userId: ctx.session.user.id!,
          status: "IN_PROGRESS",
          actions: actions
            ? {
                create: actions.map((a, i) => ({
                  title: a.title,
                  dueDate: a.dueDate,
                  order: i,
                })),
              }
            : undefined,
        },
        include: { actions: true },
      });
      return goal;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "FAILED", "PAUSED"]).optional(),
        targetValue: z.number().optional(),
        currentValue: z.number().optional(),
        color: z.string().optional(),
        categoryId: z.string().nullable().optional(),
        linkedHabitId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.goal.update({
        where: { id, userId: ctx.session.user.id! },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.goal.delete({
        where: { id: input.id, userId: ctx.session.user.id! },
      });
    }),

  updateProgress: protectedProcedure
    .input(z.object({ id: z.string(), currentValue: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.goal.update({
        where: { id: input.id, userId: ctx.session.user.id! },
        data: { currentValue: input.currentValue },
      });

      // Auto-complete if target reached
      if (goal.targetValue && goal.currentValue >= goal.targetValue && goal.status !== "COMPLETED") {
        await ctx.db.goal.update({
          where: { id: input.id },
          data: { status: "COMPLETED" },
        });
        await ctx.db.notification.create({
          data: {
            userId: ctx.session.user.id!,
            type: "GOAL_COMPLETED",
            title: "Goal completed!",
            message: `"${goal.title}" reached its target of ${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""}.`,
          },
        });
      }

      return goal;
    }),

  // Goal Actions
  createAction: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify goal belongs to current user
      const goal = await ctx.db.goal.findFirst({
        where: { id: input.goalId, userId: ctx.session.user.id! },
      });
      if (!goal) throw new TRPCError({ code: "NOT_FOUND", message: "Goal not found" });

      const maxOrder = await ctx.db.goalAction.aggregate({
        where: { goalId: input.goalId },
        _max: { order: true },
      });
      return ctx.db.goalAction.create({
        data: { ...input, order: (maxOrder._max.order ?? 0) + 1 },
      });
    }),

  toggleAction: protectedProcedure
    .input(z.object({ actionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.goalAction.findUnique({
        where: { id: input.actionId },
        include: { goal: { select: { userId: true } } },
      });
      if (!action || action.goal.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Action not found" });
      }

      return ctx.db.goalAction.update({
        where: { id: input.actionId },
        data: {
          completed: !action.completed,
          completedAt: !action.completed ? new Date() : null,
        },
      });
    }),

  deleteAction: protectedProcedure
    .input(z.object({ actionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const action = await ctx.db.goalAction.findUnique({
        where: { id: input.actionId },
        include: { goal: { select: { userId: true } } },
      });
      if (!action || action.goal.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Action not found" });
      }

      return ctx.db.goalAction.delete({ where: { id: input.actionId } });
    }),
});
