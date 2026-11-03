import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { checkpointWhere, machineWhere, qrWhere, usageWhere } from "@/server/scope";
import { scanProblem } from "@/server/domain/qr-scan";
import { addDays, bkkDay, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";
import { num } from "@/lib/format";
import { byPriority } from "@/lib/resources";

const lineInclude = { productionLine: { include: { department: { include: { building: true } } } } } as const;
type WithLine = { productionLine: { lineName: string; department: { departmentName: string; building: { buildingName: string } } } };
const location = (t: WithLine) =>
  [t.productionLine.department.building.buildingName, t.productionLine.department.departmentName, t.productionLine.lineName].join(" / ");

export const ROUTINE_DAYS = 14;

export type ChecklistItem = {
  kind: "MACHINE" | "CHECKPOINT";
  id: number;
  name: string;
  code: string;
  location: string;
  /** What this target is usually read for (most recent resource in the routine window). */
  resource: string;
  /** Latest reading today (Bangkok day), or null if nothing recorded yet. */
  done: { quantity: number; unit: string; resource: string; at: Date; count: number } | null;
};

/**
 * "งานวันนี้": every ACTIVE machine/checkpoint in my factory that was recorded in the last
 * ROUTINE_DAYS days (i.e. is on a routine), with today's latest reading if there is one.
 */
export async function todayChecklist(user: CurrentUser, now = new Date()) {
  const day = bkkDay(now);
  const since = startOfBkkDay(addDays(day, -ROUTINE_DAYS));
  const [routine, today] = await Promise.all([
    db.resourceUsage.groupBy({
      by: ["machineId", "checkpointId", "resourceTypeId"],
      where: { ...usageWhere(user), usageAt: { gte: since, lt: endOfBkkDayExclusive(day) } },
      _max: { usageAt: true },
    }),
    db.resourceUsage.findMany({
      where: { ...usageWhere(user), usageAt: { gte: startOfBkkDay(day), lt: endOfBkkDayExclusive(day) } },
      orderBy: { usageAt: "desc" },
      select: { machineId: true, checkpointId: true, quantity: true, usageAt: true, unit: { select: { symbol: true } }, resourceType: { select: { resourceName: true } } },
    }),
  ]);
  const ids = (k: "machineId" | "checkpointId") => [...new Set(routine.map((r) => r[k]).filter((v): v is number => v !== null))];
  const [machines, checkpoints, types] = await Promise.all([
    db.machine.findMany({ where: { machineId: { in: ids("machineId") }, status: "ACTIVE", ...machineWhere(user) }, include: lineInclude }),
    db.checkpoint.findMany({ where: { checkpointId: { in: ids("checkpointId") }, status: "ACTIVE", ...checkpointWhere(user) }, include: lineInclude }),
    db.resourceTypeMaster.findMany({ where: { resourceTypeId: { in: [...new Set(routine.map((r) => r.resourceTypeId))] } }, select: { resourceTypeId: true, resourceName: true } }),
  ]);
  const usualResource = (match: (r: (typeof routine)[number]) => boolean) => {
    const latest = routine.filter(match).sort((a, b) => (b._max.usageAt?.getTime() ?? 0) - (a._max.usageAt?.getTime() ?? 0))[0];
    return types.find((t) => t.resourceTypeId === latest?.resourceTypeId)?.resourceName ?? "";
  };
  const doneOf = (match: (u: (typeof today)[number]) => boolean): ChecklistItem["done"] => {
    const rows = today.filter(match);
    const u = rows[0];
    return u ? { quantity: num(u.quantity), unit: u.unit.symbol, resource: u.resourceType.resourceName, at: u.usageAt, count: rows.length } : null;
  };
  const items: ChecklistItem[] = [
    ...machines.map((m) => ({
      kind: "MACHINE" as const, id: m.machineId, name: m.machineName, code: m.machineCode, location: location(m),
      resource: usualResource((r) => r.machineId === m.machineId),
      done: doneOf((u) => u.machineId === m.machineId),
    })),
    ...checkpoints.map((c) => ({
      kind: "CHECKPOINT" as const, id: c.checkpointId, name: c.checkpointName, code: c.checkpointCode, location: location(c),
      resource: usualResource((r) => r.checkpointId === c.checkpointId),
      done: doneOf((u) => u.checkpointId === c.checkpointId),
    })),
  ];
  const todo = items.filter((i) => !i.done).sort((a, b) => a.code.localeCompare(b.code, "th"));
  const done = items.filter((i) => i.done).sort((a, b) => b.done!.at.getTime() - a.done!.at.getTime());
  return { total: items.length, todo, done };
}

/** "MACHINE:12" / "CHECKPOINT:3" — the record form's `?target=` value. */
export const targetParam = (t: { kind: "MACHINE" | "CHECKPOINT"; id: number }) => `${t.kind}:${t.id}`;

/** Resolves `?target=` to an ACTIVE machine/checkpoint in my factory; anything else → null (ignored). */
export async function targetForRecord(user: CurrentUser, raw: string | null | undefined): Promise<RecordTarget | null> {
  const m = raw?.match(/^(MACHINE|CHECKPOINT):(\d{1,9})$/);
  if (!m) return null;
  const id = Number(m[2]);
  if (m[1] === "MACHINE") {
    const t = await db.machine.findFirst({ where: { machineId: id, status: "ACTIVE", ...machineWhere(user) }, include: lineInclude });
    return t && { kind: "MACHINE", id: t.machineId, name: t.machineName, code: t.machineCode, location: location(t) };
  }
  const t = await db.checkpoint.findFirst({ where: { checkpointId: id, status: "ACTIVE", ...checkpointWhere(user) }, include: lineInclude });
  return t && { kind: "CHECKPOINT", id: t.checkpointId, name: t.checkpointName, code: t.checkpointCode, location: location(t) };
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
      label: r.resourceName,
      category: r.category.categoryName,
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
        ? location({ productionLine: r.productionLine })
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
