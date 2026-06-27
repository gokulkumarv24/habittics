"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sprout, Target, BarChart3, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { name: "Garden",  href: "/dashboard",  icon: LayoutDashboard },
  { name: "Habits",  href: "/habits",     icon: Sprout },
  { name: "Planner", href: "/planner",    icon: CalendarDays },
  { name: "Goals",   href: "/goals",      icon: Target },
  { name: "Stats",   href: "/analytics",  icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-bottom">
      <div className="mx-3 mb-3 rounded-2xl bg-card/90 dark:bg-card/95 backdrop-blur-2xl border border-border/60 shadow-float">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] cursor-pointer",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground active:scale-95"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10" />
                )}
                {isActive && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-400" />
                )}

                <item.icon
                  className={cn(
                    "relative w-5 h-5 transition-transform duration-200",
                    isActive ? "scale-110" : "scale-100"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span className="relative text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
