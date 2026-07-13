"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, Sprout, Target, CalendarClock, Info, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
  STREAK_MILESTONE: Sprout,
  GOAL_COMPLETED: Target,
  GOAL_DEADLINE: CalendarClock,
  REMINDER: Bell,
  SYSTEM: Info,
} as const;

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const { data: notifications } = trpc.notification.getAll.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => utils.notification.invalidate(),
  });
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.invalidate(),
  });
  const remove = trpc.notification.delete.useMutation({
    onSuccess: () => utils.notification.invalidate(),
  });

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-xl hover:bg-accent relative"
        aria-label={
          unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"
        }
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-4 h-4" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount! > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto rounded-2xl border bg-card shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-card">
            <p className="text-sm font-semibold">Notifications</p>
            {(unreadCount ?? 0) > 0 && (
              <button
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS] ?? Info;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 group",
                      !n.read && "bg-primary/[0.04]"
                    )}
                    onClick={() => {
                      if (!n.read) markRead.mutate({ id: n.id });
                    }}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {timeAgo(new Date(n.createdAt))}
                      </p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
                      aria-label="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove.mutate({ id: n.id });
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">
              No notifications yet — go grow something!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
