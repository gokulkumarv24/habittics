"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  Target,
  BarChart3,
  Settings,
  Calendar,
  TrendingUp,
  Flame,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: CheckCircle2 },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const goalSubNav = [
  { name: "Weekly", href: "/goals/weekly", icon: Calendar },
  { name: "Monthly", href: "/goals/monthly", icon: TrendingUp },
  { name: "Yearly", href: "/goals/yearly", icon: Flame },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card lg:min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">HabitFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>

              {/* Goal sub-navigation */}
              {item.name === "Goals" && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {goalSubNav.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        pathname === sub.href
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <sub.icon className="w-3.5 h-3.5" />
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          HabitFlow v1.0 — Track. Grow. Achieve.
        </p>
      </div>
    </aside>
  );
}
