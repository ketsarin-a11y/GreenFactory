import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { ownedWhere } from "@/server/scope";

export const ALERT_PAGE_SIZE = 20;
export const ALERT_TABS = ["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;

export async function getAlerts(user: CurrentUser, f: { status?: string; severity?: string; q?: string; page: number }) {
  const own = ownedWhere(user);
  const where = {
    ...own,
    ...(f.status && (ALERT_TABS as readonly string[]).includes(f.status) ? { status: f.status } : {}),
    ...(f.severity ? { severity: f.severity } : {}),
    ...(f.q
      ? { OR: [{ title: { contains: f.q } }, { message: { contains: f.q } }, { alertCode: { contains: f.q } }, { machine: { machineName: { contains: f.q } } }, { department: { departmentName: { contains: f.q } } }] }
      : {}),
  };
  const [rows, total, counts] = await Promise.all([
    db.alert.findMany({
      where,
      orderBy: [{ triggeredAt: "desc" }],
      skip: (f.page - 1) * ALERT_PAGE_SIZE,
      take: ALERT_PAGE_SIZE,
      select: { alertId: true, title: true, severity: true, status: true, triggeredAt: true, alertCode: true, machine: { select: { machineName: true } }, department: { select: { departmentName: true } } },
    }),
    db.alert.count({ where }),
    db.alert.groupBy({ by: ["status", "severity"], where: own, _count: true }),
  ]);
  const n = (p: (c: (typeof counts)[number]) => boolean) => counts.filter(p).reduce((a, c) => a + c._count, 0);
  return {
    rows: rows.map((r) => ({ ...r, alertId: String(r.alertId) })),
    total,
    summary: {
      open: n((c) => c.status === "OPEN"),
      acknowledged: n((c) => c.status === "ACKNOWLEDGED"),
      criticalOpen: n((c) => c.status !== "RESOLVED" && c.severity === "CRITICAL"),
      resolved: n((c) => c.status === "RESOLVED"),
      all: n(() => true),
    },
  };
}

export async function getAlertDetail(user: CurrentUser, id: string | undefined) {
  if (!id || !/^\d{1,19}$/.test(id)) return null;
  const a = await db.alert.findFirst({
    where: { alertId: BigInt(id), ...ownedWhere(user) },
    include: {
      machine: { select: { machineId: true, machineName: true, machineCode: true } },
      building: { select: { buildingName: true } },
      department: { select: { departmentName: true } },
      productionLine: { select: { lineName: true } },
      usage: { select: { usageReference: true, unit: { select: { symbol: true } }, resourceType: { select: { resourceName: true } } } },
      resolver: { select: { firstName: true, lastName: true } },
      aiRecommendations: { where: { status: "ACTIVE" }, select: { title: true, description: true, confidenceScore: true } },
    },
  });
  if (!a) return null;
  const actual = a.actualValue === null ? null : Number(a.actualValue);
  const baseline = a.thresholdValue === null ? null : Number(a.thresholdValue);
  return {
    id: String(a.alertId),
    code: a.alertCode,
    title: a.title,
    message: a.message,
    severity: a.severity,
    status: a.status,
    triggeredAt: a.triggeredAt,
    acknowledgedAt: a.acknowledgedAt,
    resolvedAt: a.resolvedAt,
    resolvedBy: a.resolver ? `${a.resolver.firstName} ${a.resolver.lastName}` : null,
    actual,
    baseline,
    deviation: actual !== null && baseline ? ((actual - baseline) / baseline) * 100 : null,
    unit: a.usage?.unit.symbol ?? "",
    resource: a.usage?.resourceType.resourceName ?? null,
    reference: a.usage?.usageReference ?? null,
    location: [a.building?.buildingName, a.department?.departmentName, a.productionLine?.lineName].filter(Boolean).join(" › ") || "—",
    machine: a.machine,
    recommendations: a.aiRecommendations.map((r) => ({ title: r.title, description: r.description, confidence: r.confidenceScore === null ? null : Number(r.confidenceScore) })),
  };
}

/** Open (not yet acknowledged) alert count for the bell. */
export const openAlertCount = (user: CurrentUser) => db.alert.count({ where: { ...ownedWhere(user), status: "OPEN" } });
