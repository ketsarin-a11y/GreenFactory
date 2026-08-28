"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Gauge,
  GitCompareArrows,
  Leaf,
<<<<<<< HEAD
  LogOut,
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
  Menu,
  LoaderCircle,
  MessageCircleMore,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;

type ManagerAlert = {
  id: string;
  alertCode: string;
  alertType: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: string;
  triggeredAt: string;
  machineName: string | null;
  departmentName: string | null;
  buildingName: string | null;
};

type AlertResponse = {
  alerts: ManagerAlert[];
  openCount: number;
};

const ANALYTICS_ITEMS = [
  {
    href: "/manager/overview",
    label: "Resource Analytics",
    description: "วิเคราะห์การใช้ทรัพยากร",
    icon: BarChart3,
  },
  {
    href: "/manager/overview/carbon",
    label: "Carbon",
    description: "ติดตาม Carbon footprint",
    icon: Leaf,
  },
  {
    href: "/manager/overview/oee",
    label: "Performance & KPI",
    description: "ติดตามเป้าหมายและประสิทธิภาพ",
    icon: Gauge,
  },
  {
    href: "/manager/overview/compare",
    label: "Compare",
    description: "เปรียบเทียบช่วงเวลาและหน่วยงาน",
    icon: GitCompareArrows,
  },
];

const OPERATIONS_ITEMS = [
  {
    href: "/manager/overview/equipment",
    label: "Machines",
    description: "สถานะและข้อมูลเครื่องจักร",
    icon: Wrench,
  },
];

export default function ManagerTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
<<<<<<< HEAD

  const [openMenu, setOpenMenu] = useState<
    "analytics" | "operations" | null
  >(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [alerts, setAlerts] = useState<ManagerAlert[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [acknowledgingAll, setAcknowledgingAll] =
    useState(false);

  const [criticalToast, setCriticalToast] =
    useState<ManagerAlert | null>(null);
=======
  const [openMenu, setOpenMenu] = useState<"analytics" | "operations" | null>(
    null,
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [alerts, setAlerts] = useState<ManagerAlert[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [acknowledgingAll, setAcknowledgingAll] = useState(false);
  const [criticalToast, setCriticalToast] = useState<ManagerAlert | null>(null);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

  const headerRef = useRef<HTMLElement | null>(null);
  const seenCriticalRef = useRef<string | null>(null);

  const loadAlerts = useCallback(async (showLoading = false) => {
<<<<<<< HEAD
    if (showLoading) {
      setAlertsLoading(true);
    }

    try {
      const response = await fetch(
        "/api/manager/notifications",
        {
          cache: "no-store",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Notification request failed: ${response.status}`,
        );
=======
    if (showLoading) setAlertsLoading(true);

    try {
      const response = await fetch("/api/manager/notifications", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Notification request failed: ${response.status}`);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      }

      const data = (await response.json()) as AlertResponse;

      setAlerts(data.alerts ?? []);
      setOpenCount(data.openCount ?? 0);

      const latestCritical = (data.alerts ?? []).find(
        (item) =>
          item.status === "OPEN" &&
<<<<<<< HEAD
          (item.severity === "CRITICAL" ||
            item.severity === "HIGH"),
=======
          (item.severity === "CRITICAL" || item.severity === "HIGH"),
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      );

      if (
        latestCritical &&
        latestCritical.id !== seenCriticalRef.current
      ) {
        seenCriticalRef.current = latestCritical.id;
<<<<<<< HEAD

        setCriticalToast(latestCritical);
      }
    } catch (error) {
      console.error(
        "Manager notification error:",
        error,
      );
    } finally {
      if (showLoading) {
        setAlertsLoading(false);
      }
=======
        setCriticalToast(latestCritical);
      }
    } catch (error) {
      console.error("Manager notification error:", error);
    } finally {
      if (showLoading) setAlertsLoading(false);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
    }
  }, []);

  useEffect(() => {
    void loadAlerts(true);

    const timer = window.setInterval(() => {
      void loadAlerts(false);
    }, 5_000);

<<<<<<< HEAD
    return () => {
      window.clearInterval(timer);
    };
=======
    return () => window.clearInterval(timer);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
  }, [loadAlerts]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
        setNotificationsOpen(false);
<<<<<<< HEAD
        setProfileOpen(false);
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      }
    };

    document.addEventListener("mousedown", close);
<<<<<<< HEAD

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  useEffect(() => {
    if (!criticalToast) {
      return;
    }
=======
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!criticalToast) return;
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

    const timer = window.setTimeout(() => {
      setCriticalToast(null);
    }, 8000);

<<<<<<< HEAD
    return () => {
      window.clearTimeout(timer);
    };
=======
    return () => window.clearTimeout(timer);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
  }, [criticalToast]);

  async function acknowledgeAlert(alertId: string) {
    try {
<<<<<<< HEAD
      const response = await fetch(
        "/api/manager/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            alertId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Acknowledge failed: ${response.status}`,
        );
=======
      const response = await fetch("/api/manager/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) {
        throw new Error(`Acknowledge failed: ${response.status}`);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId
<<<<<<< HEAD
            ? {
                ...alert,
                status: "ACKNOWLEDGED",
              }
            : alert,
        ),
      );

      setOpenCount((count) =>
        Math.max(0, count - 1),
      );
=======
            ? { ...alert, status: "ACKNOWLEDGED" }
            : alert,
        ),
      );
      setOpenCount((count) => Math.max(0, count - 1));
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

      if (criticalToast?.id === alertId) {
        setCriticalToast(null);
      }
    } catch (error) {
<<<<<<< HEAD
      console.error(
        "Acknowledge alert error:",
        error,
      );
=======
      console.error("Acknowledge alert error:", error);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
    }
  }

  async function acknowledgeAll() {
<<<<<<< HEAD
    if (
      openCount === 0 ||
      acknowledgingAll
    ) {
      return;
    }
=======
    if (openCount === 0 || acknowledgingAll) return;
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

    try {
      setAcknowledgingAll(true);

<<<<<<< HEAD
      const response = await fetch(
        "/api/manager/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            acknowledgeAll: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Acknowledge all failed: ${response.status}`,
        );
=======
      const response = await fetch("/api/manager/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ acknowledgeAll: true }),
      });

      if (!response.ok) {
        throw new Error(`Acknowledge all failed: ${response.status}`);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.status === "OPEN"
<<<<<<< HEAD
            ? {
                ...alert,
                status: "ACKNOWLEDGED",
              }
            : alert,
        ),
      );

      setOpenCount(0);
      setCriticalToast(null);
    } catch (error) {
      console.error(
        "Acknowledge all alerts error:",
        error,
      );
=======
            ? { ...alert, status: "ACKNOWLEDGED" }
            : alert,
        ),
      );
      setOpenCount(0);
      setCriticalToast(null);
    } catch (error) {
      console.error("Acknowledge all alerts error:", error);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
    } finally {
      setAcknowledgingAll(false);
    }
  }

<<<<<<< HEAD
  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      setProfileOpen(false);
      setMobileOpen(false);
      setOpenMenu(null);
      setNotificationsOpen(false);

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

      setIsLoggingOut(false);

      window.alert(
        "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง",
      );
    }
  }

  const isActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
=======
  const isActive = (href: string) => {
    if (href === "/manager") return pathname === "/manager";
    return pathname === href || pathname.startsWith(`${href}/`);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-5 px-5 sm:px-8 lg:px-10">
<<<<<<< HEAD
          {/* Logo */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          <Link
            href="/manager"
            className="shrink-0"
            aria-label="GreenFactory Insight"
          >
            <img
              src="/images/LOGO.png"
              alt="GreenFactory Insight"
              className="block h-auto w-[176px] object-contain"
              draggable={false}
            />
          </Link>

          <div className="hidden h-7 w-px bg-slate-200 lg:block" />

<<<<<<< HEAD
          {/* Desktop navigation */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
            <TopLink
              href="/manager"
              active={pathname === "/manager"}
              label="Dashboard"
            />

            <DropdownButton
              label="Analytics"
              open={openMenu === "analytics"}
<<<<<<< HEAD
              active={
                pathname.startsWith(
                  "/manager/overview",
                ) &&
                !pathname.startsWith(
                  "/manager/overview/equipment",
                )
              }
              onClick={() => {
                setOpenMenu(
                  openMenu === "analytics"
                    ? null
                    : "analytics",
                );

                setNotificationsOpen(false);
                setProfileOpen(false);
=======
              active={pathname.startsWith("/manager/overview") &&
                !pathname.startsWith("/manager/overview/equipment")}
              onClick={() => {
                setOpenMenu(openMenu === "analytics" ? null : "analytics");
                setNotificationsOpen(false);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              }}
            />

            <DropdownButton
              label="Operations"
              open={openMenu === "operations"}
<<<<<<< HEAD
              active={pathname.startsWith(
                "/manager/overview/equipment",
              )}
              onClick={() => {
                setOpenMenu(
                  openMenu === "operations"
                    ? null
                    : "operations",
                );

                setNotificationsOpen(false);
                setProfileOpen(false);
=======
              active={pathname.startsWith("/manager/overview/equipment")}
              onClick={() => {
                setOpenMenu(openMenu === "operations" ? null : "operations");
                setNotificationsOpen(false);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              }}
            />

            <TopLink
              href="/manager/reports"
<<<<<<< HEAD
              active={isActive(
                "/manager/reports",
              )}
=======
              active={isActive("/manager/reports")}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              label="Reports"
            />
          </nav>

<<<<<<< HEAD
          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Notifications */}
=======
          <div className="ml-auto flex items-center gap-2">
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            <div className="relative">
              <button
                type="button"
                onClick={() => {
<<<<<<< HEAD
                  setNotificationsOpen(
                    (value) => !value,
                  );

                  setOpenMenu(null);
                  setProfileOpen(false);
=======
                  setNotificationsOpen((value) => !value);
                  setOpenMenu(null);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

                  if (!notificationsOpen) {
                    void loadAlerts(true);
                  }
                }}
                className={[
                  "relative flex h-10 w-10 items-center justify-center rounded-full border transition",
                  notificationsOpen
                    ? "border-slate-300 bg-slate-100 text-slate-950"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                ].join(" ")}
                aria-label="การแจ้งเตือน"
<<<<<<< HEAD
                aria-expanded={
                  notificationsOpen
                }
=======
                aria-expanded={notificationsOpen}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              >
                <Bell className="h-[18px] w-[18px]" />

                {openCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
<<<<<<< HEAD
                    {openCount > 99
                      ? "99+"
                      : openCount}
=======
                    {openCount > 99 ? "99+" : openCount}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPopover
                  alerts={alerts}
                  openCount={openCount}
                  loading={alertsLoading}
<<<<<<< HEAD
                  acknowledgingAll={
                    acknowledgingAll
                  }
                  onAcknowledge={
                    acknowledgeAlert
                  }
                  onAcknowledgeAll={
                    acknowledgeAll
                  }
=======
                  acknowledgingAll={acknowledgingAll}
                  onAcknowledge={acknowledgeAlert}
                  onAcknowledgeAll={acknowledgeAll}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                />
              )}
            </div>

<<<<<<< HEAD
            {/* Manager profile */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    (value) => !value,
                  );

                  setNotificationsOpen(false);
                  setOpenMenu(null);
                }}
                className={[
                  "flex h-10 items-center gap-2.5 rounded-full border bg-white px-2.5 pr-3 transition",
                  profileOpen
                    ? "border-slate-300 bg-slate-50"
                    : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
                aria-label="เมนูผู้ใช้งาน"
                aria-expanded={profileOpen}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf7f1] text-[#0f5b3d]">
                  <User className="h-4 w-4" />
                </span>

                <span className="max-w-[135px] truncate text-xs font-semibold text-slate-700">
                  {user?.name ?? "Manager"}
                </span>

                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 text-slate-400 transition-transform",
                    profileOpen
                      ? "rotate-180"
                      : "",
                  ].join(" ")}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
                  {/* User info */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
                        <User className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {user?.name ??
                            "Manager"}
                        </p>

                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                          Manager
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/manager/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <User className="h-4 w-4" />
                      </span>

                      โปรไฟล์ของฉัน
                    </Link>

                    <div className="my-1 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                        {isLoggingOut ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                      </span>

                      {isLoggingOut
                        ? "กำลังออกจากระบบ..."
                        : "ออกจากระบบ"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
=======
            <Link
              href="/manager/profile"
              className="hidden h-10 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-2.5 pr-3 transition hover:bg-slate-50 sm:flex"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf7f1] text-[#0f5b3d]">
                <User className="h-4 w-4" />
              </span>

              <span className="max-w-[135px] truncate text-xs font-semibold text-slate-700">
                {user?.name ?? "Manager"}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Desktop dropdown navigation */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
        {openMenu && (
          <div className="absolute left-0 right-0 top-[76px] border-b border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="mx-auto max-w-[1600px] px-10 py-5">
              {openMenu === "analytics" && (
                <MenuGrid
                  title="Analytics"
                  subtitle="เจาะลึกแนวโน้ม ประสิทธิภาพ และ Carbon"
                  items={ANALYTICS_ITEMS}
<<<<<<< HEAD
                  onNavigate={() =>
                    setOpenMenu(null)
                  }
                />
              )}

              {openMenu ===
                "operations" && (
=======
                  onNavigate={() => setOpenMenu(null)}
                />
              )}

              {openMenu === "operations" && (
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                <MenuGrid
                  title="Operations"
                  subtitle="ติดตามเครื่องจักรและข้อมูลการดำเนินงาน"
                  items={OPERATIONS_ITEMS}
<<<<<<< HEAD
                  onNavigate={() =>
                    setOpenMenu(null)
                  }
=======
                  onNavigate={() => setOpenMenu(null)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                />
              )}
            </div>
          </div>
        )}
      </header>

<<<<<<< HEAD
      {/* Critical alert toast */}
      {criticalToast && (
        <CriticalAlertToast
          alert={criticalToast}
          onClose={() =>
            setCriticalToast(null)
          }
          onAcknowledge={() =>
            acknowledgeAlert(
              criticalToast.id,
            )
          }
        />
      )}

      {/* Mobile drawer */}
=======
      {criticalToast && (
        <CriticalAlertToast
          alert={criticalToast}
          onClose={() => setCriticalToast(null)}
          onAcknowledge={() => acknowledgeAlert(criticalToast.id)}
        />
      )}

>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-slate-950/35"
<<<<<<< HEAD
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <div className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col bg-white shadow-2xl">
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-5">
=======
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-white shadow-2xl">
            <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-5">
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              <img
                src="/images/LOGO.png"
                alt="GreenFactory Insight"
                className="w-[168px]"
              />
<<<<<<< HEAD

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
                onClick={() =>
                  setMobileOpen(false)
                }
=======
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                aria-label="ปิดเมนู"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

<<<<<<< HEAD
            {/* Mobile user */}
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3.5 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
                  <User className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user?.name ??
                      "Manager"}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Manager
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <MobileLink
                  href="/manager"
                  label="Dashboard"
                />

                <MobileLink
                  href="/manager/overview"
                  label="Analytics"
                />

                <MobileLink
                  href="/manager/overview/equipment"
                  label="Operations"
                />

                <MobileLink
                  href="/manager/reports"
                  label="Reports"
                />

                <MobileLink
                  href="/manager/profile"
                  label="Profile"
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-rose-50 px-3.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}

                {isLoggingOut
                  ? "กำลังออกจากระบบ..."
                  : "ออกจากระบบ"}
              </button>
=======
            <div className="space-y-1 p-4">
              <MobileLink href="/manager" label="Dashboard" />
              <MobileLink href="/manager/overview" label="Analytics" />
              <MobileLink
                href="/manager/overview/equipment"
                label="Operations"
              />
              <MobileLink href="/manager/reports" label="Reports" />
              <MobileLink href="/manager/profile" label="Profile" />
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            </div>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Assistant button */}
      {!assistantOpen && (
        <button
          type="button"
          onClick={() =>
            setAssistantOpen(true)
          }
=======
      {!assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f5b3d] text-white shadow-[0_14px_32px_rgba(15,91,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b4b32]"
          aria-label="เปิด GreenFactory Assistant"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
      )}

      {assistantOpen && (
<<<<<<< HEAD
        <AssistantPanel
          onClose={() =>
            setAssistantOpen(false)
          }
        />
=======
        <AssistantPanel onClose={() => setAssistantOpen(false)} />
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      )}
    </>
  );
}

function NotificationPopover({
  alerts,
  openCount,
  loading,
  acknowledgingAll,
  onAcknowledge,
  onAcknowledgeAll,
}: {
  alerts: ManagerAlert[];
  openCount: number;
  loading: boolean;
  acknowledgingAll: boolean;
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-[90] w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
        <div>
          <p className="text-sm font-extrabold text-slate-950">
            การแจ้งเตือน
          </p>
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          <p className="mt-1 text-[11px] text-slate-400">
            {openCount > 0
              ? `${openCount} รายการที่ยังไม่ได้รับทราบ`
              : "ไม่มีรายการใหม่"}
          </p>
        </div>

        {openCount > 0 && (
          <button
            type="button"
            onClick={onAcknowledgeAll}
            disabled={acknowledgingAll}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            รับทราบทั้งหมด
          </button>
        )}
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((item) => (
<<<<<<< HEAD
              <div
                key={item}
                className="animate-pulse"
              >
                <div className="h-3 w-28 rounded bg-slate-100" />

                <div className="mt-2 h-3 w-full rounded bg-slate-100" />

=======
              <div key={item} className="animate-pulse">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-full rounded bg-slate-100" />
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                <div className="mt-2 h-2.5 w-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-5 w-5" />
            </span>
<<<<<<< HEAD

            <p className="mt-3 text-sm font-bold text-slate-800">
              ทุกอย่างเรียบร้อย
            </p>

            <p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-400">
              ยังไม่มี Alert
              ที่ต้องตรวจสอบในขณะนี้
=======
            <p className="mt-3 text-sm font-bold text-slate-800">
              ทุกอย่างเรียบร้อย
            </p>
            <p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-400">
              ยังไม่มี Alert ที่ต้องตรวจสอบในขณะนี้
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
<<<<<<< HEAD
                onAcknowledge={() =>
                  onAcknowledge(alert.id)
                }
=======
                onAcknowledge={() => onAcknowledge(alert.id)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  onAcknowledge,
}: {
  alert: ManagerAlert;
  onAcknowledge: () => void;
}) {
<<<<<<< HEAD
  const isOpen =
    alert.status === "OPEN";

  const severity = severityMeta(
    alert.severity,
  );
=======
  const isOpen = alert.status === "OPEN";
  const severity = severityMeta(alert.severity);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

  return (
    <div
      className={[
        "group flex gap-3 px-4 py-3.5 transition hover:bg-slate-50",
<<<<<<< HEAD
        isOpen
          ? "bg-white"
          : "bg-slate-50/50",
=======
        isOpen ? "bg-white" : "bg-slate-50/50",
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      ].join(" ")}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severity.iconClass}`}
      >
        <severity.icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-800">
            {alert.title}
          </p>

          {isOpen && (
<<<<<<< HEAD
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severity.dot}`}
            />
=======
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severity.dot}`} />
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
          {alert.message}
        </p>

        {(alert.machineName ||
          alert.departmentName ||
          alert.buildingName) && (
          <p className="mt-1.5 truncate text-[10px] text-slate-400">
<<<<<<< HEAD
            {[
              alert.machineName,
              alert.departmentName,
              alert.buildingName,
            ]
=======
            {[alert.machineName, alert.departmentName, alert.buildingName]
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              .filter(Boolean)
              .join(" • ")}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400">
<<<<<<< HEAD
            {formatAlertTime(
              alert.triggeredAt,
            )}
=======
            {formatAlertTime(alert.triggeredAt)}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          </span>

          {isOpen ? (
            <button
              type="button"
              onClick={onAcknowledge}
              className="rounded-md px-2 py-1 text-[10px] font-bold text-emerald-700 opacity-0 transition hover:bg-emerald-50 group-hover:opacity-100"
            >
              รับทราบ
            </button>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">
              รับทราบแล้ว
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CriticalAlertToast({
  alert,
  onClose,
  onAcknowledge,
}: {
  alert: ManagerAlert;
  onClose: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div className="fixed right-5 top-[92px] z-[100] w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.2)]">
      <div className="h-1 bg-rose-500" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-[18px] w-[18px]" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-rose-600">
              ต้องตรวจสอบ
            </p>
<<<<<<< HEAD

            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {alert.title}
            </p>

=======
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {alert.title}
            </p>
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {alert.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onAcknowledge}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Check className="h-3.5 w-3.5" />
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function severityMeta(
  severity: AlertSeverity,
) {
=======
function severityMeta(severity: AlertSeverity) {
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
  switch (severity) {
    case "CRITICAL":
      return {
        icon: AlertTriangle,
<<<<<<< HEAD
        iconClass:
          "bg-rose-50 text-rose-600",
        dot: "bg-rose-500",
      };

    case "HIGH":
      return {
        icon: CircleAlert,
        iconClass:
          "bg-orange-50 text-orange-600",
        dot: "bg-orange-500",
      };

    case "MEDIUM":
      return {
        icon: CircleAlert,
        iconClass:
          "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
      };

    default:
      return {
        icon: Bell,
        iconClass:
          "bg-sky-50 text-sky-600",
=======
        iconClass: "bg-rose-50 text-rose-600",
        dot: "bg-rose-500",
      };
    case "HIGH":
      return {
        icon: CircleAlert,
        iconClass: "bg-orange-50 text-orange-600",
        dot: "bg-orange-500",
      };
    case "MEDIUM":
      return {
        icon: CircleAlert,
        iconClass: "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
      };
    default:
      return {
        icon: Bell,
        iconClass: "bg-sky-50 text-sky-600",
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
        dot: "bg-sky-500",
      };
  }
}

function TopLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-lg px-3.5 py-2 text-sm font-medium transition",
        active
          ? "bg-slate-100 text-slate-950"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function DropdownButton({
  label,
  open,
  active,
  onClick,
}: {
  label: string;
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition",
        active || open
          ? "bg-slate-100 text-slate-950"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
      ].join(" ")}
    >
      {label}
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      <ChevronDown
        className={[
          "h-3.5 w-3.5 transition-transform",
          open ? "rotate-180" : "",
        ].join(" ")}
      />
    </button>
  );
}

function MenuGrid({
  title,
  subtitle,
  items,
  onNavigate,
}: {
  title: string;
  subtitle: string;
  items: typeof ANALYTICS_ITEMS;
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-8">
      <div>
<<<<<<< HEAD
        <p className="text-sm font-bold text-slate-950">
          {title}
        </p>

=======
        <p className="text-sm font-bold text-slate-950">{title}</p>
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </span>
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {item.label}
                </span>
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center rounded-xl px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

function AssistantPanel({
  onClose,
}: {
  onClose: () => void;
}) {
<<<<<<< HEAD
  const [messages, setMessages] =
    useState<AssistantMessage[]>([
      {
        role: "assistant",
        content:
          "ถามฉันเกี่ยวกับข้อมูลโรงงานได้เลย เช่น “ตอนนี้มีอะไรผิดปกติ?”, “สรุป Alert ล่าสุด” หรือ “ทรัพยากรไหนถูกบันทึกมากที่สุด?”",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const scrollRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top:
        scrollRef.current
          .scrollHeight,
=======
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      content:
        "ถามฉันเกี่ยวกับข้อมูลโรงงานได้เลย เช่น “ตอนนี้มีอะไรผิดปกติ?”, “สรุป Alert ล่าสุด” หรือ “ทรัพยากรไหนถูกบันทึกมากที่สุด?”",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      behavior: "smooth",
    });
  }, [messages, sending]);

<<<<<<< HEAD
  async function sendMessage(
    messageOverride?: string,
  ) {
    const message = (
      messageOverride ?? input
    ).trim();

    if (!message || sending) {
      return;
    }

    const userMessage: AssistantMessage =
      {
        role: "user",
        content: message,
      };

    const nextHistory = [
      ...messages,
      userMessage,
    ];
=======
  async function sendMessage(messageOverride?: string) {
    const message = (messageOverride ?? input).trim();

    if (!message || sending) return;

    const userMessage: AssistantMessage = {
      role: "user",
      content: message,
    };

    const nextHistory = [...messages, userMessage];
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
<<<<<<< HEAD
      const response = await fetch(
        "/api/manager/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
            message,
            history:
              nextHistory.slice(-8),
          }),
        },
      );
=======
      const response = await fetch("/api/manager/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message,
          history: nextHistory.slice(-8),
        }),
      });
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

      if (!response.ok) {
        throw new Error(
          `Assistant request failed: ${response.status}`,
        );
      }

<<<<<<< HEAD
      const data =
        (await response.json()) as {
          answer?: string;
        };
=======
      const data = (await response.json()) as {
        answer?: string;
      };
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          content:
            data.answer ??
            "ยังไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้",
        },
      ]);
    } catch (error) {
<<<<<<< HEAD
      console.error(
        "Manager assistant error:",
        error,
      );
=======
      console.error("Manager assistant error:", error);
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "เกิดข้อผิดพลาดระหว่างอ่านข้อมูลโรงงาน ลองถามใหม่อีกครั้งค่ะ",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const suggestions = [
    "ตอนนี้มีอะไรผิดปกติ?",
    "สรุป Alert ล่าสุด",
    "ทรัพยากรไหนถูกบันทึกมากสุด?",
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex h-[590px] w-[min(410px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
<<<<<<< HEAD
      {/* Assistant header */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
            <Sparkles className="h-4 w-4" />
          </span>
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                GreenFactory Assistant
              </p>
<<<<<<< HEAD

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                LIVE DATA
              </span>
            </div>

=======
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                LIVE DATA
              </span>
            </div>
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            <p className="text-[10px] text-slate-400">
              วิเคราะห์จากข้อมูลบริษัทของคุณ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          aria-label="ปิด Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

<<<<<<< HEAD
      {/* Messages */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
      >
<<<<<<< HEAD
        {messages.map(
          (message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={[
                "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
                message.role ===
                "assistant"
                  ? "rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm"
                  : "ml-auto rounded-tr-md bg-[#0f5b3d] text-white",
              ].join(" ")}
            >
              {message.content}
            </div>
          ),
        )}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map(
              (suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    void sendMessage(
                      suggestion,
                    )
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  {suggestion}
                </button>
              ),
            )}
=======
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={[
              "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
              message.role === "assistant"
                ? "rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm"
                : "ml-auto rounded-tr-md bg-[#0f5b3d] text-white",
            ].join(" ")}
          >
            {message.content}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void sendMessage(suggestion)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                {suggestion}
              </button>
            ))}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
          </div>
        )}

        {sending && (
          <div className="flex max-w-[88%] items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 shadow-sm">
            <LoaderCircle className="h-4 w-4 animate-spin" />
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            กำลังวิเคราะห์ข้อมูลโรงงาน...
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* Input */}
=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
      <div className="border-t border-slate-200 bg-white p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
<<<<<<< HEAD

=======
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            void sendMessage();
          }}
          className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-300 focus-within:bg-white"
        >
          <textarea
            value={input}
<<<<<<< HEAD
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

=======
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
                void sendMessage();
              }
            }}
            rows={1}
            placeholder="ถามเกี่ยวกับข้อมูลโรงงาน..."
            className="max-h-24 min-h-[28px] min-w-0 flex-1 resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
<<<<<<< HEAD
            disabled={
              !input.trim() ||
              sending
            }
=======
            disabled={!input.trim() || sending}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f5b3d] text-white transition hover:bg-[#0b4b32] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="ส่ง"
          >
            {sending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        <p className="mt-2 px-1 text-[9px] leading-4 text-slate-400">
<<<<<<< HEAD
          AI
          ใช้ข้อมูลในระบบเพื่อช่วยวิเคราะห์
          ควรตรวจสอบข้อมูลสำคัญก่อนตัดสินใจ
=======
          AI ใช้ข้อมูลในระบบเพื่อช่วยวิเคราะห์ ควรตรวจสอบข้อมูลสำคัญก่อนตัดสินใจ
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
        </p>
      </div>
    </div>
  );
}

<<<<<<< HEAD
function formatAlertTime(
  value: string,
) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "th-TH",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(date);
}
=======
function formatAlertTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
>>>>>>> 2ccdfd997d12adeeae61c744838a5d2bc3fb5e7f
