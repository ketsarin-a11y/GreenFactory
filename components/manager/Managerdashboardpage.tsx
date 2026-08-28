"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Zap,
  Droplet,
  Trash2,
  Cloud,
  Gauge,
  Wind,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  MapPin,
  Sprout,
} from "lucide-react";
import type { ManagerDashboardData } from "@/lib/manager queries";

/**
 * components/manager/ManagerDashboardPage.tsx
 * -----------------------------------------------
 * ข้อมูลจริงจาก Prisma (lib/manager-queries.ts): KPI พลังงาน/น้ำรวม + %
 * เปลี่ยนแปลง, กราฟแนวโน้มการใช้พลังงานรายวันแยกตามแผนก, สัดส่วนการใช้
 * ทรัพยากรแยกตามประเภท (resourceType จริง)
 *
 * ส่วนที่เหลือทั้งหมดเป็น MOCK เพราะไม่มี schema รองรับเลย โดยเฉพาะส่วนที่
 * เพิ่มเข้ามาใหม่รอบนี้ (หลายโรงงาน, แผนที่, Carbon Scope 1/2/3, KPI
 * ประสิทธิภาพต่อหน่วยผลิต) — ระบบตอนนี้มีแค่ระดับ "1 บริษัท = 1 โรงงาน"
 * ยังไม่มีแนวคิดหลายโรงงานย่อยเลย ดูสรุปเต็มใน MANAGER_DASHBOARD_NOTES.md
 */

const DEPT_COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
const RESOURCE_COLORS: Record<string, string> = {
  ELECTRICITY: "#059669",
  DIESEL: "#0ea5e9",
  GAS: "#f59e0b",
  STEAM: "#8b5cf6",
};
const OTHER_COLOR = "#94a3b8";

// ---------- MOCK DATA (ไม่มี schema รองรับ) ----------
const MOCK_WASTE = { total: 9158, unit: "kg", changePct: 6.4 };
const MOCK_CARBON = { total: 275.25, unit: "tCO₂e", changePct: -12.3 };
const MOCK_OEE = { total: 85, unit: "%", changePct: -3.2 };
const MOCK_AQI = { label: "ดีมาก", value: 18 };

const MOCK_FACILITIES = [
  { name: "โรงงานเชียงใหม่", oee: 87, status: "ดีมาก" },
  { name: "โรงงานอยุธยา", oee: 82, status: "ดี" },
  { name: "โรงงานชลบุรี", oee: 78, status: "ปานกลาง" },
  { name: "โรงงานสมุทรปราการ", oee: 85, status: "ดี" },
  { name: "โรงงานสงขลา", oee: 88, status: "ดีมาก" },
];
const MOCK_FACILITY_STATUS_COUNTS = [
  { label: "ดีมาก", count: 2, color: "#059669" },
  { label: "ดี", count: 2, color: "#22c55e" },
  { label: "ปานกลาง", count: 1, color: "#f59e0b" },
  { label: "ต้องปรับปรุง", count: 0, color: "#ef4444" },
];

const MOCK_SCOPE_CARBON = [
  { label: "Scope 1", value: 128.45, percent: 46.7, color: "#059669" },
  { label: "Scope 2", value: 96.3, percent: 35.0, color: "#0ea5e9" },
  { label: "Scope 3", value: 50.5, percent: 18.3, color: "#8b5cf6" },
];

const MOCK_KPI_RATIOS = [
  { icon: Zap, label: "อัตราการใช้พลังงานต่อหน่วยผลผลิต", sub: "เป้าหมาย", value: "1.26 kWh/unit", changePct: -6.3, progress: 87 },
  { icon: Droplet, label: "อัตราการใช้น้ำต่อหน่วยผลผลิต", sub: "เป้าหมาย", value: "0.36 m³/unit", changePct: 4.8, progress: 72 },
  { icon: Trash2, label: "อัตราการเกิดของเสียต่อหน่วยผลผลิต", sub: "เป้าหมาย", value: "0.18 kg/unit", changePct: 6.1, progress: 65 },
  { icon: Cloud, label: "อัตราการปล่อยคาร์บอนต่อหน่วยผลผลิต", sub: "เป้าหมาย", value: "0.56 kgCO₂e/unit", changePct: 9.2, progress: 82 },
];

const MOCK_ALERTS = [
  { icon: Zap, tone: "amber", title: "การใช้พลังงานสูงผิดปกติ", detail: "โรงงานชลบุรี - สายการผลิต 2", time: "10:15 น." },
  { icon: AlertTriangle, tone: "red", title: "ปริมาณของเสียเกินเป้าหมาย", detail: "โรงงานอยุธยา - ประเภท Plastic", time: "09:45 น." },
  { icon: Droplet, tone: "sky", title: "คุณภาพอากาศโรงงานอยุธยา", detail: "AQI สูงขึ้นเมื่อวาน", time: "09:30 น." },
  { icon: CheckCircle2, tone: "emerald", title: "รายงานประจำวันพร้อมส่ง", detail: "โรงงานสมุทรปราการ", time: "08:50 น." },
];

const MOCK_NEWS = [
  { date: "25 มิ.ย.", title: "กิจกรรมลดการใช้พลังงาน", desc: "ร่วมกันประหยัดพลังงานในโรงงาน" },
  { date: "20 มิ.ย.", title: "อบรมการจัดการของเสีย", desc: "เพิ่มประสิทธิภาพการจัดการของเสีย" },
  { date: "15 มิ.ย.", title: "ติดตั้งระบบ Solar Rooftop", desc: "ลดการใช้พลังงานจากแหล่งฟอสซิล" },
];
// ---------- จบ MOCK DATA ----------

interface ManagerDashboardPageProps {
  data: ManagerDashboardData;
  currentUserName: string;
  dateFrom: string;
  dateTo: string;
}

export default function ManagerDashboardPage({ data, dateFrom, dateTo }: ManagerDashboardPageProps) {
  const [trendGranularity, setTrendGranularity] = useState<"day" | "week" | "month">("day");

  const totalResourceValue = data.breakdown.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          ช่วงข้อมูล: {formatThaiDate(dateFrom)} - {formatThaiDate(dateTo)}
          {data.lastUpdatedAt && <> · อัปเดตข้อมูลล่าสุด {formatThaiDateTime(data.lastUpdatedAt)}</>}
        </span>
        <button type="button" onClick={() => window.location.reload()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
          <RefreshCw size={12} />
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Zap} tone="emerald" label="การใช้พลังงานรวม" value={data.energy.total.toLocaleString("th-TH")} unit={data.energy.unit} changePct={data.energy.changePct} isReal />
        <KpiCard icon={Droplet} tone="sky" label="การใช้น้ำรวม" value={data.water.total.toLocaleString("th-TH")} unit={data.water.unit} changePct={data.water.changePct} isReal />
        <KpiCard icon={Trash2} tone="orange" label="ของเสียรวม" value={MOCK_WASTE.total.toLocaleString("th-TH")} unit={MOCK_WASTE.unit} changePct={MOCK_WASTE.changePct} />
        <KpiCard icon={Cloud} tone="violet" label="Carbon Footprint" value={MOCK_CARBON.total.toLocaleString("th-TH")} unit={MOCK_CARBON.unit} changePct={MOCK_CARBON.changePct} />
        <KpiCard icon={Gauge} tone="slate" label="ประสิทธิภาพการผลิต (OEE)" value={String(MOCK_OEE.total)} unit={MOCK_OEE.unit} changePct={MOCK_OEE.changePct} />
        <KpiCard icon={Wind} tone="teal" label="คุณภาพอากาศ" value={MOCK_AQI.label} unit={`AQI ${MOCK_AQI.value}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1.4fr_1fr]">
        {/* ภาพรวมโรงงานทั้งหมด (mock — ระบบยังไม่มีแนวคิดหลายโรงงาน) */}
        <MockCard title="ภาพรวมโรงงานทั้งหมด">
          <div className="relative mb-3 flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50">
            <div className="text-center text-slate-400">
              <MapPin size={26} className="mx-auto mb-1 text-emerald-400" />
              <p className="text-xs">แผนที่โรงงาน (mockup)</p>
              <p className="text-[10px]">ระบบยังไม่มีตารางโรงงาน/พิกัดจริง</p>
            </div>
          </div>
          <ul className="mb-3 flex flex-col divide-y divide-slate-100">
            {MOCK_FACILITIES.map((f) => (
              <li key={f.name} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-slate-600">{f.name}</span>
                <span className="font-medium text-slate-700">OEE {f.oee}%</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            {MOCK_FACILITY_STATUS_COUNTS.map((s) => (
              <span key={s.label} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label} {s.count} โรงงาน
              </span>
            ))}
          </div>
        </MockCard>

        {/* แนวโน้มการใช้พลังงาน (real — แยกตามแผนก) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              แนวโน้มการใช้พลังงาน (แยกตามแผนก)
              <Info size={13} className="text-slate-300" />
            </h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setTrendGranularity(g)}
                  title={g !== "day" ? "ตอนนี้ยังรวมข้อมูลแบบรายวันเท่านั้น" : undefined}
                  className={`rounded-md px-2.5 py-1 font-medium ${trendGranularity === g ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}
                >
                  {g === "day" ? "รายวัน" : g === "week" ? "รายสัปดาห์" : "รายเดือน"}
                </button>
              ))}
            </div>
          </div>

          {data.trend.length === 0 ? (
            <p className="flex h-56 items-center justify-center text-xs text-slate-400">ยังไม่มีข้อมูลการใช้ไฟฟ้าในช่วงที่เลือก</p>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={40} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                {data.departments.map((dept, i) => (
                  <Line key={dept} type="monotone" dataKey={dept} stroke={DEPT_COLORS[i % DEPT_COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          {data.departments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {data.departments.map((dept, i) => (
                <span key={dept} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                  {dept}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-300">
            หมายเหตุ: เส้นแนวโน้มแบบเทียบ % ของ น้ำ/ของเสีย/Carbon (ตาม mockup) ยังไม่ทำ เพราะมีแค่ข้อมูลพลังงานที่บันทึกละเอียดพอมาสร้างกราฟรายวันได้จริง
          </p>
        </section>

        {/* สัดส่วนการใช้ทรัพยากรแยกตามประเภท (real — resourceType จริง) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            สัดส่วนการใช้ทรัพยากรแยกตามประเภท
            <Info size={13} className="text-slate-300" />
          </h2>

          {data.breakdown.length === 0 ? (
            <p className="flex h-40 items-center justify-center text-xs text-slate-400">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={data.breakdown} dataKey="value" nameKey="department" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {data.breakdown.map((entry, i) => (
                      <Cell key={entry.department} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5 text-xs">
                {data.breakdown.map((item, i) => (
                  <li key={item.department} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                      {item.department}
                    </span>
                    <span className="font-medium text-slate-700">{item.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 border-t border-slate-100 pt-2 text-right text-xs text-slate-400">
            รวมทั้งหมด <span className="font-semibold text-slate-700">{data.energy.total.toLocaleString("th-TH")} kWh</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-300">
            หมายเหตุ: mockup แยกตาม "ประเภทพลังงาน" (ไฟฟ้า/น้ำมัน/ก๊าซ/ไอน้ำ) แล้วแปลงทุกอย่างเป็น kWh เทียบเท่า — ระบบนี้ยังไม่มีค่าคงที่แปลงหน่วยพลังงาน จึงแยกตามแผนกที่ใช้ไฟฟ้าจริงแทน เพื่อไม่ให้ตัวเลขที่โชว์คลาดเคลื่อน
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr_1fr]">
        {/* การปล่อยคาร์บอนแยกตาม Scope (mock) */}
        <MockCard title="การปล่อยคาร์บอนแยกตาม Scope">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={MOCK_SCOPE_CARBON} dataKey="value" nameKey="label" innerRadius={35} outerRadius={58} paddingAngle={2}>
                  {MOCK_SCOPE_CARBON.map((s) => (
                    <Cell key={s.label} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-1.5 text-xs">
              {MOCK_SCOPE_CARBON.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-medium text-slate-700">
                    {s.value} tCO₂e ({s.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </MockCard>

        {/* KPI สำคัญ (mock) */}
        <MockCard title="KPI สำคัญ">
          <ul className="flex flex-col gap-4">
            {MOCK_KPI_RATIOS.map((k) => (
              <li key={k.label}>
                <div className="mb-1 flex items-start justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <k.icon size={13} className="shrink-0 text-slate-400" />
                    {k.label}
                  </span>
                  <span className={`shrink-0 flex items-center gap-1 ${k.changePct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {k.changePct <= 0 ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                    {Math.abs(k.changePct)}%
                  </span>
                </div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{k.value}</span>
                  <span>{k.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, k.progress)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </MockCard>

        {/* การแจ้งเตือนสำคัญ (mock) */}
        <MockCard title="การแจ้งเตือนสำคัญ">
          <ul className="flex flex-col divide-y divide-slate-100">
            {MOCK_ALERTS.map((a) => (
              <li key={a.title} className="flex items-start gap-3 py-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses(a.tone)}`}>
                  <a.icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="truncate text-xs text-slate-400">{a.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-300">{a.time}</span>
              </li>
            ))}
          </ul>
        </MockCard>
      </div>

      {/* ข่าวสารและกิจกรรม (mock) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">ข่าวสารและกิจกรรม</h2>
          <span className="text-xs text-slate-300">mockup — ยังไม่มีระบบจัดการเนื้อหาจริง</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MOCK_NEWS.map((n) => (
            <div key={n.title} className="overflow-hidden rounded-xl border border-slate-100">
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 text-slate-300">
                <Sprout size={22} />
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-400">{n.date}</p>
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="truncate text-xs text-slate-400">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  unit,
  changePct,
  isReal,
}: {
  icon: typeof Zap;
  tone: string;
  label: string;
  value: string;
  unit: string;
  changePct?: number;
  isReal?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses(tone)}`}>
          <Icon size={17} />
        </span>
        {!isReal && (
          <span title="ยังไม่มี schema รองรับ ใช้ข้อมูลตัวอย่าง" className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">
            mock
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">
        {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
      {typeof changePct === "number" && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${changePct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {changePct <= 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {Math.abs(changePct)}% จากช่วงก่อนหน้า
        </p>
      )}
    </div>
  );
}

function MockCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className="text-xs text-slate-300">mockup</span>
      </div>
      {children}
    </section>
  );
}

function toneClasses(tone: string) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    orange: "bg-orange-50 text-orange-600",
    violet: "bg-violet-50 text-violet-600",
    slate: "bg-slate-100 text-slate-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return map[tone] ?? map.slate;
}

function formatThaiDate(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

function formatThaiDateTime(iso: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}