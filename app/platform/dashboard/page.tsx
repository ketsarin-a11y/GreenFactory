import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Factory,
  Leaf,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(date: Date | null) {
  if (!date) return "ยังไม่มีข้อมูล";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function formatTime(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function getRoleDisplayName(roleName: string) {
  const labels: Record<string, string> = {
    PLATFORM_ADMIN: "Platform Admin",
    COMPANY_ADMIN: "Company Admin",
    MANAGER: "Manager",
    OPERATOR: "Operator",
  };

  return labels[roleName] ?? roleName;
}

function getStatus(status: string) {
  if (status === "ACTIVE") {
    return {
      label: "ใช้งานอยู่",
      className: "bg-[#EAF7EF] text-[#18834C]",
    };
  }

  return {
    label: "ปิดใช้งาน",
    className: "bg-[#F3F4F6] text-[#6B7280]",
  };
}

export default async function PlatformDashboardPage() {
  const session = await getSession();

  const [
    companyCount,
    userCount,
    activeUserCount,
    roleCount,
    latestCompanies,
    latestUsers,
    roles,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.user.count({
      where: { status: "ACTIVE" },
    }),
    prisma.role.count(),
    prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        companyId: true,
        companyName: true,
        companyCode: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: {
          select: {
            roleName: true,
          },
        },
      },
    }),
    prisma.role.findMany({
      orderBy: { roleId: "asc" },
      select: {
        roleId: true,
        roleName: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    }),
  ]);

  const activeRate =
    userCount > 0 ? Math.round((activeUserCount / userCount) * 100) : 0;

  const activity = [
    ...latestCompanies.map((company) => ({
      id: `company-${company.companyId}`,
      title: `เพิ่มบริษัท ${company.companyName}`,
      detail: company.companyCode,
      date: company.createdAt,
      type: "company" as const,
    })),
    ...latestUsers.map((user) => ({
      id: `user-${user.userId}`,
      title: `เพิ่มผู้ใช้งาน ${user.firstName} ${user.lastName}`,
      detail: getRoleDisplayName(user.role.roleName),
      date: user.createdAt,
      type: "user" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  const cards = [
    {
      label: "บริษัททั้งหมด",
      value: companyCount,
      suffix: "บริษัท",
      icon: Building2,
      iconClass: "bg-[#E7F6EC] text-[#13834A]",
      detail: "องค์กรในแพลตฟอร์ม",
    },
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: userCount,
      suffix: "คน",
      icon: Users,
      iconClass: "bg-[#EAF2FF] text-[#2E6FC2]",
      detail: `${activeUserCount.toLocaleString("th-TH")} บัญชีเปิดใช้งาน`,
    },
    {
      label: "อัตราการใช้งาน",
      value: activeRate,
      suffix: "%",
      icon: UserRoundCheck,
      iconClass: "bg-[#FFF4DE] text-[#B97208]",
      detail: "เทียบกับผู้ใช้ทั้งหมด",
    },
    {
      label: "บทบาทในระบบ",
      value: roleCount,
      suffix: "บทบาท",
      icon: ShieldCheck,
      iconClass: "bg-[#F0ECFF] text-[#6C52B8]",
      detail: "สิทธิ์ที่กำหนดไว้",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1600px] pb-10">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#1C2B23]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-[11px] text-[#7B8780]">
            ยินดีต้อนรับ {session?.firstName} {session?.lastName} ·
            ภาพรวมข้อมูลล่าสุดของ GreenFactory Insight
          </p>
        </div>

        <div className="flex h-10 w-fit items-center gap-3 rounded-[10px] border border-[#DDE5E0] bg-white px-3.5 text-[10px] text-[#66746B]">
          <CalendarDays className="h-4 w-4 text-[#6E7D73]" />
          {formatDate(new Date())}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-[14px] border border-[#E1E7E3] bg-white p-5 shadow-[0_4px_18px_rgba(28,55,38,0.035)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.iconClass}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>

                <span className="text-[9px] font-medium text-[#97A19B]">
                  ข้อมูลปัจจุบัน
                </span>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <strong className="text-[29px] font-bold tracking-[-0.04em] text-[#16251D]">
                  {card.value.toLocaleString("th-TH")}
                </strong>
                <span className="mb-1 text-[10px] font-medium text-[#7E8A83]">
                  {card.suffix}
                </span>
              </div>

              <p className="mt-1 text-[11px] font-semibold text-[#33443A]">
                {card.label}
              </p>
              <p className="mt-1 text-[9px] text-[#8D9891]">{card.detail}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
        <article className="rounded-[14px] border border-[#E1E7E3] bg-white shadow-[0_4px_18px_rgba(28,55,38,0.035)]">
          <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
            <div>
              <h2 className="text-[12px] font-bold text-[#26382E]">
                ผู้ใช้งานตามบทบาท
              </h2>
              <p className="mt-1 text-[9px] text-[#8A958E]">
                สัดส่วนบัญชีในแต่ละระดับสิทธิ์
              </p>
            </div>

            <Users className="h-[18px] w-[18px] text-[#507565]" />
          </div>

          <div className="p-5">
            <div className="flex min-h-[230px] items-end gap-4 border-b border-l border-[#E4EAE6] px-4 pb-0 pt-4">
              {roles.map((role, index) => {
                const percentage =
                  userCount > 0
                    ? Math.round((role._count.users / userCount) * 100)
                    : 0;

                const barClasses = [
                  "bg-[#2A9B5F]",
                  "bg-[#4E7EC7]",
                  "bg-[#E4A22B]",
                  "bg-[#7B65C2]",
                ];

                return (
                  <div
                    key={role.roleId}
                    className="flex h-[205px] min-w-0 flex-1 flex-col justify-end"
                  >
                    <div className="mb-2 text-center">
                      <p className="text-[11px] font-bold text-[#2E4136]">
                        {role._count.users.toLocaleString("th-TH")}
                      </p>
                      <p className="mt-0.5 text-[8px] text-[#9AA39E]">
                        {percentage}%
                      </p>
                    </div>

                    <div
                      className={`mx-auto w-full max-w-[70px] rounded-t-[6px] ${
                        barClasses[index % barClasses.length]
                      }`}
                      style={{
                        height: `${Math.max(percentage * 1.55, role._count.users > 0 ? 24 : 0)}px`,
                      }}
                    />

                    <p className="mt-3 truncate text-center text-[8px] font-medium text-[#6F7C74]">
                      {getRoleDisplayName(role.roleName)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article className="rounded-[14px] border border-[#E1E7E3] bg-white shadow-[0_4px_18px_rgba(28,55,38,0.035)]">
          <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
            <div>
              <h2 className="text-[12px] font-bold text-[#26382E]">
                สถานะระบบ
              </h2>
              <p className="mt-1 text-[9px] text-[#8A958E]">
                บริการหลักของแพลตฟอร์ม
              </p>
            </div>

            <Database className="h-[18px] w-[18px] text-[#507565]" />
          </div>

          <div className="divide-y divide-[#EDF1EE] px-5">
            {[
              ["MySQL Database", "Connected", Database],
              ["Prisma ORM", "Operational", Activity],
              ["Authentication", "Protected", ShieldCheck],
              ["GreenFactory Platform", "Online", Leaf],
            ].map(([name, status, Icon]) => {
              const ServiceIcon = Icon as typeof Database;

              return (
                <div
                  key={name as string}
                  className="flex items-center gap-3 py-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F1F6F3] text-[#387158]">
                    <ServiceIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#384B40]">
                      {name as string}
                    </p>
                    <p className="mt-1 text-[8px] text-[#8C9790]">
                      {status as string}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[8px] font-medium text-[#1E8A50]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    พร้อมใช้งาน
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <article className="rounded-[14px] border border-[#E1E7E3] bg-white shadow-[0_4px_18px_rgba(28,55,38,0.035)]">
          <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
            <div>
              <h2 className="text-[12px] font-bold text-[#26382E]">
                บริษัทล่าสุด
              </h2>
              <p className="mt-1 text-[9px] text-[#8A958E]">
                องค์กรที่เพิ่มเข้ามาล่าสุด
              </p>
            </div>

            <Link
              href="/platform/companies"
              className="flex items-center gap-1 text-[9px] font-semibold text-[#2D72C5]"
            >
              ดูทั้งหมด
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#EDF1EE] px-5">
            {latestCompanies.map((company) => {
              const status = getStatus(company.status);

              return (
                <div
                  key={company.companyId}
                  className="flex items-center gap-3 py-3.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F6ED] text-[#19824D]">
                    <Factory className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-semibold text-[#384A40]">
                      {company.companyName}
                    </p>
                    <p className="mt-1 text-[8px] text-[#929C96]">
                      {formatDate(company.createdAt)}
                    </p>
                  </div>

                  <span className={`rounded-[5px] px-2 py-1 text-[7px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[14px] border border-[#E1E7E3] bg-white shadow-[0_4px_18px_rgba(28,55,38,0.035)]">
          <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
            <div>
              <h2 className="text-[12px] font-bold text-[#26382E]">
                กิจกรรมล่าสุด
              </h2>
              <p className="mt-1 text-[9px] text-[#8A958E]">
                การเปลี่ยนแปลงล่าสุดในระบบ
              </p>
            </div>

            <Link
              href="/platform/audit-logs"
              className="flex items-center gap-1 text-[9px] font-semibold text-[#2D72C5]"
            >
              ดูทั้งหมด
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#EDF1EE] px-5">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3.5">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.type === "company"
                      ? "bg-[#E8F6ED] text-[#19824D]"
                      : "bg-[#EAF2FF] text-[#2E6FC2]"
                  }`}
                >
                  {item.type === "company" ? (
                    <Building2 className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-semibold text-[#384A40]">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[8px] text-[#929C96]">
                    {item.detail}
                  </p>
                </div>

                <span className="flex items-center gap-1 text-[7px] text-[#9AA39D]">
                  <Clock3 className="h-3 w-3" />
                  {formatTime(item.date)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[14px] border border-[#E1E7E3] bg-white shadow-[0_4px_18px_rgba(28,55,38,0.035)]">
          <div className="flex items-center justify-between border-b border-[#E8EDEA] px-5 py-4">
            <div>
              <h2 className="text-[12px] font-bold text-[#26382E]">
                การเข้าสู่ระบบล่าสุด
              </h2>
              <p className="mt-1 text-[9px] text-[#8A958E]">
                บัญชีที่เข้าใช้งานล่าสุด
              </p>
            </div>

            <UserRoundCheck className="h-[18px] w-[18px] text-[#507565]" />
          </div>

          <div className="divide-y divide-[#EDF1EE] px-5">
            {latestUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 py-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2F6] text-[8px] font-bold text-[#52606D]">
                  {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-semibold text-[#384A40]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 truncate text-[8px] text-[#929C96]">
                    {getRoleDisplayName(user.role.roleName)}
                  </p>
                </div>

                <span className="text-[7px] text-[#9AA39D]">
                  {formatTime(user.lastLogin)}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}