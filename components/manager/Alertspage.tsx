"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Zap,
  Wind,
  Cloud,
  Droplet,
  CheckCircle2,
  Trash2,
  Info,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Building2,
  Calendar,
  Clock,
  Settings2,
  CheckSquare,
  ArrowRight,
  Wrench,
  Gauge,
} from "lucide-react";

/**
 * components/manager/AlertsPage.tsx
 * -------------------------------------
 * หน้านี้ทั้งหมดเป็น MOCK DATA เพราะระบบยังไม่มีตาราง Alert/Notification
 * และไม่มีตารางเกณฑ์ (threshold) ที่ใช้เทียบเพื่อสร้างการแจ้งเตือนอัตโนมัติ
 * เลยแม้แต่ตัวเดียว — แต่การโต้ตอบ (เลือกดู, กรองแท็บ, ทำเครื่องหมายว่าอ่าน
 * แล้ว/เปลี่ยนสถานะดำเนินการ) ทำงานได้จริงในหน้าเว็บ (state บนเบราว์เซอร์
 * เท่านั้น ไม่บันทึกลง DB — รีเฟรชหน้าจะรีเซ็ตกลับเป็นค่าเริ่มต้น)
 *
 * ถ้าต้องการให้เป็นของจริง ต้องมีอย่างน้อย:
 *  - ตาราง Alert (title, description, severity, category, read, actionStatus, ...)
 *  - ตาราง Threshold/KPITarget ต่อประเภททรัพยากร เพื่อเทียบว่า "เกินเกณฑ์" จริง
 *  - Background job/cron ที่ตรวจข้อมูลแล้วสร้างแจ้งเตือนอัตโนมัติ
 */

type Severity = "สำคัญ" | "เตือน" | "ข้อมูล";
type ActionStatus = "ยังไม่ดำเนินการ" | "กำลังดำเนินการ" | "ดำเนินการแล้ว";

interface AlertDetail {
  currentValue: number;
  unit: string;
  thresholdValue: number;
  overValue: number;
  overPercent: number;
  building: string;
  buildingType: string;
  trend: { dateLabel: string; actual: number; threshold: number }[];
  recommendations: string[];
  analysisHref: string;
  buildingHref: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  icon: typeof Zap;
  iconTone: string;
  severity: Severity;
  location: string;
  date: string;
  time: string;
  read: boolean;
  actionStatus: ActionStatus;
  detail?: AlertDetail;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "a1",
    title: "การใช้พลังงานเกินเกณฑ์",
    description: "การใช้พลังงานของอาคาร A เกินเกณฑ์ 110% เมื่อเวลา 09:30 น.",
    icon: Zap,
    iconTone: "bg-red-50 text-red-600",
    severity: "สำคัญ",
    location: "อาคาร A",
    date: "26 มิ.ย. 2567",
    time: "09:30 น.",
    read: false,
    actionStatus: "ยังไม่ดำเนินการ",
    detail: {
      currentValue: 125450,
      unit: "kWh",
      thresholdValue: 114000,
      overValue: 11450,
      overPercent: 110,
      building: "อาคาร A",
      buildingType: "Production Building",
      trend: [
        { dateLabel: "20 มิ.ย.", actual: 92000, threshold: 114000 },
        { dateLabel: "21 มิ.ย.", actual: 96000, threshold: 114000 },
        { dateLabel: "22 มิ.ย.", actual: 94000, threshold: 114000 },
        { dateLabel: "23 มิ.ย.", actual: 101000, threshold: 114000 },
        { dateLabel: "24 มิ.ย.", actual: 98000, threshold: 114000 },
        { dateLabel: "25 มิ.ย.", actual: 108000, threshold: 114000 },
        { dateLabel: "26 มิ.ย.", actual: 125450, threshold: 114000 },
      ],
      recommendations: [
        "ตรวจสอบการทำงานของเครื่องจักรหลัก",
        "ปิดอุปกรณ์ที่ไม่ได้ใช้งาน",
        "ตรวจสอบการรั่วไหลของอากาศเย็น",
        "พิจารณาปรับปรุงประสิทธิภาพเครื่องจักร",
      ],
      analysisHref: "/manager/overview/energy",
      buildingHref: "/manager/overview/buildings",
    },
  },
  {
    id: "a2",
    title: "คุณภาพอากาศอยู่ในระดับเริ่มมีผลกระทบ",
    description: "AQI ของโรงงานอยู่ที่ 156 (เริ่มมีผลกระทบต่อสุขภาพ)",
    icon: Wind,
    iconTone: "bg-amber-50 text-amber-600",
    severity: "เตือน",
    location: "โรงงาน",
    date: "26 มิ.ย. 2567",
    time: "08:45 น.",
    read: false,
    actionStatus: "ยังไม่ดำเนินการ",
    detail: {
      currentValue: 156,
      unit: "AQI",
      thresholdValue: 100,
      overValue: 56,
      overPercent: 156,
      building: "อาคาร Clean Room",
      buildingType: "Cleanroom Facility",
      trend: [
        { dateLabel: "20 มิ.ย.", actual: 88, threshold: 100 },
        { dateLabel: "21 มิ.ย.", actual: 92, threshold: 100 },
        { dateLabel: "22 มิ.ย.", actual: 96, threshold: 100 },
        { dateLabel: "23 มิ.ย.", actual: 104, threshold: 100 },
        { dateLabel: "24 มิ.ย.", actual: 118, threshold: 100 },
        { dateLabel: "25 มิ.ย.", actual: 133, threshold: 100 },
        { dateLabel: "26 มิ.ย.", actual: 156, threshold: 100 },
      ],
      recommendations: ["ตรวจสอบระบบระบายอากาศ", "เพิ่มความถี่การเปลี่ยนแผ่นกรองอากาศ", "จำกัดกิจกรรมที่ก่อฝุ่นชั่วคราว"],
      analysisHref: "/manager/overview/air-quality",
      buildingHref: "/manager/overview/buildings",
    },
  },
  {
    id: "a3",
    title: "Carbon Footprint เพิ่มขึ้น 12%",
    description: "Carbon Footprint เดือนนี้เพิ่มขึ้น 12% เมื่อเทียบกับเดือนที่ผ่านมา",
    icon: Cloud,
    iconTone: "bg-violet-50 text-violet-600",
    severity: "เตือน",
    location: "โรงงาน",
    date: "26 มิ.ย. 2567",
    time: "08:30 น.",
    read: false,
    actionStatus: "ยังไม่ดำเนินการ",
    detail: {
      currentValue: 275.25,
      unit: "tCO2e",
      thresholdValue: 245,
      overValue: 30.25,
      overPercent: 112,
      building: "ทั้งโรงงาน",
      buildingType: "Facility-wide",
      trend: [
        { dateLabel: "ม.ค.", actual: 210, threshold: 245 },
        { dateLabel: "ก.พ.", actual: 220, threshold: 245 },
        { dateLabel: "มี.ค.", actual: 232, threshold: 245 },
        { dateLabel: "เม.ย.", actual: 238, threshold: 245 },
        { dateLabel: "พ.ค.", actual: 246, threshold: 245 },
        { dateLabel: "มิ.ย.", actual: 275, threshold: 245 },
      ],
      recommendations: ["ตรวจสอบสัดส่วนการใช้เชื้อเพลิง Scope 1", "พิจารณาแหล่งพลังงานสะอาดทดแทน", "ทบทวนเป้าหมายลดคาร์บอนรายไตรมาส"],
      analysisHref: "/manager/overview/carbon",
      buildingHref: "/manager/overview/buildings",
    },
  },
  {
    id: "a4",
    title: "ปริมาณการใช้น้ำใกล้ถึงเป้าหมาย",
    description: "การใช้น้ำของอาคาร B ใกล้ถึงเป้าหมายรายเดือน (90%)",
    icon: Droplet,
    iconTone: "bg-sky-50 text-sky-600",
    severity: "เตือน",
    location: "อาคาร B",
    date: "26 มิ.ย. 2567",
    time: "08:15 น.",
    read: false,
    actionStatus: "ยังไม่ดำเนินการ",
  },
  {
    id: "a5",
    title: "รายงานรายวันพร้อมใช้งาน",
    description: "รายงานสรุปการใช้พลังงานประจำวัน 25 มิ.ย. 2567 พร้อมให้ดาวน์โหลด",
    icon: CheckCircle2,
    iconTone: "bg-emerald-50 text-emerald-600",
    severity: "ข้อมูล",
    location: "ระบบ",
    date: "26 มิ.ย. 2567",
    time: "07:00 น.",
    read: true,
    actionStatus: "ดำเนินการแล้ว",
  },
  {
    id: "a6",
    title: "ปริมาณของเสียเกินเกณฑ์",
    description: "ปริมาณของเสียประเภทพลาสติกเกินเกณฑ์ 120%",
    icon: Trash2,
    iconTone: "bg-red-50 text-red-600",
    severity: "สำคัญ",
    location: "อาคาร C",
    date: "25 มิ.ย. 2567",
    time: "16:20 น.",
    read: false,
    actionStatus: "ยังไม่ดำเนินการ",
  },
  {
    id: "a7",
    title: "บำรุงรักษาเครื่องจักรประจำเดือน",
    description: "เครื่องจักร Machine-01 ถึงรอบบำรุงรักษาประจำเดือน",
    icon: Wrench,
    iconTone: "bg-slate-100 text-slate-600",
    severity: "ข้อมูล",
    location: "แผนกซ่อมบำรุง",
    date: "25 มิ.ย. 2567",
    time: "14:10 น.",
    read: false,
    actionStatus: "กำลังดำเนินการ",
  },
  {
    id: "a8",
    title: "OEE ต่ำกว่าเป้าหมาย",
    description: "SMT Line 2 มีค่า OEE ต่ำกว่าเป้าหมาย 3 วันติดต่อกัน",
    icon: Gauge,
    iconTone: "bg-amber-50 text-amber-600",
    severity: "สำคัญ",
    location: "SMT Line 2",
    date: "25 มิ.ย. 2567",
    time: "13:05 น.",
    read: true,
    actionStatus: "กำลังดำเนินการ",
  },
];

const TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "unread", label: "ยังไม่อ่าน" },
  { key: "สำคัญ", label: "สำคัญ" },
  { key: "เตือน", label: "เตือน" },
  { key: "ข้อมูล", label: "ข้อมูล" },
] as const;

const ACTION_OPTIONS: ActionStatus[] = ["ยังไม่ดำเนินการ", "กำลังดำเนินการ", "ดำเนินการแล้ว"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [selectedId, setSelectedId] = useState<string>(INITIAL_ALERTS[0].id);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      unread: alerts.filter((a) => !a.read).length,
      สำคัญ: alerts.filter((a) => a.severity === "สำคัญ").length,
      เตือน: alerts.filter((a) => a.severity === "เตือน").length,
      ข้อมูล: alerts.filter((a) => a.severity === "ข้อมูล").length,
    }),
    [alerts],
  );

  const filtered = useMemo(() => {
    if (tab === "all") return alerts;
    if (tab === "unread") return alerts.filter((a) => !a.read);
    return alerts.filter((a) => a.severity === tab);
  }, [alerts, tab]);

  const selected = alerts.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  function markRead(id: string, read = true) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read } : a)));
  }

  function setActionStatus(id: string, actionStatus: ActionStatus) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, actionStatus } : a)));
  }

  function selectAlert(id: string) {
    setSelectedId(id);
    markRead(id, true);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1.4fr]">
      {/* รายการแจ้งเตือน */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${
                  tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 text-[10px] ${tab === t.key ? "bg-white/20" : "bg-slate-100"}`}>{counts[t.key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => selectAlert(a.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selected?.id === a.id ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <span className="mt-1.5 flex flex-col items-center gap-1">{!a.read && <span className="h-2 w-2 rounded-full bg-emerald-500" />}</span>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.iconTone}`}>
                <a.icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-0.5 flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-800">{a.title}</span>
                  {a.severity === "สำคัญ" && <SeverityBadge severity={a.severity} />}
                </span>
                <span className="block truncate text-xs text-slate-500">{a.description}</span>
                <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                  {a.location} <span className="h-1 w-1 rounded-full bg-slate-300" /> {a.date} {a.time}
                </span>
              </span>
              <ChevronRight size={16} className="mt-2 shrink-0 text-slate-300" />
            </button>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-slate-400">ไม่มีการแจ้งเตือนในหมวดนี้</p>}
        </div>

        <button type="button" className="rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
          โหลดเพิ่มเติม
        </button>
      </section>

      {/* รายละเอียด */}
      <section className="flex flex-col gap-4">
        {!selected ? (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
            เลือกการแจ้งเตือนทางซ้ายเพื่อดูรายละเอียด
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected.iconTone}`}>
                    <selected.icon size={20} />
                  </span>
                  <div>
                    <SeverityBadge severity={selected.severity} />
                    <h2 className="mt-1 text-lg font-bold text-slate-900">{selected.title}</h2>
                    <p className="text-sm text-slate-500">{selected.description}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {selected.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {selected.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {selected.time}
                      </span>
                      <span>{selected.read ? "อ่านแล้ว" : "ยังไม่อ่าน"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markRead(selected.id, !selected.read)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <CheckSquare size={13} />
                    {selected.read ? "ทำเครื่องหมายว่ายังไม่อ่าน" : "ทำเครื่องหมายว่าอ่านแล้ว"}
                  </button>
                  <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {selected.detail ? (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetricCard label="ค่าปัจจุบัน" value={selected.detail.currentValue.toLocaleString("th-TH")} unit={selected.detail.unit} />
                    <MetricCard label="เกณฑ์ที่กำหนด" value={selected.detail.thresholdValue.toLocaleString("th-TH")} unit={selected.detail.unit} />
                    <MetricCard
                      label="เกินเกณฑ์"
                      value={selected.detail.overValue.toLocaleString("th-TH")}
                      unit={selected.detail.unit}
                      tone="text-red-500"
                      sub={`(${selected.detail.overPercent}%)`}
                    />
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="mb-1 flex items-center gap-1 text-xs text-slate-400">
                        <Building2 size={12} /> ตำแหน่ง
                      </p>
                      <p className="text-sm font-semibold text-slate-800">{selected.detail.building}</p>
                      <p className="text-xs text-slate-400">{selected.detail.buildingType}</p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl border border-slate-100 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">แนวโน้ม</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={selected.detail.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={45} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="actual" name="ค่าจริง" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="threshold" name="เกณฑ์ที่กำหนด" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <h3 className="mb-2 text-sm font-semibold text-emerald-700">คำแนะนำ</h3>
                      <ul className="flex flex-col gap-1.5">
                        {selected.detail.recommendations.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-slate-600">
                            <Settings2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a href={selected.detail.analysisHref} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                        ดูรายละเอียดการวิเคราะห์
                        <ArrowRight size={15} />
                      </a>
                      <a
                        href={selected.detail.buildingHref}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Building2 size={15} />
                        ดู{selected.detail.building}
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-400">
                  <Info size={16} />
                  การแจ้งเตือนนี้ไม่มีรายละเอียดเชิงลึกเพิ่มเติม
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Info size={13} /> สร้างโดยระบบ · {selected.date} {selected.time}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ACTION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setActionStatus(selected.id, opt)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      selected.actionStatus === opt ? actionStyle(opt) : "border border-slate-200 text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {opt === "ดำเนินการแล้ว" && <CheckCircle2 size={12} />}
                    {opt === "กำลังดำเนินการ" && <AlertTriangle size={12} />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    สำคัญ: "bg-red-50 text-red-600",
    เตือน: "bg-amber-50 text-amber-600",
    ข้อมูล: "bg-sky-50 text-sky-600",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[severity]}`}>{severity}</span>;
}

function actionStyle(status: ActionStatus) {
  if (status === "ดำเนินการแล้ว") return "bg-emerald-600 text-white";
  if (status === "กำลังดำเนินการ") return "bg-amber-500 text-white";
  return "bg-slate-400 text-white";
}

function MetricCard({ label, value, unit, tone, sub }: { label: string; value: string; unit: string; tone?: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${tone ?? "text-slate-800"}`}>
        {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
      {sub && <p className={`text-xs ${tone ?? "text-slate-400"}`}>{sub}</p>}
    </div>
  );
}