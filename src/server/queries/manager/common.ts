import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { buildingWhere, departmentWhere, lineWhere, machineWhere, ownedWhere, usageWhere } from "@/server/scope";
import { addDays, bkkDay, daysBetween, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";
import { byPriority } from "@/lib/resources";

export type Range = { from: string; to: string; days: number; isDefault: boolean };
type SP = Record<string, string | string[] | undefined>;
const str = (v: unknown) => (typeof v === "string" ? v : undefined);
export const intParam = (v: unknown) => {
  const n = Number.parseInt(str(v) ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Latest Bangkok day with an ACTIVE usage in the manager's scope (null when no data at all). */
export async function latestDataDay(user: CurrentUser) {
  const u = await db.resourceUsage.findFirst({ where: { ...usageWhere(user), usageAt: { lte: new Date() } }, orderBy: { usageAt: "desc" }, select: { usageAt: true } });
  return u ? bkkDay(u.usageAt) : null;
}

/** ?from&to (YYYY-MM-DD, Bangkok). Default: `defaultDays` ending at the latest day with data. Max 366 days. */
export async function resolveRange(user: CurrentUser, sp: SP, defaultDays = 7): Promise<Range> {
  let from = str(sp.from), to = str(sp.to);
  const valid = isDay(from) && isDay(to) && from! <= to!;
  if (!valid) {
    to = isDay(to) ? to! : (await latestDataDay(user)) ?? bkkDay(new Date());
    from = isDay(from) && from! <= to ? from! : addDays(to, -(defaultDays - 1));
  }
  if (daysBetween(from!, to!) > 366) from = addDays(to!, -365);
  return { from: from!, to: to!, days: daysBetween(from!, to!), isDefault: !valid && !sp.from && !sp.to };
}

/** First Bangkok day with data in scope (null when none). */
export async function firstDataDay(user: CurrentUser) {
  const u = await db.resourceUsage.findFirst({ where: usageWhere(user), orderBy: { usageAt: "asc" }, select: { usageAt: true } });
  return u ? bkkDay(u.usageAt) : null;
}

/**
 * Rows of the comparison period, or [] when recording had not started yet on its first day —
 * a half-empty previous period would show fake growth like "+263%". [] makes pctChange() return null.
 */
export async function loadPreviousRows(user: CurrentUser, prev: { from: string; to: string }, f: UsageFilter = {}) {
  const first = await firstDataDay(user);
  if (!first || first > prev.from) return [];
  return loadUsageRows(user, prev.from, prev.to, f);
}

export const dayRange = (from: string, to: string) => ({ gte: startOfBkkDay(from), lt: endOfBkkDayExclusive(to) });

export type UsageFilter = { buildingId?: number; departmentId?: number; lineId?: number; machineId?: number };

export type UsageRow = Awaited<ReturnType<typeof loadUsageRows>>[number];

/** ACTIVE usages in range, flattened for aggregation. Always scoped. */
export async function loadUsageRows(user: CurrentUser, from: string, to: string, f: UsageFilter = {}) {
  const rows = await db.resourceUsage.findMany({
    where: { ...usageWhere(user), usageAt: dayRange(from, to), ...f },
    select: {
      usageId: true, usageAt: true, quantity: true, sourceType: true, usageReference: true, remark: true, processingStatus: true,
      productionLine: { select: { lineName: true } },
      machineId: true, departmentId: true, buildingId: true, lineId: true, checkpointId: true,
      resourceType: { select: { resourceCode: true, resourceName: true } },
      unit: { select: { symbol: true } },
      machine: { select: { machineCode: true, machineName: true } },
      checkpoint: { select: { checkpointName: true } },
      department: { select: { departmentName: true } },
      building: { select: { buildingName: true } },
      carbonResults: { select: { carbonValue: true, scope: true, factorUsed: true, factor: { select: { factorUnit: true, source: true } } } },
    },
    orderBy: { usageAt: "asc" },
  });
  return rows.map((r) => {
    const c = r.carbonResults[0];
    return {
      usageId: r.usageId,
      usageAt: r.usageAt,
      day: bkkDay(r.usageAt),
      quantity: Number(r.quantity),
      sourceType: r.sourceType,
      reference: r.usageReference,
      remark: r.remark,
      processingStatus: r.processingStatus,
      lineName: r.productionLine?.lineName ?? "",
      resourceCode: r.resourceType.resourceCode,
      resourceName: r.resourceType.resourceName,
      unit: r.unit.symbol,
      machineId: r.machineId,
      departmentId: r.departmentId,
      buildingId: r.buildingId,
      lineId: r.lineId,
      target: r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "ไม่ระบุ",
      targetCode: r.machine?.machineCode ?? null,
      departmentName: r.department?.departmentName ?? "ไม่ระบุแผนก",
      buildingName: r.building?.buildingName ?? "ไม่ระบุอาคาร",
      carbon: c ? { kg: Number(c.carbonValue), scope: normScope(c.scope), factor: Number(c.factorUsed), factorUnit: c.factor.factorUnit, source: c.factor.source } : null,
    };
  });
}

/** "SCOPE_1" / "Scope 1" / "scope-1" → "Scope 1". */
export function normScope(s: string | null | undefined) {
  const m = /([123])/.exec(s ?? "");
  return m ? `Scope ${m[1]}` : "ไม่ระบุ";
}

/** Resource metric key used in URLs: "ELECTRICITY|kWh". */
export const metricKey = (code: string, unit: string) => `${code}|${unit}`;
export const sortGroups = <T extends { resourceCode: string; unit: string }>(g: T[]) =>
  [...g].sort((a, b) => byPriority(a.resourceCode, b.resourceCode) || a.unit.localeCompare(b.unit));

/** Cascade options for building → department → line → machine filters. */
export async function structureOptions(user: CurrentUser) {
  const [buildings, departments, lines, machines] = await Promise.all([
    db.building.findMany({ where: buildingWhere(user), select: { buildingId: true, buildingName: true }, orderBy: { buildingName: "asc" } }),
    db.department.findMany({ where: departmentWhere(user), select: { departmentId: true, departmentName: true, buildingId: true }, orderBy: { departmentName: "asc" } }),
    db.productionLine.findMany({ where: lineWhere(user), select: { lineId: true, lineName: true, departmentId: true }, orderBy: { lineName: "asc" } }),
    db.machine.findMany({ where: machineWhere(user), select: { machineId: true, machineName: true, machineCode: true, lineId: true }, orderBy: { machineCode: "asc" } }),
  ]);
  return { buildings, departments, lines, machines };
}

/** KPIs belonging to the manager's factory: by factoryId or by a hierarchy node inside it. */
export const kpiWhere = (user: CurrentUser) => {
  const own = ownedWhere(user);
  if (!("factoryId" in own)) return { companyId: own.companyId };
  return {
    companyId: own.companyId,
    OR: [
      { factoryId: own.factoryId },
      { building: buildingWhere(user) },
      { department: departmentWhere(user) },
      { productionLine: lineWhere(user) },
      { machine: machineWhere(user) },
    ],
  };
};

/** Structure options shaped for <StructureFilters>. */
export async function structureFilterOptions(user: CurrentUser) {
  const s = await structureOptions(user);
  return {
    buildings: s.buildings.map((b) => ({ value: String(b.buildingId), label: b.buildingName })),
    departments: s.departments.map((d) => ({ value: String(d.departmentId), label: d.departmentName, parent: String(d.buildingId) })),
    lines: s.lines.map((l) => ({ value: String(l.lineId), label: l.lineName, parent: String(l.departmentId) })),
    machines: s.machines.map((m) => ({ value: String(m.machineId), label: `${m.machineCode} · ${m.machineName}`, parent: String(m.lineId) })),
  };
}

/** ?building&department&line&machine → usage filter (ids are checked against scope by the usage query itself). */
export const structureFilter = (sp: SP): UsageFilter => ({
  buildingId: intParam(sp.building),
  departmentId: intParam(sp.department),
  lineId: intParam(sp.line),
  machineId: intParam(sp.machine),
});
