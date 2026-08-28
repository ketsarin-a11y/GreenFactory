"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LogOut,
  Menu,
  MoonStar,
  Sparkles,
  SunMedium,
  Sunset,
} from "lucide-react";

interface HeaderUser {
  firstName: string;
  lastName: string;
  email: string;
  profileImagePath?: string | null;
}

interface HeaderProps {
  user: HeaderUser;
  dateLabel?: string;
  notificationCount?: number;
  onMenuClick: () => void;
}

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) {
    return {
      label: "สวัสดีตอนเช้า",
      message: "เริ่มต้นวันทำงานด้วยการตรวจสอบข้อมูลและบันทึกอย่างถูกต้อง",
      badgeBg:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: Sparkles,
    };
  }

  if (hour >= 12 && hour < 17) {
    return {
      label: "สวัสดีตอนบ่าย",
      message: "ติดตามและบันทึกข้อมูลการปฏิบัติงานให้ครบถ้วน",
      badgeBg:
        "border-orange-200 bg-orange-50 text-orange-700",
      icon: SunMedium,
    };
  }

  if (hour >= 17 && hour < 20) {
    return {
      label: "สวัสดีตอนเย็น",
      message: "ตรวจสอบข้อมูลก่อนสิ้นสุดการทำงานวันนี้",
      badgeBg:
        "border-indigo-200 bg-indigo-50 text-indigo-700",
      icon: Sunset,
    };
  }

  return {
    label: "สวัสดีรอบดึก",
    message: "ปฏิบัติงานด้วยความระมัดระวังและบันทึกข้อมูลให้ครบถ้วน",
    badgeBg:
      "border-violet-200 bg-violet-50 text-violet-700",
    icon: MoonStar,
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

  const [headerUser, setHeaderUser] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImagePath: user.profileImagePath ?? "",
  });

  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => {
    const firstName = headerUser.firstName || "";
    const lastName = headerUser.lastName || "";
    return (firstName + " " + lastName).trim() || "Operator";
  }, [headerUser.firstName, headerUser.lastName]);

  const initial = useMemo(() => {
    return (
      headerUser.firstName?.trim().charAt(0).toUpperCase() ||
      headerUser.email?.trim().charAt(0).toUpperCase() ||
      "O"
    );
  }, [headerUser.firstName, headerUser.email]);

  const avatarUrl = headerUser.profileImagePath;

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
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
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", closeWithEscape);
    return () => document.removeEventListener("keydown", closeWithEscape);
  }, []);

  useEffect(() => {
    setHeaderUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImagePath: user.profileImagePath ?? "",
    });
  }, [
    user.firstName,
    user.lastName,
    user.email,
    user.profileImagePath,
  ]);

  useEffect(() => {
    let active = true;

    async function loadLatestProfile() {
      try {
        const response = await fetch("/api/Profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const responseText = await response.text();

        let payload: {
          success?: boolean;
          profile?: {
            firstName?: string;
            lastName?: string;
            email?: string;
            avatarUrl?: string | null;
          };
        } = {};

        try {
          payload = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          return;
        }

        if (
          !active ||
          !payload.success ||
          !payload.profile
        ) {
          return;
        }

        setHeaderUser((current) => ({
          firstName:
            payload.profile?.firstName ??
            current.firstName,
          lastName:
            payload.profile?.lastName ??
            current.lastName,
          email:
            payload.profile?.email ??
            current.email,
          profileImagePath:
            payload.profile?.avatarUrl ??
            current.profileImagePath,
        }));
      } catch (error) {
        console.error(
          "Load latest header profile error:",
          error,
        );
      }
    }

    void loadLatestProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleProfileUpdated(event: Event) {
      const customEvent =
        event as CustomEvent<{
          firstName?: string;
          lastName?: string;
          avatarUrl?: string;
        }>;

      setHeaderUser((current) => ({
        ...current,
        firstName:
          customEvent.detail?.firstName ??
          current.firstName,
        lastName:
          customEvent.detail?.lastName ??
          current.lastName,
        profileImagePath:
          customEvent.detail?.avatarUrl ??
          current.profileImagePath,
      }));
    }

    window.addEventListener(
      "gfi-profile-updated",
      handleProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        "gfi-profile-updated",
        handleProfileUpdated,
      );
    };
  }, []);

  const thailandHour = useMemo(() => {
    if (!now) return 9;
    const value = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      hour12: false,
    }).format(now);
    return Number(value);
  }, [now]);

  const greeting = useMemo(() => getGreeting(thailandHour), [thailandHour]);
  const TimeIcon = greeting.icon;

  const thaiDate = useMemo(() => {
    if (!now) return "กำลังโหลดวันที่";
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }, [now]);

  const thailandTime = useMemo(() => {
    if (!now) return "--:--:--";
    return new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      setProfileOpen(false);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed: " + response.status);
      }

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      window.alert("ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[118px] items-center justify-between gap-6 px-5 sm:px-7 lg:px-9">

        {/* LEFT: เน€เธกเธเธน (เธกเธทเธญเธ–เธทเธญ) + เธเธณเธ—เธฑเธเธ—เธฒเธขเนเธฅเธฐเนเธญเธเธญเธเธเธฃเธตเน€เธกเธตเธขเธกเธ•เธฒเธกเน€เธงเธฅเธฒ */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="เปิดเมนู"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 md:hidden"
          >
            <Menu size={19} strokeWidth={2} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold ${greeting.badgeBg}`}>
                <TimeIcon size={14} className="stroke-[2.2]" />
                {greeting.label}
              </span>
            </div>

            <div className="mt-2 flex min-w-0 items-center gap-3">
              <h1 className="truncate text-[26px] font-black leading-none tracking-[-0.03em] text-slate-950 sm:text-[30px] lg:text-[32px]">
                {displayName}
              </h1>

              <span className="hidden items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white sm:inline-flex">
                Operator
              </span>
            </div>

            <p className="mt-2 max-w-[720px] truncate text-sm font-medium text-slate-500">
              {dateLabel ?? greeting.message}
            </p>
          </div>
        </div>

        {/* RIGHT: เน€เธงเธฅเธฒ, เนเธเนเธเน€เธ•เธทเธญเธ เนเธฅเธฐเนเธเธฃเนเธเธฅเน */}
        <div className="flex shrink-0 items-center gap-3.5">

          {/* DATE + TIME (Desktop) */}
          <div className="hidden items-center gap-3.5 border-l border-slate-200 pl-6 lg:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/25">
              <CalendarDays size={18} strokeWidth={2} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">
                {thaiDate}
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <time className="tabular-nums text-base font-black tracking-wide text-slate-950">
                  {thailandTime}
                </time>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-md">
                  ICT
                </span>
              </div>
            </div>
          </div>

          {/* NOTIFICATION */}
          <button
            type="button"
            aria-label={`การแจ้งเตือน ${notificationCount} รายการ`}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <Bell size={18} strokeWidth={2} />

            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-1 text-[10px] font-extrabold text-white shadow-xs shadow-rose-500/30 animate-pulse">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {/* PROFILE */}
          <div ref={profileRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className={[
                "flex h-12 items-center gap-3 rounded-2xl border px-3 transition-all",
                profileOpen
                  ? "border-violet-300 bg-violet-50/50"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
              ].join(" ")}
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-xs font-bold text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>

              <span className="hidden max-w-[185px] text-left lg:block">
                <span className="block truncate text-sm font-extrabold text-slate-900">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate text-[11px] font-bold text-violet-600">
                  Operator
                </span>
              </span>

              <ChevronDown
                size={14}
                className={[
                  "hidden text-slate-400 transition-transform duration-200 xl:block",
                  profileOpen ? "rotate-180 text-violet-600" : "",
                ].join(" ")}
              />
            </button>

            {/* DROPDOWN */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-br from-violet-50/60 to-pink-50/60 rounded-xl border border-violet-100/50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-sm font-bold text-white shadow-sm">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-slate-900">
                      {displayName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 font-medium">
                      {headerUser.email}
                    </p>
                  </div>
                </div>

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <LogOut size={16} strokeWidth={2.2} />
                  <span>
                    {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
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
            aria-label="ออกจากระบบ"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:hidden"
          >
            <LogOut size={17} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* MOBILE DATE + TIME */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-1.5 sm:hidden">
        <p className="min-w-0 truncate text-[10px] font-medium text-slate-500">
          {thaiDate}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <time className="tabular-nums text-xs font-bold text-slate-900">
            {thailandTime}
          </time>
        </div>
      </div>
    </header>
  );
}