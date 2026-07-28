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
    <div className="flex min-h-screen bg-slate-50">
  <Sidebar
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
  />

  <div className="min-w-0 flex-1">
        <Header
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}