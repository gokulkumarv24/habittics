import { createTRPCRouter } from "@/server/trpc";
import { habitRouter } from "@/server/routers/habit.router";
import { goalRouter } from "@/server/routers/goal.router";
import { analyticsRouter } from "@/server/routers/analytics.router";
import { categoryRouter } from "@/server/routers/category.router";
import { userRouter } from "@/server/routers/user.router";
import { dayPlanRouter } from "@/server/routers/dayplan.router";
import { notificationRouter } from "@/server/routers/notification.router";

export const appRouter = createTRPCRouter({
  habit: habitRouter,
  goal: goalRouter,
  analytics: analyticsRouter,
  category: categoryRouter,
  user: userRouter,
  dayPlan: dayPlanRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
