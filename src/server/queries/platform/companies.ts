import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { addDays, bkkDay, endOfBkkDayExclusive, startOfBkkDay } from "@/lib/time";
import { dayList } from "@/server/domain/analytics";
import { PAGE_SIZE, oneOf, paging, str, type SP } from "./common";
import { dailyRecordsByCompany, lastActivityByCompany } from "./dashboard";
import { denseDays, sum } from "./series";

/** Last 30 complete Bangkok days (ending yesterday). */
const window30 = () => {
  const end = addDays(bkkDay(new Date()), -1);
  return { from: addDays(end, -29), to: end };
};

export const COMPANY_STATUSES = ["ACTIVE", "PENDING", "SUSPENDED"] as const;
export const PLANS = ["TRIAL", "STANDARD", "ENTERPRISE"] as const;

export function companyWhere(sp: SP): Prisma.CompanyWhereInput {
  const q = str(sp, "q");
  const industry = str(sp, "industry");
  const status = oneOf(sp, "status", COMPANY_STATUSES);
  return {
    ...(status ? { status } : {}),
    ...(industry ? { industryType: industry } : {}),
    ...(q
      ? {
          OR: [
            { companyCode: { contains: q } },
            { companyName: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { province: { contains: q } },
            { industryType: { contains: q } },
            { users: { some: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }] } } },
          ],
        }
      : {}),
  };
}

/** Machines hang off company → factory → building → department → line; count them in one query. */
async function machineCounts(companyIds: number[]) {
  if (!companyIds.length) return new Map<number, number>();
  const rows = await db.$queryRaw<{ companyId: number; n: bigint }[]>`
    SELECT f.company_id AS companyId, COUNT(m.machine_id) AS n
    FROM machine m
    JOIN production_line l ON l.line_id = m.line_id
    JOIN department d ON d.department_id = l.department_id
    JOIN building b ON b.building_id = d.building_id
    JOIN factory f ON f.factory_id = b.factory_id
    WHERE f.company_id IN (${Prisma.join(companyIds)})
    GROUP BY f.company_id`;
  return new Map(rows.map((r) => [Number(r.companyId), Number(r.n)]));
}

const listSelect = {
  companyId: true,
  companyCode: true,
  companyName: true,
  email: true,
  industryType: true,
  province: true,
  phone: true,
  subscriptionPlan: true,
  status: true,
  createdAt: true,
  _count: { select: { factories: true, users: true } },
} satisfies Prisma.CompanySelect;

export async function listCompanies(sp: SP, page: number) {
  const where = companyWhere(sp);
  const [total, rows, industries] = await Promise.all([
    db.company.count({ where }),
    db.company.findMany({ where, orderBy: { createdAt: "desc" }, ...paging(page), select: listSelect }),
    db.company.findMany({ where: { industryType: { not: null } }, distinct: ["industryType"], select: { industryType: true }, orderBy: { industryType: "asc" } }),
  ]);
  const ids = rows.map((r) => r.companyId);
  const w = window30();
  const [machines, usage, last] = await Promise.all([machineCounts(ids), dailyRecordsByCompany(w.from, ids), lastActivityByCompany(ids)]);
  return {
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    rows: rows.map((r) => {
      const spark = denseDays(usage.get(r.companyId) ?? [], w.from, w.to);
      return { ...r, machines: machines.get(r.companyId) ?? 0, spark, records30: sum(spark), lastActivity: last.get(r.companyId) ?? null };
    }),
    industries: industries.map((i) => i.industryType!).filter(Boolean),
  };
}

export async function exportCompanies(sp: SP) {
  const rows = await db.company.findMany({ where: companyWhere(sp), orderBy: { createdAt: "desc" }, take: 10_000, select: listSelect });
  const machines = await machineCounts(rows.map((r) => r.companyId));
  return rows.map((r) => ({ ...r, machines: machines.get(r.companyId) ?? 0 }));
}

export async function companyDetail(companyId: number) {
  const company = await db.company.findUnique({
    where: { companyId },
    include: {
      factories: {
        orderBy: { factoryName: "asc" },
        include: { _count: { select: { buildings: true, users: true } } },
      },
      users: {
        orderBy: [{ roleId: "asc" }, { firstName: "asc" }],
        take: 100,
        select: { userId: true, firstName: true, lastName: true, email: true, status: true, lastLogin: true, role: { select: { roleName: true } }, factory: { select: { factoryName: true } } },
      },
      _count: { select: { users: true } },
    },
  });
  if (!company) return null;
  const w = window30();
  const [machines, buildings, usage, last, byRole, byFactory] = await Promise.all([
    machineCounts([companyId]),
    db.building.count({ where: { factory: { companyId } } }),
    dailyRecordsByCompany(addDays(w.from, -30), [companyId]),
    lastActivityByCompany([companyId]),
    db.user.groupBy({ by: ["roleId", "status"], where: { companyId }, _count: { _all: true } }),
    db.resourceUsage.groupBy({ by: ["factoryId"], where: { companyId, status: "ACTIVE", usageAt: { gte: startOfBkkDay(w.from), lt: endOfBkkDayExclusive(w.to) } }, _count: { _all: true } }),
  ]);
  const roleRows = await db.role.findMany({ where: { roleId: { in: byRole.map((r) => r.roleId) } }, select: { roleId: true, roleName: true } });
  const roleName = new Map(roleRows.map((r) => [r.roleId, r.roleName]));
  const roles30 = new Map<string, { role: string; active: number; total: number }>();
  for (const r of byRole) {
    const name = roleName.get(r.roleId) ?? "";
    const g = roles30.get(name) ?? { role: name, active: 0, total: 0 };
    g.total += r._count._all;
    if (r.status === "ACTIVE") g.active += r._count._all;
    roles30.set(name, g);
  }
  const rows = usage.get(companyId) ?? [];
  const daily = denseDays(rows, w.from, w.to);
  const prev = sum(denseDays(rows, addDays(w.from, -30), addDays(w.from, -1)));
  const roles = company.users.map((u) => u.role.roleName);
  const checklist = [
    { label: "ข้อมูลบริษัทครบ (อีเมล โทรศัพท์ จังหวัด ที่อยู่)", done: !!(company.email && company.phone && company.province && company.address) },
    { label: "มีโรงงานอย่างน้อย 1 แห่ง", done: company.factories.length > 0 },
    { label: "มีผู้ดูแลบริษัทที่ใช้งานได้", done: company.users.some((u) => u.role.roleName === "COMPANY_ADMIN" && u.status === "ACTIVE") },
    { label: "มีผู้ใช้งานระดับโรงงาน (ผู้จัดการหรือผู้ปฏิบัติงาน)", done: roles.includes("MANAGER") || roles.includes("OPERATOR") },
  ];
  return {
    company,
    machines: machines.get(companyId) ?? 0,
    buildings,
    checklist,
    usage: { days: dayList(w.from, w.to), daily, total: sum(daily), prev, lastActivity: last.get(companyId) ?? null },
    usersByRole: [...roles30.values()].sort((a, b) => b.total - a.total),
    factoryRecords: new Map(byFactory.map((f) => [f.factoryId, f._count._all])),
  };
}

export async function factoryDetail(companyId: number, factoryId: number) {
  const factory = await db.factory.findFirst({
    where: { factoryId, companyId },
    include: {
      company: { select: { companyName: true, companyCode: true } },
      buildings: { orderBy: { buildingCode: "asc" }, include: { _count: { select: { departments: true } } } },
      _count: { select: { users: true } },
    },
  });
  if (!factory) return null;
  const machines = await db.machine.count({ where: { productionLine: { department: { building: { factoryId } } } } });
  const checklist = [
    { label: "ข้อมูลโรงงาน (ที่อยู่ จังหวัด โทรศัพท์)", done: !!(factory.address && factory.province && factory.phone) },
    { label: "พิกัดแผนที่", done: factory.latitude !== null && factory.longitude !== null },
    { label: "มีอาคารอย่างน้อย 1 หลัง", done: factory.buildings.length > 0 },
    { label: "ลงทะเบียนเครื่องจักร", done: machines > 0 },
    { label: "มีผู้ใช้งานประจำโรงงาน", done: factory._count.users > 0 },
  ];
  return { factory, machines, checklist };
}
