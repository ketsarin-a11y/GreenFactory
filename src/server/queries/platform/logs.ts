import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { ROLES } from "@/server/auth/roles";
import { parseUserAgent } from "@/server/domain/user-agent";
import { PAGE_SIZE, dayRange, oneOf, paging, str, type SP } from "./common";

// ---------- Audit log ----------

export function auditWhere(sp: SP): Prisma.AuditLogWhereInput {
  const q = str(sp, "q");
  const action = str(sp, "action");
  const tableName = str(sp, "module");
  const role = oneOf(sp, "role", ROLES);
  const createdAt = dayRange(sp);
  const recordId = q && /^\d+$/.test(q) ? BigInt(q) : undefined;
  return {
    ...(action ? { action } : {}),
    ...(tableName ? { tableName } : {}),
    ...(role ? { user: { role: { roleName: role } } } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { tableName: { contains: q } },
            { ipAddress: { contains: q } },
            { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { email: { contains: q } }] } },
            ...(recordId !== undefined ? [{ recordId }] : []),
          ],
        }
      : {}),
  };
}

const auditSelect = {
  auditLogId: true,
  tableName: true,
  recordId: true,
  action: true,
  oldData: true,
  newData: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  user: { select: { firstName: true, lastName: true, email: true, role: { select: { roleName: true } } } },
} satisfies Prisma.AuditLogSelect;

type AuditRow = Prisma.AuditLogGetPayload<{ select: typeof auditSelect }>;
const shapeAudit = (a: AuditRow) => ({
  id: a.auditLogId.toString(),
  tableName: a.tableName,
  recordId: a.recordId.toString(),
  action: a.action,
  oldData: a.oldData === null ? null : JSON.stringify(a.oldData, null, 2),
  newData: a.newData === null ? null : JSON.stringify(a.newData, null, 2),
  ipAddress: a.ipAddress,
  userAgent: a.userAgent,
  createdAt: a.createdAt,
  userName: a.user ? `${a.user.firstName} ${a.user.lastName}` : null,
  userEmail: a.user?.email ?? null,
  role: a.user?.role.roleName ?? null,
});
export type AuditView = ReturnType<typeof shapeAudit>;

export async function listAuditLogs(sp: SP, page: number) {
  const where = auditWhere(sp);
  const [total, rows, actions, modules] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, ...paging(page), select: auditSelect }),
    db.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
    db.auditLog.findMany({ distinct: ["tableName"], select: { tableName: true }, orderBy: { tableName: "asc" } }),
  ]);
  return {
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    rows: rows.map(shapeAudit),
    actions: actions.map((a) => a.action),
    modules: modules.map((m) => m.tableName),
  };
}

export async function exportAuditLogs(sp: SP) {
  const rows = await db.auditLog.findMany({ where: auditWhere(sp), orderBy: { createdAt: "desc" }, take: 20_000, select: auditSelect });
  return rows.map(shapeAudit);
}

// ---------- Login log ----------

export const LOGIN_DEVICES = ["Desktop", "Mobile", "Tablet"] as const;

// Same rules as deviceOf() in domain/user-agent.ts, expressed as SQL LIKE filters.
const ua = (s: string): Prisma.LoginLogWhereInput => ({ userAgent: { contains: s } });
const TABLET: Prisma.LoginLogWhereInput = { OR: [ua("iPad"), ua("Tablet"), ua("PlayBook"), ua("Silk"), ua("Kindle"), { AND: [ua("Android"), { NOT: ua("Mobile") }] }] };
const MOBILE_ANY: Prisma.LoginLogWhereInput = { OR: [ua("Mobi"), ua("iPhone"), ua("iPod"), ua("Android"), ua("IEMobile"), ua("Opera Mini")] };
const DEVICE_WHERE: Record<(typeof LOGIN_DEVICES)[number], Prisma.LoginLogWhereInput> = {
  Tablet: TABLET,
  Mobile: { AND: [{ NOT: TABLET }, MOBILE_ANY] },
  Desktop: { AND: [{ userAgent: { not: null } }, { NOT: TABLET }, { NOT: MOBILE_ANY }] },
};

export function loginWhere(sp: SP, userId?: number): Prisma.LoginLogWhereInput {
  const q = str(sp, "q");
  const status = oneOf(sp, "status", ["SUCCESS", "FAILED"] as const);
  const device = oneOf(sp, "device", LOGIN_DEVICES);
  const loginAt = dayRange(sp);
  return {
    AND: [
      userId ? { userId } : {},
      status ? { loginStatus: status } : {},
      device ? DEVICE_WHERE[device] : {},
      loginAt ? { loginAt } : {},
      q
        ? {
            OR: [
              { attemptedEmail: { contains: q } },
              { ipAddress: { contains: q } },
              { user: { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { company: { companyName: { contains: q } } }] } },
            ],
          }
        : {},
    ],
  };
}

const loginSelect = {
  loginLogId: true,
  attemptedEmail: true,
  loginAt: true,
  logoutAt: true,
  ipAddress: true,
  userAgent: true,
  loginStatus: true,
  failureReason: true,
  user: { select: { firstName: true, lastName: true, role: { select: { roleName: true } }, company: { select: { companyName: true } } } },
} satisfies Prisma.LoginLogSelect;

type LoginRow = Prisma.LoginLogGetPayload<{ select: typeof loginSelect }>;
const shapeLogin = (l: LoginRow) => ({
  id: l.loginLogId.toString(),
  email: l.attemptedEmail,
  loginAt: l.loginAt,
  logoutAt: l.logoutAt,
  ipAddress: l.ipAddress,
  status: l.loginStatus,
  failureReason: l.failureReason,
  userName: l.user ? `${l.user.firstName} ${l.user.lastName}` : null,
  role: l.user?.role.roleName ?? null,
  company: l.user ? (l.user.role.roleName === "PLATFORM_ADMIN" ? "แพลตฟอร์มส่วนกลาง" : (l.user.company?.companyName ?? "—")) : null,
  ...parseUserAgent(l.userAgent),
});
export type LoginView = ReturnType<typeof shapeLogin>;

export async function listLoginLogs(sp: SP, page: number) {
  const where = loginWhere(sp);
  const [total, success, rows] = await Promise.all([
    db.loginLog.count({ where }),
    db.loginLog.count({ where: { AND: [where, { loginStatus: "SUCCESS" }] } }),
    db.loginLog.findMany({ where, orderBy: { loginAt: "desc" }, ...paging(page), select: loginSelect }),
  ]);
  return { total, success, failed: total - success, totalPages: Math.ceil(total / PAGE_SIZE), rows: rows.map(shapeLogin) };
}

export async function exportLoginLogs(sp: SP) {
  const rows = await db.loginLog.findMany({ where: loginWhere(sp), orderBy: { loginAt: "desc" }, take: 20_000, select: loginSelect });
  return rows.map(shapeLogin);
}

export async function userLoginLogs(userId: number, take = 20) {
  const rows = await db.loginLog.findMany({ where: { userId }, orderBy: { loginAt: "desc" }, take, select: loginSelect });
  return rows.map(shapeLogin);
}
