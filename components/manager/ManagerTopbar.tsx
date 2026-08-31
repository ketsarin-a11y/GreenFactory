"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  Gauge,
  GitCompareArrows,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  MessageCircleMore,
  Send,
  Sparkles,
  User,
  Wrench,
  X,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

/* =========================================================
   TYPES
========================================================= */

type AlertSeverity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | string;

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

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MenuItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

/* =========================================================
   MENU DATA
========================================================= */

const ANALYTICS_ITEMS: MenuItem[] = [
  {
    href: "/manager/overview",
    label: "Resource Analytics",
    description: "วิเคราะห์การใช้ทรัพยากรภายในโรงงาน",
    icon: BarChart3,
  },
  {
    href: "/manager/overview/carbon",
    label: "Carbon",
    description: "ติดตามข้อมูลการปล่อยคาร์บอนของโรงงาน",
    icon: Leaf,
  },
  {
    href: "/manager/overview/oee",
    label: "Performance & KPI",
    description: "ติดตามประสิทธิภาพและตัวชี้วัดของโรงงาน",
    icon: Gauge,
  },
  {
    href: "/manager/overview/compare",
    label: "Compare",
    description: "เปรียบเทียบข้อมูลตามช่วงเวลาและหน่วยงาน",
    icon: GitCompareArrows,
  },
];

const OPERATIONS_ITEMS: MenuItem[] = [
  {
    href: "/manager/overview/equipment",
    label: "Machines",
    description: "ตรวจสอบสถานะและข้อมูลเครื่องจักร",
    icon: Wrench,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ManagerTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [openMenu, setOpenMenu] = useState<
    "analytics" | "operations" | null
  >(null);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

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

  const headerRef = useRef<HTMLElement | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);

  const seenCriticalRef = useRef<string | null>(null);

  /* =======================================================
     MANAGER NAME
  ======================================================= */

  const managerName =
    (user as { name?: string } | null)?.name?.trim() ||
    "Manager";

  /* =======================================================
     ALERTS
  ======================================================= */

  const loadAlerts = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setAlertsLoading(true);
      }

      try {
        const response = await fetch(
          "/api/manager/notifications",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Notification request failed: ${response.status}`,
          );
        }

        const data =
          (await response.json()) as AlertResponse;

        const nextAlerts = data.alerts ?? [];

        setAlerts(nextAlerts);
        setOpenCount(data.openCount ?? 0);

        const latestCritical = nextAlerts.find(
          (item) =>
            item.status === "OPEN" &&
            (item.severity === "CRITICAL" ||
              item.severity === "HIGH"),
        );

        if (
          latestCritical &&
          latestCritical.id !==
            seenCriticalRef.current
        ) {
          seenCriticalRef.current =
            latestCritical.id;

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
      }
    },
    [],
  );

  /* โหลด Alert ครั้งแรก + polling */

  useEffect(() => {
    void loadAlerts(true);

    const timer = window.setInterval(() => {
      void loadAlerts(false);
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadAlerts]);

  /* =======================================================
     CLICK OUTSIDE
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      const target = event.target as Node;

      if (
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setOpenMenu(null);
        setNotificationsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setOpenMenu(null);
      setNotificationsOpen(false);
      setProfileOpen(false);
      setMobileOpen(false);
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =======================================================
     CLOSE MENU WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setOpenMenu(null);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  /* =======================================================
     AUTO CLOSE CRITICAL TOAST
  ======================================================= */

  useEffect(() => {
    if (!criticalToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCriticalToast(null);
    }, 8000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [criticalToast]);

  /* =======================================================
     ACKNOWLEDGE ONE ALERT
  ======================================================= */

  async function acknowledgeAlert(
    alertId: string,
  ) {
    try {
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
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId
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

      if (criticalToast?.id === alertId) {
        setCriticalToast(null);
      }
    } catch (error) {
      console.error(
        "Acknowledge alert error:",
        error,
      );
    }
  }

  /* =======================================================
     ACKNOWLEDGE ALL
  ======================================================= */

  async function acknowledgeAll() {
    if (
      openCount === 0 ||
      acknowledgingAll
    ) {
      return;
    }

    try {
      setAcknowledgingAll(true);

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
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.status === "OPEN"
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
    } finally {
      setAcknowledgingAll(false);
    }
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Logout failed: ${response.status}`,
        );
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const analyticsActive =
    pathname.startsWith("/manager/overview") &&
    !pathname.startsWith(
      "/manager/overview/equipment",
    );

  const operationsActive =
    pathname.startsWith(
      "/manager/overview/equipment",
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex h-[76px] w-full max-w-[1600px] items-center gap-5 px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

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

          {/* DESKTOP MENU */}

          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
            <TopLink
              href="/manager"
              active={pathname === "/manager"}
              label="Dashboard"
            />

            <DropdownButton
              label="Analytics"
              open={openMenu === "analytics"}
              active={analyticsActive}
              onClick={() => {
                setOpenMenu((current) =>
                  current === "analytics"
                    ? null
                    : "analytics",
                );

                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
            />

            <DropdownButton
              label="Operations"
              open={openMenu === "operations"}
              active={operationsActive}
              onClick={() => {
                setOpenMenu((current) =>
                  current === "operations"
                    ? null
                    : "operations",
                );

                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
            />

            <TopLink
              href="/manager/reports"
              active={isActive(
                "/manager/reports",
              )}
              label="Reports"
            />
          </nav>

          {/* RIGHT ACTIONS */}

          <div className="ml-auto flex items-center gap-2">
            {/* ALERT */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const willOpen =
                    !notificationsOpen;

                  setNotificationsOpen(
                    willOpen,
                  );

                  setOpenMenu(null);
                  setProfileOpen(false);

                  if (willOpen) {
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
                aria-expanded={
                  notificationsOpen
                }
              >
                <Bell className="h-[18px] w-[18px]" />

                {openCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {openCount > 99
                      ? "99+"
                      : openCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPopover
                  alerts={alerts}
                  openCount={openCount}
                  loading={alertsLoading}
                  acknowledgingAll={
                    acknowledgingAll
                  }
                  onAcknowledge={
                    acknowledgeAlert
                  }
                  onAcknowledgeAll={
                    acknowledgeAll
                  }
                />
              )}
            </div>

            {/* PROFILE + LOGOUT */}

            <div
              ref={profileRef}
              className="relative hidden sm:block"
            >
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
                aria-expanded={profileOpen}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf7f1] text-[#0f5b3d]">
                  <User className="h-4 w-4" />
                </span>

                <span className="max-w-[135px] truncate text-xs font-semibold text-slate-700">
                  {managerName}
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
                <ProfileDropdown
                  managerName={managerName}
                  isLoggingOut={
                    isLoggingOut
                  }
                  onLogout={
                    handleLogout
                  }
                />
              )}
            </div>

            {/* MOBILE */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LARGE DROPDOWN */}

        {openMenu && (
          <div className="absolute left-0 right-0 top-[76px] border-b border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="mx-auto max-w-[1600px] px-10 py-5">
              {openMenu === "analytics" && (
                <MenuGrid
                  title="Analytics"
                  subtitle="วิเคราะห์แนวโน้ม การใช้ทรัพยากร ประสิทธิภาพ และคาร์บอน"
                  items={ANALYTICS_ITEMS}
                  onNavigate={() =>
                    setOpenMenu(null)
                  }
                />
              )}

              {openMenu ===
                "operations" && (
                <MenuGrid
                  title="Operations"
                  subtitle="ตรวจสอบเครื่องจักรและข้อมูลการดำเนินงานภายในโรงงาน"
                  items={OPERATIONS_ITEMS}
                  onNavigate={() =>
                    setOpenMenu(null)
                  }
                />
              )}
            </div>
          </div>
        )}
      </header>

      {/* CRITICAL ALERT */}

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

      {/* MOBILE MENU */}

      {mobileOpen && (
        <MobileMenu
          managerName={managerName}
          isLoggingOut={isLoggingOut}
          onClose={() =>
            setMobileOpen(false)
          }
          onLogout={handleLogout}
        />
      )}

      {/* ASSISTANT FLOATING BUTTON */}

      {!assistantOpen && (
        <button
          type="button"
          onClick={() =>
            setAssistantOpen(true)
          }
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f5b3d] text-white shadow-[0_14px_32px_rgba(15,91,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b4b32]"
          aria-label="เปิด GreenFactory Assistant"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
      )}

      {assistantOpen && (
        <AssistantPanel
          onClose={() =>
            setAssistantOpen(false)
          }
        />
      )}
    </>
  );
}

/* =========================================================
   PROFILE DROPDOWN
========================================================= */

function ProfileDropdown({
  managerName,
  isLoggingOut,
  onLogout,
}: {
  managerName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-[100] w-[230px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.16)]">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <p className="truncate text-sm font-bold text-slate-900">
          {managerName}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          Manager
        </p>
      </div>

      <div className="p-2">
        <Link
          href="/manager/profile"
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <User className="h-4 w-4 text-slate-400" />
          โปรไฟล์
        </Link>

        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
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
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION POPOVER
========================================================= */

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

          <p className="mt-1 text-[11px] text-slate-400">
            {openCount > 0
              ? `${openCount} รายการที่ยังไม่ได้รับทราบ`
              : "ไม่มีการแจ้งเตือนใหม่"}
          </p>
        </div>

        {openCount > 0 && (
          <button
            type="button"
            onClick={
              onAcknowledgeAll
            }
            disabled={
              acknowledgingAll
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {acknowledgingAll ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}

            รับทราบทั้งหมด
          </button>
        )}
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {loading ? (
          <NotificationSkeleton />
        ) : alerts.length === 0 ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-5 w-5" />
            </span>

            <p className="mt-3 text-sm font-bold text-slate-800">
              ทุกอย่างเรียบร้อย
            </p>

            <p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-400">
              ยังไม่มี Alert
              ที่ต้องตรวจสอบในขณะนี้
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onAcknowledge={() =>
                  onAcknowledge(
                    alert.id,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION LOADING
========================================================= */

function NotificationSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse"
        >
          <div className="h-3 w-28 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-2.5 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ALERT ROW
========================================================= */

function AlertRow({
  alert,
  onAcknowledge,
}: {
  alert: ManagerAlert;
  onAcknowledge: () => void;
}) {
  const isOpen =
    alert.status === "OPEN";

  const severity =
    severityMeta(alert.severity);

  const location = [
    alert.machineName,
    alert.departmentName,
    alert.buildingName,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      className={[
        "group flex gap-3 px-4 py-3.5 transition hover:bg-slate-50",
        isOpen
          ? "bg-white"
          : "bg-slate-50/50",
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
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severity.dot}`}
            />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
          {alert.message}
        </p>

        {location && (
          <p className="mt-1.5 truncate text-[10px] text-slate-400">
            {location}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400">
            {formatAlertTime(
              alert.triggeredAt,
            )}
          </span>

          {isOpen ? (
            <button
              type="button"
              onClick={
                onAcknowledge
              }
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

/* =========================================================
   CRITICAL ALERT TOAST
========================================================= */

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

            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {alert.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {alert.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={
              onAcknowledge
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Check className="h-3.5 w-3.5" />
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SEVERITY
========================================================= */

function severityMeta(
  severity: AlertSeverity,
) {
  switch (severity) {
    case "CRITICAL":
      return {
        icon: AlertTriangle,
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
        dot: "bg-sky-500",
      };
  }
}

/* =========================================================
   TOP LINK
========================================================= */

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

/* =========================================================
   DROPDOWN BUTTON
========================================================= */

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

      <ChevronDown
        className={[
          "h-3.5 w-3.5 transition-transform",
          open
            ? "rotate-180"
            : "",
        ].join(" ")}
      />
    </button>
  );
}

/* =========================================================
   DESKTOP MENU GRID
========================================================= */

function MenuGrid({
  title,
  subtitle,
  items,
  onNavigate,
}: {
  title: string;
  subtitle: string;
  items: MenuItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-8">
      <div>
        <p className="text-sm font-bold text-slate-950">
          {title}
        </p>

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
              onClick={
                onNavigate
              }
              className="flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </span>

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {item.label}
                </span>

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

/* =========================================================
   MOBILE MENU
========================================================= */

function MobileMenu({
  managerName,
  isLoggingOut,
  onClose,
  onLogout,
}: {
  managerName: string;
  isLoggingOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button
        type="button"
        aria-label="ปิดเมนู"
        className="absolute inset-0 bg-slate-950/35"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col bg-white shadow-2xl">
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <img
            src="/images/LOGO.png"
            alt="GreenFactory Insight"
            className="w-[168px]"
          />

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-slate-100"
            onClick={onClose}
            aria-label="ปิดเมนู"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
              <User className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {managerName}
              </p>

              <p className="text-xs text-slate-400">
                Manager
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-4">
          <MobileLink
            href="/manager"
            label="Dashboard"
            onClick={onClose}
          />

          <MobileLink
            href="/manager/overview"
            label="Resource Analytics"
            onClick={onClose}
          />

          <MobileLink
            href="/manager/overview/equipment"
            label="Operations"
            onClick={onClose}
          />

          <MobileLink
            href="/manager/reports"
            label="Reports"
            onClick={onClose}
          />

          <MobileLink
            href="/manager/profile"
            label="Profile"
            onClick={onClose}
          />
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={
              onLogout
            }
            disabled={
              isLoggingOut
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE LINK
========================================================= */

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-12 items-center rounded-xl px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}

/* =========================================================
   AI ASSISTANT
========================================================= */

function AssistantPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState<AssistantMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "สวัสดีค่ะ ฉันคือ GreenFactory Assistant สามารถช่วยสรุปข้อมูลโรงงาน วิเคราะห์ Alert และช่วยอธิบายข้อมูลทรัพยากรให้เข้าใจง่ายขึ้นได้ค่ะ",
      },
    ]);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    const question =
      input.trim();

    if (
      !question ||
      loading
    ) {
      return;
    }

    const userMessage: AssistantMessage =
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
      };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/manager/assistant",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: question,
            question,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Assistant request failed: ${response.status}`,
        );
      }

      const data =
        (await response.json()) as {
          answer?: string;
          message?: string;
          response?: string;
        };

      const answer =
        data.answer ||
        data.response ||
        data.message ||
        "ไม่พบคำตอบจากระบบ";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error(
        "Manager assistant error:",
        error,
      );

      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            "ไม่สามารถเชื่อมต่อ GreenFactory Assistant ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function useSuggestion(
    value: string,
  ) {
    setInput(value);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex h-[600px] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
            <Sparkles className="h-4 w-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              GreenFactory Assistant
            </p>

            <p className="text-[10px] text-slate-400">
              AI Factory Intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
          aria-label="ปิด Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
        <div className="space-y-3">
          {messages.map(
            (message) => (
              <div
                key={message.id}
                className={[
                  "flex",
                  message.role ===
                  "user"
                    ? "justify-end"
                    : "justify-start",
                ].join(" ")}
              >
                <div
                  className={[
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6",
                    message.role ===
                    "user"
                      ? "rounded-tr-md bg-[#0f5b3d] text-white"
                      : "rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm",
                  ].join(" ")}
                >
                  {message.content}
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 shadow-sm">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                กำลังวิเคราะห์ข้อมูล...
              </div>
            </div>
          )}

          <div
            ref={
              messagesEndRef
            }
          />
        </div>
      </div>

      {/* SUGGESTIONS */}

      <div className="border-t border-slate-100 bg-white px-3 pt-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "ตอนนี้มีอะไรผิดปกติ?",
            "สรุป Alert ล่าสุด",
            "ทรัพยากรไหนถูกบันทึกมากที่สุด?",
          ].map((question) => (
            <button
              key={question}
              type="button"
              onClick={() =>
                useSuggestion(
                  question,
                )
              }
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT */}

      <form
        onSubmit={sendMessage}
        className="bg-white p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-300 focus-within:bg-white">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            disabled={loading}
            placeholder="ถามเกี่ยวกับข้อมูลในโรงงาน..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f5b3d] text-white transition hover:bg-[#0b4b32] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="ส่ง"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   FORMAT ALERT DATE
========================================================= */

function formatAlertTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "th-TH",
    {
      timeZone:
        "Asia/Bangkok",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(date);
}