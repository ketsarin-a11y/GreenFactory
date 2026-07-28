"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";

interface HeaderUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface HeaderProps {
  user: HeaderUser;
  dateLabel?: string;
  notificationCount?: number;
  onMenuClick: () => void;
}

function getGreeting(hour: number) {
  if (hour < 12) {
    return {
      label: "สวัสดีตอนเช้า",
      message: "พร้อมเริ่มต้นการทำงานในวันนี้",
    };
  }

  if (hour < 18) {
    return {
      label: "สวัสดีตอนบ่าย",
      message: "ติดตามและบันทึกข้อมูลการปฏิบัติงาน",
    };
  }

  return {
    label: "สวัสดีตอนเย็น",
    message: "ตรวจสอบข้อมูลก่อนสิ้นสุดการทำงานวันนี้",
  };
}

export default function Header({
  user,
  dateLabel,
  notificationCount = 3,
  onMenuClick,
}: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = (firstName + " " + lastName).trim();

    return fullName || "Operator";
  }, [user.firstName, user.lastName]);

  const initial = useMemo(() => {
    return (
      user.firstName?.trim().charAt(0).toUpperCase() ||
      user.email?.trim().charAt(0).toUpperCase() ||
      "O"
    );
  }, [user.firstName, user.email]);

  useEffect(() => {
    const updateClock = () => {
      setNow(new Date());
    };

    updateClock();

    const timer = window.setInterval(updateClock, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const closeProfile = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfile);

    return () => {
      document.removeEventListener("mousedown", closeProfile);
    };
  }, []);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  const thailandHour = useMemo(() => {
    if (!now) {
      return 9;
    }

    const value = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      hour12: false,
    }).format(now);

    return Number(value);
  }, [now]);

  const greeting = useMemo(() => {
    return getGreeting(thailandHour);
  }, [thailandHour]);

  const thaiDate = useMemo(() => {
    if (!now) {
      return "กำลังโหลดวันที่";
    }

    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }, [now]);

  const thailandTime = useMemo(() => {
    if (!now) {
      return "--:--:--";
    }

    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setProfileOpen(false);

      const response = await fetch("/api/auth/reset-session", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed: " + response.status);
      }

      window.location.replace("/");
    } catch (error) {
      console.error("Logout error:", error);

      window.alert(
        "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง",
      );

      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[104px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:hidden"
            aria-label="เปิดเมนู"
          >
            <Menu size={19} strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {greeting.label}
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                {displayName}
              </h1>

              <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 sm:inline">
                Operator
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
              {dateLabel ?? greeting.message}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* DATE + TIME */}
          <div className="hidden items-center gap-3 border-r border-slate-200 pr-4 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarDays size={17} strokeWidth={2} />
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500">
                {thaiDate}
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <time className="tabular-nums text-base font-semibold tracking-wide text-slate-950">
                  {thailandTime}
                </time>

                <span className="text-[10px] font-medium text-slate-400">
                  เวลาไทย
                </span>
              </div>
            </div>
          </div>

          {/* TABLET TIME */}
          <div className="hidden rounded-lg px-2 text-right sm:block lg:hidden">
            <time className="block tabular-nums text-sm font-semibold text-slate-900">
              {thailandTime}
            </time>

            <span className="text-[10px] text-slate-400">
              เวลาไทย
            </span>
          </div>

          {/* NOTIFICATION */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label={
              "การแจ้งเตือน " +
              notificationCount +
              " รายการ"
            }
          >
            <Bell size={18} strokeWidth={2} />

            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-bold leading-none text-white">
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <div
            ref={profileRef}
            className="relative hidden sm:block"
          >
            <button
              type="button"
              onClick={() => {
                setProfileOpen((value) => !value);
              }}
              className={
                "flex h-10 items-center gap-2.5 rounded-xl border px-2.5 transition " +
                (profileOpen
                  ? "border-slate-300 bg-slate-50"
                  : "border-slate-200 bg-white hover:bg-slate-50")
              }
              aria-label="เปิดเมนูผู้ใช้งาน"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-xs font-semibold text-violet-700">
                {initial}
              </span>

              <span className="hidden max-w-[145px] text-left xl:block">
                <span className="block truncate text-xs font-semibold text-slate-900">
                  {displayName}
                </span>

                <span className="block truncate text-[10px] text-slate-400">
                  Operator
                </span>
              </span>

              <ChevronDown
                size={14}
                className={
                  "hidden text-slate-400 transition-transform xl:block " +
                  (profileOpen ? "rotate-180" : "")
                }
              />
            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_-16px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-center gap-3 px-2 py-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-semibold text-violet-700">
                    {initial}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={17} strokeWidth={2} />

                  <span>
                    {isLoggingOut
                      ? "กำลังออกจากระบบ..."
                      : "ออกจากระบบ"}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 sm:hidden"
            aria-label="ออกจากระบบ"
          >
            <LogOut size={17} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* MOBILE DATE + TIME */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2 sm:hidden">
        <p className="min-w-0 truncate text-[10px] text-slate-500">
          {thaiDate}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          <time className="tabular-nums text-xs font-semibold text-slate-900">
            {thailandTime}
          </time>
        </div>
      </div>
    </header>
  );
}