import Link from "next/link";
import { Zap, Droplet, LayoutDashboard, FileText, Bell, ArrowRight, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { KpiWithTrend } from "@/lib/manager queries";

/**
 * components/manager/ManagerHomePage.tsx
 * -----------------------------------------
 * "หน้าหลัก" — หน้าต้อนรับแบบเบาๆ แยกจาก "Overview" (dashboard วิเคราะห์
 * แบบเต็มที่ /manager/overview) ตาม mockup ที่ทั้ง 2 เมนูแยกกันใน Sidebar
 * ใช้ KPI พลังงาน/น้ำจริงย่อๆ + การ์ดพาไปหน้าต่างๆ, ส่วนแจ้งเตือนยังเป็น mock
 * เหมือนหน้า Overview (ดู MANAGER_DASHBOARD_NOTES.md)
 */

const QUICK_LINKS = [
  { href: "/manager/overview", label: "Overview", desc: "ภาพรวมและกราฟวิเคราะห์แบบเต็ม", icon: LayoutDashboard, ready: true },
  { href: "/manager/reports", label: "รายงาน", desc: "ดูรายงานสรุปประจำเดือน", icon: FileText, ready: true },
  { href: "/manager/alerts", label: "การแจ้งเตือน", desc: "ดูรายการแจ้งเตือนทั้งหมด", icon: Bell, ready: true },
];

const MOCK_ALERTS_PREVIEW = [
  { icon: AlertTriangle, tone: "text-amber-600 bg-amber-50", title: "การใช้พลังงานสูงผิดปกติ", time: "10:15 น." },
  { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50", title: "รายงานประจำวันพร้อมส่ง", time: "08:50 น." },
];

export default function ManagerHomePage({
  energy,
  water,
  currentUserName,
}: {
  energy: KpiWithTrend;
  water: KpiWithTrend;
  currentUserName: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
        <p className="text-sm text-emerald-700">ยินดีต้อนรับกลับมา 👋</p>
        <h1 className="text-xl font-bold text-slate-900">คุณ{currentUserName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          นี่คือสรุปภาพรวมสั้นๆ ของสัปดาห์นี้ ดูรายละเอียดเต็มได้ที่หน้า{" "}
          <Link href="/manager/overview" className="font-medium text-emerald-700 underline">
            Overview
          </Link>
        </p>
      </section>

      {/* KPI ย่อ — ข้อมูลจริง 7 วันล่าสุด */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MiniKpiCard icon={Zap} tone="emerald" label="การใช้พลังงาน (7 วันล่าสุด)" value={energy.total.toLocaleString("th-TH")} unit={energy.unit} changePct={energy.changePct} />
        <MiniKpiCard icon={Droplet} tone="sky" label="การใช้น้ำ (7 วันล่าสุด)" value={water.total.toLocaleString("th-TH")} unit={water.unit} changePct={water.changePct} />
      </div>

      {/* ทางลัด */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">ทางลัด</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link) =>
            link.ready ? (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <link.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{link.label}</p>
                  <p className="text-xs text-slate-400">{link.desc}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  ไปที่หน้านี้
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ) : (
              <div key={link.href} className="flex cursor-not-allowed flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 opacity-60">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                  <link.icon size={18} />
                </span>
                <div>
                  <p className="font-semibold text-slate-500">{link.label}</p>
                  <p className="text-xs text-slate-400">{link.desc}</p>
                </div>
                <span className="w-fit rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-500">เร็วๆ นี้</span>
              </div>
            ),
          )}
        </div>
      </section>

      {/* แจ้งเตือนล่าสุด (mock) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">แจ้งเตือนล่าสุด</h2>
          <span className="text-xs text-slate-300">mockup</span>
        </div>
        <ul className="flex flex-col divide-y divide-slate-100">
          {MOCK_ALERTS_PREVIEW.map((a) => (
            <li key={a.title} className="flex items-center gap-3 py-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.tone}`}>
                <a.icon size={15} />
              </span>
              <p className="flex-1 text-sm text-slate-700">{a.title}</p>
              <span className="text-xs text-slate-300">{a.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function MiniKpiCard({
  icon: Icon,
  tone,
  label,
  value,
  unit,
  changePct,
}: {
  icon: typeof Zap;
  tone: "emerald" | "sky";
  label: string;
  value: string;
  unit: string;
  changePct: number;
}) {
  const toneClass = tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600";
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-900">
          {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </p>
        <p className={`flex items-center gap-1 text-xs ${changePct <= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {changePct <= 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {Math.abs(changePct)}% จากช่วงก่อนหน้า
        </p>
      </div>
    </div>
  );
}