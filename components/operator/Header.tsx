"use client";

import { Bell, ChevronDown, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  dateLabel?: string;
  notificationCount?: number;
}

export default function Header({ dateLabel = "19 พฤษภาคม 2567", notificationCount = 3 }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-6 px-8 py-6">
      <div>
        <p className="flex items-center gap-2 text-sm text-slate-500">
          สวัสดีตอนเช้า <span aria-hidden>👋</span>
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{user?.name ?? "ผู้ใช้งาน"}</h1>
        <p className="text-sm text-slate-400">{user?.role ?? ""}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Calendar size={16} className="text-slate-400" />
          {dateLabel}
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50"
        >
          <Bell size={18} className="text-slate-500" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {user?.avatarInitial ?? "?"}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-sm font-semibold text-slate-800">{user?.name ?? "ผู้ใช้งาน"}</span>
            <span className="block text-xs text-slate-400">{user?.role ?? ""}</span>
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}