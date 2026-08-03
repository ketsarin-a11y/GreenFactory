"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";

export interface MockTrendPoint {
  dateLabel: string;
  value: number;
}

export interface MockBreakdownItem {
  label: string;
  value: number;
  unit: string;
  color: string;
}

interface MockAnalyticsPageProps {
  icon: React.ReactNode;
  kpiLabel: string;
  kpiValue: string;
  kpiUnit: string;
  changePct: number;
  trendLabel: string;
  trendColor: string;
  trendData: MockTrendPoint[];
  breakdownTitle: string;
  breakdown: MockBreakdownItem[];
  missingSchemaNote: string;
}

/**
 * components/manager/MockAnalyticsPage.tsx
 * --------------------------------------------
 * ใช้ร่วมกันสำหรับหน้า "ของเสีย", "ประสิทธิภาพการผลิต (OEE)", "คุณภาพอากาศ"
 * — ข้อมูลทั้งหมดในนี้เป็น MOCK เพราะไม่มีตารางรองรับข้อมูลจริงเลย (ไม่มี
 * ตาราง WasteLog, ProductionOutput, หรือ AirQualitySensor ใน schema)
 * ทุกหน้าที่ใช้ component นี้จะมีป้าย "ข้อมูลตัวอย่าง" กำกับไว้ชัดเจน
 * ไม่ปนกับข้อมูลจริงที่หน้าอื่นๆ ใช้ (ดู MANAGER_DASHBOARD_NOTES.md)
 */
export default function MockAnalyticsPage({
  icon,
  kpiLabel,
  kpiValue,
  kpiUnit,
  changePct,
  trendLabel,
  trendColor,
  trendData,
  breakdownTitle,
  breakdown,
  missingSchemaNote,
}: MockAnalyticsPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>หน้านี้เป็นข้อมูลตัวอย่าง (mock)</strong> — {missingSchemaNote}
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">{icon}</span>
        <div>
          <p className="text-sm text-slate-400">{kpiLabel}</p>
          <p className="text-2xl font-bold text-slate-900">
            {kpiValue} <span className="text-base font-normal text-slate-400">{kpiUnit}</span>
          </p>
          <p className={`flex items-center gap-1 text-sm ${changePct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {changePct <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {Math.abs(changePct)}% จากช่วงก่อนหน้า
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">{trendLabel}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="mockTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={40} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke={trendColor} strokeWidth={2} fill="url(#mockTrendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">{breakdownTitle}</h2>
        <ul className="flex flex-col divide-y divide-slate-100">
          {breakdown.map((item) => (
            <li key={item.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-medium text-slate-800">
                {item.value.toLocaleString("th-TH")} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}