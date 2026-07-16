"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, QrCode, Clock, User, HelpCircle, Leaf, LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MENU_ITEMS: MenuItem[] = [
  { href: "/operator", label: "หน้าแรก", icon: Home },
  { href: "/operator/record", label: "บันทึกการใช้ทรัพยากร", icon: PenLine },
  { href: "/operator/scan", label: "สแกน QR Code", icon: QrCode },
  { href: "/operator/history", label: "ประวัติการบันทึก", icon: Clock },
];

const FOOTER_ITEMS: MenuItem[] = [
  { href: "/operator/profile", label: "โปรไฟล์", icon: User },
  { href: "/operator/help", label: "ช่วยเหลือ", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-slate-200 bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf size={18} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">GreenFactory</p>
            <p className="-mt-0.5 text-sm font-bold text-emerald-600">Insight</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {MENU_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
        {FOOTER_ITEMS.map((item) => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: MenuItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={2} />
      <span>{item.label}</span>
    </Link>
  );
}