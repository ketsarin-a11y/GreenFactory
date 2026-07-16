"use client";

import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Factory,
  FileBarChart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  QrCode,
  Radio,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";

type CompanyShellProps = {
  children: ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  company: {
    companyName: string;
    companyCode: string;
  };
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const navigationItems: NavigationItem[] = [
  {
    label: "หน้าหลัก",
    href: "/company/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "ผู้ใช้งาน",
    href: "/company/users",
    icon: Users,
  },
  {
    label: "บทบาทและสิทธิ์",
    href: "/company/roles",
    icon: ShieldCheck,
  },
  {
    label: "แผนกและสายการผลิต",
    href: "/company/departments",
    icon: Building2,
  },
  {
    label: "เครื่องจักรและจุดตรวจ",
    href: "/company/machines",
    icon: Factory,
  },
  {
    label: "เซนเซอร์",
    href: "/company/sensors",
    icon: Radio,
  },
  {
    label: "QR Code",
    href: "/company/qr-codes",
    icon: QrCode,
  },
  {
    label: "การบันทึกการใช้ทรัพยากร",
    href: "/company/resource-usage",
    icon: ClipboardList,
  },
  {
    label: "รายงานและส่งออกข้อมูล",
    href: "/company/reports",
    icon: FileBarChart,
  },
  {
    label: "การตั้งค่าโรงงาน",
    href: "/company/settings",
    icon: Settings,
  },
  {
    label: "โปรไฟล์",
    href: "/company/profile",
    icon: UserRound,
  },
];

const pageTitles: Array<[string, string]> = [
  ["/company/dashboard", "หน้าหลัก"],
  ["/company/users", "ผู้ใช้งาน"],
  ["/company/roles", "บทบาทและสิทธิ์"],
  ["/company/departments", "แผนกและสายการผลิต"],
  ["/company/production-lines", "สายการผลิต"],
  ["/company/machines", "เครื่องจักรและจุดตรวจ"],
  ["/company/sensors", "เซนเซอร์"],
  ["/company/qr-codes", "QR Code"],
  ["/company/resource-usage", "การบันทึกการใช้ทรัพยากร"],
  ["/company/reports", "รายงานและส่งออกข้อมูล"],
  ["/company/settings", "การตั้งค่าโรงงาน"],
  ["/company/profile", "โปรไฟล์"],
];

function getPageTitle(pathname: string) {
  const matchedPage = pageTitles.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matchedPage?.[1] ?? "Company Admin";
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function CompanyShell({
  children,
  user,
  company,
}: CompanyShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Company Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "CA";

  const pageTitle = getPageTitle(pathname);

  const sidebarWidthClass = collapsed ? "lg:w-[82px]" : "lg:w-[252px]";
  const contentPaddingClass = collapsed ? "lg:pl-[82px]" : "lg:pl-[252px]";

  const currentBreadcrumb = useMemo(
    () => [company.companyName, pageTitle],
    [company.companyName, pageTitle],
  );

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#243129]">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-[#dce8df] bg-[#6f9e7d] text-white transition-[width,transform] duration-300 ${sidebarWidthClass} ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          className={`flex h-[74px] items-center border-b border-white/20 ${
            collapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <Link
            href="/company/dashboard"
            className={`flex min-w-0 items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#52735f]">
              <Leaf className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>

            {!collapsed && (
              <span className="leading-none">
                <span className="block text-[14px] font-semibold tracking-[-0.02em] text-white">
                  GreenFactory
                </span>
                <span className="mt-1 block text-[14px] font-semibold tracking-[-0.02em] text-[#eef7f0]">
                  Insight
                </span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/15 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={collapsed ? "px-2 py-3" : "px-4 py-4"}>
          <button
            type="button"
            onClick={() => setCompanyMenuOpen((current) => !current)}
            className={`flex w-full items-center border border-white/25 bg-white/10 text-left transition hover:bg-white/15 ${
              collapsed
                ? "h-12 justify-center rounded-lg px-2"
                : "min-h-[64px] gap-3 rounded-lg px-3 py-2.5"
            }`}
          >
            <Warehouse
              className="h-[18px] w-[18px] shrink-0 text-[#eef7f0]"
              strokeWidth={1.8}
            />

            {!collapsed && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] text-white/65">
                    Company Admin
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-medium text-white">
                    {company.companyName}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-white/55">
                    {company.companyCode}
                  </span>
                </span>

                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-white/65 transition-transform ${
                    companyMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          {companyMenuOpen && !collapsed && (
            <div className="mt-2 rounded-lg border border-white/20 bg-[#638f71] p-2">
              <div className="rounded-md px-2 py-2">
                <p className="truncate text-[11px] font-medium text-white">
                  {company.companyName}
                </p>
                <p className="mt-1 text-[9px] text-white/55">
                  รหัสบริษัท {company.companyCode}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 [scrollbar-width:thin]">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex min-h-[42px] items-center rounded-lg transition-colors ${
                    collapsed ? "justify-center px-2" : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-white font-medium text-[#456653] shadow-[0_1px_2px_rgba(47,73,57,0.10)]"
                      : "text-white/88 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-[17px] w-[17px] shrink-0 ${
                      active ? "text-[#5f896e]" : "text-white/82"
                    }`}
                    strokeWidth={1.7}
                  />

                  {!collapsed && (
                    <span className="truncate text-[11px]">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {!collapsed && (
          <div className="px-3 pb-3">
            <Link
              href="/company/help"
              className="flex min-h-[58px] items-center gap-3 rounded-lg border border-white/25 bg-white/[0.06] px-3 text-white/88 transition hover:bg-white/15 hover:text-white"
            >
              <CircleHelp className="h-[17px] w-[17px]" strokeWidth={1.7} />
              <span>
                <span className="block text-[11px] font-medium">ช่วยเหลือ</span>
                <span className="mt-0.5 block text-[8px] text-white/55">
                  คู่มือการใช้งานและคำถามที่พบบ่อย
                </span>
              </span>
            </Link>
          </div>
        )}

        <div className="border-t border-white/20 p-3">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className={`flex min-w-0 items-center rounded-lg hover:bg-white/15 ${
                collapsed
                  ? "h-10 w-10 justify-center"
                  : "flex-1 gap-3 px-2 py-2 text-left"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#52735f]">
                {initials}
              </span>

              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-medium text-white">
                      {fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-[8px] text-white/55">
                      {user.email}
                    </span>
                  </span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-white/60 transition-transform ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>
          </div>

          {profileMenuOpen && (
            <>
              <button
                type="button"
                aria-label="ปิดเมนูผู้ใช้"
                onClick={() => setProfileMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div
                className={`absolute bottom-[68px] z-50 rounded-lg border border-[#dce8df] bg-white p-1.5 text-[#2f4035] shadow-lg ${
                  collapsed ? "left-[72px] w-[210px]" : "left-3 right-3"
                }`}
              >
                <Link
                  href="/company/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex min-h-[38px] items-center gap-3 rounded-md px-3 text-[10px] hover:bg-[#eef5f0]"
                >
                  <UserRound className="h-4 w-4" strokeWidth={1.6} />
                  โปรไฟล์ของฉัน
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex min-h-[38px] w-full items-center gap-3 rounded-md px-3 text-left text-[10px] text-[#b45454] hover:bg-[#fff3f3] disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.6} />
                  {isLoggingOut ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className={`mt-2 hidden min-h-[36px] w-full items-center rounded-md text-white/65 hover:bg-white/15 hover:text-white lg:flex ${
              collapsed ? "justify-center" : "gap-3 px-2"
            }`}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-[9px]">ซ่อนเมนู</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${contentPaddingClass}`}
      >
        <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-[#e1eae3] bg-white px-5 sm:px-7 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="เปิดเมนู"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#53645c] hover:bg-[#eef5f0] lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-semibold text-[#27372d]">
              {pageTitle}
            </h1>

            <div className="mt-1 hidden items-center gap-1.5 text-[9px] text-[#849189] sm:flex">
              {currentBreadcrumb.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <span>/</span>}
                  <span className="truncate">{item}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/company/notifications"
              aria-label="การแจ้งเตือน"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe8e1] text-[#627569] hover:bg-[#f0f6f2]"
            >
              <Bell className="h-[16px] w-[16px]" strokeWidth={1.7} />
              <span className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#d65a5a]" />
            </Link>

            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#eef5f0] sm:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcecdf] text-[10px] font-semibold text-[#4e725b]">
                {initials}
              </span>

              <span className="hidden text-left md:block">
                <span className="block max-w-[130px] truncate text-[10px] font-medium text-[#314139]">
                  {fullName}
                </span>
                <span className="mt-0.5 block text-[8px] text-[#87938c]">
                  Company Admin
                </span>
              </span>

              <ChevronDown className="h-3.5 w-3.5 text-[#87938c]" />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-68px)] p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}