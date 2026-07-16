"use client";

import {
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Database,
  Factory,
  Gauge,
  Leaf,
  LogOut,
  Menu,
  Ruler,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

type PlatformShellProps = {
  children: ReactNode;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

const navigationGroups = [
  {
    label: "ภาพรวม",
    items: [
      {
        label: "แดชบอร์ด",
        href: "/platform/dashboard",
        icon: Gauge,
      },
    ],
  },
  {
    label: "การจัดการองค์กร",
    items: [
      {
        label: "จัดการบริษัท",
        href: "/platform/companies",
        icon: Building2,
      },
    ],
  },
  {
    label: "ผู้ใช้งานและสิทธิ์",
    items: [
      {
        label: "จัดการผู้ใช้งาน",
        href: "/platform/users",
        icon: Users,
      },
      {
        label: "บทบาทและสิทธิ์",
        href: "/platform/roles",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "ข้อมูลมาตรฐานกลาง",
    items: [
      {
        label: "หมวดหมู่ทรัพยากร",
        href: "/platform/master-data/resource-categories",
        icon: Boxes,
      },
      {
        label: "ประเภททรัพยากร",
        href: "/platform/master-data/resource-types",
        icon: Zap,
      },
      {
        label: "ประเภทเครื่องจักร",
        href: "/platform/master-data/machine-types",
        icon: Factory,
      },
      {
        label: "ประเภทเซนเซอร์",
        href: "/platform/master-data/sensor-types",
        icon: Waves,
      },
      {
        label: "หน่วยวัด",
        href: "/platform/master-data/units",
        icon: Ruler,
      },
      {
        label: "Emission Factor",
        href: "/platform/master-data/emission-factors",
        icon: Leaf,
      },
    ],
  },
  {
    label: "การติดตามระบบ",
    items: [
      {
        label: "Audit Log",
        href: "/platform/audit-logs",
        icon: ClipboardList,
      },
      {
        label: "Login Log",
        href: "/platform/login-logs",
        icon: CircleUserRound,
      },
      {
        label: "การแจ้งเตือน",
        href: "/platform/notifications",
        icon: Bell,
      },
    ],
  },
];

const pageTitles: Array<[string, string]> = [
  ["/platform/dashboard", "แดชบอร์ด"],
  ["/platform/companies", "จัดการบริษัท"],
  ["/platform/users", "จัดการผู้ใช้งาน"],
  ["/platform/roles", "บทบาทและสิทธิ์"],
  [
    "/platform/master-data/resource-categories",
    "หมวดหมู่ทรัพยากร",
  ],
  ["/platform/master-data/resource-types", "ประเภททรัพยากร"],
  ["/platform/master-data/machine-types", "ประเภทเครื่องจักร"],
  ["/platform/master-data/sensor-types", "ประเภทเซนเซอร์"],
  ["/platform/master-data/units", "หน่วยวัด"],
  [
    "/platform/master-data/emission-factors",
    "Emission Factor",
  ],
  ["/platform/audit-logs", "Audit Log"],
  ["/platform/login-logs", "Login Log"],
  ["/platform/notifications", "การแจ้งเตือน"],
  ["/platform/settings", "ตั้งค่าระบบ"],
];

function getPageTitle(pathname: string) {
  const matchedPage = pageTitles.find(
    ([path]) =>
      pathname === path || pathname.startsWith(`${path}/`),
  );

  return matchedPage?.[1] ?? "Platform Administration";
}

export default function PlatformShell({
  children,
  user,
}: PlatformShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() ||
    "Platform Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${
      user.lastName?.[0] ?? ""
    }`.toUpperCase() || "PA";

  const pageTitle = getPageTitle(pathname);

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

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
    <div className="min-h-screen bg-[#f4f6f5] text-[#17231c]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#071f14]/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col border-r border-white/5 bg-[#073c2a] text-white shadow-[18px_0_50px_rgba(5,35,23,0.08)] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/platform/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#56d47e] text-[#063721] shadow-[0_10px_25px_rgba(65,210,112,0.18)]">
              <Leaf
                className="h-[19px] w-[19px]"
                strokeWidth={2}
              />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold tracking-[-0.025em]">
                GreenFactory
              </span>

              <span className="block truncate text-[13px] font-semibold tracking-[-0.025em] text-[#69dd8c]">
                Insight
              </span>

              <span className="mt-1 block text-[6px] font-medium uppercase tracking-[0.18em] text-white/40">
                Platform Administrator
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Role */}
        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[9px] text-white/58">
            <ShieldCheck
              className="h-3.5 w-3.5 text-[#69dd8c]"
              strokeWidth={1.8}
            />

            Platform Admin
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <section key={group.label}>
                <p className="px-3 text-[7px] font-semibold uppercase tracking-[0.17em] text-white/32">
                  {group.label}
                </p>

                <div className="mt-2 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() =>
                          setSidebarOpen(false)
                        }
                        className={`group relative flex min-h-[40px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition duration-200 ${
                          active
                            ? "bg-[#168d58] font-medium text-white shadow-[0_8px_20px_rgba(16,114,67,0.18)]"
                            : "text-white/64 hover:bg-white/[0.07] hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-[15px] w-[15px] shrink-0 ${
                            active
                              ? "text-white"
                              : "text-white/45 group-hover:text-[#77e097]"
                          }`}
                          strokeWidth={1.7}
                        />

                        <span className="truncate">
                          {item.label}
                        </span>

                        {active && (
                          <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#a4f0b9]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        {/* Settings */}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/platform/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex min-h-[42px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition ${
              isActive("/platform/settings")
                ? "bg-[#168d58] font-medium text-white"
                : "text-white/64 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Settings
              className="h-[15px] w-[15px]"
              strokeWidth={1.7}
            />

            ตั้งค่าระบบ
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="min-h-screen lg:pl-[258px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-[#153b28]/8 bg-white px-5 shadow-[0_1px_0_rgba(24,59,39,0.02)] sm:px-7 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="เปิดเมนู"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#53645a] transition hover:bg-[#eef3ef] lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold tracking-[-0.025em] text-[#192a20]">
              {pageTitle}
            </p>

            <p className="mt-0.5 hidden text-[8px] uppercase tracking-[0.13em] text-[#98a29c] sm:block">
              GreenFactory Insight Platform
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Search */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() =>
                  setSearchOpen((current) => !current)
                }
                aria-label="ค้นหา"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#64736a] transition hover:bg-[#eef3ef] hover:text-[#247049]"
              >
                <Search
                  className="h-[16px] w-[16px]"
                  strokeWidth={1.7}
                />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-[46px] w-[300px] rounded-[14px] border border-[#23422f]/10 bg-white p-3 shadow-[0_20px_55px_rgba(22,52,33,0.14)]">
                  <div className="flex h-[42px] items-center gap-3 rounded-[10px] border border-[#23422f]/10 bg-[#f6f8f6] px-3">
                    <Search
                      className="h-[15px] w-[15px] text-[#78857d]"
                      strokeWidth={1.6}
                    />

                    <input
                      autoFocus
                      type="search"
                      placeholder="ค้นหาในแพลตฟอร์ม"
                      className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-[#9da69f]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Link
              href="/platform/notifications"
              aria-label="การแจ้งเตือน"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#64736a] transition hover:bg-[#eef3ef] hover:text-[#247049]"
            >
              <Bell
                className="h-[16px] w-[16px]"
                strokeWidth={1.7}
              />

              <span className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#e14f4f] ring-2 ring-white" />
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((current) => !current)
                }
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-[#f0f4f1]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff1e4] text-[10px] font-semibold text-[#1d7548]">
                  {initials}
                </span>

                <span className="hidden text-left md:block">
                  <span className="block max-w-[135px] truncate text-[10px] font-semibold text-[#293a30]">
                    {fullName}
                  </span>

                  <span className="block text-[8px] text-[#8a968e]">
                    Platform Admin
                  </span>
                </span>

                <ChevronDown
                  className={`hidden h-3 w-3 text-[#7d8982] transition md:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    aria-label="ปิดเมนูผู้ใช้"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 top-[48px] z-50 w-[240px] overflow-hidden rounded-[15px] border border-[#23422f]/10 bg-white shadow-[0_22px_60px_rgba(22,52,33,0.15)]">
                    <div className="border-b border-[#23422f]/8 px-4 py-4">
                      <p className="truncate text-[12px] font-semibold text-[#25372c]">
                        {fullName}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#849087]">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        className="flex min-h-[40px] w-full items-center gap-3 rounded-[9px] px-3 text-left text-[11px] text-[#5c6a61] transition hover:bg-[#f2f5f2]"
                      >
                        <CircleUserRound
                          className="h-4 w-4"
                          strokeWidth={1.6}
                        />

                        บัญชีผู้ใช้งาน
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex min-h-[40px] w-full items-center gap-3 rounded-[9px] px-3 text-left text-[11px] text-[#b14545] transition hover:bg-[#fff1f1] disabled:opacity-50"
                      >
                        <LogOut
                          className="h-4 w-4"
                          strokeWidth={1.6}
                        />

                        {isLoggingOut
                          ? "กำลังออกจากระบบ"
                          : "ออกจากระบบ"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-68px)] p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}