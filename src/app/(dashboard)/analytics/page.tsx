"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { subDays } from "date-fns";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];

export default function AnalyticsPage() {
  const { data: weeklyStats } = trpc.analytics.getWeeklyStats.useQuery();
  const { data: dailyStats } = trpc.analytics.getDailyStats.useQuery();
  const { data: completionRate } = trpc.analytics.getCompletionRate.useQuery({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const { data: categories } = trpc.category.getAll.useQuery();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights into your habits and goal progress.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">30-Day Rate</p>
            <p className="text-3xl font-bold font-mono mt-1">{completionRate?.rate ?? 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-bold font-mono mt-1">{completionRate?.completed ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Tracked</p>
            <p className="text-3xl font-bold font-mono mt-1">{completionRate?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <p className="text-3xl font-bold font-mono mt-1">{dailyStats?.activeGoals ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyStats || []}>
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  formatter={(value: number) => [`${value}%`, "Rate"]}
                />
                <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categories && categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((cat, i) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat._count.habits} habits
                      </span>
                    </div>
                    <Progress
                      value={cat._count.habits > 0 ? Math.min(cat._count.habits * 20, 100) : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No categories yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats?.currentStreaks && dailyStats.currentStreaks.length > 0 ? (
            <div className="space-y-2">
              {dailyStats.currentStreaks.map((streak, i) => (
                <div key={streak.habitId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <span className="flex-1 font-medium">{streak.title}</span>
                  <span className="font-mono font-bold text-orange-500">{streak.streak} 🔥</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Start building your streaks!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
