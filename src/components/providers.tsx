"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/lib/trpc";
import { TimePeriodProvider } from "@/components/providers/time-period";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TimePeriodProvider>
            {children}
          </TimePeriodProvider>
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
