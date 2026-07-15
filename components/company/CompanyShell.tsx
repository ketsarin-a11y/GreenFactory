"use client";

import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ClipboardList,
  Factory,
  Gauge,
  Leaf,
  LogOut,
  Menu,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
  Waves,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

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

const navigationGroups = [
  {
    label: "ภาพรวม",
    items: [
      {
        label: "แดชบอร์ด",
        href: "/company/dashboard",
        icon: Gauge,
      },
    ],
  },
  {
    label: "องค์กร",
    items: [
      {
        label: "โรงงานและโครงสร้าง",
        href: "/company/factories",
        icon: Building2,
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
    ],
  },
  {
    label: "เครื่องจักรและข้อมูล",
    items: [
      {
        label: "เครื่องจักร",
        href: "/company/machines",
        icon: Factory,
      },
      {
        label: "เซนเซอร์",
        href: "/company/sensors",
        icon: Waves,
      },
      {
        label: "QR Code",
        href: "/company/qr-codes",
        icon: QrCode,
      },
      {
        label: "บันทึกการใช้ทรัพยากร",
        href: "/company/resource-usage",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "วิเคราะห์และรายงาน",
    items: [
      {
        label: "รายงาน",
        href: "/company/reports",
        icon: BarChart3,
      },
      {
        label: "การแจ้งเตือน",
        href: "/company/notifications",
        icon: Bell,
      },
    ],
  },
];

const pageTitles: Array<[string, string]> = [
  ["/company/dashboard", "แดชบอร์ด"],
  ["/company/factories", "โรงงานและโครงสร้าง"],
  ["/company/users", "ผู้ใช้งาน"],
  ["/company/roles", "บทบาทและสิทธิ์"],
  ["/company/machines", "เครื่องจักร"],
  ["/company/sensors", "เซนเซอร์"],
  ["/company/qr-codes", "QR Code"],
  ["/company/resource-usage", "บันทึกการใช้ทรัพยากร"],
  ["/company/reports", "รายงาน"],
  ["/company/notifications", "การแจ้งเตือน"],
  ["/company/settings", "ตั้งค่าบริษัท"],
];

function getPageTitle(pathname: string) {
  const matched = pageTitles.find(
    ([path]) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return matched?.[1] ?? "Company Administration";
}

export default function CompanyShell({
  children,
  user,
  company,
}: CompanyShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName =
    `${user.firstName} ${user.lastName}`.trim() || "Company Admin";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "CA";

  const pageTitle = getPageTitle(pathname);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5] text-[#17231c]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#071f14]/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col bg-[#0b3d2c] text-white shadow-[18px_0_50px_rgba(5,35,23,0.08)] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/company/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#61d985] text-[#063721]">
              <Leaf className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">
                GreenFactory Insight
              </span>

              <span className="mt-1 block truncate text-[9px] text-[#78df98]">
                {company.companyName}
              </span>

              <span className="mt-0.5 block text-[6px] uppercase tracking-[0.16em] text-white/40">
                Company Administrator
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[9px] text-white/60">
            <ShieldCheck
              className="h-3.5 w-3.5 text-[#73df94]"
              strokeWidth={1.8}
            />
            Company Admin · {company.companyCode}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
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
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex min-h-[40px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition ${
                          active
                            ? "bg-[#178e59] font-medium text-white"
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

                        <span className="truncate">{item.label}</span>

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

        <div className="border-t border-white/10 p-3">
          <Link
            href="/company/settings"
            className={`flex min-h-[42px] items-center gap-3 rounded-[9px] px-3 text-[11px] transition ${
              isActive("/company/settings")
                ? "bg-[#178e59] font-medium text-white"
                : "text-white/64 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <Settings className="h-[15px] w-[15px]" strokeWidth={1.7} />
            ตั้งค่าบริษัท
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-[#153b28]/8 bg-white px-5 sm:px-7 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#53645a] hover:bg-[#eef3ef] lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold tracking-[-0.025em] text-[#192a20]">
              {pageTitle}
            </p>

            <p className="mt-0.5 hidden text-[8px] uppercase tracking-[0.13em] text-[#98a29c] sm:block">
              {company.companyName}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/company/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#64736a] hover:bg-[#eef3ef] hover:text-[#247049]"
            >
              <Bell className="h-[16px] w-[16px]" strokeWidth={1.7} />

              <span className="absolute right-[6px] top-[6px] h-1.5 w-1.5 rounded-full bg-[#e14f4f] ring-2 ring-white" />
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[#f0f4f1]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff1e4] text-[10px] font-semibold text-[#1d7548]">
                  {initials}
                </span>

                <span className="hidden text-left md:block">
                  <span className="block max-w-[135px] truncate text-[10px] font-semibold text-[#293a30]">
                    {fullName}
                  </span>

                  <span className="block text-[8px] text-[#8a968e]">
                    Company Admin
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
                    onClick={() => setProfileOpen(false)}
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
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex min-h-[40px] w-full items-center gap-3 rounded-[9px] px-3 text-left text-[11px] text-[#b14545] hover:bg-[#fff1f1] disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.6} />

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

        <main className="min-h-[calc(100vh-68px)] p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}