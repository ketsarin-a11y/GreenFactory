"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCcw,
  Download,
  Eye,
  ClipboardList,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Paperclip,
} from "lucide-react";
import { RESOURCE_META } from "@/lib/resource-meta";
import type { HistoryRecordItem, HistoryFilterOptions } from "@/lib/History queries";

/**
 * components/operator/HistoryPage.tsx
 * --------------------------------------
 * หน้า "ประวัติการบันทึก" ไฟล์เดียว (ไม่มีโฟลเดอร์ย่อย) — กรอง/แบ่งหน้าฝั่ง client
 * จากข้อมูลจริงที่ server ดึงมาให้ทั้งหมดแล้ว (lib/history-queries.ts)
 *
 * หมายเหตุ: มีแค่สถานะ "บันทึกแล้ว" กับ "รออนุมัติ" (ไม่มี "ปฏิเสธ" และไม่มีการ์ด
 * "ปริมาณรวมทั้งหมด" แบบ mockup เพราะหน่วยวัดต่างกัน (kWh/m³/kg) รวมกันตรงๆ ไม่ได้
 * จริง — ดูรายละเอียดเพิ่มท้ายไฟล์ lib/history-queries.ts)
 */

const ALL = "ทั้งหมด";
const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface HistoryPageProps {
  records: HistoryRecordItem[];
  filterOptions: HistoryFilterOptions;
  currentUserId: number;
}

function defaultStartDate() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function defaultEndDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function HistoryPage({ records, filterOptions, currentUserId }: HistoryPageProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [resourceType, setResourceType] = useState(ALL);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [productionLine, setProductionLine] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [unit, setUnit] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [recordedById, setRecordedById] = useState<string>(ALL);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return records.filter((rec) => {
      const recDate = rec.recordedAt.slice(0, 10);
      if (startDate && recDate < startDate) return false;
      if (endDate && recDate > endDate) return false;
      if (resourceType !== ALL && rec.resourceType !== resourceType) return false;
      if (productionLine !== ALL && rec.productionLine !== productionLine) return false;
      if (department !== ALL && rec.department !== department) return false;
      if (unit !== ALL && rec.unit !== unit) return false;
      if (status !== ALL && rec.status !== status) return false;
      if (recordedById !== ALL && String(rec.recordedById) !== recordedById) return false;
      if (pendingOnly && rec.status !== "PENDING") return false;
      if (equipmentSearch.trim()) {
        const term = equipmentSearch.trim().toLowerCase();
        const matches =
          rec.equipmentName.toLowerCase().includes(term) ||
          (rec.equipmentCode ?? "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, startDate, endDate, resourceType, productionLine, department, unit, status, recordedById, pendingOnly, equipmentSearch]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const recorded = filtered.filter((r) => r.status === "RECORDED").length;
    const pending = filtered.filter((r) => r.status === "PENDING").length;
    return { total, recorded, pending };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setStartDate(defaultStartDate());
    setEndDate(defaultEndDate());
    setResourceType(ALL);
    setEquipmentSearch("");
    setProductionLine(ALL);
    setDepartment(ALL);
    setUnit(ALL);
    setStatus(ALL);
    setRecordedById(ALL);
    setPendingOnly(false);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ตัวกรองการค้นหา */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="mb-4 flex w-full items-center justify-between text-left"
        >
          <h2 className="text-base font-semibold text-slate-800">ตัวกรองการค้นหา</h2>
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            {showFilters ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {showFilters && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <FilterField label="ช่วงวันที่">
                <div className="flex items-center gap-2">
                  <DateInput value={startDate} onChange={setStartDate} />
                  <span className="text-xs text-slate-400">ถึง</span>
                  <DateInput value={endDate} onChange={setEndDate} />
                </div>
              </FilterField>

              <FilterField label="ประเภททรัพยากร">
                <Select
                  value={resourceType}
                  onChange={(v) => { setResourceType(v); setPage(1); }}
                  options={[ALL, ...Object.keys(RESOURCE_META)]}
                  renderLabel={(v) => (v === ALL ? ALL : RESOURCE_META[v]?.label ?? v)}
                />
              </FilterField>

              <FilterField label="เครื่องจักร / จุดตรวจ">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={equipmentSearch}
                    onChange={(e) => { setEquipmentSearch(e.target.value); setPage(1); }}
                    placeholder="ค้นหาเครื่องจักร / จุดตรวจ"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-emerald-400"
                  />
                </div>
              </FilterField>

              <FilterField label="ไลน์การผลิต">
                <Select value={productionLine} onChange={(v) => { setProductionLine(v); setPage(1); }} options={[ALL, ...filterOptions.productionLines]} />
              </FilterField>

              <FilterField label="แผนก">
                <Select value={department} onChange={(v) => { setDepartment(v); setPage(1); }} options={[ALL, ...filterOptions.departments]} />
              </FilterField>

              <FilterField label="หน่วยวัด">
                <Select value={unit} onChange={(v) => { setUnit(v); setPage(1); }} options={[ALL, ...filterOptions.units]} />
              </FilterField>

              <FilterField label="สถานะการบันทึก">
                <Select
                  value={status}
                  onChange={(v) => { setStatus(v); setPage(1); }}
                  options={[ALL, "RECORDED", "PENDING"]}
                  renderLabel={(v) => (v === ALL ? ALL : v === "RECORDED" ? "บันทึกแล้ว" : "รออนุมัติ")}
                />
              </FilterField>

              <FilterField label="ผู้บันทึก">
                <Select
                  value={recordedById}
                  onChange={(v) => { setRecordedById(v); setPage(1); }}
                  options={[ALL, ...filterOptions.recorders.map((r) => String(r.id))]}
                  renderLabel={(v) => {
                    if (v === ALL) return ALL;
                    const rec = filterOptions.recorders.find((r) => String(r.id) === v);
                    return rec ? `${rec.name}${rec.id === currentUserId ? " (คุณ)" : ""}` : v;
                  }}
                />
              </FilterField>
            </div>

            <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => { setPendingOnly(e.target.checked); setPage(1); }}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              แสดงเฉพาะรายการที่รออนุมัติ
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={15} />
                ล้างตัวกรอง
              </button>
              <button
                type="button"
                onClick={() => setPage(1)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Search size={15} />
                ค้นหา
              </button>
            </div>
          </>
        )}
      </section>

      {/* สรุปผลการบันทึก */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-800">สรุปผลการบันทึก (ตามตัวกรอง)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard icon={ClipboardList} tone="sky" label="รายการทั้งหมด" value={summary.total} />
          <SummaryCard icon={CheckCircle2} tone="emerald" label="บันทึกแล้ว" value={summary.recorded} />
          <SummaryCard icon={Clock} tone="amber" label="รออนุมัติ" value={summary.pending} />
        </div>
      </section>

      {/* ตารางรายการ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">รายการบันทึกข้อมูล</h2>
          <button
            type="button"
            onClick={() => alert("ฟีเจอร์ส่งออกข้อมูล (CSV/Excel) จะเปิดใช้งานในเวอร์ชันถัดไป")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download size={15} />
            ส่งออกข้อมูล
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">วันที่และเวลา</th>
                <th className="px-3 py-2.5 font-medium">เครื่องจักร/จุดตรวจ</th>
                <th className="px-3 py-2.5 font-medium">ประเภทเครื่องจักร</th>
                <th className="px-3 py-2.5 font-medium">ไลน์การผลิต</th>
                <th className="px-3 py-2.5 font-medium">ประเภททรัพยากร</th>
                <th className="px-3 py-2.5 font-medium">หน่วยวัด</th>
                <th className="px-3 py-2.5 font-medium text-right">ปริมาณที่ใช้</th>
                <th className="px-3 py-2.5 font-medium">ผู้บันทึก</th>
                <th className="px-3 py-2.5 font-medium">สถานะ</th>
                <th className="px-3 py-2.5 font-medium">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((rec) => (
                <tr key={rec.recordId} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-500">{formatDateTime(rec.recordedAt)}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">{rec.equipmentName}</p>
                    <p className="text-xs text-slate-400">{rec.equipmentCode ?? "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{rec.equipmentType ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{rec.productionLine ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-500">{rec.resourceLabel}</td>
                  <td className="px-3 py-3 text-slate-500">{rec.unit}</td>
                  <td className="px-3 py-3 text-right font-medium text-slate-800">{rec.value.toLocaleString("th-TH")}</td>
                  <td className="px-3 py-3 text-slate-500">{rec.recordedByName}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const noteText = rec.note ? `\n\nหมายเหตุ: ${rec.note}` : "";
                          alert(`รายละเอียดบันทึก #${rec.recordId}${noteText}`);
                          if (rec.attachmentUrl) {
                            window.open(rec.attachmentUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Eye size={16} />
                      </button>
                      {rec.attachmentUrl && (
                        <span title="มีไฟล์แนบ" className="text-slate-300">
                          <Paperclip size={13} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-sm text-slate-400">
                    ไม่พบรายการที่ตรงกับตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            แสดง {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} จาก{" "}
            {filtered.length} รายการ
          </p>

          <div className="flex items-center gap-1.5">
            <PageButton onClick={() => setPage(1)} disabled={page === 1}>
              <ChevronsLeft size={15} />
            </PageButton>
            <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={15} />
            </PageButton>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-slate-300">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium ${p === page ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {p}
                </button>
              ),
            )}
            <PageButton onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={15} />
            </PageButton>
            <PageButton onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              <ChevronsRight size={15} />
            </PageButton>
          </div>

          <label className="flex items-center gap-2">
            แสดง
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            รายการ/หน้า
          </label>
        </div>
      </section>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  renderLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderLabel?: (v: string) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-emerald-400"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {renderLabel ? renderLabel(o) : o}
        </option>
      ))}
    </select>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <Calendar size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-2 text-xs text-slate-600 outline-none focus:border-emerald-400"
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, tone, label, value }: { icon: typeof ClipboardList; tone: "sky" | "emerald" | "amber"; label: string; value: number }) {
  const TONE = {
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xl font-bold text-slate-800">{value.toLocaleString("th-TH")}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isRecorded = status === "RECORDED";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isRecorded ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
      }`}
    >
      {isRecorded ? "บันทึกแล้ว" : "รออนุมัติ"}
    </span>
  );
}

function PageButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}