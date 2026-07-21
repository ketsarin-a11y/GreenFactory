"use client";

import { Bell, ChevronDown, Calendar, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  dateLabel?: string;
  notificationCount?: number;
  onMenuClick?: () => void; // เปิดเมนู Sidebar แบบ drawer บนจอเล็ก
}

export default function Header({ dateLabel = "19 พฤษภาคม 2567", notificationCount = 3, onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
      <div className="flex items-center gap-3">
        {/* ปุ่มแฮมเบอร์เกอร์ โชว์เฉพาะจอเล็ก (lg ขึ้นไป Sidebar อยู่ถาวรอยู่แล้ว) */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 md:hidden"
          aria-label="เปิดเมนู"
        >
          <Menu size={18} />
        </button>

        <div>
          <p className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
            สวัสดีตอนเช้า <span aria-hidden>👋</span>
          </p>
          <h1 className="text-lg font-bold text-slate-900 sm:text-2xl">{user?.name ?? "ผู้ใช้งาน"}</h1>
          <p className="text-xs text-slate-400 sm:text-sm">{user?.role ?? ""}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-initial sm:gap-4">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:flex"
        >
          <Calendar size={16} className="text-slate-400" />
          {dateLabel}
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        {/* เวอร์ชันจอเล็ก: ไอคอนปฏิทินอย่างเดียว ไม่โชว์ข้อความวันที่ (กันล้นจอ) */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 md:hidden"
          aria-label={dateLabel}
        >
          <Calendar size={16} />
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 sm:h-10 sm:w-10"
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
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50 sm:gap-3 sm:px-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {user?.avatarInitial ?? "?"}
          </span>
          {/* ชื่อ/ตำแหน่ง ซ่อนบนจอเล็กมาก เหลือแค่ avatar กันล้นจอ */}
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-slate-800">{user?.name ?? "ผู้ใช้งาน"}</span>
            <span className="block text-xs text-slate-400">{user?.role ?? ""}</span>
          </span>
          <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
        </button>
      </div>
    </header>
  );
}