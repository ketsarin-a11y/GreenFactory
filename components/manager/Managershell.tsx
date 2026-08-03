"use client";

import { useState } from "react";
import Sidebar from "@/components/manager/Sidebar";
import Header from "@/components/manager/Header";

export default function ManagerShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-col gap-6 px-4 pb-10 sm:px-8">{children}</div>
      </main>
    </div>
  );
}