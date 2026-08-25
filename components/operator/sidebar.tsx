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
    gradient: string;      // ไล่สีไอคอนเวลา Active
    textActive: string;    // สีตัวอักษรเวลา Active
    glow: string;          // เงาเรืองแสงจางๆ
    badgeBg: string;       // สีพื้นหลังไอคอนปกติ
  };
}

const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    href: "/operator",
    label: "ภาพรวมระบบ",
    icon: Home,
    theme: {
      gradient: "from-blue-600 to-indigo-600 text-white shadow-blue-500/25",
      textActive: "text-blue-975 font-bold",
      glow: "bg-blue-50/80 border-blue-100/80 shadow-sm",
      badgeBg: "bg-blue-50 text-blue-600 group-hover:bg-blue-100/70",
    },
  },
  {
    href: "/operator/record",
    label: "บันทึกข้อมูล",
    icon: PenLine,
    theme: {
      gradient: "from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
      textActive: "text-emerald-950 font-bold",
      glow: "bg-emerald-50/80 border-emerald-100/80 shadow-sm",
      badgeBg: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/70",
    },
  },
  {
    href: "/operator/scan",
    label: "สแกน QR Code",
    icon: QrCode,
    theme: {
      gradient: "from-violet-600 to-purple-600 text-white shadow-violet-500/25",
      textActive: "text-violet-950 font-bold",
      glow: "bg-violet-50/80 border-violet-100/80 shadow-sm",
      badgeBg: "bg-violet-50 text-violet-600 group-hover:bg-violet-100/70",
    },
  },
  {
    href: "/operator/history",
    label: "ประวัติการบันทึก",
    icon: History,
    theme: {
      gradient: "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
      textActive: "text-amber-950 font-bold",
      glow: "bg-amber-50/80 border-amber-100/80 shadow-sm",
      badgeBg: "bg-amber-50 text-amber-600 group-hover:bg-amber-100/70",
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
      glow: "bg-rose-50/80 border-rose-100/80 shadow-sm",
      badgeBg: "bg-rose-50 text-rose-600 group-hover:bg-rose-100/70",
    },
  },
  {
    href: "/operator/help",
    label: "ศูนย์ช่วยเหลือ",
    icon: HelpCircle,
    theme: {
      gradient: "from-cyan-500 to-blue-600 text-white shadow-cyan-500/25",
      textActive: "text-cyan-950 font-bold",
      glow: "bg-cyan-50/80 border-cyan-100/80 shadow-sm",
      badgeBg: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100/70",
    },
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/operator") {
      return pathname === "/operator";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] flex-col",
          "border-r border-slate-200/60 bg-white/90 backdrop-blur-xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:w-[270px] lg:translate-x-0",
        ].join(" ")}
      >
        {/* Header แบรนด์พร้อมลูกเล่น Gradient เล็กน้อย */}
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 font-bold text-base">
              OP
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Workspace
              </span>
              <h2 className="text-sm font-extrabold tracking-tight text-slate-900">
                Operator Portal
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
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

        {/* Bottom Status Card แบบพรีเมียมไล่สี */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="relative overflow-hidden rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/60">
            {/* แถบแสงตกแต่งด้านข้าง */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-500" />
            
            <div className="flex items-center gap-3 pl-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-bold text-slate-800">
                    ระบบพร้อมใช้งาน
                  </p>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
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

function SidebarSection({ title, items, isActive, onNavigate }: SidebarSectionProps) {
  return (
    <section>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <nav className="space-y-1.5">
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

function SidebarLink({ item, active, onNavigate }: SidebarLinkProps) {
  const Icon = item.icon;
  const { theme } = item;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex h-12 items-center gap-3.5 rounded-xl px-3 border transition-all duration-200",
        active
          ? `${theme.glow} ${theme.textActive}`
          : "border-transparent text-slate-600 hover:bg-slate-100/60 hover:text-slate-900 font-medium",
      ].join(" ")}
    >
      {/* ไอคอน: ถ้า Active จะเปลี่ยนเป็น Gradient ทรงพลัง ถ้าปกติจะเป็นสีพาสเทลตามหมวดหมู่ */}
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 shadow-xs",
          active ? `bg-gradient-to-br ${theme.gradient} scale-105` : theme.badgeBg,
        ].join(" ")}
      >
        <Icon className="h-4 w-4" strokeWidth={active ? 2.3 : 2} />
      </span>

      {/* ข้อความชื่อเมนู */}
      <span className="truncate text-sm tracking-tight">
        {item.label}
      </span>

      {/* ลูกศรจางๆ ด้านขวาเวลา Hover (เพิ่มความรู้สึกอินเตอร์แอคทีฟ) */}
      {!active && (
        <span className="ml-auto opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-40 group-hover:translate-x-0 text-slate-400 text-xs">
          ›
        </span>
      )}
    </Link>
  );
}