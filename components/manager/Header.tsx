"use client";

import { useState } from "react";
import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import {
  Bell,
  ChevronDown,
  Calendar,
  Menu,
  Building2,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
  notificationCount?: number;
}

function defaultDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function Header({
  onMenuClick,
  notificationCount = 12,
}: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dateFrom =
    searchParams.get("from") ?? defaultDate(6);
  const dateTo =
    searchParams.get("to") ?? defaultDate(0);

  function updateRange(
    nextFrom: string,
    nextTo: string,
  ) {
    const params = new URLSearchParams({
      from: nextFrom,
      to: nextTo,
    });

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setProfileOpen(false);

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Logout failed: ${response.status}`,
        );
      }

      window.location.replace("/login");
    } catch (error) {
      console.error(
        "Manager logout error:",
        error,
      );

      window.alert(
        "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง",
      );

      setIsLoggingOut(false);
    }
  }

  const showDateRange = [
    "/manager/overview",
    "/manager/overview/energy",
    "/manager/overview/water",
    "/manager/overview/carbon",
    "/manager/overview/buildings",
    "/manager/overview/departments",
  ].includes(pathname);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-6">
      <div className="flex items-center gap-3">
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
            สวัสดีตอนเช้า คุณ
            {user?.name ?? ""}
            <span aria-hidden>👋</span>
          </p>

          <p className="text-xs text-slate-400 sm:text-sm">
            ยินดีต้อนรับเข้าสู่ระบบ GreenFactory Insight
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          title="ระบบยังไม่รองรับหลายโรงงานต่อบริษัท — โชว์ชื่อบริษัทแทน"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 md:flex"
        >
          <Building2
            size={15}
            className="text-slate-400"
          />
          ทั้งหมด 5 โรงงาน
          <ChevronDown
            size={14}
            className="text-slate-400"
          />
        </button>

        {showDateRange && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:px-3">
            <Calendar
              size={14}
              className="hidden text-slate-400 sm:block"
            />

            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) =>
                updateRange(
                  e.target.value,
                  dateTo,
                )
              }
              className="w-[110px] bg-transparent text-xs text-slate-600 outline-none sm:text-sm"
            />

            <span className="text-slate-300">
              –
            </span>

            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) =>
                updateRange(
                  dateFrom,
                  e.target.value,
                )
              }
              className="w-[110px] bg-transparent text-xs text-slate-600 outline-none sm:text-sm"
            />
          </div>
        )}

        <button
          type="button"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 sm:h-10 sm:w-10"
          aria-label="การแจ้งเตือน"
        >
          <Bell
            size={18}
            className="text-slate-500"
          />

          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (current) => !current,
              )
            }
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50 sm:px-3"
            aria-expanded={profileOpen}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {user?.avatarInitial ?? "?"}
            </span>

            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-slate-800">
                {user?.name ?? "ผู้ใช้งาน"}
              </span>

              <span className="block text-xs text-slate-400">
                {user?.role ?? ""}
              </span>
            </span>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform sm:block ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="ปิดเมนูโปรไฟล์"
                onClick={() =>
                  setProfileOpen(false)
                }
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[250px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                <div className="border-b border-slate-100 px-4 py-3.5">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name ?? "ผู้ใช้งาน"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.role ?? "Manager"}
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <LoaderCircle className="h-[17px] w-[17px] animate-spin" />
                    ) : (
                      <LogOut className="h-[17px] w-[17px]" />
                    )}

                    {isLoggingOut
                      ? "กำลังออกจากระบบ..."
                      : "ออกจากระบบ"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}