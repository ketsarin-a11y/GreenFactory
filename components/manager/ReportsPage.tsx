"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Zap,
  Droplet,
  Trash2,
  Cloud,
  LayoutGrid,
  BarChart3,
  Gauge,
  Search,
  RotateCcw,
  Download,
  FileText,
  FileSpreadsheet,
  Lightbulb,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

/**
 * components/manager/ReportsPage.tsx
 * ---------------------------------------
 * "ส่งออกรายงานด่วน" ทำงานได้จริง — กดแล้วดาวน์โหลด CSV จริงจากข้อมูลจริง
 * (ยกเว้นของเสีย/KPI ที่ปิดไว้เพราะไม่มีข้อมูลจริงให้ส่งออก)
 *
 * "รายงานของฉัน" (ประวัติรายงานที่เคยสร้าง) เป็น MOCK ทั้งหมด — ระบบยังไม่มี
 * ตารางเก็บประวัติการ export หรือระบบไฟล์เก็บถาวร (ต้องมีตาราง
 * GeneratedReport + พื้นที่เก็บไฟล์จริงถึงจะทำได้จริง) และรองรับแค่ไฟล์ CSV
 * เท่านั้น — ยังไม่รองรับ PDF/Excel/PowerPoint ตามที่ mockup โชว์ไว้
 */

const PERIOD_PRESETS = [
  { key: "year", label: "ปีนี้", days: 365 },
  { key: "month", label: "เดือนนี้", days: 30 },
  { key: "7d", label: "7 วันล่าสุด", days: 7 },
  { key: "30d", label: "30 วันล่าสุด", days: 30 },
] as const;

const DATA_TYPES = [
  { key: "energy", label: "พลังงาน", icon: Zap, tone: "text-amber-500 bg-amber-50" },
  { key: "water", label: "น้ำ", icon: Droplet, tone: "text-sky-500 bg-sky-50" },
  { key: "waste", label: "ของเสีย", icon: Trash2, tone: "text-orange-500 bg-orange-50" },
  { key: "carbon", label: "Carbon", icon: Cloud, tone: "text-violet-500 bg-violet-50" },
  { key: "all", label: "ทั้งหมด", icon: LayoutGrid, tone: "text-slate-500 bg-slate-100" },
];

const MOCK_REPORT_HISTORY = [
  { name: "รายงานสรุปการใช้พลังงาน - มิถุนายน 2567", typeIcon: Zap, typeTone: "text-amber-500", type: "พลังงาน", range: "01/06/2567 - 30/06/2567", groupBy: "รายอาคาร", format: "PDF", createdAt: "26/06/2567 10:30" },
  { name: "รายงานการใช้น้ำรายสัปดาห์ - สัปดาห์ที่ 4", typeIcon: Droplet, typeTone: "text-sky-500", type: "น้ำ", range: "17/06/2567 - 23/06/2567", groupBy: "รายแผนก", format: "Excel", createdAt: "24/06/2567 15:45" },
  { name: "รายงานของเสียแยกประเภท - พฤษภาคม 2567", typeIcon: Trash2, typeTone: "text-orange-500", type: "ของเสีย", range: "01/05/2567 - 31/05/2567", groupBy: "ทั้งหมด", format: "PDF", createdAt: "01/06/2567 09:15" },
  { name: "รายงาน Carbon Footprint - ไตรมาส 2/2567", typeIcon: Cloud, typeTone: "text-violet-500", type: "Carbon", range: "01/04/2567 - 30/06/2567", groupBy: "รายอาคาร", format: "PowerPoint", createdAt: "25/06/2567 11:20" },
];

const FORMAT_ICON: Record<string, { icon: typeof FileText; color: string }> = {
  PDF: { icon: FileText, color: "text-red-500" },
  Excel: { icon: FileSpreadsheet, color: "text-emerald-600" },
  PowerPoint: { icon: FileText, color: "text-orange-500" },
  CSV: { icon: FileSpreadsheet, color: "text-slate-500" },
};

export default function ReportsPage({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [dataType, setDataType] = useState("all");
  const [search, setSearch] = useState("");

  function applyPreset(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    const params = new URLSearchParams({ from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) });
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateRange(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams({ from: nextFrom, to: nextTo });
    router.push(`${pathname}?${params.toString()}`);
  }

  const exportHref = (kind: "energy" | "water" | "all") => `/api/manager/export?type=${kind}&from=${dateFrom}&to=${dateTo}`;
  const carbonHref = `/api/manager/export/carbon?from=${dateFrom}&to=${dateTo}`;
  const summaryHref = `/api/manager/export/summary?from=${dateFrom}&to=${dateTo}`;

  const filteredHistory = MOCK_REPORT_HISTORY.filter((r) => !search.trim() || r.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      {/* ตัวกรอง */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">ช่วงเวลา</p>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_PRESETS.map((p) => (
                <button key={p.key} type="button" onClick={() => applyPreset(p.days)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  {p.label}
                </button>
              ))}
              <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">กำหนดเอง</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">วันที่เริ่มต้น</span>
              <input type="date" value={dateFrom} max={dateTo} onChange={(e) => updateRange(e.target.value, dateTo)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">วันที่สิ้นสุด</span>
              <input type="date" value={dateTo} min={dateFrom} onChange={(e) => updateRange(dateFrom, e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 outline-none" />
            </label>
          </div>
        </div>

        <p className="mb-2 text-xs font-medium text-slate-500">ประเภทข้อมูล</p>
        <div className="flex flex-wrap gap-2">
          {DATA_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setDataType(t.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-medium ${
                dataType === t.key ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.tone}`}>
                <t.icon size={16} />
              </span>
              {t.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => applyPreset(7)} className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
          <RotateCcw size={13} />
          ล้างตัวกรอง
        </button>
      </section>

      {/* ส่งออกรายงานด่วน */}
      <section>
        <h2 className="mb-1 text-sm font-semibold text-slate-800">ส่งออกรายงานด่วน</h2>
        <p className="mb-3 text-xs text-slate-400">
          เลือกแม่แบบรายงานสำเร็จรูปตามประเภทข้อมูลที่ต้องการ — ดาวน์โหลดเป็นไฟล์ CSV จริงจากข้อมูลของช่วงเวลาที่เลือกด้านบน
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <QuickReportCard icon={BarChart3} tone="bg-emerald-50 text-emerald-600" title="รายงานสรุปผู้บริหาร" desc="ภาพรวมทั้งหมดในหน้าเดียว" href={summaryHref} />
          <QuickReportCard icon={Zap} tone="bg-amber-50 text-amber-600" title="รายงานการใช้พลังงาน" desc="วิเคราะห์การใช้พลังงาน" href={exportHref("energy")} />
          <QuickReportCard icon={Droplet} tone="bg-sky-50 text-sky-600" title="รายงานการใช้น้ำ" desc="วิเคราะห์การใช้น้ำ" href={exportHref("water")} />
          <QuickReportCard icon={Trash2} tone="bg-orange-50 text-orange-600" title="รายงานของเสีย" desc="ยังไม่มีข้อมูลจริง" disabled disabledReason="ไม่มีตารางบันทึกของเสียจริงในระบบ" />
          <QuickReportCard icon={Cloud} tone="bg-violet-50 text-violet-600" title="รายงาน Carbon Footprint" desc="วิเคราะห์การปล่อยคาร์บอน" href={carbonHref} />
          <QuickReportCard icon={Gauge} tone="bg-teal-50 text-teal-600" title="รายงาน KPI" desc="ยังไม่มีข้อมูลจริง" disabled disabledReason="ไม่มีตารางเป้าหมาย KPI จริงในระบบ" />
        </div>
      </section>

      {/* รายงานของฉัน (mock) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">รายงานของฉัน</h2>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหารายงาน..." className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none" />
          </div>
        </div>
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          รายการนี้เป็นข้อมูลตัวอย่าง (mock) — ระบบยังไม่มีการบันทึกประวัติรายงานที่เคยสร้างจริง และยังไม่รองรับไฟล์ PDF/Excel/PowerPoint (ตอนนี้ export ได้แค่ CSV จากปุ่มด้านบน)
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">ชื่อรายงาน</th>
                <th className="px-3 py-2.5 font-medium">ประเภทข้อมูล</th>
                <th className="px-3 py-2.5 font-medium">ช่วงเวลา</th>
                <th className="px-3 py-2.5 font-medium">แยกตาม</th>
                <th className="px-3 py-2.5 font-medium">รูปแบบไฟล์</th>
                <th className="px-3 py-2.5 font-medium">สร้างเมื่อ</th>
                <th className="px-3 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((r) => {
                const FormatIcon = FORMAT_ICON[r.format]?.icon ?? FileText;
                return (
                  <tr key={r.name} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <r.typeIcon size={14} className={r.typeTone} />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{r.type}</td>
                    <td className="px-3 py-3 text-slate-500">{r.range}</td>
                    <td className="px-3 py-3 text-slate-500">{r.groupBy}</td>
                    <td className="px-3 py-3">
                      <span className={`flex items-center gap-1 ${FORMAT_ICON[r.format]?.color ?? "text-slate-500"}`}>
                        <FormatIcon size={14} />
                        {r.format}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{r.createdAt}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled
                          title="mock — ยังไม่มีไฟล์จริงให้ดาวน์โหลด"
                          className="flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-300"
                        >
                          <Download size={12} />
                          ดาวน์โหลด
                        </button>
                        <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">
                    ไม่พบรายงานที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FileText size={18} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">สรุปการส่งออกรายงาน</p>
            <p className="text-xs text-slate-400">mockup — ยังไม่มีระบบนับพื้นที่จัดเก็บไฟล์จริง</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[12.5%] rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 text-xs text-slate-400">1.25 GB จาก 10 GB (12.5%)</p>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Lightbulb size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-700">เคล็ดลับ</p>
            <p className="text-sm text-slate-500">เลือกช่วงเวลาและประเภทข้อมูลก่อน เพื่อให้ได้รายงานที่ตรงกับความต้องการมากที่สุด</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickReportCard({
  icon: Icon,
  tone,
  title,
  desc,
  href,
  disabled,
  disabledReason,
}: {
  icon: typeof Zap;
  tone: string;
  title: string;
  desc: string;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return (
      <div title={disabledReason} className="flex cursor-not-allowed flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-60">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={16} />
        </span>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    );
  }

  return (
    <a href={href} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={16} />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400">{desc}</p>
    </a>
  );
}