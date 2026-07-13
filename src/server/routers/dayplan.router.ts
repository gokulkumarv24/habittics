import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { DATE_KEY_REGEX, dateKeyToUtcDate, localDateKey } from "@/lib/dates";

const dateKeySchema = z.string().regex(DATE_KEY_REGEX, "Expected yyyy-MM-dd");

export const dayPlanRouter = createTRPCRouter({
  // Get or create plan for a specific date
  getByDate: protectedProcedure
    .input(z.object({ date: dateKeySchema }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const date = dateKeyToUtcDate(input.date);

      let plan = await ctx.db.dayPlan.findUnique({
        where: { userId_date: { userId, date } },
        include: { items: { orderBy: { order: "asc" } } },
      });

      if (!plan) {
        plan = await ctx.db.dayPlan.create({
          data: { userId, date },
          include: { items: { orderBy: { order: "asc" } } },
        });
      }

      return plan;
    }),

  // Update day note/intention
  updateNote: protectedProcedure
    .input(z.object({ date: dateKeySchema, note: z.string().max(500) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const date = dateKeyToUtcDate(input.date);

      return ctx.db.dayPlan.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date, note: input.note },
        update: { note: input.note },
      });
    }),

  // Add an item to the day plan
  addItem: protectedProcedure
    .input(
      z.object({
        date: dateKeySchema,
        title: z.string().min(1).max(200),
        description: z.string().max(500).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        priority: z.number().min(0).max(2).default(0),
        color: z.string().default("#10b981"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const date = dateKeyToUtcDate(input.date);

      // Ensure day plan exists
      const plan = await ctx.db.dayPlan.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date },
        update: {},
      });

      const maxOrder = await ctx.db.dayPlanItem.aggregate({
        where: { dayPlanId: plan.id },
        _max: { order: true },
      });

      return ctx.db.dayPlanItem.create({
        data: {
          dayPlanId: plan.id,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          priority: input.priority,
          color: input.color,
          order: (maxOrder._max.order ?? 0) + 1,
        },
      });
    }),

  // Toggle item completion
  toggleItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.dayPlanItem.findFirst({
        where: { id: input.itemId },
        include: { dayPlan: true },
      });
      if (!item || item.dayPlan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return ctx.db.dayPlanItem.update({
        where: { id: input.itemId },
        data: {
          completed: !item.completed,
          completedAt: !item.completed ? new Date() : null,
        },
      });
    }),

  // Update an item
  updateItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(500).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
        priority: z.number().min(0).max(2).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { itemId, ...data } = input;
      const item = await ctx.db.dayPlanItem.findFirst({
        where: { id: itemId },
        include: { dayPlan: true },
      });
      if (!item || item.dayPlan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return ctx.db.dayPlanItem.update({ where: { id: itemId }, data });
    }),

  // Delete an item
  deleteItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.dayPlanItem.findFirst({
        where: { id: input.itemId },
        include: { dayPlan: true },
      });
      if (!item || item.dayPlan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return ctx.db.dayPlanItem.delete({ where: { id: input.itemId } });
    }),

  // Get upcoming days with plans (for calendar preview)
  getUpcoming: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(30).default(7),
        dateKey: dateKeySchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const today = dateKeyToUtcDate(input.dateKey ?? localDateKey());
      const endDate = new Date(today);
      endDate.setUTCDate(endDate.getUTCDate() + input.days);

      return ctx.db.dayPlan.findMany({
        where: {
          userId,
          date: { gte: today, lt: endDate },
        },
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { date: "asc" },
      });
    }),
});
