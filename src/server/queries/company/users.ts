import "server-only";
import { db } from "@/server/db";
import { companyUserWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import type { Prisma } from "@/generated/prisma/client";

export const USER_PAGE = 10;
const staff = { role: { roleName: { in: ["MANAGER", "OPERATOR"] } } };

export async function listUsers(user: CurrentUser, f: { q?: string; role?: string; status?: string; factory?: number; setup?: string; page: number }) {
  const base = companyUserWhere(user);
  const and: Prisma.UserWhereInput[] = [base];
  if (f.q) and.push({ OR: [{ firstName: { contains: f.q } }, { lastName: { contains: f.q } }, { email: { contains: f.q } }, { employeeCode: { contains: f.q } }, { username: { contains: f.q } }] });
  if (f.role) and.push({ role: { roleName: f.role } });
  if (f.status === "ACTIVE" || f.status === "LOCKED" || f.status === "INACTIVE") and.push({ status: f.status });
  if (f.factory) and.push({ factoryId: f.factory });
  if (f.setup === "no-factory") and.push({ ...staff, factoryId: null });
  if (f.setup === "no-department") and.push({ role: { roleName: "OPERATOR" }, departmentId: null });
  const where = { AND: and };

  const [total, rows, all, active, managers, operators, noFactory, noDept] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: [{ status: "asc" }, { firstName: "asc" }],
      skip: (f.page - 1) * USER_PAGE,
      take: USER_PAGE,
      select: {
        userId: true, firstName: true, lastName: true, email: true, username: true, employeeCode: true, phone: true, status: true,
        factoryId: true, departmentId: true, lastLogin: true, role: { select: { roleName: true } },
        factory: { select: { factoryName: true } }, departmentRef: { select: { departmentName: true } },
      },
    }),
    db.user.count({ where: base }),
    db.user.count({ where: { ...base, status: "ACTIVE" } }),
    db.user.count({ where: { ...base, role: { roleName: "MANAGER" } } }),
    db.user.count({ where: { ...base, role: { roleName: "OPERATOR" } } }),
    db.user.count({ where: { ...base, ...staff, factoryId: null } }),
    db.user.count({ where: { ...base, role: { roleName: "OPERATOR" }, departmentId: null } }),
  ]);
  return {
    total,
    stats: { all, active, managers, operators, needsSetup: noFactory + noDept },
    rows: rows.map((u) => ({
      id: u.userId, firstName: u.firstName, lastName: u.lastName, email: u.email, username: u.username, employeeCode: u.employeeCode ?? "",
      phone: u.phone ?? "", status: u.status as string, role: u.role.roleName, factoryId: u.factoryId, departmentId: u.departmentId,
      factory: u.factory?.factoryName ?? null, department: u.departmentRef?.departmentName ?? null,
      lastLogin: u.lastLogin?.toISOString() ?? null,
      manageable: u.userId !== user.id && (u.role.roleName === "MANAGER" || u.role.roleName === "OPERATOR"),
    })),
  };
}
export type UserRow = Awaited<ReturnType<typeof listUsers>>["rows"][number];
