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
  Activity,
  Radio,
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

const summaryStyles = [
  {
    iconBox: "bg-[#e7f6ed] text-[#16834d]",
    accent: "from-[#27aa67] to-[#69cb91]",
    soft: "bg-[#f3fbf6]",
  },
  {
    iconBox: "bg-[#e8f1ff] text-[#2f76c8]",
    accent: "from-[#428fdf] to-[#76b5ef]",
    soft: "bg-[#f4f8ff]",
  },
  {
    iconBox: "bg-[#fff2de] text-[#d88415]",
    accent: "from-[#f3a52d] to-[#f6c36a]",
    soft: "bg-[#fffaf1]",
  },
  {
    iconBox: "bg-[#f0eafe] text-[#7953c6]",
    accent: "from-[#8867d7] to-[#b095ed]",
    soft: "bg-[#faf7ff]",
  },
];

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
    <section className="mx-auto w-full max-w-[1600px]">
      {/* Welcome */}
      <header className="relative overflow-hidden rounded-[22px] border border-[#197548]/10 bg-gradient-to-br from-[#0f6a42] via-[#147d4d] to-[#1f955b] px-6 py-6 text-white shadow-[0_18px_45px_rgba(22,110,67,0.18)] sm:px-7">
        <div className="gf-soft-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              <Building2 className="h-3.5 w-3.5" />
              {company.companyCode}
            </div>

            <h1 className="mt-4 text-[28px] font-bold tracking-[-0.045em] sm:text-[35px]">
              ยินดีต้อนรับ, {session.firstName} 👋
            </h1>

            <p className="mt-2 max-w-[680px] text-[11px] leading-6 text-white/75 sm:text-[12px]">
              จัดการข้อมูลสำคัญของ {company.companyName} ได้จากพื้นที่ทำงานนี้
              ทั้งผู้ใช้งาน เครื่องจักร QR Code เซนเซอร์ และข้อมูลทรัพยากร
            </p>
          </div>

          <div className="min-w-[210px] rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7ef0aa] shadow-[0_0_0_5px_rgba(126,240,170,0.12)]" />
              <p className="text-[10px] font-semibold text-white/85">Company Status</p>
            </div>
            <p className="mt-3 text-[20px] font-bold">
              {company.status === "ACTIVE" ? "Active" : company.status}
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/60">
              {company.companyName}
            </p>
          </div>
        </div>
      </header>

      {/* Summary */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item, index) => {
          const Icon = item.icon;
          const style = summaryStyles[index];

          return (
            <article
              key={item.label}
              className={`gf-panel gf-card-hover relative overflow-hidden p-5 ${style.soft}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent}`} />
              <div className="flex items-start justify-between gap-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${style.iconBox}`}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>

                <p className="text-[29px] font-bold tracking-[-0.05em] text-[#173326]">
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
        <article className="gf-panel p-5 sm:p-6">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.025em] text-[#273a2e]">
              เริ่มต้นใช้งาน
            </h2>

            <p className="mt-1 text-[9px] text-[#8d9791]">
              ทางลัดสำหรับจัดการข้อมูลภายในบริษัท
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const actionStyles = [
                "bg-[#e8f6ee] text-[#18834d]",
                "bg-[#eaf2ff] text-[#3479c8]",
                "bg-[#f1eafe] text-[#7652c5]",
                "bg-[#fff0e2] text-[#da811c]",
              ];
              const actionStyle = actionStyles[index];

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex min-h-[92px] items-center gap-4 rounded-[15px] border border-[#dfe9e2] bg-[#fbfdfb] px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#bcd9c5] hover:bg-white hover:shadow-[0_12px_30px_rgba(26,67,43,0.09)]"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${actionStyle}`}>
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
        <article className="gf-panel p-5 sm:p-6">
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

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="gf-panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#233b2e]">สถานะระบบวันนี้</h2>
              <p className="mt-1 text-[9px] text-[#89958e]">ข้อมูลสรุปจากการทำงานภายในระบบ</p>
            </div>
            <Activity className="h-5 w-5 text-[#238151]" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[15px] bg-[#eef9f2] p-4">
              <p className="text-[8px] text-[#789084]">บันทึกสำเร็จ</p>
              <p className="mt-1 text-[24px] font-bold text-[#18834d]">93</p>
            </div>
            <div className="rounded-[15px] bg-[#fff6e7] p-4">
              <p className="text-[8px] text-[#8e8371]">รอดำเนินการ</p>
              <p className="mt-1 text-[24px] font-bold text-[#d88415]">14</p>
            </div>
            <div className="rounded-[15px] bg-[#f1edff] p-4">
              <p className="text-[8px] text-[#817892]">QR ใกล้หมดอายุ</p>
              <p className="mt-1 text-[24px] font-bold text-[#7953c6]">5</p>
            </div>
          </div>
        </article>

        <article className="gf-panel p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-[#233b2e]">บริการที่เชื่อมต่อ</h2>
          <div className="mt-4 space-y-3">
            {[
              ["ฐานข้อมูล", "พร้อมใช้งาน", "bg-[#2cac67]"],
              ["Authentication", "ทำงานปกติ", "bg-[#3f8cd8]"],
              ["QR Service", "พร้อมใช้งาน", "bg-[#8b69d6]"],
            ].map(([label, status, dot]) => (
              <div key={label} className="flex items-center rounded-[13px] border border-[#e2ebe5] bg-[#fbfdfb] px-3 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="ml-3 text-[9px] font-semibold text-[#455b4c]">{label}</span>
                <span className="ml-auto text-[8px] text-[#87938c]">{status}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}