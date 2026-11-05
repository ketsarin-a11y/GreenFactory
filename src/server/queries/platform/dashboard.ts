import "server-only";
import { bkkDaySql, bkkHourSql, epochSql } from "@/server/sql";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { addDays, bkkDay, startOfBkkDay } from "@/lib/time";
import { mysqldumpBin, toolStatus } from "@/server/backup";
import { dayList, pctChange } from "@/server/domain/analytics";
import { sensorConnection } from "@/server/domain/readiness";
import { denseDays, hourMatrix, sum, type DayCount } from "./series";

// Bangkok is UTC+7 with no DST; timestamps are stored in UTC.
const BKK_DAY = bkkDaySql;

/** Active resource-usage records per company per Bangkok day since `from` (counts only, never quantities). */
export async function dailyRecordsByCompany(from: string, companyIds?: number[]) {
  if (companyIds && !companyIds.length) return new Map<number, DayCount[]>();
  const rows = await db.$queryRaw<{ company_id: number; day: string; n: bigint }[]>`
    SELECT company_id, ${BKK_DAY("usage_at")} AS day, COUNT(*) AS n
    FROM resource_usage
    WHERE status = 'ACTIVE' AND usage_at >= ${startOfBkkDay(from)}
      ${companyIds ? Prisma.sql`AND company_id IN (${Prisma.join(companyIds)})` : Prisma.empty}
    GROUP BY company_id, day`;
  const m = new Map<number, DayCount[]>();
  for (const r of rows) {
    const id = Number(r.company_id);
    m.set(id, [...(m.get(id) ?? []), { day: r.day, n: Number(r.n) }]);
  }
  return m;
}

/** Last record per company (any status) — "last activity". */
export async function lastActivityByCompany(companyIds: number[]) {
  if (!companyIds.length) return new Map<number, Date>();
  const rows = await db.resourceUsage.groupBy({ by: ["companyId"], where: { companyId: { in: companyIds } }, _max: { usageAt: true } });
  return new Map(rows.filter((r) => r._max.usageAt).map((r) => [r.companyId, r._max.usageAt!]));
}

/** Logins per Bangkok day, split by status, since `from`. */
export async function dailyLogins(from: string, where: Prisma.Sql = Prisma.empty) {
  const rows = await db.$queryRaw<{ day: string; status: string; n: bigint }[]>`
    SELECT ${BKK_DAY("login_at")} AS day, login_status AS status, COUNT(*) AS n
    FROM login_log
    WHERE login_at >= ${startOfBkkDay(from)} ${where}
    GROUP BY day, status`;
  return rows.map((r) => ({ day: r.day, status: r.status, n: Number(r.n) }));
}

export async function platformDashboard() {
  const today = bkkDay(new Date());
  // Trends use complete days (ending yesterday) so today's partial day never reads as a drop.
  const end = addDays(today, -1);
  const from30 = addDays(end, -29);
  const from60 = addDays(end, -59);
  const from14 = addDays(today, -13);
  const days30 = dayList(from30, end);
  const days14 = dayList(from14, today);

  const [companies, usage, logins, distinct, heat, sensors, latestCompanies, recentAudit, auditToday] = await Promise.all([
    db.company.findMany({ select: { companyId: true, companyName: true, status: true }, orderBy: { companyId: "asc" } }),
    dailyRecordsByCompany(from60),
    dailyLogins(from30),
    db.$queryRaw<{ day: string; u: bigint }[]>`
      SELECT ${BKK_DAY("login_at")} AS day, COUNT(DISTINCT user_id) AS u
      FROM login_log WHERE login_status = 'SUCCESS' AND user_id IS NOT NULL AND login_at >= ${startOfBkkDay(addDays(today, -13))}
      GROUP BY day`,
    db.$queryRaw<{ day: string; hour: number; n: bigint }[]>`
      SELECT ${BKK_DAY("login_at")} AS day, ${bkkHourSql("login_at")} AS hour, COUNT(*) AS n
      FROM login_log WHERE login_status = 'SUCCESS' AND login_at >= ${startOfBkkDay(from14)}
      GROUP BY day, hour`,
    db.sensor.findMany({
      select: { status: true, samplingIntervalSeconds: true, lastConnectedAt: true, data: { orderBy: { measuredAt: "desc" }, take: 1, select: { qualityStatus: true } } },
    }),
    db.company.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { companyId: true, companyCode: true, companyName: true, status: true, createdAt: true, _count: { select: { factories: true, users: true } } },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { auditLogId: true, tableName: true, recordId: true, action: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
    }),
    db.auditLog.count({ where: { createdAt: { gte: startOfBkkDay(today) } } }),
  ]);

  // Distinct users over two 7-day windows (a user active on several days counts once per window).
  const [u7, uPrev7] = await Promise.all([
    distinctLoginUsers(addDays(today, -6)),
    distinctLoginUsers(addDays(today, -13), addDays(today, -6)),
  ]);

  // Records: total per day (30) and per company.
  const allUsage = [...usage.values()].flat();
  const records30 = denseDays(allUsage, from30, end);
  const recordsPrev = sum(denseDays(allUsage, from60, addDays(from30, -1)));
  const perCompany = companies
    .map((c) => ({ ...c, days: denseDays(usage.get(c.companyId) ?? [], from30, end) }))
    .map((c) => ({ ...c, total: sum(c.days) }));
  // ≤3 series, in fixed (companyId) order so colours never move between visits.
  const chartCompanies = [...perCompany].filter((c) => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 3).sort((a, b) => a.companyId - b.companyId);

  const ok = logins.filter((l) => l.status === "SUCCESS");
  const bad = logins.filter((l) => l.status !== "SUCCESS");

  const now = new Date();
  const conn = sensors.map((s) => sensorConnection({ ...s, latestQuality: s.data[0]?.qualityStatus ?? null }, now));
  const lastHeard = sensors.reduce<Date | null>((a, s) => (s.lastConnectedAt && (!a || s.lastConnectedAt > a) ? s.lastConnectedAt : a), null);
  const sensorRecent = await sensorReadingsRecent();

  return {
    today,
    companies: {
      total: companies.length,
      active: companies.filter((c) => c.status === "ACTIVE").length,
      pending: companies.filter((c) => c.status === "PENDING").length,
      suspended: companies.filter((c) => c.status === "SUSPENDED").length,
    },
    users7: { value: u7, change: pctChange(u7, uPrev7), spark: denseDays(distinct.map((r) => ({ day: r.day, n: Number(r.u) })), addDays(end, -13), end) },
    records: { total: sum(records30), change: pctChange(sum(records30), recordsPrev), spark: records30 },
    sensors: { online: conn.filter((c) => c === "ONLINE").length, total: sensors.length, lastHeard, spark: sensorRecent },
    trend: {
      days: days30,
      series: chartCompanies.map((c) => ({ companyId: c.companyId, name: c.companyName, days: c.days, total: c.total })),
      others: perCompany.filter((c) => c.total > 0).length - chartCompanies.length,
    },
    logins: { success: sum(ok.map((l) => l.n)), failed: sum(bad.map((l) => l.n)), failedDays: denseDays(bad, from30, end), days: days30 },
    heatmap: { days: days14, values: hourMatrix(heat.map((h) => ({ day: h.day, hour: Number(h.hour), n: Number(h.n) })), days14) },
    latestCompanies: latestCompanies.map((c) => ({ ...c, spark: perCompany.find((p) => p.companyId === c.companyId)?.days ?? [] })),
    recentAudit: recentAudit.map((a) => ({ ...a, auditLogId: a.auditLogId.toString(), recordId: a.recordId.toString() })),
    auditToday,
  };
}

async function distinctLoginUsers(from: string, toExclusive?: string) {
  const [r] = await db.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(DISTINCT user_id) AS n FROM login_log
    WHERE login_status = 'SUCCESS' AND user_id IS NOT NULL AND login_at >= ${startOfBkkDay(from)}
      ${toExclusive ? Prisma.sql`AND login_at < ${startOfBkkDay(toExclusive)}` : Prisma.empty}`;
  return Number(r?.n ?? 0);
}

/** Sensor readings received per 5 minutes over the last 2 hours (oldest → newest), for the live sparkline. */
async function sensorReadingsRecent() {
  const BUCKET = 300, N = 24;
  const nowB = Math.floor(Date.now() / 1000 / BUCKET);
  const since = new Date((nowB - N + 1) * BUCKET * 1000);
  const rows = await db.$queryRaw<{ b: bigint; n: bigint }[]>`
    SELECT FLOOR(${epochSql("received_at")} / ${BUCKET}) AS b, COUNT(*) AS n
    FROM sensor_data WHERE received_at >= ${since} GROUP BY b`;
  const out = Array.from({ length: N }, () => 0);
  for (const r of rows) {
    const i = Number(r.b) - (nowB - N + 1);
    if (i >= 0 && i < N) out[i] = Number(r.n);
  }
  return out;
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
