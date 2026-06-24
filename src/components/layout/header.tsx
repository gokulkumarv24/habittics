"use client";

import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LogOut, User, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b bg-card/80 backdrop-blur-sm">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Spacer keeps actions right-aligned on desktop */}
      <div className="hidden md:block flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
        >
          <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ? `${session.user.name}'s avatar` : "User avatar"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <span className="hidden md:block text-sm font-medium">
            {session?.user?.name || "User"}
          </span>
          <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
