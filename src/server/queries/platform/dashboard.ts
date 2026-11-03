import "server-only";
import { db } from "@/server/db";
import { addDays, bkkDay, startOfBkkDay } from "@/lib/time";
import { mysqldumpBin, toolStatus } from "@/server/backup";

export async function platformDashboard() {
  const since = startOfBkkDay(addDays(bkkDay(new Date()), -29));
  const [companiesByStatus, usersByStatus, usersByRole, factories, machines, records, latestCompanies, recentAudit, recentLogins] =
    await Promise.all([
      db.company.groupBy({ by: ["status"], _count: { _all: true } }),
      db.user.groupBy({ by: ["status"], _count: { _all: true } }),
      db.user.groupBy({ by: ["roleId"], _count: { _all: true } }),
      db.factory.count(),
      db.machine.count(),
      db.resourceUsage.count({ where: { usageAt: { gte: since }, status: "ACTIVE" } }),
      db.company.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { companyId: true, companyCode: true, companyName: true, status: true, createdAt: true, _count: { select: { factories: true, users: true } } },
      }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { auditLogId: true, tableName: true, recordId: true, action: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
      }),
      db.loginLog.findMany({
        orderBy: { loginAt: "desc" },
        take: 8,
        select: { loginLogId: true, attemptedEmail: true, loginStatus: true, failureReason: true, loginAt: true, ipAddress: true, user: { select: { firstName: true, lastName: true } } },
      }),
    ]);
  const roles = await db.role.findMany({ select: { roleId: true, roleName: true } });
  const roleName = new Map(roles.map((r) => [r.roleId, r.roleName]));
  const count = (rows: { _count: { _all: number } }[]) => rows.reduce((a, r) => a + r._count._all, 0);
  const byStatus = (rows: { status: string; _count: { _all: number } }[], s: string) => rows.find((r) => r.status === s)?._count._all ?? 0;

  return {
    companies: {
      total: count(companiesByStatus),
      active: byStatus(companiesByStatus, "ACTIVE"),
      pending: byStatus(companiesByStatus, "PENDING"),
      suspended: byStatus(companiesByStatus, "SUSPENDED"),
    },
    users: { total: count(usersByStatus), active: byStatus(usersByStatus, "ACTIVE") },
    usersByRole: usersByRole.map((r) => ({ role: roleName.get(r.roleId) ?? "—", count: r._count._all })).sort((a, b) => b.count - a.count),
    factories,
    machines,
    records,
    latestCompanies,
    recentAudit: recentAudit.map((a) => ({ ...a, auditLogId: a.auditLogId.toString(), recordId: a.recordId.toString() })),
    recentLogins: recentLogins.map((l) => ({ ...l, loginLogId: l.loginLogId.toString() })),
  };
}

/** Real health signals: DB round-trip, last verified backup, whether backups can run here. */
export async function systemHealth() {
  const t0 = performance.now();
  let dbOk = true;
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbOk = false;
  }
  const dbMs = Math.round(performance.now() - t0);
  const [lastBackup, dump] = await Promise.all([
    db.backupRecord.findFirst({ where: { status: "COMPLETED", verified: true }, orderBy: { completedAt: "desc" }, select: { completedAt: true, backupCode: true } }),
    toolStatus(mysqldumpBin()),
  ]);
  const at = lastBackup?.completedAt ?? null;
  return { dbOk, dbMs, lastBackupAt: at, backupStale: !at || Date.now() - at.getTime() > 7 * 86_400_000, lastBackupCode: lastBackup?.backupCode ?? null, backupToolAvailable: dump.available };
}
