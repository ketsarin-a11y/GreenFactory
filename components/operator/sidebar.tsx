"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock3,
  HelpCircle,
  History,
  Home,
  PenLine,
  QrCode,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  theme: {
    gradient: string;
    textActive: string;
    glow: string;
    badgeBg: string;
  };
}

const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    href: "/operator",
    label: "ภาพรวมระบบ",
    icon: Home,
    theme: {
      gradient: "from-blue-600 to-indigo-600 text-white shadow-blue-500/25",
      textActive: "text-blue-950 font-bold",
      glow: "bg-blue-50/80 border-blue-100/90 shadow-[0_6px_18px_rgba(59,130,246,0.08)]",
      badgeBg: "bg-blue-50 text-blue-600 group-hover:bg-blue-100/80",
    },
  },
  {
    href: "/operator/record",
    label: "บันทึกข้อมูล",
    icon: PenLine,
    theme: {
      gradient: "from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
      textActive: "text-emerald-950 font-bold",
      glow: "bg-emerald-50/80 border-emerald-100/90 shadow-[0_6px_18px_rgba(16,185,129,0.08)]",
      badgeBg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/80",
    },
  },
  {
    href: "/operator/scan",
    label: "สแกน QR Code",
    icon: QrCode,
    theme: {
      gradient: "from-violet-600 to-purple-600 text-white shadow-violet-500/25",
      textActive: "text-violet-950 font-bold",
      glow: "bg-violet-50/80 border-violet-100/90 shadow-[0_6px_18px_rgba(139,92,246,0.08)]",
      badgeBg: "bg-violet-50 text-violet-600 group-hover:bg-violet-100/80",
    },
  },
  {
    href: "/operator/history",
    label: "ประวัติการบันทึก",
    icon: History,
    theme: {
      gradient: "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
      textActive: "text-amber-950 font-bold",
      glow: "bg-amber-50/80 border-amber-100/90 shadow-[0_6px_18px_rgba(245,158,11,0.08)]",
      badgeBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-100/80",
    },
  },
];

const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    href: "/operator/profile",
    label: "โปรไฟล์ของฉัน",
    icon: UserRound,
    theme: {
      gradient: "from-rose-500 to-pink-600 text-white shadow-rose-500/25",
      textActive: "text-rose-950 font-bold",
      glow: "bg-rose-50/80 border-rose-100/90 shadow-[0_6px_18px_rgba(244,63,94,0.08)]",
      badgeBg: "bg-rose-50 text-rose-600 group-hover:bg-rose-100/80",
    },
  },
  {
    href: "/operator/help",
    label: "ศูนย์ช่วยเหลือ",
    icon: HelpCircle,
    theme: {
      gradient: "from-cyan-500 to-blue-600 text-white shadow-cyan-500/25",
      textActive: "text-cyan-950 font-bold",
      glow: "bg-cyan-50/80 border-cyan-100/90 shadow-[0_6px_18px_rgba(6,182,212,0.08)]",
      badgeBg: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100/80",
    },
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/operator") return pathname === "/operator";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(300px,calc(100vw-24px))] flex-col",
          "border-r border-slate-200 bg-white",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-dvh lg:w-[300px] lg:translate-x-0",
        ].join(" ")}
      >
        {/* LOGO */}
        <div className="flex min-h-[92px] items-center justify-between border-b border-slate-100 px-4 sm:min-h-[104px] sm:px-5 lg:min-h-[112px] lg:px-6">
          <Link
            href="/operator"
            onClick={onClose}
            className="flex min-w-0 flex-1 items-center"
            aria-label="GreenFactory Insight"
          >
            <img
              src="/images/LOGO.png"
              alt="GreenFactory Insight"
              className="block h-auto w-[180px] max-w-full object-contain object-left sm:w-[195px] lg:w-[205px]"
              draggable={false}
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="ml-2 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4 sm:py-6">
          <div className="space-y-7">
            <SidebarSection
              title="เมนูหลัก"
              items={MAIN_MENU_ITEMS}
              isActive={isActive}
              onNavigate={onClose}
            />

            <div className="mx-2 h-px bg-slate-100" />

            <SidebarSection
              title="อื่นๆ"
              items={SECONDARY_MENU_ITEMS}
              isActive={isActive}
              onNavigate={onClose}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
          <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-emerald-500" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-xs font-extrabold text-slate-800">
                    ระบบพร้อมใช้งาน
                  </p>
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                </div>

                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                  เชื่อมต่อเซิร์ฟเวอร์แล้ว
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarSectionProps {
  title: string;
  items: MenuItem[];
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}

function SidebarSection({
  title,
  items,
  isActive,
  onNavigate,
}: SidebarSectionProps) {
  return (
    <section>
      <p className="mb-3.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>

      <nav className="space-y-2">
        {items.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </section>
  );
}

interface SidebarLinkProps {
  item: MenuItem;
  active: boolean;
  onNavigate: () => void;
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon;
  const { theme } = item;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex min-h-[52px] touch-manipulation items-center gap-3 rounded-[16px] border px-3 sm:gap-3.5 sm:px-3.5",
        "transition-all duration-200",
        active
          ? `${theme.glow} ${theme.textActive}`
          : "border-transparent font-medium text-slate-600 hover:bg-slate-100/70 hover:text-slate-900",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
          active
            ? `scale-[1.03] bg-gradient-to-br ${theme.gradient}`
            : theme.badgeBg,
        ].join(" ")}
      >
        <Icon
          className="h-[18px] w-[18px]"
          strokeWidth={active ? 2.4 : 2}
        />
      </span>

      <span className="min-w-0 truncate text-[14px] tracking-tight">
        {item.label}
      </span>

      {!active && (
        <span className="ml-auto hidden -translate-x-1 text-xs text-slate-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-50 sm:inline">
          ›
        </span>
      )}
    </Link>
  );
}
