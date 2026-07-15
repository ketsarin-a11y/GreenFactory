import {
  Activity,
  Bell,
  Building2,
  Factory,
  QrCode,
  ShieldCheck,
  Users,
  Waves,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
          createdAt: true,
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
        take: 5,
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
          role: {
            select: {
              roleName: true,
            },
          },
        },
      }),
    ]);

  const overviewCards = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: userCount,
      description: "บัญชีภายในบริษัท",
      icon: Users,
    },
    {
      label: "ผู้ใช้งานที่เปิดใช้งาน",
      value: activeUserCount,
      description: "บัญชีสถานะ Active",
      icon: ShieldCheck,
    },
    {
      label: "เครื่องจักรทั้งหมด",
      value: 0,
      description: "ยังไม่มีข้อมูลเครื่องจักร",
      icon: Factory,
    },
    {
      label: "เซนเซอร์ทั้งหมด",
      value: 0,
      description: "ยังไม่มีข้อมูลเซนเซอร์",
      icon: Waves,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1600px]">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#32815a]">
            Company overview
          </p>

          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#17291f] sm:text-[36px]">
            ภาพรวมบริษัท
          </h1>

          <p className="mt-2 text-[12px] text-[#758179]">
            {company?.companyName} · {company?.companyCode}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[#21432e]/10 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(26,57,37,0.04)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#35a968]" />

          <span className="text-[10px] font-medium text-[#52665a]">
            บริษัทพร้อมใช้งาน
          </span>
        </div>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.045)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#e8f4eb] text-[#24784d]">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>

              <p className="mt-6 text-[32px] font-semibold tracking-[-0.05em] text-[#173020]">
                {item.value.toLocaleString("th-TH")}
              </p>

              <p className="mt-1 text-[12px] font-semibold text-[#34483b]">
                {item.label}
              </p>

              <p className="mt-1.5 text-[9px] text-[#8a958e]">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-6 shadow-[0_12px_36px_rgba(24,54,35,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#24382b]">
                ผู้ใช้งานล่าสุด
              </h2>

              <p className="mt-1 text-[9px] text-[#8a958e]">
                บัญชีล่าสุดที่ถูกสร้างภายในบริษัท
              </p>
            </div>

            <Activity className="h-5 w-5 text-[#559169]" />
          </div>

          {recentUsers.length === 0 ? (
            <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#294831]/14 bg-[#fafcf9] text-center">
              <Users className="h-7 w-7 text-[#769280]" />

              <p className="mt-4 text-[12px] font-semibold text-[#425548]">
                ยังไม่มีผู้ใช้งาน
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-[#24432e]/8">
              {recentUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#e8f4eb] text-[10px] font-semibold text-[#24784d]">
                    {`${user.firstName?.[0] ?? ""}${
                      user.lastName?.[0] ?? ""
                    }`.toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-[#35493c]">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#869189]">
                      {user.email}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf5ed] px-2.5 py-1 text-[8px] font-medium text-[#26754b]">
                    {user.role.roleName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-6 shadow-[0_12px_36px_rgba(24,54,35,0.04)]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#24382b]">
              ทางลัด
            </h2>

            <p className="mt-1 text-[9px] text-[#8a958e]">
              เมนูที่ใช้บ่อยภายในบริษัท
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              ["จัดการผู้ใช้งาน", "/company/users", Users],
              ["เพิ่มเครื่องจักร", "/company/machines", Factory],
              ["จัดการ QR Code", "/company/qr-codes", QrCode],
              ["ดูการแจ้งเตือน", "/company/notifications", Bell],
            ].map(([label, href, Icon]) => (
              <a
                key={String(href)}
                href={String(href)}
                className="flex items-center gap-3 rounded-[13px] border border-[#26452f]/8 bg-[#fafcf9] px-4 py-4 transition hover:border-[#2b8054]/20 hover:bg-[#f4f8f4]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#e7f4eb] text-[#24764b]">
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </span>

                <span className="text-[10px] font-medium text-[#405247]">
                  {String(label)}
                </span>
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}