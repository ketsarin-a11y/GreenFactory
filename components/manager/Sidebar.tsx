"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ChevronDown,
  LayoutDashboard,
  Zap,
  Droplet,
  Trash2,
  Cloud,
  Gauge,
  Wind,
  Building2,
  Users,
  Wrench,
  Map,
  GitCompareArrows,
  Download,
  FileText,
  Bell,
  User,
  Leaf,
  X,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ready?: boolean; // false = ยังไม่มีหน้าจริง โชว์ป้าย "เร็วๆ นี้" แทนการเป็นลิงก์
}

const ANALYSIS_ITEMS: MenuItem[] = [
  { href: "/manager/overview", label: "Overview", icon: LayoutDashboard, ready: true },
  { href: "/manager/overview/energy", label: "พลังงาน", icon: Zap, ready: true },
  { href: "/manager/overview/water", label: "น้ำ", icon: Droplet, ready: true },
  { href: "/manager/overview/waste", label: "ของเสีย", icon: Trash2, ready: true },
  { href: "/manager/overview/carbon", label: "Carbon", icon: Cloud, ready: true },
  { href: "/manager/overview/oee", label: "ประสิทธิภาพการผลิต", icon: Gauge, ready: true },
  { href: "/manager/overview/air-quality", label: "คุณภาพอากาศ", icon: Wind, ready: true },
  { href: "/manager/overview/buildings", label: "อาคาร", icon: Building2, ready: true },
  { href: "/manager/overview/departments", label: "แผนก", icon: Users, ready: true },
  { href: "/manager/overview/equipment", label: "เครื่องจักร", icon: Wrench, ready: true },
  { href: "/manager/overview/factory-layout", label: "Factory Layout", icon: Map, ready: true },
  { href: "/manager/overview/compare", label: "Compare", icon: GitCompareArrows, ready: true },
  { href: "/manager/overview/export", label: "Export", icon: Download, ready: true },
];

const FOOTER_ITEMS: MenuItem[] = [
  { href: "/manager/reports", label: "รายงาน", icon: FileText, ready: true },
  { href: "/manager/alerts", label: "การแจ้งเตือน", icon: Bell, ready: true },
  { href: "/manager/profile", label: "โปรไฟล์", icon: User, ready: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [analysisExpanded, setAnalysisExpanded] = useState(true);

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-hidden="true" />}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between overflow-y-auto",
          "border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:w-64 md:translate-x-0",
        ].join(" ")}
      >
        <div>
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf size={18} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900">GreenFactory</p>
                <p className="-mt-0.5 text-sm font-bold text-emerald-600">Insight</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden" aria-label="ปิดเมนู">
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <SidebarLink item={{ href: "/manager", label: "หน้าหลัก", icon: Home, ready: true }} active={pathname === "/manager"} onNavigate={onClose} />

            <button
              type="button"
              onClick={() => setAnalysisExpanded((v) => !v)}
              className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                การวิเคราะห์
              </span>
              <ChevronDown size={15} className={`transition-transform ${analysisExpanded ? "rotate-180" : ""}`} />
            </button>

            {analysisExpanded && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-slate-100 pl-3">
                {ANALYSIS_ITEMS.map((item) => (
                  <SidebarLink key={item.href} item={item} active={pathname === item.href} onNavigate={onClose} compact />
                ))}
              </div>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
          {FOOTER_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} onNavigate={onClose} />
          ))}
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  onNavigate,
  compact,
}: {
  item: MenuItem;
  active: boolean;
  onNavigate: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const baseClass = [
    "flex items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
    compact ? "py-2" : "py-2.5",
    active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  ].join(" ");

  // หน้ายังไม่พร้อม -> โชว์เป็น item เฉยๆ ไม่ใช่ลิงก์ (กัน 404) พร้อมป้าย "เร็วๆ นี้"
  if (!item.ready) {
    return (
      <div className={`${baseClass} cursor-not-allowed opacity-60`}>
        <span className="flex items-center gap-3">
          <Icon size={16} strokeWidth={2} />
          {item.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">เร็วๆ นี้</span>
      </div>
    );
  }

  return (
    <Link href={item.href} onClick={onNavigate} className={baseClass}>
      <span className="flex items-center gap-3">
        <Icon size={16} strokeWidth={2} />
        {item.label}
      </span>
    </Link>
  );
}