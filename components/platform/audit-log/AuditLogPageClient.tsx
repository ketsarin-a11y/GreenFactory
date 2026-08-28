"use client";

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileClock,
  FileSpreadsheet,
  Filter,
  LoaderCircle,
  LogIn,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | string;

type AuditLogItem = {
  id: string;
  createdAt: string;
  userName: string;
  email: string;
  role: string;
  action: AuditAction;
  module: string;
  reference: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  oldData: unknown;
  newData: unknown;
};

type AuditSummary = {
  total: number;
  uniqueUsers: number;
  created: number;
  updatedAndDeleted: number;
};

type AuditApiResponse = {
  success: boolean;
  message?: string;
  data?: AuditLogItem[];
  summary?: AuditSummary;
};

const PAGE_SIZE = 10;

const EMPTY_SUMMARY: AuditSummary = {
  total: 0,
  uniqueUsers: 0,
  created: 0,
  updatedAndDeleted: 0,
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: "เพิ่มข้อมูล",
  UPDATE: "แก้ไขข้อมูล",
  DELETE: "ลบข้อมูล",
  LOGIN: "เข้าสู่ระบบ",
};

function getActionLabel(action: string) {
  return ACTION_LABEL[action] ?? action;
}

function getActionStyle(action: string) {
  switch (action) {
    case "CREATE":
      return {
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
        icon: <CirclePlus className="h-3.5 w-3.5" />,
      };
    case "UPDATE":
      return {
        badge: "bg-blue-50 text-blue-700 ring-blue-600/10",
        icon: <Edit3 className="h-3.5 w-3.5" />,
      };
    case "DELETE":
      return {
        badge: "bg-rose-50 text-rose-700 ring-rose-600/10",
        icon: <Trash2 className="h-3.5 w-3.5" />,
      };
    case "LOGIN":
      return {
        badge: "bg-violet-50 text-violet-700 ring-violet-600/10",
        icon: <LogIn className="h-3.5 w-3.5" />,
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700 ring-slate-600/10",
        icon: <Activity className="h-3.5 w-3.5" />,
      };
  }
}

function roleStyle(role: string) {
  switch (role) {
    case "Platform Admin":
      return "bg-emerald-50 text-emerald-700";
    case "Company Admin":
      return "bg-blue-50 text-blue-700";
    case "Factory Manager":
      return "bg-orange-50 text-orange-700";
    case "Environment Officer":
      return "bg-violet-50 text-violet-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function avatarStyle(role: string) {
  switch (role) {
    case "Platform Admin":
      return "bg-emerald-700 text-white";
    case "Company Admin":
      return "bg-blue-600 text-white";
    case "Factory Manager":
      return "bg-rose-400 text-white";
    case "Environment Officer":
      return "bg-violet-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SY";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function prettyJson(value: unknown) {
  if (value == null) return "ไม่มีข้อมูล";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function AuditLogPageClient() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary>(EMPTY_SUMMARY);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ทั้งหมด");
  const [action, setAction] = useState("ทั้งหมด");
  const [moduleName, setModuleName] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await fetch("/api/platform/audit-logs", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as AuditApiResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message ?? "ไม่สามารถโหลด Audit Log ได้");
      }

      setLogs(result.data);
      setSummary(result.summary ?? EMPTY_SUMMARY);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ไม่สามารถโหลด Audit Log ได้",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const roles = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(logs.map((item) => item.role))).sort(),
    ],
    [logs],
  );

  const modules = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(logs.map((item) => item.module))).sort(),
    ],
    [logs],
  );

  const actions = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(logs.map((item) => item.action))).sort(),
    ],
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return logs.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.userName,
          item.email,
          item.module,
          item.reference,
          item.description,
          item.ipAddress,
          item.userAgent,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      return (
        matchesSearch &&
        (role === "ทั้งหมด" || item.role === role) &&
        (action === "ทั้งหมด" || item.action === action) &&
        (moduleName === "ทั้งหมด" || item.module === moduleName)
      );
    });
  }, [action, logs, moduleName, role, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLogs, safePage]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  function handleReset() {
    setSearch("");
    setRole("ทั้งหมด");
    setAction("ทั้งหมด");
    setModuleName("ทั้งหมด");
    setPage(1);
  }

  function handleExportCsv() {
    const headers = [
      "วันที่",
      "เวลา",
      "ผู้ใช้งาน",
      "อีเมล",
      "บทบาท",
      "การกระทำ",
      "โมดูล",
      "รายการอ้างอิง",
      "รายละเอียด",
      "IP Address",
      "User Agent",
    ];

    const rows = filteredLogs.map((item) => [
      formatDate(item.createdAt),
      formatTime(item.createdAt),
      item.userName,
      item.email,
      item.role,
      getActionLabel(item.action),
      item.module,
      item.reference,
      item.description,
      item.ipAddress,
      item.userAgent,
    ]);

    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "greenfactory-audit-log.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  }

  if (loading) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            กำลังโหลด Audit Log จากฐานข้อมูล
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>ระบบและการตั้งค่า</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Audit Log</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              Audit Log
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบประวัติการดำเนินการที่บันทึกจริงในฐานข้อมูล
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportOpen((value) => !value)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                ส่งออกข้อมูล
                <ChevronDown className="h-4 w-4" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    ส่งออกเป็น CSV
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setPage(1)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Filter className="h-4 w-4" />
              ตัวกรอง
            </button>

            <button
              type="button"
              onClick={() => void loadLogs(true)}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadLogs(true)}
              className="text-sm font-semibold text-rose-700"
            >
              ลองใหม่
            </button>
          </div>
        )}

        <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="รายการทั้งหมด"
            value={summary.total.toLocaleString()}
            helper="รายการ"
            trend="ข้อมูลจริงจาก Audit Log"
            icon={<FileClock className="h-5 w-5" />}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            label="ผู้ใช้งานไม่ซ้ำ"
            value={summary.uniqueUsers.toLocaleString()}
            helper="คน"
            trend="นับจากผู้ใช้งานที่มีรายการ"
            icon={<UsersRound className="h-5 w-5" />}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            label="เพิ่มข้อมูล"
            value={summary.created.toLocaleString()}
            helper="รายการ"
            trend={
              summary.total > 0
                ? `${((summary.created / summary.total) * 100).toFixed(1)}% ของทั้งหมด`
                : "ยังไม่มีข้อมูล"
            }
            icon={<CirclePlus className="h-5 w-5" />}
            iconClassName="bg-orange-50 text-orange-500"
          />

          <SummaryCard
            label="แก้ไขและลบ"
            value={summary.updatedAndDeleted.toLocaleString()}
            helper="รายการ"
            trend="UPDATE + DELETE"
            icon={<Activity className="h-5 w-5" />}
            iconClassName="bg-violet-50 text-violet-600"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-200 p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(150px,0.55fr))_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา ผู้ใช้ รายการ โมดูล IP หรือ User Agent"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <FilterSelect
                label="บทบาท"
                value={role}
                options={roles}
                onChange={(value) => {
                  setRole(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="การกระทำ"
                value={action}
                options={actions}
                getLabel={(value) =>
                  value === "ทั้งหมด" ? value : getActionLabel(value)
                }
                onChange={(value) => {
                  setAction(value);
                  setPage(1);
                }}
              />

              <FilterSelect
                label="โมดูล"
                value={moduleName}
                options={modules}
                onChange={(value) => {
                  setModuleName(value);
                  setPage(1);
                }}
              />

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <RefreshCw className="h-4 w-4" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] border-collapse">
              <thead className="bg-slate-50/90">
                <tr className="border-b border-slate-200">
                  <TableHeader className="w-16">#</TableHeader>
                  <TableHeader>วันที่และเวลา</TableHeader>
                  <TableHeader>ผู้ใช้งาน</TableHeader>
                  <TableHeader>บทบาท</TableHeader>
                  <TableHeader>การกระทำ</TableHeader>
                  <TableHeader>โมดูล</TableHeader>
                  <TableHeader>รายการที่เกี่ยวข้อง</TableHeader>
                  <TableHeader>รายละเอียด</TableHeader>
                  <TableHeader>IP Address</TableHeader>
                  <TableHeader className="w-14" />
                </tr>
              </thead>

              <tbody>
                {paginatedLogs.map((item, index) => {
                  const actionStyle = getActionStyle(item.action);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedLog(item)}
                      className="cursor-pointer border-b border-slate-100 transition last:border-b-0 hover:bg-emerald-50/35"
                    >
                      <TableCell className="font-semibold text-slate-500">
                        {(safePage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-700">
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatTime(item.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${avatarStyle(item.role)}`}
                          >
                            {getInitials(item.userName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800">
                              {item.userName}
                            </div>
                            <div className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleStyle(item.role)}`}
                        >
                          {item.role}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${actionStyle.badge}`}
                        >
                          {actionStyle.icon}
                          {getActionLabel(item.action)}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-slate-600">
                        {item.module}
                      </TableCell>

                      <TableCell className="font-medium text-slate-700">
                        {item.reference}
                      </TableCell>

                      <TableCell className="max-w-[230px]">
                        <p className="truncate text-slate-500">
                          {item.description}
                        </p>
                      </TableCell>

                      <TableCell>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600">
                          {item.ipAddress}
                        </span>
                      </TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedLog(item);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                          aria-label="ดูรายละเอียด"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {paginatedLogs.length === 0 && (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  ไม่พบข้อมูล Audit Log
                </h3>
                <p className="mt-1 max-w-lg text-sm text-slate-500">
                  ถ้าฐานข้อมูลยังไม่มีรายการ Audit Log หน้านี้จะแสดงว่างจนกว่าจะมี API ฝั่ง CRUD เขียนประวัติลงตาราง audit_log
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              แสดง{" "}
              <span className="font-semibold text-slate-700">
                {filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
                -
                {Math.min(safePage * PAGE_SIZE, filteredLogs.length)}
              </span>{" "}
              จาก{" "}
              <span className="font-semibold text-slate-700">
                {filteredLogs.length}
              </span>{" "}
              รายการ
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                      safePage === pageNumber
                        ? "bg-emerald-800 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedLog && (
        <>
          <button
            type="button"
            aria-label="ปิดรายละเอียด"
            onClick={() => setSelectedLog(null)}
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]"
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Audit detail
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  รายละเอียดกิจกรรม
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarStyle(selectedLog.role)}`}
                  >
                    {getInitials(selectedLog.userName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedLog.userName}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedLog.email}
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyle(selectedLog.role)}`}
                    >
                      {selectedLog.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DetailItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="วันที่และเวลา"
                  value={`${formatDate(selectedLog.createdAt)} เวลา ${formatTime(selectedLog.createdAt)}`}
                />
                <DetailItem
                  icon={<Activity className="h-4 w-4" />}
                  label="การกระทำ"
                  value={getActionLabel(selectedLog.action)}
                />
                <DetailItem
                  icon={<FileClock className="h-4 w-4" />}
                  label="โมดูล"
                  value={selectedLog.module}
                />
                <DetailItem
                  icon={<Eye className="h-4 w-4" />}
                  label="รายการอ้างอิง"
                  value={selectedLog.reference}
                />
                <DetailItem
                  icon={<UserRound className="h-4 w-4" />}
                  label="รายละเอียด"
                  value={selectedLog.description}
                />
                <DetailItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="IP Address"
                  value={selectedLog.ipAddress}
                  mono
                />
                <DetailItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="User Agent"
                  value={selectedLog.userAgent}
                />
              </div>

              <JsonBlock title="ข้อมูลก่อนแก้ไข (Old Data)" value={selectedLog.oldData} />
              <JsonBlock title="ข้อมูลหลังแก้ไข (New Data)" value={selectedLog.newData} />

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  สถานะการตรวจสอบ
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  รายการนี้อ่านโดยตรงจากตาราง audit_log และไม่ใช่ Mock Data
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  trend,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-950">
              {value}
            </span>
            <span className="pb-1 text-sm font-medium text-slate-400">
              {helper}
            </span>
          </div>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {trend}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  getLabel,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1.5 z-10 text-[10px] font-semibold text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pb-1 pt-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-sm align-middle ${className}`}
    >
      {children}
    </td>
  );
}

function DetailItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        {icon}
        {label}
      </div>
      <p
        className={`mt-2 break-words text-sm font-semibold text-slate-800 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-950 p-4">
      <p className="mb-2 text-xs font-semibold text-slate-300">{title}</p>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-100">
        {prettyJson(value)}
      </pre>
    </div>
  );
}
