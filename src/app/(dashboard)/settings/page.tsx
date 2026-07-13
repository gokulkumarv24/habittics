"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Download, BellRing } from "lucide-react";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { setTheme: applyTheme } = useTheme();
  const { data: settings } = trpc.user.getSettings.useQuery();
  const { data: profile } = trpc.user.getProfile.useQuery();
  const utils = trpc.useUtils();

  const [profileForm, setProfileForm] = useState({ name: "" });
  const [settingsForm, setSettingsForm] = useState({
    theme: "system",
    timezone: "UTC",
    weekStartDay: 1,
    reminderTime: "08:00",
    emailNotify: true,
    pushNotify: true,
  });

  useEffect(() => {
    if (profile) setProfileForm({ name: profile.name || "" });
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        theme: settings.theme,
        timezone: settings.timezone,
        weekStartDay: settings.weekStartDay,
        reminderTime: settings.reminderTime,
        emailNotify: settings.emailNotify,
        pushNotify: settings.pushNotify,
      });
    }
  }, [settings]);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => utils.user.getProfile.invalidate(),
  });

  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.getSettings.invalidate();
      applyTheme(settingsForm.theme);
    },
  });

  const [notifPermission, setNotifPermission] = useState<string>("default");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const exportQuery = trpc.user.exportData.useQuery(undefined, { enabled: false });

  const handleExportJson = async () => {
    const { data } = await exportQuery.refetch();
    if (!data) return;
    downloadFile(
      `habitflow-export-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      "application/json"
    );
  };

  const handleExportCsv = async () => {
    const { data } = await exportQuery.refetch();
    if (!data) return;
    const rows = data.habits.flatMap((habit) =>
      habit.logs.map((log) => ({
        habit: habit.title,
        category: habit.category?.name ?? "",
        date: new Date(log.date).toISOString().slice(0, 10),
        completed: log.completed,
        value: log.value,
        note: log.note ?? "",
      }))
    );
    downloadFile(
      `habitflow-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
      "text/csv"
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={session?.user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ name: e.target.value })}
            />
          </div>
          <Button
            onClick={() => updateProfile.mutate(profileForm)}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <select
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
              value={settingsForm.theme}
              onChange={(e) => setSettingsForm({ ...settingsForm, theme: e.target.value })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <select
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
              value={settingsForm.timezone}
              onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Week Starts On</Label>
            <select
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
              value={settingsForm.weekStartDay}
              onChange={(e) => setSettingsForm({ ...settingsForm, weekStartDay: parseInt(e.target.value) })}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Daily Reminder Time</Label>
            <Input
              type="time"
              value={settingsForm.reminderTime}
              onChange={(e) => setSettingsForm({ ...settingsForm, reminderTime: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.emailNotify}
                onChange={(e) => setSettingsForm({ ...settingsForm, emailNotify: e.target.checked })}
                className="w-4 h-4 rounded border"
              />
              <span className="text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.pushNotify}
                onChange={(e) => setSettingsForm({ ...settingsForm, pushNotify: e.target.checked })}
                className="w-4 h-4 rounded border"
              />
              <span className="text-sm">Push Notifications</span>
            </label>
          </div>

          {settingsForm.pushNotify && notifPermission !== "granted" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs flex-1">
                {notifPermission === "denied"
                  ? "Browser notifications are blocked — enable them in your browser's site settings to receive habit reminders."
                  : "Allow browser notifications so habit reminders can reach you."}
              </p>
              {notifPermission === "default" && (
                <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                  Enable
                </Button>
              )}
            </div>
          )}

          <Button
            onClick={() => updateSettings.mutate(settingsForm)}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download everything you&apos;ve tracked — habits, logs, goals, day plans, and settings.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportJson} disabled={exportQuery.isFetching}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={exportQuery.isFetching}>
              <Download className="w-4 h-4 mr-2" />
              Export Logs CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
