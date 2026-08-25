"use client";

import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  Download,
  FileSpreadsheet,
  Globe2,
  Laptop2,
  LoaderCircle,
  LockKeyhole,
  MonitorSmartphone,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldX,
  Smartphone,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type LoginStatus = "SUCCESS" | "FAILED";
type DeviceType = "Desktop" | "Mobile" | "Tablet";

type LoginLogItem = {
  id: string;
  loginAt: string;
  logoutAt: string | null;
  userName: string;
  email: string;
  role: string;
  company: string;
  status: LoginStatus;
  ipAddress: string;
  operatingSystem: string;
  browser: string;
  deviceType: DeviceType;
  location: string;
  country: string;
  reason: string;
  sessionId: string;
  loginMethod: string;
  userAgent: string;
};

type LoginSummary = {
  total: number;
  successCount: number;
  failedCount: number;
  successRate: number;
};

type LoginApiResponse = {
  success: boolean;
  message?: string;
  data?: LoginLogItem[];
  summary?: LoginSummary;
};

const PAGE_SIZE = 10;

const EMPTY_SUMMARY: LoginSummary = {
  total: 0,
  successCount: 0,
  failedCount: 0,
  successRate: 0,
};

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

function roleClassName(role: string) {
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

function avatarClassName(role: string) {
  switch (role) {
    case "Platform Admin":
      return "bg-emerald-700 text-white";
    case "Company Admin":
      return "bg-blue-600 text-white";
    case "Factory Manager":
      return "bg-orange-500 text-white";
    case "Environment Officer":
      return "bg-violet-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function LoginLogPageClient() {
  const [items, setItems] = useState<LoginLogItem[]>([]);
  const [summary, setSummary] =
    useState<LoginSummary>(EMPTY_SUMMARY);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ทั้งหมด");
  const [company, setCompany] = useState("ทั้งหมด");
  const [status, setStatus] = useState("ทั้งหมด");
  const [device, setDevice] = useState("ทั้งหมด");
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] =
    useState<LoginLogItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async (refresh = false) => {
    try {
      refresh ? setIsRefreshing(true) : setLoading(true);
      setError("");

      const response = await fetch("/api/platform/login-logs", {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as LoginApiResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message ?? "ไม่สามารถโหลด Login Log ได้",
        );
      }

      setItems(result.data);
      setSummary(result.summary ?? EMPTY_SUMMARY);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลด Login Log ได้",
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const roles = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(items.map((item) => item.role))).sort(),
    ],
    [items],
  );

  const companies = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(items.map((item) => item.company))).sort(),
    ],
    [items],
  );

  const devices = useMemo(
    () => [
      "ทั้งหมด",
      ...Array.from(new Set(items.map((item) => item.deviceType))).sort(),
    ],
    [items],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.userName,
          item.email,
          item.company,
          item.ipAddress,
          item.operatingSystem,
          item.browser,
          item.reason,
        ].some((value) =>
          value.toLowerCase().includes(keyword),
        );

      return (
        matchesSearch &&
        (role === "ทั้งหมด" || item.role === role) &&
        (company === "ทั้งหมด" || item.company === company) &&
        (status === "ทั้งหมด" || item.status === status) &&
        (device === "ทั้งหมด" || item.deviceType === device)
      );
    });
  }, [company, device, items, role, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const latest = items[0] ?? null;

  function resetFilters() {
    setSearch("");
    setRole("ทั้งหมด");
    setCompany("ทั้งหมด");
    setStatus("ทั้งหมด");
    setDevice("ทั้งหมด");
    setPage(1);
  }

  function exportCsv() {
    const headers = [
      "วันที่",
      "เวลา",
      "ผู้ใช้งาน",
      "อีเมล",
      "บทบาท",
      "บริษัท",
      "สถานะ",
      "IP Address",
      "ระบบปฏิบัติการ",
      "เบราว์เซอร์",
      "อุปกรณ์",
      "เหตุผล",
    ];

    const rows = filteredItems.map((item) => [
      formatDate(item.loginAt),
      formatTime(item.loginAt),
      item.userName,
      item.email,
      item.role,
      item.company,
      item.status === "SUCCESS" ? "สำเร็จ" : "ไม่สำเร็จ",
      item.ipAddress,
      item.operatingSystem,
      item.browser,
      item.deviceType,
      item.reason,
    ]);

    const escapeCsv = (value: string) =>
      `"${value.replaceAll('"', '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map((value) => escapeCsv(String(value))).join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "greenfactory-login-log.csv";
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
            กำลังโหลด Login Log จากฐานข้อมูล
          </p>
        </div>
      </div>
    );
  }

  const failedPercent =
    summary.total > 0
      ? (summary.failedCount / summary.total) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#f5f7f6] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              <span>ระบบและการตั้งค่า</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Login Log</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              Login Log
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ตรวจสอบประวัติการเข้าสู่ระบบจากฐานข้อมูลจริง
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsExportOpen((current) => !current)
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
              >
                <Download className="h-4 w-4" />
                ส่งออกข้อมูล
                <ChevronDown className="h-4 w-4" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={exportCsv}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    ส่งออกเป็น CSV
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => void loadData(true)}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              รีเฟรช
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <section className="mb-5 grid gap-4 xl:grid-cols-4">
          <SecurityScoreCard
            successRate={summary.successRate}
            successCount={summary.successCount}
            totalCount={summary.total}
          />

          <MetricCard
            label="เข้าสู่ระบบทั้งหมด"
            value={summary.total.toLocaleString()}
            helper="ครั้ง"
            icon={<UsersRound className="h-5 w-5" />}
            iconClassName="bg-emerald-50 text-emerald-600"
            footer="ข้อมูลจริงจาก login_log"
          />

          <MetricCard
            label="เข้าสู่ระบบไม่สำเร็จ"
            value={summary.failedCount.toLocaleString()}
            helper="ครั้ง"
            icon={<ShieldX className="h-5 w-5" />}
            iconClassName="bg-rose-50 text-rose-600"
            footer={`${failedPercent.toFixed(2)}% ของทั้งหมด`}
            danger
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">
              ความเคลื่อนไหวล่าสุด
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {latest ? formatDate(latest.loginAt) : "-"}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {latest ? formatTime(latest.loginAt) : "-"}
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600">
              {latest?.userName ?? "ยังไม่มีข้อมูล"}
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 2xl:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(145px,0.6fr))_auto]">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ค้นหา ชื่อ อีเมล บริษัท IP หรือเหตุผล"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm outline-none"
            />

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
              label="บริษัท"
              value={company}
              options={companies}
              onChange={(value) => {
                setCompany(value);
                setPage(1);
              }}
            />

            <FilterSelect
              label="สถานะ"
              value={status}
              options={["ทั้งหมด", "SUCCESS", "FAILED"]}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />

            <FilterSelect
              label="อุปกรณ์"
              value={device}
              options={devices}
              onChange={(value) => {
                setDevice(value);
                setPage(1);
              }}
            />

            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1260px] border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeader>#</TableHeader>
                  <TableHeader>วันที่และเวลา</TableHeader>
                  <TableHeader>ผู้ใช้งาน</TableHeader>
                  <TableHeader>บทบาท</TableHeader>
                  <TableHeader>บริษัท</TableHeader>
                  <TableHeader>สถานะ</TableHeader>
                  <TableHeader>IP Address</TableHeader>
                  <TableHeader>อุปกรณ์ / Browser</TableHeader>
                  <TableHeader>เหตุผล</TableHeader>
                  <TableHeader />
                </tr>
              </thead>

              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  >
                    <TableCell>
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold">
                        {formatDate(item.loginAt)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatTime(item.loginAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold ${avatarClassName(
                            item.role,
                          )}`}
                        >
                          {initials(item.userName)}
                        </span>
                        <div>
                          <div className="font-semibold">
                            {item.userName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleClassName(
                          item.role,
                        )}`}
                      >
                        {item.role}
                      </span>
                    </TableCell>

                    <TableCell>{item.company}</TableCell>

                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs">
                        {item.ipAddress}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon type={item.deviceType} />
                        <div>
                          <div>{item.operatingSystem}</div>
                          <div className="text-xs text-slate-400">
                            {item.browser}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{item.reason}</TableCell>

                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedItems.length === 0 && (
              <div className="grid min-h-[280px] place-items-center text-center">
                <div>
                  <Search className="mx-auto h-5 w-5 text-slate-400" />
                  <p className="mt-3 font-semibold">
                    ไม่พบประวัติการเข้าสู่ระบบ
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              {filteredItems.length} รายการ
            </p>

            <div className="flex gap-1.5">
              <button
                disabled={safePage === 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="h-9 w-9 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="mx-auto h-4 w-4" />
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-lg px-2 ${
                    pageNumber === safePage
                      ? "bg-emerald-800 text-white"
                      : "border border-slate-200"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                className="h-9 w-9 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="mx-auto h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedItem && (
        <>
          <button
            type="button"
            aria-label="ปิดรายละเอียด"
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-40 bg-slate-950/25"
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-700">
                  Login session
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  รายละเอียดการเข้าสู่ระบบ
                </h2>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-6">
              <DetailItem
                icon={<CalendarDays className="h-4 w-4" />}
                label="วันที่และเวลา"
                value={`${formatDate(
                  selectedItem.loginAt,
                )} ${formatTime(selectedItem.loginAt)}`}
              />
              <DetailItem
                icon={<Building2 className="h-4 w-4" />}
                label="บริษัท"
                value={selectedItem.company}
              />
              <DetailItem
                icon={<UserRound className="h-4 w-4" />}
                label="บทบาท"
                value={selectedItem.role}
              />
              <DetailItem
                icon={<Globe2 className="h-4 w-4" />}
                label="IP Address"
                value={selectedItem.ipAddress}
                mono
              />
              <DetailItem
                icon={<LockKeyhole className="h-4 w-4" />}
                label="Login Log ID"
                value={selectedItem.sessionId}
                mono
              />
              <DetailItem
                icon={<Clock3 className="h-4 w-4" />}
                label="Logout"
                value={
                  selectedItem.logoutAt
                    ? `${formatDate(
                        selectedItem.logoutAt,
                      )} ${formatTime(
                        selectedItem.logoutAt,
                      )}`
                    : "ยังไม่มีเวลาบันทึก"
                }
              />

              <div
                className={`rounded-2xl border p-4 ${
                  selectedItem.status === "SUCCESS"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <p className="font-semibold">
                  {selectedItem.status === "SUCCESS"
                    ? "เข้าสู่ระบบสำเร็จ"
                    : "เข้าสู่ระบบไม่สำเร็จ"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedItem.reason}
                </p>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function SecurityScoreCard({
  successRate,
  successCount,
  totalCount,
}: {
  successRate: number;
  successCount: number;
  totalCount: number;
}) {
  return (
    <div className="rounded-2xl bg-emerald-800 p-5 text-white">
      <p className="text-sm text-emerald-100">Security Health</p>
      <p className="mt-2 text-4xl font-bold">
        {successRate.toFixed(2)}%
      </p>
      <p className="mt-3 text-xs text-emerald-100">
        สำเร็จ {successCount.toLocaleString()} จาก{" "}
        {totalCount.toLocaleString()} ครั้ง
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  iconClassName,
  footer,
  danger = false,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  iconClassName: string;
  footer: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold">{value}</span>
            <span className="pb-1 text-sm text-slate-400">
              {helper}
            </span>
          </div>
        </div>

        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-4 text-xs font-medium ${
          danger ? "text-rose-600" : "text-slate-500"
        }`}
      >
        {footer}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: LoginStatus }) {
  const success = status === "SUCCESS";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        success
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {success ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <CircleX className="h-3.5 w-3.5" />
      )}
      {success ? "สำเร็จ" : "ไม่สำเร็จ"}
    </span>
  );
}

function DeviceIcon({ type }: { type: DeviceType }) {
  if (type === "Mobile") {
    return <Smartphone className="h-4 w-4 text-blue-600" />;
  }

  if (type === "Tablet") {
    return (
      <MonitorSmartphone className="h-4 w-4 text-blue-600" />
    );
  }

  return <Laptop2 className="h-4 w-4 text-blue-600" />;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="pointer-events-none absolute left-3 top-1.5 text-[10px] font-semibold text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pb-1 pt-4 text-sm font-semibold"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "SUCCESS"
              ? "สำเร็จ"
              : option === "FAILED"
                ? "ไม่สำเร็จ"
                : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TableHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-bold uppercase text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-sm align-middle">
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