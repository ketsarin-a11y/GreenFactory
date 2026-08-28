import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  Factory,
  Gauge,
  Network,
  QrCode,
  ShieldCheck,
  UserPlus,
  Users,
  Waves,
  TrendingUp,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function roleLabel(roleName: string) {
  if (roleName === "COMPANY_ADMIN") return "ผู้ดูแลระบบ";
  if (roleName === "MANAGER") return "ผู้จัดการ";
  if (roleName === "OPERATOR") return "ผู้ปฏิบัติงาน";
  return roleName;
}

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "US";
}

export default async function CompanyDashboardPage() {
  const session = await getSession();
  if (!session?.companyId) return null;

  const companyId = session.companyId;

  const [company, users, factories, recentUsers] = await Promise.all([
    prisma.company.findUnique({
      where: { companyId },
      select: {
        companyName: true,
        companyCode: true,
        status: true,
      },
    }),

    prisma.user.findMany({
      where: { companyId },
      select: {
        userId: true,
        status: true,
        factoryId: true,
        departmentId: true,
        role: { select: { roleName: true } },
      },
    }),

    prisma.factory.findMany({
      where: { companyId },
      orderBy: { factoryName: "asc" },
      select: {
        factoryId: true,
        factoryCode: true,
        factoryName: true,
        status: true,
        buildings: {
          select: {
            buildingId: true,
            departments: {
              select: {
                departmentId: true,
                productionLines: {
                  select: {
                    lineId: true,
                    machines: {
                      select: {
                        machineId: true,
                        status: true,
                        sensors: {
                          select: {
                            sensorId: true,
                            status: true,
                          },
                        },
                        qrCodes: {
                          select: {
                            qrId: true,
                            qrStatus: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        role: { select: { roleName: true } },
      },
    }),
  ]);

  if (!company) return null;

  let buildingCount = 0;
  let departmentCount = 0;
  let lineCount = 0;
  let machineCount = 0;
  let activeMachineCount = 0;
  let sensorCount = 0;
  let activeSensorCount = 0;
  let machinesWithSensor = 0;
  let machinesWithQr = 0;

  const factoryCoverage = factories.map((factory) => {
    let buildings = 0;
    let departments = 0;
    let lines = 0;
    let machines = 0;
    let sensors = 0;
    let withSensor = 0;
    let withQr = 0;

    for (const building of factory.buildings) {
      buildingCount++;
      buildings++;

      for (const department of building.departments) {
        departmentCount++;
        departments++;

        for (const line of department.productionLines) {
          lineCount++;
          lines++;

          for (const machine of line.machines) {
            machineCount++;
            machines++;

            if (machine.status === "ACTIVE") activeMachineCount++;

            sensorCount += machine.sensors.length;
            sensors += machine.sensors.length;
            activeSensorCount += machine.sensors.filter((s) => s.status === "ACTIVE").length;

            if (machine.sensors.length > 0) {
              machinesWithSensor++;
              withSensor++;
            }

            if (machine.qrCodes.length > 0) {
              machinesWithQr++;
              withQr++;
            }
          }
        }
      }
    }

    const structureScore =
      buildings > 0 && departments > 0 && lines > 0 ? 100 : buildings > 0 ? 60 : 20;

    const readiness = Math.round(
      structureScore * 0.35 +
        pct(withSensor, machines) * 0.35 +
        pct(withQr, machines) * 0.3,
    );

    return {
      id: factory.factoryId,
      code: factory.factoryCode,
      name: factory.factoryName,
      status: factory.status,
      buildings,
      machines,
      sensors,
      readiness,
    };
  });

  const userCount = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const managers = users.filter((u) => u.role.roleName === "MANAGER").length;
  const operators = users.filter((u) => u.role.roleName === "OPERATOR").length;
  const inactiveUsers = users.filter((u) => u.status !== "ACTIVE").length;
  const usersWithoutFactory = users.filter(
    (u) => u.role.roleName !== "COMPANY_ADMIN" && u.factoryId == null,
  ).length;
  const operatorsWithoutDepartment = users.filter(
    (u) => u.role.roleName === "OPERATOR" && u.departmentId == null,
  ).length;

  const organizationScore =
    factories.length > 0 && buildingCount > 0 && departmentCount > 0 && lineCount > 0
      ? 100
      : factories.length > 0
        ? 65
        : 20;

  const userScore = pct(activeUsers, userCount);
  const assetScore = pct(activeMachineCount, machineCount);
  const sensorCoverage = pct(machinesWithSensor, machineCount);
  const qrCoverage = pct(machinesWithQr, machineCount);

  const readiness = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        organizationScore * 0.25 +
          userScore * 0.2 +
          assetScore * 0.2 +
          sensorCoverage * 0.2 +
          qrCoverage * 0.15,
      ),
    ),
  );

  const summary = [
    {
      label: "ผู้ใช้งานทั้งหมด",
      value: userCount,
      detail: `${activeUsers} บัญชี Active อยู่ในระบบ`,
      icon: Users,
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      progress: pct(activeUsers, userCount),
    },
    {
      label: "โรงงานในสังกัด",
      value: factories.length,
      detail: `${factories.filter((f) => f.status === "ACTIVE").length} โรงงานพร้อมปฏิบัติงาน`,
      icon: Building2,
      badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
      progress: factories.length > 0 ? 100 : 0,
    },
    {
      label: "เครื่องจักรทั้งหมด",
      value: machineCount,
      detail: `${activeMachineCount} เครื่องกำลังทำงาน`,
      icon: Factory,
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
      progress: pct(activeMachineCount, machineCount),
    },
    {
      label: "เซนเซอร์ IoT",
      value: sensorCount,
      detail: `${activeSensorCount} ตัวออนไลน์ปกติ`,
      icon: Waves,
      badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
      progress: pct(activeSensorCount, sensorCount),
    },
  ];

  const attentions = [
    ["เครื่องจักรยังไม่มี Sensor ติดตั้ง", Math.max(0, machineCount - machinesWithSensor), "/company/sensors"],
    ["เครื่องจักรยังไม่มี QR Code", Math.max(0, machineCount - machinesWithQr), "/company/qr-codes"],
    ["ผู้ใช้ยังไม่ถูกกำหนดสังกัดโรงงาน", usersWithoutFactory, "/company/users"],
    ["Operator ยังไม่ถูกระบุแผนกงาน", operatorsWithoutDepartment, "/company/users"],
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-16 font-sans text-slate-800">
      
      {/* 1. Minimal Clean Header (ตัดกรอบเขียวทึบออก ให้ดูเป็นมืออาชีพ เรียบง่าย) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>{company.companyName}</span>
            <span>•</span>
            <span className="text-emerald-700">{company.companyCode}</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            ยินดีต้อนรับกลับมา, {session.firstName}
          </h1>
        </div>

        {/* Status & Readiness Widget (กระชับและดูอินเตอร์ขึ้น) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">System Readiness</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-sm font-black text-slate-900">{readiness}% <span className="text-[11px] font-normal text-slate-400">({company.status})</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards ด้านบน */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <article 
              key={item.label} 
              className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.badgeColor} shadow-2xs`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <TrendingUp className="h-3 w-3" /> {item.progress}%
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  {item.value.toLocaleString("th-TH")}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{item.detail}</p>
              </div>

              <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                  style={{ width: `${item.progress}%` }} 
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* 3. ส่วนกลาง: Readiness Breakdown & Governance */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* รายละเอียด Readiness */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">ตัวชี้วัดความพร้อมเชิงระบบ</h2>
                <p className="mt-0.5 text-xs text-slate-400">วิเคราะห์สัดส่วนโครงสร้างองค์กร บัญชีผู้ใช้ และสถานะเครื่องจักร</p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Breakdown</span>
            </div>

            <div className="mt-5 space-y-4">
              <ReadinessItem label="โครงสร้างองค์กร (Organization Structure)" value={organizationScore} />
              <ReadinessItem label="สิทธิ์และการใช้งานระบบ (User & Access)" value={userScore} />
              <ReadinessItem label="ความพร้อมของเครื่องจักร (Asset Readiness)" value={assetScore} />
              <ReadinessItem label="ความครอบคลุมของเซนเซอร์ IoT (Sensor Coverage)" value={sensorCoverage} />
              <ReadinessItem label="ความครอบคลุมของรหัส QR Code (QR Coverage)" value={qrCoverage} />
            </div>
          </div>
        </article>

        {/* สิทธิ์และการจัดการ */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">การจัดการสิทธิ์ (Governance)</h2>
                <p className="mt-0.5 text-xs text-slate-400">สถานะบทบาทผู้ใช้งานภายในองค์กร</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <GovCard label="ผู้จัดการ (Managers)" value={managers} icon={<Users className="h-4 w-4 text-emerald-600" />} />
              <GovCard label="ผู้ปฏิบัติงาน (Operators)" value={operators} icon={<Users className="h-4 w-4 text-emerald-600" />} />
              <GovCard label="บัญชีระงับการใช้งาน" value={inactiveUsers} warn={inactiveUsers > 0} />
              <GovCard label="ยังไม่ระบุโรงงาน" value={usersWithoutFactory} warn={usersWithoutFactory > 0} />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">ตรวจสอบสิทธิ์ผู้ใช้ทั้งหมด</span>
            <Link href="/company/users" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group">
              จัดการผู้ใช้ <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </article>
      </div>

      {/* 4. Factory Coverage & Setup Attention */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Factory Coverage */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">ภาพรวมโรงงาน (Factory Coverage)</h2>
              <p className="mt-0.5 text-xs text-slate-400">สถานะความพร้อมเชิงโครงสร้างแยกตามโรงงาน</p>
            </div>
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {factoryCoverage.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-medium">
                ยังไม่มีข้อมูลโรงงานในระบบ
              </div>
            ) : (
              factoryCoverage.map((factory) => (
                <div key={factory.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-white hover:border-emerald-200 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{factory.name}</span>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {factory.code}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 font-medium">
                        🏢 {factory.buildings} อาคาร &nbsp;·&nbsp; ⚙️ {factory.machines} เครื่อง &nbsp;·&nbsp; 📡 {factory.sensors} เซนเซอร์
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-black text-white">
                      {factory.readiness}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${factory.readiness}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Setup Attention */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">สิ่งที่ต้องตั้งค่า (Setup Attention)</h2>
              <p className="mt-0.5 text-xs text-slate-400">จุดที่ยังขาดข้อมูลความสมบูรณ์ในการทำงาน</p>
            </div>
            <CircleAlert className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-5 space-y-3">
            {attentions.map(([label, value, href]) => (
              <Link 
                key={label} 
                href={href} 
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5 hover:border-amber-300 hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${value > 0 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${value > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                    {value} รายการ
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </article>
      </div>

      {/* 5. ทางลัดระบบ & ผู้ใช้งานล่าสุด */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        
        {/* ทางลัด */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-black text-slate-900">ทางลัดการจัดการระบบ</h2>
          <p className="mt-0.5 text-xs text-slate-400">ทางเข้าเมนูลัดสำหรับผู้ดูแลระบบ</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <QuickLink href="/company/users" icon={<UserPlus className="h-4 w-4" />} title="จัดการผู้ใช้งาน" desc="เพิ่ม/สิทธิ์ผู้ใช้งาน" />
            <QuickLink href="/company/departments" icon={<Network className="h-4 w-4" />} title="โครงสร้างโรงงาน" desc="จัดการตึก แผนก ไลน์" />
            <QuickLink href="/company/machines" icon={<Factory className="h-4 w-4" />} title="เครื่องจักร" desc="ฐานข้อมูลเครื่องจักร" />
            <QuickLink href="/company/qr-codes" icon={<QrCode className="h-4 w-4" />} title="QR Code" desc="พิมพ์และจัดการ QR" />
          </div>
        </article>

        {/* ผู้ใช้งานล่าสุด */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">ผู้ใช้งานล่าสุด</h2>
                <p className="mt-0.5 text-xs text-slate-400">บัญชีที่เพิ่งลงทะเบียนใน {company.companyName}</p>
              </div>
              <Link href="/company/users" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xs font-extrabold text-emerald-800 border border-emerald-100">
                    {initials(user.firstName, user.lastName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">{user.email}</p>
                  </div>
                  <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 border border-slate-200/60">
                    {roleLabel(user.role.roleName)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

    </div>
  );
}

function ReadinessItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-slate-700">{label}</span>
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div 
          className="h-full rounded-full bg-emerald-500 transition-all duration-300" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function GovCard({ label, value, warn = false, icon }: { label: string; value: number; warn?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-3.5 border transition-all ${warn ? "border-amber-200 bg-amber-50/40" : "border-slate-100 bg-slate-50/60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500">{label}</span>
        {icon}
      </div>
      <p className={`mt-2 text-xl font-black tracking-tight ${warn ? "text-amber-600" : "text-slate-900"}`}>
        {value.toLocaleString("th-TH")}
      </p>
    </div>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link 
      href={href} 
      className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-xs text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all shadow-2xs"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-emerald-100">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-slate-900 group-hover:text-emerald-900 truncate">{title}</p>
        <p className="mt-0.5 text-[11px] text-slate-400 truncate">{desc}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all shrink-0" />
    </Link>
  );
}