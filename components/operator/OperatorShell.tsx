"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import Header from "@/components/operator/Header";
import Sidebar from "@/components/operator/sidebar";

interface OperatorUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface OperatorShellProps {
  children: ReactNode;
  user: OperatorUser;
}

export default function OperatorShell({
  children,
  user,
}: OperatorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100/60 antialiased">
      {/* Sidebar สำหรับ Mobile / Desktop */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}