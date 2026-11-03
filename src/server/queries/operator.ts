import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { checkpointWhere, machineWhere, qrWhere, usageWhere } from "@/server/scope";
import { scanProblem } from "@/server/domain/qr-scan";
import { bkkDay, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";
import { num } from "@/lib/format";
import { byPriority } from "@/lib/resources";

const lineInclude = { productionLine: { include: { department: { include: { building: true } } } } } as const;
type WithLine = { productionLine: { lineName: string; department: { departmentName: string; building: { buildingName: string } } } };
const location = (t: WithLine) =>
  [t.productionLine.department.building.buildingName, t.productionLine.department.departmentName, t.productionLine.lineName].join(" • ");

/** Today's (Bangkok) readings in my factory: count + totals per resource, never mixing units. */
export async function todaySummary(user: CurrentUser) {
  const day = bkkDay(new Date());
  const where = { ...usageWhere(user), usageAt: { gte: startOfBkkDay(day), lt: endOfBkkDayExclusive(day) } };
  const groups = await db.resourceUsage.groupBy({
    by: ["resourceTypeId", "unitId"],
    where,
    _sum: { quantity: true },
    _count: { _all: true },
  });
  const [types, units] = await Promise.all([
    db.resourceTypeMaster.findMany({ where: { resourceTypeId: { in: groups.map((g) => g.resourceTypeId) } } }),
    db.unit.findMany({ where: { unitId: { in: groups.map((g) => g.unitId) } } }),
  ]);
  const totals = groups
    .map((g) => {
      const t = types.find((x) => x.resourceTypeId === g.resourceTypeId)!;
      return {
        key: `${g.resourceTypeId}-${g.unitId}`,
        code: t.resourceCode,
        name: t.resourceName,
        unit: units.find((u) => u.unitId === g.unitId)?.symbol ?? "",
        total: num(g._sum.quantity),
        count: g._count._all,
      };
    })
    .sort((a, b) => b.count - a.count);
  return { count: totals.reduce((s, t) => s + t.count, 0), totals };
}

export async function myRecentUsages(user: CurrentUser, take = 5) {
  const rows = await db.resourceUsage.findMany({
    where: { ...usageWhere(user), recordedBy: user.id },
    orderBy: { usageAt: "desc" },
    take,
    include: { machine: true, checkpoint: true, resourceType: true, unit: true },
  });
  return rows.map((r) => ({
    id: String(r.usageId),
    target: r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "—",
    resource: r.resourceType.resourceName,
    resourceCode: r.resourceType.resourceCode,
    quantity: num(r.quantity),
    unit: r.unit.symbol,
    usageAt: r.usageAt,
    processing: r.processingStatus,
  }));
}

/**
 * Looks up an ACTIVE QR in my factory and logs the scan. Writes a QRScanLog, so call it
 * only from the /scan/[token] page. Other company/factory → null (same as unknown token).
 */
export async function scanQr(user: CurrentUser, token: string, meta: { ip: string | null; userAgent: string | null }) {
  if (!/^[A-Za-z0-9-]{8,255}$/.test(token)) return null;
  const qr = await db.qRCode.findFirst({
    where: { qrToken: token, qrStatus: "ACTIVE", ...qrWhere(user) },
    include: { machine: { include: { ...lineInclude, machineType: true } }, checkpoint: { include: lineInclude } },
  });
  const target = qr?.machine ?? qr?.checkpoint;
  if (!qr || !target || target.status !== "ACTIVE") return null;
  const scan = await db.qRScanLog.create({
    data: { qrId: qr.qrId, userId: user.id, scanResult: "SUCCESS", ipAddress: meta.ip?.slice(0, 45) ?? null, userAgent: meta.userAgent?.slice(0, 500) ?? null },
  });
  return {
    scanId: String(scan.scanId),
    scannedAt: scan.scannedAt,
    target: qr.machine
      ? { kind: "MACHINE" as const, name: qr.machine.machineName, code: qr.machine.machineCode, type: qr.machine.machineType.machineTypeName, status: qr.machine.operationalStatus, location: location(qr.machine) }
      : { kind: "CHECKPOINT" as const, name: qr.checkpoint!.checkpointName, code: qr.checkpoint!.checkpointCode, type: qr.checkpoint!.checkpointType, status: null, location: location(qr.checkpoint!) },
  };
}

/** `recent`: resource type ids this target was recorded with (most recent first) — used to pre-select. */
export type RecordTarget = { kind: "MACHINE" | "CHECKPOINT"; id: number; name: string; code: string; location: string; recent?: number[] };

/** Machines and checkpoints in my factory plus active resource types, for the record form. */
export async function recordOptions(user: CurrentUser) {
  const [machines, checkpoints, resources, used] = await Promise.all([
    db.machine.findMany({ where: { ...machineWhere(user), status: "ACTIVE" }, include: lineInclude, orderBy: { machineName: "asc" } }),
    db.checkpoint.findMany({ where: { ...checkpointWhere(user), status: "ACTIVE" }, include: lineInclude, orderBy: { checkpointName: "asc" } }),
    db.resourceTypeMaster.findMany({
      where: { status: "ACTIVE", defaultUnit: { status: "ACTIVE" } },
      include: { category: true, defaultUnit: true },
      orderBy: [{ category: { categoryName: "asc" } }, { resourceName: "asc" }],
    }),
    db.resourceUsage.groupBy({
      by: ["machineId", "checkpointId", "resourceTypeId"],
      where: { ...usageWhere(user), usageAt: { gte: new Date(Date.now() - 90 * 86_400_000) } },
      _max: { usageAt: true },
    }),
  ]);
  const recent = (kind: "m" | "c", id: number) =>
    used
      .filter((u) => (kind === "m" ? u.machineId === id : u.checkpointId === id))
      .sort((a, b) => (b._max.usageAt?.getTime() ?? 0) - (a._max.usageAt?.getTime() ?? 0))
      .map((u) => u.resourceTypeId);
  const targets: RecordTarget[] = [
    ...machines.map((m) => ({ kind: "MACHINE" as const, id: m.machineId, name: m.machineName, code: m.machineCode, location: location(m), recent: recent("m", m.machineId) })),
    ...checkpoints.map((c) => ({ kind: "CHECKPOINT" as const, id: c.checkpointId, name: c.checkpointName, code: c.checkpointCode, location: location(c), recent: recent("c", c.checkpointId) })),
  ];
  return {
    targets,
    // Everyday utilities first (electricity, water…), then the long tail by category.
    resources: [...resources].sort((a, b) => byPriority(a.resourceCode, b.resourceCode)).map((r) => ({
      id: r.resourceTypeId,
      label: `${r.resourceName} — ${r.category.categoryName}`,
      unitId: r.defaultUnitId,
      unit: r.defaultUnit.symbol,
    })),
  };
}

/** The target a scan id points to, if that scan can still be used by this user. */
export async function scanForRecord(
  user: CurrentUser,
  scanIdRaw: string,
): Promise<{ ok: true; scanId: string; target: RecordTarget } | { ok: false; error: string }> {
  if (!/^\d{1,18}$/.test(scanIdRaw)) return { ok: false, error: "ไม่พบข้อมูลการสแกน QR Code กรุณาสแกนใหม่" };
  const scan = await db.qRScanLog.findFirst({
    where: { scanId: BigInt(scanIdRaw), userId: user.id, qrCode: qrWhere(user) },
    include: { qrCode: true, _count: { select: { resourceUsages: true } } },
  });
  if (!scan) return { ok: false, error: "ไม่พบข้อมูลการสแกน QR Code กรุณาสแกนใหม่" };
  const { machineId, checkpointId } = scan.qrCode;
  const target = machineId
    ? await db.machine.findFirst({ where: { machineId, ...machineWhere(user), status: "ACTIVE" }, include: lineInclude })
    : checkpointId
      ? await db.checkpoint.findFirst({ where: { checkpointId, ...checkpointWhere(user), status: "ACTIVE" }, include: lineInclude })
      : null;
  if (!target) return { ok: false, error: "เครื่องจักรหรือจุดตรวจของ QR Code นี้ไม่พร้อมใช้งาน" };
  const t: RecordTarget =
    "machineId" in target
      ? { kind: "MACHINE", id: target.machineId, name: target.machineName, code: target.machineCode, location: location(target) }
      : { kind: "CHECKPOINT", id: target.checkpointId, name: target.checkpointName, code: target.checkpointCode, location: location(target) };
  const problem = scanProblem(
    { userId: scan.userId, scanResult: scan.scanResult, scannedAt: scan.scannedAt, machineId, checkpointId, usedByUsage: scan._count.resourceUsages > 0 },
    user.id,
    t,
    new Date(),
  );
  return problem ? { ok: false, error: problem } : { ok: true, scanId: scanIdRaw, target: t };
}

// ---------- history ----------

export type HistoryFilters = { q?: string; resource?: string; source?: string; from?: string; to?: string; mine?: string };
export const HISTORY_PAGE_SIZE = 20;

export function parseHistoryFilters(sp: Record<string, string | string[] | undefined>): HistoryFilters {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : undefined) || undefined;
  return { q: s("q")?.slice(0, 100), resource: s("resource"), source: s("source"), from: s("from"), to: s("to"), mine: s("mine") };
}

/** Same filter for the table and the CSV export. Always scoped to my factory and ACTIVE rows. */
export function historyWhere(user: CurrentUser, f: HistoryFilters): Prisma.ResourceUsageWhereInput {
  const and: Prisma.ResourceUsageWhereInput[] = [usageWhere(user)];
  if (f.q) {
    and.push({
      OR: [
        { usageReference: { contains: f.q } },
        { machine: { machineName: { contains: f.q } } },
        { machine: { machineCode: { contains: f.q } } },
        { checkpoint: { checkpointName: { contains: f.q } } },
        { checkpoint: { checkpointCode: { contains: f.q } } },
      ],
    });
  }
  if (f.resource && /^\d+$/.test(f.resource)) and.push({ resourceTypeId: Number(f.resource) });
  if (f.source === "QR" || f.source === "MANUAL") and.push({ sourceType: f.source });
  if (isDay(f.from)) and.push({ usageAt: { gte: startOfBkkDay(f.from) } });
  if (isDay(f.to)) and.push({ usageAt: { lt: endOfBkkDayExclusive(f.to) } });
  if (f.mine === "1") and.push({ recordedBy: user.id });
  return { AND: and };
}

export const historyInclude = {
  machine: true,
  checkpoint: true,
  productionLine: { include: { department: { include: { building: true } } } },
  resourceType: true,
  unit: true,
  recorder: { select: { firstName: true, lastName: true } },
} as const;

export async function historyPage(user: CurrentUser, f: HistoryFilters, page: number) {
  const where = historyWhere(user, f);
  const [total, rows] = await Promise.all([
    db.resourceUsage.count({ where }),
    db.resourceUsage.findMany({
      where,
      include: historyInclude,
      orderBy: [{ usageAt: "desc" }, { usageId: "desc" }],
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
    }),
  ]);
  const deleteBefore = Date.now() - 24 * 3_600_000;
  return {
    total,
    totalPages: Math.ceil(total / HISTORY_PAGE_SIZE),
    rows: rows.map((r) => ({
      id: String(r.usageId),
      reference: r.usageReference,
      usageAt: r.usageAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      target: r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "—",
      targetCode: r.machine?.machineCode ?? r.checkpoint?.checkpointCode ?? "",
      scope: r.scopeType,
      location: r.productionLine
        ? [r.productionLine.department.building.buildingName, r.productionLine.department.departmentName, r.productionLine.lineName].join(" • ")
        : "—",
      resource: r.resourceType.resourceName,
      resourceCode: r.resourceType.resourceCode,
      quantity: num(r.quantity),
      unit: r.unit.symbol,
      recorder: `${r.recorder.firstName} ${r.recorder.lastName}`,
      mine: r.recordedBy === user.id,
      source: r.sourceType,
      processing: r.processingStatus,
      hasEvidence: Boolean(r.evidenceFilePath),
      remark: r.remark,
      canDelete: r.recordedBy === user.id && r.createdAt.getTime() >= deleteBefore,
    })),
  };
}
export type HistoryRow = Awaited<ReturnType<typeof historyPage>>["rows"][number];

export const resourceFilterOptions = () =>
  db.resourceTypeMaster
    .findMany({ where: { status: "ACTIVE" }, orderBy: { resourceName: "asc" }, select: { resourceTypeId: true, resourceName: true } })
    .then((rs) => rs.map((r) => ({ value: String(r.resourceTypeId), label: r.resourceName })));
