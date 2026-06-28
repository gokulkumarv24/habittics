"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 overflow-auto">
          <div className="animate-slide-up">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
