import {
  Activity,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function formatDateTime(date: Date | null) {
  if (!date) {
    return "ยังไม่มีข้อมูล";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function getRoleDisplayName(roleName: string) {
  switch (roleName) {
    case "PLATFORM_ADMIN":
      return "ผู้ดูแลแพลตฟอร์ม";

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
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.role.count(),

    prisma.company.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
      orderBy: {
        roleId: "asc",
      },
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

  const overviewCards = [
    {
      label: "บริษัททั้งหมด",
      value: companyCount,
      description: "องค์กรที่อยู่บนแพลตฟอร์ม",
      icon: Building2,
    },
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: userCount,
      description: "บัญชีผู้ใช้ทุกบทบาท",
      icon: Users,
    },
    {
      label: "ผู้ใช้งานที่เปิดใช้งาน",
      value: activeUserCount,
      description: "บัญชีที่มีสถานะ Active",
      icon: UserRoundCheck,
    },
    {
      label: "บทบาทในระบบ",
      value: roleCount,
      description: "สิทธิ์การใช้งานที่กำหนดไว้",
      icon: ShieldCheck,
    },
  ];

  const latestActivity = [
    ...latestCompanies.map((company) => ({
      id: `company-${company.companyId}`,
      title: `เพิ่มบริษัท ${company.companyName}`,
      description: `รหัสองค์กร ${company.companyCode}`,
      date: company.createdAt,
      type: "company" as const,
    })),

    ...latestUsers.map((user) => ({
      id: `user-${user.userId}`,
      title: `เพิ่มผู้ใช้งาน ${user.firstName} ${user.lastName}`,
      description: getRoleDisplayName(user.role.roleName),
      date: user.createdAt,
      type: "user" as const,
    })),
  ]
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .slice(0, 7);

  return (
    <section className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#32815a]">
            Platform overview
          </p>

          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#17291f] sm:text-[36px]">
            ภาพรวมแพลตฟอร์ม
          </h1>

          <p className="mt-2 text-[12px] text-[#758179]">
            ยินดีต้อนรับ {session?.firstName} {session?.lastName}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-[#21432e]/10 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(26,57,37,0.04)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#35a968]/35" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#35a968]" />
          </span>

          <span className="text-[10px] font-medium text-[#52665a]">
            ระบบพร้อมใช้งาน
          </span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,54,35,0.075)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#e8f4eb] text-[#24784d]">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>

                <span className="rounded-full bg-[#f3f7f4] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-[#718078]">
                  Live
                </span>
              </div>

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

      {/* Main dashboard */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        {/* Recent activity */}
        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.04)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#24382b]">
                กิจกรรมล่าสุด
              </h2>

              <p className="mt-1 text-[9px] text-[#8a958e]">
                ข้อมูลล่าสุดที่เกิดขึ้นจริงในแพลตฟอร์ม
              </p>
            </div>

            <Activity
              className="h-5 w-5 text-[#559169]"
              strokeWidth={1.6}
            />
          </div>

          {latestActivity.length === 0 ? (
            <div className="mt-6 flex min-h-[330px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#294831]/14 bg-[#fafcf9] px-6 text-center">
              <Activity
                className="h-7 w-7 text-[#6f967c]"
                strokeWidth={1.5}
              />

              <p className="mt-4 text-[12px] font-semibold text-[#3b5143]">
                ยังไม่มีกิจกรรมในระบบ
              </p>

              <p className="mt-2 max-w-[360px] text-[10px] leading-5 text-[#8a958e]">
                เมื่อมีการเพิ่มบริษัทหรือผู้ใช้งาน
                ระบบจะแสดงรายการล่าสุดที่ส่วนนี้
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-[#24432e]/8">
              {latestActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${
                      activity.type === "company"
                        ? "bg-[#e8f4eb] text-[#25784d]"
                        : "bg-[#edf2fb] text-[#4d6fa8]"
                    }`}
                  >
                    {activity.type === "company" ? (
                      <Building2 className="h-4 w-4" strokeWidth={1.7} />
                    ) : (
                      <Users className="h-4 w-4" strokeWidth={1.7} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-[#35493c]">
                      {activity.title}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#869189]">
                      {activity.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-[8px] text-[#99a29c]">
                    <Clock3 className="h-3 w-3" strokeWidth={1.6} />
                    {formatDateTime(activity.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Role distribution */}
        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.04)] sm:p-6">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#24382b]">
              ผู้ใช้งานตามบทบาท
            </h2>

            <p className="mt-1 text-[9px] text-[#8a958e]">
              จำนวนบัญชีจริงในแต่ละระดับสิทธิ์
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {roles.map((role) => {
              const count = role._count.users;
              const percentage =
                userCount > 0 ? Math.round((count / userCount) * 100) : 0;

              return (
                <div key={role.roleId}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-[#405247]">
                        {getRoleDisplayName(role.roleName)}
                      </p>

                      <p className="mt-1 text-[8px] text-[#929c95]">
                        {role.roleName}
                      </p>
                    </div>

                    <p className="text-[12px] font-semibold text-[#1f633f]">
                      {count.toLocaleString("th-TH")}
                    </p>
                  </div>

                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#edf2ee]">
                    <div
                      className="h-full rounded-full bg-[#2d9a61] transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* Bottom section */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Latest companies */}
        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.04)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#24382b]">
                บริษัทล่าสุด
              </h2>

              <p className="mt-1 text-[9px] text-[#8a958e]">
                องค์กรที่เพิ่มเข้าสู่แพลตฟอร์มล่าสุด
              </p>
            </div>

            <Building2
              className="h-5 w-5 text-[#58916b]"
              strokeWidth={1.6}
            />
          </div>

          {latestCompanies.length === 0 ? (
            <div className="mt-5 rounded-[14px] border border-dashed border-[#294831]/14 bg-[#fafcf9] px-5 py-10 text-center">
              <p className="text-[11px] font-medium text-[#607168]">
                ยังไม่มีบริษัทในระบบ
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#24432e]/8">
              {latestCompanies.map((company) => (
                <div
                  key={company.companyId}
                  className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#e8f4eb] text-[#24784d]">
                    <Building2 className="h-4 w-4" strokeWidth={1.7} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#3b4e42]">
                      {company.companyName}
                    </p>

                    <p className="mt-1 text-[8px] text-[#8e9992]">
                      {company.companyCode}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf5ed] px-2.5 py-1 text-[8px] font-medium text-[#26754b]">
                    {company.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* System status */}
        <article className="rounded-[20px] border border-[#203d2a]/8 bg-white p-5 shadow-[0_12px_36px_rgba(24,54,35,0.04)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#24382b]">
                สถานะระบบ
              </h2>

              <p className="mt-1 text-[9px] text-[#8a958e]">
                บริการหลักที่กำลังใช้งาน
              </p>
            </div>

            <Database
              className="h-5 w-5 text-[#58916b]"
              strokeWidth={1.6}
            />
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["MySQL Database", "Connected"],
              ["Prisma ORM", "Operational"],
              ["Authentication", "Operational"],
              ["Session Protection", "Operational"],
            ].map(([service, status]) => (
              <div
                key={service}
                className="flex items-center justify-between gap-4 rounded-[13px] border border-[#26452f]/8 bg-[#fafcf9] px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-4 w-4 text-[#32a567]"
                    strokeWidth={1.7}
                  />

                  <span className="text-[10px] font-medium text-[#405247]">
                    {service}
                  </span>
                </div>

                <span className="text-[8px] font-medium text-[#28744b]">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}