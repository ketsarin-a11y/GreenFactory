
"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ReportFormat = "XLSX" | "CSV" | "PDF" | "JSON";

type CreateReportResponse = {
  success?: boolean;
  reportId?: string;
  reportName?: string;
  rowCount?: number;
  downloadUrl?: string;
  format?: ReportFormat;
  message?: string;
};

const FORMATS: Array<{
  value: ReportFormat;
  label: string;
  description: string;
}> = [
  {
    value: "XLSX",
    label: "Excel (.xlsx)",
    description: "เหมาะกับการวิเคราะห์และทำตารางต่อ",
  },
  {
    value: "PDF",
    label: "PDF (.pdf)",
    description: "รายงานพร้อมอ่านและนำเสนอ",
  },
  {
    value: "CSV",
    label: "CSV (.csv)",
    description: "ไฟล์ข้อมูลมาตรฐานสำหรับนำไปใช้งานต่อ",
  },
  {
    value: "JSON",
    label: "JSON (.json)",
    description: "เหมาะกับการส่งข้อมูลต่อให้ระบบอื่น",
  },
];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 30);

  return {
    from: toDateInputValue(start),
    to: toDateInputValue(today),
  };
}

export default function ManagerReportCreator() {
  const router = useRouter();
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [format, setFormat] = useState<ReportFormat>("XLSX");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reportName: string;
    rowCount: number;
    downloadUrl: string;
    format: ReportFormat;
  } | null>(null);

  const invalidRange = Boolean(from && to && from > to);

  async function createReport(event: FormEvent) {
    event.preventDefault();

    if (!from || !to || invalidRange || creating) return;

    setCreating(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/manager/reports/resource-usage",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to,
            format,
          }),
        },
      );

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Report API ตอบกลับผิดรูปแบบ (${response.status})`,
        );
      }

      const data = (await response.json()) as CreateReportResponse;

      if (!response.ok) {
        throw new Error(data.message || "สร้างรายงานไม่สำเร็จ");
      }

      if (!data.downloadUrl || !data.reportName) {
        throw new Error("API ไม่ได้ส่งข้อมูลรายงานกลับมาครบ");
      }

      setResult({
        reportName: data.reportName,
        rowCount: data.rowCount ?? 0,
        downloadUrl: data.downloadUrl,
        format: data.format ?? format,
      });

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "สร้างรายงานไม่สำเร็จ",
      );
    } finally {
      setCreating(false);
    }
  }

  function downloadReport() {
    if (!result?.downloadUrl) return;

    const anchor = document.createElement("a");
    anchor.href = result.downloadUrl;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      router.refresh();
    }, 700);
  }

  const selectedFormat = FORMATS.find((item) => item.value === format)!;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <FileSpreadsheet className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">
            สร้าง Resource Usage Report
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            เลือกช่วงเวลาและรูปแบบไฟล์
          </p>
        </div>
      </div>

      <form onSubmit={createReport} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            รูปแบบไฟล์
          </label>

          <div className="relative">
            <select
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as ReportFormat)
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
            >
              {FORMATS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
            {selectedFormat.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              วันที่เริ่มต้น
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              วันที่สิ้นสุด
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>
        </div>

        {invalidRange ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={creating || !from || !to || invalidRange}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              {format === "JSON" ? (
                <FileJson className="h-4 w-4" />
              ) : format === "XLSX" ? (
                <FileSpreadsheet className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              สร้าง {format}
            </>
          )}
        </button>
      </form>

      {result ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-950">
                สร้างรายงานสำเร็จ
              </p>

              <p className="mt-1 truncate text-xs text-emerald-800/80">
                {result.reportName}
              </p>

              <p className="mt-1 text-xs text-emerald-800/70">
                {result.rowCount.toLocaleString("th-TH")} รายการ ·{" "}
                {result.format}
              </p>

              <button
                type="button"
                onClick={downloadReport}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-100"
              >
                <Download className="h-3.5 w-3.5" />
                ดาวน์โหลด {result.format}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
