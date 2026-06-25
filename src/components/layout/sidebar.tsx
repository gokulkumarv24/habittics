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
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard, color: "text-indigo-500",  bg: "bg-indigo-500/10" },
  { name: "Habits",     href: "/habits",      icon: CheckCircle2,    color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Planner",    href: "/planner",     icon: CalendarDays,    color: "text-sky-500",     bg: "bg-sky-500/10" },
  { name: "Goals",      href: "/goals",       icon: Target,          color: "text-violet-500",  bg: "bg-violet-500/10" },
  { name: "Analytics",  href: "/analytics",   icon: BarChart3,       color: "text-amber-500",   bg: "bg-amber-500/10" },
  { name: "Settings",   href: "/settings",    icon: Settings,        color: "text-slate-500",   bg: "bg-slate-500/10" },
];

const goalSubNav = [
  { name: "Weekly",  href: "/goals/weekly",  icon: Calendar },
  { name: "Monthly", href: "/goals/monthly", icon: TrendingUp },
  { name: "Yearly",  href: "/goals/yearly",  icon: Flame },
];

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0",
          "glass-sidebar",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="logo-mark w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm">
              <Flame className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight">HabitFlow</span>
              <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
                Smart Tracker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Menu
          </p>

          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {/* Active left indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-primary to-violet-500 shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                      isActive
                        ? `${item.bg} ${item.color}`
                        : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>

                  <span className="flex-1">{item.name}</span>

                  {item.name === "Goals" && (
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        isActive ? "rotate-90 text-primary" : "text-muted-foreground/40"
                      )}
                    />
                  )}
                </Link>

                {/* Goal sub-navigation */}
                {item.name === "Goals" && isActive && (
                  <div className="ml-4 mt-1 mb-1 pl-5 border-l border-border/60 space-y-0.5">
                    {goalSubNav.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                            subActive
                              ? "text-primary bg-primary/8"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <sub.icon className="w-3.5 h-3.5" />
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border/50">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-gradient-to-r from-primary/8 to-violet-500/6 border border-primary/15">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-foreground">Track. Grow. Achieve.</p>
              <p className="text-[10px] text-muted-foreground">HabitFlow v1.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
