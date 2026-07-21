"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, QrCode, Clock, User, HelpCircle, Leaf, X, LucideIcon } from "lucide-react";

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

interface SidebarProps {
  isOpen: boolean; // สถานะเมนูมือถือ (แบบ drawer) — จอใหญ่ (lg+) ไม่สนค่านี้ โชว์ตลอด
  onClose: () => void;
}

/**
 * Sidebar.tsx
 * -----------
 * จอใหญ่ (lg ขึ้นไป): แสดงเป็นแถบข้างถาวร เหมือนเดิม
 * จอเล็ก (มือถือ/แท็บเล็ตแนวตั้ง): ซ่อนไว้นอกจอ เลื่อนเข้ามาทับเนื้อหา (drawer)
 * เมื่อกดปุ่มแฮมเบอร์เกอร์ใน Header ควบคุมเปิด/ปิดผ่าน isOpen/onClose ที่ส่งมาจาก
 * components/operator/OperatorShell.tsx
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ฉากหลังมืดตอนเปิดเมนูบนจอเล็ก (มือถือ) กดเพื่อปิดเมนูได้ — จอแท็บเล็ตขึ้นไป (md+) ไม่ใช้ */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between",
          "border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // md (แท็บเล็ตขึ้นไป ~768px+): แสดงถาวรเป็นแถบข้าง ไม่ใช้ drawer แล้ว
          "md:static md:z-auto md:w-56 md:translate-x-0 lg:w-60",
        ].join(" ")}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf size={18} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900">GreenFactory</p>
                <p className="-mt-0.5 text-sm font-bold text-emerald-600">Insight</p>
              </div>
            </div>

            {/* ปุ่มปิดเมนู โชว์เฉพาะจอเล็ก */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
              aria-label="ปิดเมนู"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {MENU_ITEMS.map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} onNavigate={onClose} />
            ))}
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

function SidebarLink({ item, active, onNavigate }: { item: MenuItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate} // มือถือ: ปิด drawer อัตโนมัติหลังกดเมนู (จอใหญ่ onClose ไม่มีผลอะไรเพราะ isOpen ไม่ถูกใช้)
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