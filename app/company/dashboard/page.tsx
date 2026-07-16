import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  Factory,
  QrCode,
  ShieldCheck,
  UserPlus,
  Users,
  Waves,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function getRoleLabel(roleName: string) {
  switch (roleName) {
    case "COMPANY_ADMIN":
      return "ผู้ดูแลบริษัท";

    case "MANAGER":
      return "ผู้จัดการ";

    case "OPERATOR":
      return "ผู้ปฏิบัติงาน";

    default:
      return roleName;
  }
}

function getInitials(firstName: string, lastName: string) {
  const initials = `${firstName?.[0] ?? ""}${
    lastName?.[0] ?? ""
  }`.toUpperCase();

  return initials || "US";
}

export default async function CompanyDashboardPage() {
  const session = await getSession();

  if (!session?.companyId) {
    return null;
  }

  const [company, userCount, activeUserCount, recentUsers] =
    await Promise.all([
      prisma.company.findUnique({
        where: {
          companyId: session.companyId,
        },
        select: {
          companyName: true,
          companyCode: true,
          status: true,
        },
      }),

      prisma.user.count({
        where: {
          companyId: session.companyId,
        },
      }),

      prisma.user.count({
        where: {
          companyId: session.companyId,
          status: "ACTIVE",
        },
      }),

      prisma.user.findMany({
        where: {
          companyId: session.companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          role: {
            select: {
              roleName: true,
            },
          },
        },
      }),
    ]);

  if (!company) {
    return null;
  }

  const overviewItems = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: userCount,
      detail: "บัญชีภายในองค์กร",
      icon: Users,
    },
    {
      label: "บัญชีที่เปิดใช้งาน",
      value: activeUserCount,
      detail: "พร้อมเข้าสู่ระบบ",
      icon: ShieldCheck,
    },
    {
      label: "เครื่องจักร",
      value: 0,
      detail: "รอเพิ่มข้อมูล",
      icon: Factory,
    },
    {
      label: "เซนเซอร์",
      value: 0,
      detail: "รอเพิ่มข้อมูล",
      icon: Waves,
    },
  ];

  const quickActions = [
    {
      title: "เพิ่มผู้ใช้งาน",
      description: "สร้างบัญชี Manager หรือ Operator",
      href: "/company/users",
      icon: UserPlus,
    },
    {
      title: "จัดการเครื่องจักร",
      description: "เพิ่มและดูรายการเครื่องจักร",
      href: "/company/machines",
      icon: Factory,
    },
    {
      title: "จัดการ QR Code",
      description: "สร้าง QR Code สำหรับแต่ละเครื่อง",
      href: "/company/qr-codes",
      icon: QrCode,
    },
    {
      title: "ดูการแจ้งเตือน",
      description: "ตรวจสอบเหตุการณ์ที่ต้องดำเนินการ",
      href: "/company/notifications",
      icon: Bell,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1500px]">
      {/* Welcome */}
      <header className="overflow-hidden rounded-[24px] border border-[#21412d]/8 bg-white shadow-[0_16px_50px_rgba(25,56,37,0.045)]">
        <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf6ef] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2f7b51]">
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              Company Workspace
            </div>

            <h1 className="mt-5 text-[34px] font-bold tracking-[-0.055em] text-[#17281f] sm:text-[40px]">
              สวัสดี,{" "}
              <span className="bg-gradient-to-r from-[#1d7b49] to-[#45a96e] bg-clip-text text-transparent">
                {session.firstName}
              </span>{" "}
              👋
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#dbe8df] bg-[#fafcfb] px-3 py-1 text-[10px] font-medium text-[#456052]">
                {company.companyName}
              </span>

              <span className="rounded-full border border-[#dbe8df] bg-[#fafcfb] px-3 py-1 text-[10px] font-medium text-[#456052]">
                Company Administrator
              </span>
            </div>

            <p className="mt-5 max-w-[650px] text-[12px] leading-7 text-[#758178]">
              ยินดีต้อนรับกลับเข้าสู่{" "}
              <span className="font-semibold text-[#206e44]">
                GreenFactory Insight
              </span>{" "}
              จัดการผู้ใช้งาน เครื่องจักร เซนเซอร์ QR Code
              และข้อมูลทรัพยากรขององค์กรได้จากเมนูด้านซ้าย
            </p>
          </div>

          <div className="min-w-[190px] rounded-[18px] border border-[#254630]/8 bg-[#f8faf8] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#37a969]/25" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#37a969]" />
              </span>

              <p className="text-[10px] font-semibold text-[#405348]">
                Company Status
              </p>
            </div>

            <p className="mt-3 text-[12px] font-semibold text-[#1f7b49]">
              ● Active
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-[#909b95]">
              {company.companyCode}
            </p>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-[18px] border border-[#203e2b]/8 bg-white p-5 shadow-[0_10px_32px_rgba(24,54,35,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(24,54,35,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#edf5ef] text-[#28764d]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>

                <p className="text-[29px] font-semibold tracking-[-0.05em] text-[#183021]">
                  {item.value.toLocaleString("th-TH")}
                </p>
              </div>

              <p className="mt-5 text-[11px] font-semibold text-[#3b4e42]">
                {item.label}
              </p>

              <p className="mt-1 text-[8px] text-[#929c95]">
                {item.detail}
              </p>
            </article>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Quick actions */}
        <article className="rounded-[20px] border border-[#203e2b]/8 bg-white p-5 shadow-[0_12px_38px_rgba(24,54,35,0.035)] sm:p-6">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.025em] text-[#273a2e]">
              เริ่มต้นใช้งาน
            </h2>

            <p className="mt-1 text-[9px] text-[#8d9791]">
              ทางลัดสำหรับจัดการข้อมูลภายในบริษัท
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex min-h-[92px] items-center gap-4 rounded-[15px] border border-[#254630]/8 bg-[#fafcf9] px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#2a7b51]/18 hover:bg-white hover:shadow-[0_12px_30px_rgba(26,67,43,0.065)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e8f3eb] text-[#28774e]">
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.7}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-semibold text-[#3d5144]">
                      {action.title}
                    </span>

                    <span className="mt-1 block text-[8px] leading-4 text-[#919b95]">
                      {action.description}
                    </span>
                  </span>

                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[#abb2ad] transition group-hover:translate-x-1 group-hover:text-[#28774e]"
                    strokeWidth={1.6}
                  />
                </Link>
              );
            })}
          </div>
        </article>

        {/* Latest users */}
        <article className="rounded-[20px] border border-[#203e2b]/8 bg-white p-5 shadow-[0_12px_38px_rgba(24,54,35,0.035)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.025em] text-[#273a2e]">
                ผู้ใช้งานล่าสุด
              </h2>

              <p className="mt-1 text-[9px] text-[#8d9791]">
                บัญชีล่าสุดภายในบริษัท
              </p>
            </div>

            <Link
              href="/company/users"
              className="inline-flex items-center gap-1.5 text-[9px] font-medium text-[#28754c] transition hover:text-[#195d39]"
            >
              ดูทั้งหมด
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="mt-5 flex min-h-[260px] flex-col items-center justify-center rounded-[15px] border border-dashed border-[#294831]/14 bg-[#fafcf9] px-5 text-center">
              <Users
                className="h-7 w-7 text-[#789181]"
                strokeWidth={1.5}
              />

              <p className="mt-4 text-[11px] font-semibold text-[#4a5c50]">
                ยังไม่มีผู้ใช้งาน
              </p>

              <p className="mt-1.5 text-[9px] text-[#929c95]">
                เริ่มเพิ่มผู้จัดการหรือผู้ปฏิบัติงานเข้าสู่ระบบ
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#24432e]/8">
              {recentUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f2e9] text-[10px] font-semibold text-[#28764d]">
                    {getInitials(user.firstName, user.lastName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#3a4d40]">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="mt-1 truncate text-[8px] text-[#909a94]">
                      {user.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex rounded-full bg-[#edf5ef] px-2.5 py-1 text-[8px] font-medium text-[#317551]">
                      {getRoleLabel(user.role.roleName)}
                    </span>

                    <p className="mt-1.5 text-[7px] text-[#9ca49f]">
                      {user.status === "ACTIVE"
                        ? "เปิดใช้งาน"
                        : "ปิดใช้งาน"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}