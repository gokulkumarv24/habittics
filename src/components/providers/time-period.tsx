"use client";

import { useEffect } from "react";

function getPeriod(): "dawn" | "day" | "dusk" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 17 && hour < 21) return "dusk";
  return "day";
}

export function TimePeriodProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const period = getPeriod();
      if (period === "day") {
        document.documentElement.removeAttribute("data-period");
      } else {
        document.documentElement.setAttribute("data-period", period);
      }
    };

    apply();
    const interval = setInterval(apply, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
