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

  const headerRef = useRef<HTMLElement | null>(null);
  const seenCriticalRef = useRef<string | null>(null);

  const loadAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setAlertsLoading(true);

    try {
      const response = await fetch("/api/manager/notifications", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Notification request failed: ${response.status}`);
      }

      const data = (await response.json()) as AlertResponse;

      setAlerts(data.alerts ?? []);
      setOpenCount(data.openCount ?? 0);

      const latestCritical = (data.alerts ?? []).find(
        (item) =>
          item.status === "OPEN" &&
          (item.severity === "CRITICAL" || item.severity === "HIGH"),
      );

      if (
        latestCritical &&
        latestCritical.id !== seenCriticalRef.current
      ) {
        seenCriticalRef.current = latestCritical.id;
        setCriticalToast(latestCritical);
      }
    } catch (error) {
      console.error("Manager notification error:", error);
    } finally {
      if (showLoading) setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts(true);

    const timer = window.setInterval(() => {
      void loadAlerts(false);
    }, 5_000);

    return () => window.clearInterval(timer);
  }, [loadAlerts]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!criticalToast) return;

    const timer = window.setTimeout(() => {
      setCriticalToast(null);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [criticalToast]);

  async function acknowledgeAlert(alertId: string) {
    try {
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
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.id === alertId
            ? { ...alert, status: "ACKNOWLEDGED" }
            : alert,
        ),
      );
      setOpenCount((count) => Math.max(0, count - 1));

      if (criticalToast?.id === alertId) {
        setCriticalToast(null);
      }
    } catch (error) {
      console.error("Acknowledge alert error:", error);
    }
  }

  async function acknowledgeAll() {
    if (openCount === 0 || acknowledgingAll) return;

    try {
      setAcknowledgingAll(true);

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
      }

      setAlerts((current) =>
        current.map((alert) =>
          alert.status === "OPEN"
            ? { ...alert, status: "ACKNOWLEDGED" }
            : alert,
        ),
      );
      setOpenCount(0);
      setCriticalToast(null);
    } catch (error) {
      console.error("Acknowledge all alerts error:", error);
    } finally {
      setAcknowledgingAll(false);
    }
  }

  const isActive = (href: string) => {
    if (href === "/manager") return pathname === "/manager";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-5 px-5 sm:px-8 lg:px-10">
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

          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
            <TopLink
              href="/manager"
              active={pathname === "/manager"}
              label="Dashboard"
            />

            <DropdownButton
              label="Analytics"
              open={openMenu === "analytics"}
              active={pathname.startsWith("/manager/overview") &&
                !pathname.startsWith("/manager/overview/equipment")}
              onClick={() => {
                setOpenMenu(openMenu === "analytics" ? null : "analytics");
                setNotificationsOpen(false);
              }}
            />

            <DropdownButton
              label="Operations"
              open={openMenu === "operations"}
              active={pathname.startsWith("/manager/overview/equipment")}
              onClick={() => {
                setOpenMenu(openMenu === "operations" ? null : "operations");
                setNotificationsOpen(false);
              }}
            />

            <TopLink
              href="/manager/reports"
              active={isActive("/manager/reports")}
              label="Reports"
            />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setOpenMenu(null);

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
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-[18px] w-[18px]" />

                {openCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {openCount > 99 ? "99+" : openCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPopover
                  alerts={alerts}
                  openCount={openCount}
                  loading={alertsLoading}
                  acknowledgingAll={acknowledgingAll}
                  onAcknowledge={acknowledgeAlert}
                  onAcknowledgeAll={acknowledgeAll}
                />
              )}
            </div>

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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
              aria-label="เปิดเมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {openMenu && (
          <div className="absolute left-0 right-0 top-[76px] border-b border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="mx-auto max-w-[1600px] px-10 py-5">
              {openMenu === "analytics" && (
                <MenuGrid
                  title="Analytics"
                  subtitle="เจาะลึกแนวโน้ม ประสิทธิภาพ และ Carbon"
                  items={ANALYTICS_ITEMS}
                  onNavigate={() => setOpenMenu(null)}
                />
              )}

              {openMenu === "operations" && (
                <MenuGrid
                  title="Operations"
                  subtitle="ติดตามเครื่องจักรและข้อมูลการดำเนินงาน"
                  items={OPERATIONS_ITEMS}
                  onNavigate={() => setOpenMenu(null)}
                />
              )}
            </div>
          </div>
        )}
      </header>

      {criticalToast && (
        <CriticalAlertToast
          alert={criticalToast}
          onClose={() => setCriticalToast(null)}
          onAcknowledge={() => acknowledgeAlert(criticalToast.id)}
        />
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="ปิดเมนู"
            className="absolute inset-0 bg-slate-950/35"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-white shadow-2xl">
            <div className="flex h-[76px] items-center justify-between border-b border-slate-200 px-5">
              <img
                src="/images/LOGO.png"
                alt="GreenFactory Insight"
                className="w-[168px]"
              />
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
                aria-label="ปิดเมนู"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 p-4">
              <MobileLink href="/manager" label="Dashboard" />
              <MobileLink href="/manager/overview" label="Analytics" />
              <MobileLink
                href="/manager/overview/equipment"
                label="Operations"
              />
              <MobileLink href="/manager/reports" label="Reports" />
              <MobileLink href="/manager/profile" label="Profile" />
            </div>
          </div>
        </div>
      )}

      {!assistantOpen && (
        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f5b3d] text-white shadow-[0_14px_32px_rgba(15,91,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#0b4b32]"
          aria-label="เปิด GreenFactory Assistant"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
      )}

      {assistantOpen && (
        <AssistantPanel onClose={() => setAssistantOpen(false)} />
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
            รับทราบทั้งหมด
          </button>
        )}
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                <div className="mt-2 h-2.5 w-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-800">
              ทุกอย่างเรียบร้อย
            </p>
            <p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-400">
              ยังไม่มี Alert ที่ต้องตรวจสอบในขณะนี้
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onAcknowledge={() => onAcknowledge(alert.id)}
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
  const isOpen = alert.status === "OPEN";
  const severity = severityMeta(alert.severity);

  return (
    <div
      className={[
        "group flex gap-3 px-4 py-3.5 transition hover:bg-slate-50",
        isOpen ? "bg-white" : "bg-slate-50/50",
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
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severity.dot}`} />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
          {alert.message}
        </p>

        {(alert.machineName ||
          alert.departmentName ||
          alert.buildingName) && (
          <p className="mt-1.5 truncate text-[10px] text-slate-400">
            {[alert.machineName, alert.departmentName, alert.buildingName]
              .filter(Boolean)
              .join(" • ")}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400">
            {formatAlertTime(alert.triggeredAt)}
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
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}

function severityMeta(severity: AlertSeverity) {
  switch (severity) {
    case "CRITICAL":
      return {
        icon: AlertTriangle,
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
        <p className="text-sm font-bold text-slate-950">{title}</p>
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
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function sendMessage(messageOverride?: string) {
    const message = (messageOverride ?? input).trim();

    if (!message || sending) return;

    const userMessage: AssistantMessage = {
      role: "user",
      content: message,
    };

    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
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

      if (!response.ok) {
        throw new Error(
          `Assistant request failed: ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        answer?: string;
      };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.answer ??
            "ยังไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้",
        },
      ]);
    } catch (error) {
      console.error("Manager assistant error:", error);

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
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf7f1] text-[#0f5b3d]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                GreenFactory Assistant
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                LIVE DATA
              </span>
            </div>
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

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
      >
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
          </div>
        )}

        {sending && (
          <div className="flex max-w-[88%] items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 shadow-sm">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            กำลังวิเคราะห์ข้อมูลโรงงาน...
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
          className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-300 focus-within:bg-white"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            rows={1}
            placeholder="ถามเกี่ยวกับข้อมูลโรงงาน..."
            className="max-h-24 min-h-[28px] min-w-0 flex-1 resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || sending}
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
          AI ใช้ข้อมูลในระบบเพื่อช่วยวิเคราะห์ ควรตรวจสอบข้อมูลสำคัญก่อนตัดสินใจ
        </p>
      </div>
    </div>
  );
}

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
