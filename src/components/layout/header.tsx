"use client";

import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LogOut, User, Menu, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 lg:px-6 glass-nav">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden w-9 h-9 rounded-xl hover:bg-accent"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="w-4.5 h-4.5" />
      </Button>

      {/* Desktop spacer */}
      <div className="hidden lg:block flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-xl hover:bg-accent relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-sm" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-xl hover:bg-accent"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-border/60 mx-1" />

        {/* User section */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full ring-2 ring-primary/20 overflow-hidden bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ? `${session.user.name}'s avatar` : "User avatar"}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          <span className="hidden md:block text-sm font-semibold">
            {session?.user?.name?.split(" ")[0] || "User"}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
