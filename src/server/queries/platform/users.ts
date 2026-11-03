import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { ROLES } from "@/server/auth/roles";
import { addDays, bkkDay, startOfBkkDay } from "@/lib/time";
import { PAGE_SIZE, intParam, oneOf, paging, str, type SP } from "./common";

export const USER_STATUSES = ["ACTIVE", "INACTIVE", "LOCKED"] as const;

export async function listUsers(sp: SP, page: number) {
  const q = str(sp, "q");
  const companyId = intParam(sp, "company");
  const role = oneOf(sp, "role", ROLES);
  const status = oneOf(sp, "status", USER_STATUSES);
  const where: Prisma.UserWhereInput = {
    ...(companyId ? { companyId } : {}),
    ...(role ? { role: { roleName: role } } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }, { username: { contains: q } }, { employeeCode: { contains: q } }] }
      : {}),
  };
  const since = startOfBkkDay(addDays(bkkDay(new Date()), -29));
  const [total, rows, byStatus, newUsers] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paging(page),
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        employeeCode: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        companyId: true,
        factoryId: true,
        departmentId: true,
        role: { select: { roleName: true } },
        company: { select: { companyName: true } },
        factory: { select: { factoryName: true } },
        departmentRef: { select: { departmentName: true } },
      },
    }),
    db.user.groupBy({ by: ["status"], _count: { _all: true } }),
    db.user.count({ where: { createdAt: { gte: since } } }),
  ]);
  const n = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  return {
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    rows,
    stats: { total: byStatus.reduce((a, r) => a + r._count._all, 0), active: n("ACTIVE"), locked: n("LOCKED"), inactive: n("INACTIVE"), newUsers },
  };
}

/** Companies → factories → departments for the user form's dependent selects. */
export async function userFormOptions() {
  const [companies, factories, departments] = await Promise.all([
    db.company.findMany({ orderBy: { companyName: "asc" }, select: { companyId: true, companyName: true, status: true } }),
    db.factory.findMany({ orderBy: { factoryName: "asc" }, select: { factoryId: true, factoryName: true, companyId: true } }),
    db.department.findMany({
      where: { status: "ACTIVE" },
      orderBy: { departmentName: "asc" },
      select: { departmentId: true, departmentName: true, building: { select: { factoryId: true, buildingName: true } } },
    }),
  ]);
  return {
    companies: companies.map((c) => ({ id: c.companyId, name: c.companyName, status: c.status })),
    factories: factories.map((f) => ({ id: f.factoryId, name: f.factoryName, companyId: f.companyId })),
    departments: departments.map((d) => ({ id: d.departmentId, name: `${d.departmentName} (${d.building.buildingName})`, factoryId: d.building.factoryId })),
  };
}
