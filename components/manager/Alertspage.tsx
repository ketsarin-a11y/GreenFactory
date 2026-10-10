"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";

type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | string;
type AlertSeverity = "CRITICAL" | "HIGH" | "WARNING" | "MEDIUM" | "INFO" | string;

interface ManagerAlert {
  id: string;
  alertCode?: string;
  alertType?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  triggeredAt: string;

  thresholdValue?: number | null;
  actualValue?: number | null;

  factoryName?: string | null;
  buildingName?: string | null;
  departmentName?: string | null;
  lineName?: string | null;
  machineId?: number | null;
  machineCode?: string | null;
  machineName?: string | null;

  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
}

type TabKey = "all" | "open" | "critical" | "high" | "warning" | "resolved";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "ทั้งหมด" },
  { key: "open", label: "เปิดอยู่" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "warning", label: "Warning" },
  { key: "resolved", label: "Resolved" },
];

function severityMeta(severity: string) {
  const s = severity.toUpperCase();

  if (s === "CRITICAL") {
    return {
      label: "CRITICAL",
      icon: AlertTriangle,
      badge: "bg-rose-50 text-rose-700 ring-rose-100",
      iconBox: "bg-rose-100 text-rose-700 ring-rose-200",
      border: "border-rose-200",
      accent: "bg-rose-500",
    };
  }

  if (s === "HIGH") {
    return {
      label: "HIGH",
      icon: ShieldAlert,
      badge: "bg-orange-50 text-orange-700 ring-orange-100",
      iconBox: "bg-orange-100 text-orange-700 ring-orange-200",
      border: "border-orange-200",
      accent: "bg-orange-500",
    };
  }

  if (s === "WARNING" || s === "MEDIUM") {
    return {
      label: "WARNING",
      icon: CircleAlert,
      badge: "bg-amber-50 text-amber-700 ring-amber-100",
      iconBox: "bg-amber-100 text-amber-700 ring-amber-200",
      border: "border-amber-200",
      accent: "bg-amber-500",
    };
  }

  return {
    label: "INFO",
    icon: CircleAlert,
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    iconBox: "bg-sky-100 text-sky-700 ring-sky-200",
    border: "border-sky-200",
    accent: "bg-sky-500",
  };
}

function statusMeta(status: string) {
  const s = status.toUpperCase();

  if (s === "OPEN") {
    return {
      label: "เปิดอยู่",
      className: "bg-rose-50 text-rose-700 ring-rose-100",
    };
  }

  if (s === "ACKNOWLEDGED") {
    return {
      label: "รับทราบแล้ว",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
    };
  }

  if (s === "RESOLVED") {
    return {
      label: "แก้ไขแล้ว",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }

  return {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function fmt(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "-";
  }

  return Number(value).toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}

function normalizePayload(payload: unknown): ManagerAlert[] {
  if (Array.isArray(payload)) return payload as ManagerAlert[];

  if (
    payload &&
    typeof payload === "object" &&
    "alerts" in payload &&
    Array.isArray((payload as { alerts?: unknown }).alerts)
  ) {
    return (payload as { alerts: ManagerAlert[] }).alerts;
  }

  return [];
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ManagerAlert[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadAlerts(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (!silent) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const response = await fetch("/api/manager/notifications", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Notification request failed: ${response.status}`);
      }

      const payload = await response.json();
      const nextAlerts = normalizePayload(payload);

      setAlerts(nextAlerts);

      setSelectedId((current) => {
        if (current && nextAlerts.some((item) => item.id === current)) {
          return current;
        }

        return nextAlerts[0]?.id ?? null;
      });
    } catch (e) {
      console.error("Load manager alerts error:", e);
      setError("โหลดการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    const timer = window.setInterval(() => {
      loadAlerts({ silent: true });
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  const counts = useMemo(() => {
    const open = alerts.filter((a) => a.status.toUpperCase() === "OPEN").length;
    const critical = alerts.filter(
      (a) => a.severity.toUpperCase() === "CRITICAL",
    ).length;
    const high = alerts.filter((a) => a.severity.toUpperCase() === "HIGH").length;
    const warning = alerts.filter((a) =>
      ["WARNING", "MEDIUM"].includes(a.severity.toUpperCase()),
    ).length;
    const resolved = alerts.filter(
      (a) => a.status.toUpperCase() === "RESOLVED",
    ).length;

    return {
      all: alerts.length,
      open,
      critical,
      high,
      warning,
      resolved,
    };
  }, [alerts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const severity = alert.severity.toUpperCase();
      const status = alert.status.toUpperCase();

      let tabMatch = true;

      if (tab === "open") tabMatch = status === "OPEN";
      if (tab === "critical") tabMatch = severity === "CRITICAL";
      if (tab === "high") tabMatch = severity === "HIGH";
      if (tab === "warning") tabMatch = severity === "WARNING" || severity === "MEDIUM";
      if (tab === "resolved") tabMatch = status === "RESOLVED";

      if (!tabMatch) return false;
      if (!q) return true;

      return [
        alert.title,
        alert.message,
        alert.alertCode,
        alert.alertType,
        alert.factoryName,
        alert.buildingName,
        alert.departmentName,
        alert.lineName,
        alert.machineCode,
        alert.machineName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [alerts, tab, search]);

  const selected =
    alerts.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null;

  async function acknowledge(alertId: string) {
    if (updatingId) return;

    setUpdatingId(alertId);

    try {
      const response = await fetch("/api/manager/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alertId,
          action: "ACKNOWLEDGE",
        }),
      });

      if (!response.ok) {
        throw new Error(`Acknowledge failed: ${response.status}`);
      }

      await loadAlerts({ silent: true });
    } catch (e) {
      console.error("Acknowledge alert error:", e);
      setError("รับทราบ Alert ไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f8f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* =========================================================
            HEADER
        ========================================================== */}
        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white px-6 py-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:px-7">
          <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-rose-500 via-amber-400 to-sky-500" />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100">
                <ShieldAlert className="h-3.5 w-3.5" />
                Alert Command Center
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                ศูนย์แจ้งเตือนและเหตุการณ์
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                ติดตาม Alert จริงจากฐานข้อมูล ดูระดับความรุนแรง ตำแหน่ง
                ค่าที่เกินเกณฑ์ และรับทราบเหตุการณ์จากหน้าเดียว
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SummaryBox
                label="Open"
                value={counts.open}
                tone="rose"
              />
              <SummaryBox
                label="Critical"
                value={counts.critical}
                tone="amber"
              />
              <SummaryBox
                label="Resolved"
                value={counts.resolved}
                tone="emerald"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            FILTER BAR
        ========================================================== */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((item) => {
                const count = counts[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={[
                      "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold transition",
                      tab === item.key
                        ? "bg-slate-950 text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {item.label}
                    <span
                      className={[
                        "rounded-full px-1.5 py-0.5 text-[9px]",
                        tab === item.key
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1 xl:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหา Alert, เครื่องจักร, อาคาร..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
                />
              </label>

              <button
                type="button"
                onClick={() => loadAlerts({ silent: true })}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {refreshing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* =========================================================
            WORKSPACE
        ========================================================== */}
        <section className="grid gap-5 xl:grid-cols-[460px_minmax(0,1fr)]">
          {/* LIST */}
          <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-black text-slate-950">
                  Alert Queue
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  {filtered.length} รายการตามตัวกรองปัจจุบัน
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                Live
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                  <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    กำลังโหลด Alert
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    ไม่มี Alert ในหมวดนี้
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    ลองเปลี่ยนตัวกรองหรือค้นหาใหม่
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[720px] overflow-y-auto p-2.5">
                <div className="space-y-2">
                  {filtered.map((alert) => (
                    <AlertListItem
                      key={alert.id}
                      alert={alert}
                      selected={selected?.id === alert.id}
                      onClick={() => setSelectedId(alert.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DETAIL */}
          <div className="min-w-0">
            {!selected ? (
              <div className="flex min-h-[520px] items-center justify-center rounded-[26px] border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                  <CircleAlert className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    เลือก Alert เพื่อดูรายละเอียด
                  </p>
                </div>
              </div>
            ) : (
              <AlertDetailPanel
                alert={selected}
                updating={updatingId === selected.id}
                onAcknowledge={() => acknowledge(selected.id)}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "rose" | "amber" | "emerald";
}) {
  const styles = {
    rose: "border-rose-100 bg-rose-50 text-rose-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">
        {value.toLocaleString("th-TH")}
      </p>
    </div>
  );
}

function AlertListItem({
  alert,
  selected,
  onClick,
}: {
  alert: ManagerAlert;
  selected: boolean;
  onClick: () => void;
}) {
  const severity = severityMeta(alert.severity);
  const status = statusMeta(alert.status);
  const Icon = severity.icon;

  const location = [
    alert.machineName,
    alert.lineName,
    alert.departmentName,
    alert.buildingName,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-[20px] border p-4 text-left transition duration-200",
        selected
          ? `${severity.border} bg-slate-50 shadow-[0_8px_22px_rgba(15,23,42,0.05)]`
          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/70",
      ].join(" ")}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${severity.accent}`} />

      <div className="flex gap-3 pl-1">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${severity.iconBox}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.08em] ring-1 ${severity.badge}`}
            >
              {severity.label}
            </span>

            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-2 line-clamp-1 text-[13px] font-extrabold text-slate-900">
            {alert.title}
          </p>

          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
            {alert.message}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="truncate text-[9px] text-slate-400">
              {location.join(" · ") || alert.factoryName || "GreenFactory"}
            </span>

            <span className="shrink-0 text-[9px] font-semibold text-slate-400">
              {formatDateTime(alert.triggeredAt)}
            </span>
          </div>
        </div>

        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}

function AlertDetailPanel({
  alert,
  updating,
  onAcknowledge,
}: {
  alert: ManagerAlert;
  updating: boolean;
  onAcknowledge: () => void;
}) {
  const severity = severityMeta(alert.severity);
  const status = statusMeta(alert.status);
  const Icon = severity.icon;

  const canAcknowledge = alert.status.toUpperCase() === "OPEN";
  const hasThreshold =
    alert.thresholdValue !== null &&
    alert.thresholdValue !== undefined &&
    alert.actualValue !== null &&
    alert.actualValue !== undefined;

  const overValue =
    hasThreshold
      ? Number(alert.actualValue) - Number(alert.thresholdValue)
      : null;

  const overPercent =
    hasThreshold && Number(alert.thresholdValue) !== 0
      ? (Number(alert.actualValue) / Number(alert.thresholdValue)) * 100
      : null;

  const detailLink = alert.machineId
    ? `/manager/overview/equipment/${alert.machineId}`
    : "/manager/overview/equipment";

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="relative border-b border-slate-100 px-6 py-6">
        <span className={`absolute inset-x-0 top-0 h-[4px] ${severity.accent}`} />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${severity.iconBox}`}
            >
              <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.08em] ring-1 ${severity.badge}`}
                >
                  {severity.label}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ring-1 ${status.className}`}
                >
                  {status.label}
                </span>

                {alert.alertCode && (
                  <span className="font-mono text-[9px] text-slate-400">
                    {alert.alertCode}
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                {alert.title}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {alert.message}
              </p>
            </div>
          </div>

          {canAcknowledge && (
            <button
              type="button"
              onClick={onAcknowledge}
              disabled={updating}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {updating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              รับทราบ Alert
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            icon={Building2}
            label="ตำแหน่ง"
            value={
              alert.machineName ||
              alert.lineName ||
              alert.departmentName ||
              alert.buildingName ||
              "-"
            }
            sub={[
              alert.machineCode,
              alert.lineName,
              alert.departmentName,
              alert.buildingName,
            ]
              .filter(Boolean)
              .join(" · ")}
          />

          <DetailCard
            icon={CalendarDays}
            label="Triggered"
            value={formatDateTime(alert.triggeredAt)}
            sub={alert.alertType || "System Alert"}
          />

          <DetailCard
            icon={Clock3}
            label="Acknowledged"
            value={formatDateTime(alert.acknowledgedAt)}
            sub="เวลาที่ Manager รับทราบ"
          />

          <DetailCard
            icon={CheckCircle2}
            label="Resolved"
            value={formatDateTime(alert.resolvedAt)}
            sub="เวลาที่เหตุการณ์ถูกปิด"
          />
        </section>

        {hasThreshold && (
          <section>
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                THRESHOLD INTELLIGENCE
              </p>
              <h3 className="mt-1 text-sm font-black text-slate-950">
                ค่าที่ตรวจพบเทียบกับเกณฑ์
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricBox
                label="Threshold"
                value={fmt(alert.thresholdValue)}
                tone="slate"
              />

              <MetricBox
                label="Actual"
                value={fmt(alert.actualValue)}
                tone="rose"
              />

              <MetricBox
                label="Difference"
                value={
                  overValue !== null
                    ? `${overValue > 0 ? "+" : ""}${fmt(overValue)}${
                        overPercent !== null ? ` · ${fmt(overPercent)}% of threshold` : ""
                      }`
                    : "-"
                }
                tone={overValue !== null && overValue > 0 ? "amber" : "emerald"}
              />
            </div>
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              EVENT CONTEXT
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoRow label="Factory" value={alert.factoryName || "-"} />
              <InfoRow label="Building" value={alert.buildingName || "-"} />
              <InfoRow label="Department" value={alert.departmentName || "-"} />
              <InfoRow label="Production Line" value={alert.lineName || "-"} />
              <InfoRow label="Machine" value={alert.machineName || "-"} />
              <InfoRow label="Machine Code" value={alert.machineCode || "-"} />
            </div>
          </div>

          <div className="rounded-[22px] bg-slate-950 p-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
              NEXT ACTION
            </p>

            <p className="mt-3 text-sm font-bold">
              ตรวจข้อมูลต้นทางของเครื่องจักร
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-300">
              เปิดหน้า Equipment Detail เพื่อดู ResourceUsage, Sensor,
              QR และสถานะล่าสุดของเครื่องที่เกี่ยวข้อง
            </p>

            <Link
              href={detailLink}
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 transition hover:bg-emerald-100"
            >
              <Wrench className="h-4 w-4" />
              เปิด Machine Detail
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-sm font-black text-slate-900">
        {value}
      </p>

      {sub && (
        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">
          {sub}
        </p>
      )}
    </div>
  );
}

function MetricBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "slate" | "rose" | "amber" | "emerald";
}) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    rose: "border-rose-100 bg-rose-50 text-rose-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-900",
  };

  return (
    <div className={`rounded-[20px] border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}
