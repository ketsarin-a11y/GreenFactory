import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  History,
  ListChecks,
  QrCode,
  RotateCcw,
  Search,
} from "lucide-react";
import { getManagerResourceHistory } from "@/lib/manager-history-queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type SearchParams = {
  page?: string;
  from?: string;
  to?: string;
  q?: string;
  source?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

function paramsHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);
  if (params.source) query.set("source", params.source);
  query.set("page", String(page));
  return `/manager/history?${query.toString()}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}

function pageNumbers(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, Math.max(current + 1, 3));
  const result: number[] = [];
  for (let page = start; page <= end; page += 1) result.push(page);
  return result;
}

function SourceBadge({ source }: { source: string }) {
  const qr = source === "QR";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
        qr
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-sky-50 text-sky-700 ring-sky-200"
      }`}
    >
      {qr ? <QrCode className="h-3.5 w-3.5" /> : <ListChecks className="h-3.5 w-3.5" />}
      {qr ? "QR" : "Manual"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase() ?? "";
  const className =
    normalized === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : normalized === "FAILED"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";
  const label =
    normalized === "COMPLETED"
      ? "ประมวลผลแล้ว"
      : normalized === "FAILED"
        ? "ผิดพลาด"
        : normalized === "PENDING"
          ? "รอประมวลผล"
          : status || "-";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${className}`}>
      {label}
    </span>
  );
}

export default async function ManagerHistoryPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.roleName !== "MANAGER") redirect("/");
  if (!session.companyId) throw new Error("Manager account does not have a companyId");

  const params = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const data = await getManagerResourceHistory(session.companyId, {
    page: requestedPage,
    from: params.from,
    to: params.to,
    q: params.q,
    source: params.source,
  });

  const hasFilters = Boolean(params.q || params.from || params.to || params.source);
  const firstRecord = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const lastRecord = Math.min(data.page * data.pageSize, data.total);
  const visiblePages = pageNumbers(data.page, data.totalPages);

  return (
    <main className="min-h-screen bg-[#f7faf9] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <section className="relative mb-5 overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_10px_35px_-18px_rgba(15,118,110,0.22)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_5%_100%,rgba(14,165,233,0.07),transparent_28%)]" />
          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
            <div>
              <Link
                href="/manager"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับหน้าภาพรวม
              </Link>
              <div className="flex items-start gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[28px]">
                      ประวัติการบันทึกทรัพยากร
                    </h1>
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      Live Database
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-500">
                    ตรวจสอบรายการ ResourceUsage ที่บันทึกเข้าระบบ พร้อมค้นหาและกรองข้อมูลย้อนหลัง
                  </p>
                </div>
              </div>
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-2.5 sm:min-w-[300px]">
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Database className="h-4 w-4 text-emerald-600" />
                  รายการทั้งหมด
                </div>
                <strong className="text-xl font-extrabold tabular-nums text-slate-950">
                  {data.total.toLocaleString("th-TH")}
                </strong>
                <span className="ml-1 text-xs font-medium text-slate-400">รายการ</span>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <CalendarDays className="h-4 w-4 text-sky-600" />
                  หน้าปัจจุบัน
                </div>
                <strong className="text-xl font-extrabold tabular-nums text-slate-950">
                  {data.page.toLocaleString("th-TH")}
                </strong>
                <span className="ml-1 text-xs font-medium text-slate-400">
                  / {data.totalPages.toLocaleString("th-TH")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">ค้นหาและกรองข้อมูล</h2>
              <p className="mt-0.5 text-xs text-slate-500">ค้นหาจากเครื่องจักร ทรัพยากร หรือเลขอ้างอิง</p>
            </div>
            {hasFilters && (
              <Link
                href="/manager/history"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                ล้างตัวกรอง
              </Link>
            )}
          </div>
          <form method="GET" className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_165px_165px_155px_auto]">
            <label className="relative">
              <span className="sr-only">ค้นหา</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="ค้นหาเครื่องจักร ทรัพยากร หรือเลขอ้างอิง"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/60"
              />
            </label>
            <label>
              <span className="sr-only">ตั้งแต่วันที่</span>
              <input
                type="date"
                name="from"
                defaultValue={params.from ?? ""}
                max={params.to || undefined}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/60"
              />
            </label>
            <label>
              <span className="sr-only">ถึงวันที่</span>
              <input
                type="date"
                name="to"
                defaultValue={params.to ?? ""}
                min={params.from || undefined}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/60"
              />
            </label>
            <label>
              <span className="sr-only">แหล่งข้อมูล</span>
              <select
                name="source"
                defaultValue={params.source ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/60"
              >
                <option value="">ทุกแหล่งข้อมูล</option>
                <option value="MANUAL">Manual</option>
                <option value="QR">QR</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:translate-y-0"
            >
              <Filter className="h-4 w-4" />
              กรองข้อมูล
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">รายการบันทึก</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {data.total > 0
                  ? `กำลังแสดง ${firstRecord.toLocaleString("th-TH")}–${lastRecord.toLocaleString("th-TH")} จาก ${data.total.toLocaleString("th-TH")} รายการ`
                  : "ยังไม่มีข้อมูลตามเงื่อนไขที่เลือก"}
              </p>
            </div>
            {hasFilters && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                <Filter className="h-3 w-3" />
                กำลังใช้ตัวกรอง
              </span>
            )}
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
                  <th className="px-5 py-3.5">วันเวลา</th>
                  <th className="px-5 py-3.5">เครื่องจักร / ตำแหน่ง</th>
                  <th className="px-5 py-3.5">ทรัพยากร</th>
                  <th className="px-5 py-3.5 text-right">ปริมาณ</th>
                  <th className="px-5 py-3.5">แหล่งข้อมูล</th>
                  <th className="px-5 py-3.5">สถานะ</th>
                  <th className="px-5 py-3.5">เลขอ้างอิง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16">
                      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                          <Search className="h-5 w-5" />
                        </div>
                        <strong className="text-sm text-slate-700">ไม่พบรายการบันทึก</strong>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          ลองเปลี่ยนคำค้นหา ช่วงวันที่ หรือแหล่งข้อมูล
                        </p>
                        {hasFilters && (
                          <Link
                            href="/manager/history"
                            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                          >
                            ล้างตัวกรองทั้งหมด
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.records.map((record) => (
                    <tr key={record.id} className="group transition-colors hover:bg-emerald-50/30">
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="text-sm font-bold tabular-nums text-slate-800">{formatDate(record.usageAt)}</div>
                        <div className="mt-1 text-xs font-medium tabular-nums text-slate-400">{formatTime(record.usageAt)} น.</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[240px] font-bold text-slate-900">{record.machineName}</div>
                        <div className="mt-1 max-w-[260px] truncate text-xs text-slate-500" title={`${record.departmentName} · ${record.buildingName}`}>
                          {record.departmentName} · {record.buildingName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{record.resourceName}</div>
                        <div className="mt-1 text-[11px] font-semibold tracking-wide text-slate-400">{record.resourceCode}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="text-base font-extrabold tabular-nums text-slate-950">{formatNumber(record.quantity)}</span>
                        <span className="ml-1.5 text-xs font-medium text-slate-500">{record.unit}</span>
                      </td>
                      <td className="px-5 py-4">
                        <SourceBadge source={record.sourceType} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={record.processingStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="block max-w-[220px] truncate font-mono text-[11px] text-slate-500" title={record.reference}>
                          {record.reference}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs font-medium text-slate-500">
              หน้า <strong className="text-slate-800">{data.page.toLocaleString("th-TH")}</strong> จาก{" "}
              <strong className="text-slate-800">{data.totalPages.toLocaleString("th-TH")}</strong> · {data.pageSize} รายการต่อหน้า
            </p>
            <nav className="flex items-center gap-1.5" aria-label="เปลี่ยนหน้าประวัติ">
              {data.page > 1 ? (
                <Link
                  href={paramsHref(params, data.page - 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  ก่อนหน้า
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-xl border border-slate-100 bg-white px-3 text-xs font-bold text-slate-300">
                  <ChevronLeft className="h-4 w-4" />
                  ก่อนหน้า
                </span>
              )}
              {visiblePages.map((page) => (
                <Link
                  key={page}
                  href={paramsHref(params, page)}
                  aria-current={page === data.page ? "page" : undefined}
                  className={`grid h-9 min-w-9 place-items-center rounded-xl px-2 text-xs font-extrabold transition ${
                    page === data.page
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {page.toLocaleString("th-TH")}
                </Link>
              ))}
              {data.page < data.totalPages ? (
                <Link
                  href={paramsHref(params, data.page + 1)}
                  className="inline-flex h-9 items-center gap-1 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-300">
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          </footer>
        </section>
      </div>
    </main>
  );
}
