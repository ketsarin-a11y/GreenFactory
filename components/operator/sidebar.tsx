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
  iconStyle: string;
  activeStyle: string;
  activeBar: string;
}

const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    href: "/operator",
    label: "ภาพรวม",
    icon: Home,
    iconStyle: "bg-blue-50 text-blue-600",
    activeStyle: "bg-blue-50/80 text-blue-700",
    activeBar: "bg-blue-500",
  },
  {
    href: "/operator/record",
    label: "บันทึกข้อมูล",
    icon: PenLine,
    iconStyle: "bg-emerald-50 text-emerald-600",
    activeStyle: "bg-emerald-50/80 text-emerald-700",
    activeBar: "bg-emerald-500",
  },
  {
    href: "/operator/scan",
    label: "สแกน QR Code",
    icon: QrCode,
    iconStyle: "bg-violet-50 text-violet-600",
    activeStyle: "bg-violet-50/80 text-violet-700",
    activeBar: "bg-violet-500",
  },
  {
    href: "/operator/history",
    label: "ประวัติการบันทึก",
    icon: History,
    iconStyle: "bg-amber-50 text-amber-600",
    activeStyle: "bg-amber-50/80 text-amber-700",
    activeBar: "bg-amber-500",
  },
];

const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    href: "/operator/profile",
    label: "โปรไฟล์",
    icon: UserRound,
    iconStyle: "bg-rose-50 text-rose-600",
    activeStyle: "bg-rose-50/80 text-rose-700",
    activeBar: "bg-rose-500",
  },
  {
    href: "/operator/help",
    label: "ช่วยเหลือ",
    icon: HelpCircle,
    iconStyle: "bg-cyan-50 text-cyan-600",
    activeStyle: "bg-cyan-50/80 text-cyan-700",
    activeBar: "bg-cyan-500",
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
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
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดเมนู"
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[280px] flex-col",
          "border-r border-slate-200/80 bg-white",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:translate-x-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Operator Workspace
            </p>

            <h2 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
              เมนูการทำงาน
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-slate-100" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <SidebarSection
            title="การทำงาน"
            items={MAIN_MENU_ITEMS}
            isActive={isActive}
            onNavigate={onClose}
          />

          <div className="my-6 mx-2 h-px bg-slate-100" />

          <SidebarSection
            title="บัญชีและระบบ"
            items={SECONDARY_MENU_ITEMS}
            isActive={isActive}
            onNavigate={onClose}
          />
        </div>

        {/* Bottom status */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <Clock3 className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-700">
                  พร้อมบันทึกข้อมูล
                </p>

                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              </div>

              <p className="mt-0.5 text-[11px] text-slate-400">
                ระบบทำงานปกติ
              </p>
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
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
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

function SidebarLink({
  item,
  active,
  onNavigate,
}: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative flex h-[54px] items-center gap-3 rounded-2xl px-3",
        "transition-all duration-200",
        active
          ? `${item.activeStyle} shadow-sm`
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
    >
      {active && (
        <span
          className={[
            "absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full",
            item.activeBar,
          ].join(" ")}
        />
      )}

      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          "transition-transform duration-200 group-hover:scale-[1.04]",
          item.iconStyle,
        ].join(" ")}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
      </span>

      <span
        className={[
          "truncate text-sm",
          active ? "font-bold" : "font-semibold",
        ].join(" ")}
      >
        {item.label}
      </span>
    </Link>
  );
}