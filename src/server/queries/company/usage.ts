import "server-only";
import { db } from "@/server/db";
import { usageWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import type { Prisma } from "@/generated/prisma/client";
import { addDays, bkkDay, daysBetween, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";
import { num } from "@/lib/format";
import { byPriority } from "@/lib/resources";

export const USAGE_PAGE = 25;
type Params = Record<string, string | string[] | undefined>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** URL params → scoped where. Default range: the last 30 Bangkok days. */
export function usageFilter(user: CurrentUser, sp: Params) {
  const today = bkkDay(new Date());
  let to = isDay(sp.to) ? sp.to : today;
  let from = isDay(sp.from) ? sp.from : addDays(to, -29);
  if (from > to) [from, to] = [to, from];
  const and: Prisma.ResourceUsageWhereInput[] = [usageWhere(user), { usageAt: { gte: startOfBkkDay(from), lt: endOfBkkDayExclusive(to) } }];
  const factory = Number(str(sp.factory));
  if (factory) and.push({ factoryId: factory });
  const resource = Number(str(sp.resource));
  if (resource) and.push({ resourceTypeId: resource });
  const source = str(sp.source);
  if (source) and.push({ sourceType: source });
  const q = str(sp.q);
  if (q)
    and.push({ OR: [{ usageReference: { contains: q } }, { remark: { contains: q } }, { machine: { OR: [{ machineCode: { contains: q } }, { machineName: { contains: q } }] } }, { checkpoint: { OR: [{ checkpointCode: { contains: q } }, { checkpointName: { contains: q } }] } }] });
  return { where: { AND: and } satisfies Prisma.ResourceUsageWhereInput, from, to };
}

export const usageInclude = {
  factory: { select: { factoryName: true } },
  machine: { select: { machineCode: true, machineName: true } },
  checkpoint: { select: { checkpointCode: true, checkpointName: true } },
  resourceType: { select: { resourceCode: true, resourceName: true } },
  unit: { select: { symbol: true } },
  recorder: { select: { firstName: true, lastName: true } },
  carbonResults: { select: { carbonValue: true } },
} satisfies Prisma.ResourceUsageInclude;
export type UsageWithRefs = Prisma.ResourceUsageGetPayload<{ include: typeof usageInclude }>;

/** Totals per (resource, unit) — quantities in different units are never added. */
export async function usageTotals(where: Prisma.ResourceUsageWhereInput) {
  const [groups, carbon, types, units] = await Promise.all([
    db.resourceUsage.groupBy({ by: ["resourceTypeId", "unitId"], where, _sum: { quantity: true }, _count: { _all: true } }),
    db.carbonResult.aggregate({ where: { usage: where }, _sum: { carbonValue: true } }),
    db.resourceTypeMaster.findMany({ select: { resourceTypeId: true, resourceCode: true, resourceName: true } }),
    db.unit.findMany({ select: { unitId: true, symbol: true } }),
  ]);
  const totals = groups
    .map((g) => {
      const t = types.find((x) => x.resourceTypeId === g.resourceTypeId);
      return { code: t?.resourceCode ?? "", name: t?.resourceName ?? "—", unit: units.find((u) => u.unitId === g.unitId)?.symbol ?? "", quantity: num(g._sum.quantity), records: g._count._all };
    })
    .sort((a, b) => byPriority(a.code, b.code));
  return { totals, carbonKg: num(carbon._sum.carbonValue) };
}

export async function listUsage(user: CurrentUser, sp: Params, page: number) {
  const { where, from, to } = usageFilter(user, sp);
  const [total, rows, sums] = await Promise.all([
    db.resourceUsage.count({ where }),
    db.resourceUsage.findMany({ where, include: usageInclude, orderBy: { usageAt: "desc" }, skip: (page - 1) * USAGE_PAGE, take: USAGE_PAGE }),
    usageTotals(where),
  ]);
  return { total, from, to, ...sums, rows: rows.map(usageRow) };
}

export function usageRow(u: UsageWithRefs) {
  return {
    id: u.usageId.toString(),
    reference: u.usageReference,
    usageAt: u.usageAt,
    factory: u.factory?.factoryName ?? "—",
    targetCode: u.machine?.machineCode ?? u.checkpoint?.checkpointCode ?? null,
    targetName: u.machine?.machineName ?? u.checkpoint?.checkpointName ?? "—",
    target: u.machine ? `${u.machine.machineCode} ${u.machine.machineName}` : u.checkpoint ? `${u.checkpoint.checkpointCode} ${u.checkpoint.checkpointName}` : "—",
    resourceCode: u.resourceType.resourceCode,
    resource: u.resourceType.resourceName,
    quantity: num(u.quantity),
    unit: u.unit.symbol,
    carbonKg: u.carbonResults.length ? u.carbonResults.reduce((a, c) => a + num(c.carbonValue), 0) : null,
    source: u.sourceType,
    recorder: `${u.recorder.firstName} ${u.recorder.lastName}`,
    processing: u.processingStatus,
    remark: u.remark,
  };
}

export const resourceOptions = async () =>
  (await db.resourceTypeMaster.findMany({ where: { status: "ACTIVE" }, orderBy: { resourceName: "asc" }, select: { resourceTypeId: true, resourceName: true } }))
    .map((r) => ({ value: String(r.resourceTypeId), label: r.resourceName }));

const MAX_DAY_COLUMNS = 45;
const MAX_HEAT_ROWS = 24;

/**
 * Machine/checkpoint × day matrix of one resource in one unit, for the usage heatmap.
 * Resource = the filtered one, else electricity; unit = the one most rows use. Ranges longer
 * than 45 days fold into weeks (Monday-start). Cells with no record stay null (not zero).
 */
export async function usageHeatmap(where: Prisma.ResourceUsageWhereInput, from: string, to: string, resourceTypeId?: number) {
  const resource = resourceTypeId
    ? await db.resourceTypeMaster.findUnique({ where: { resourceTypeId }, select: { resourceTypeId: true, resourceCode: true, resourceName: true } })
    : await db.resourceTypeMaster.findFirst({ where: { resourceCode: "ELECTRICITY" }, select: { resourceTypeId: true, resourceCode: true, resourceName: true } });
  if (!resource) return null;
  const rows = await db.resourceUsage.findMany({
    where: { AND: [where, { resourceTypeId: resource.resourceTypeId }] },
    select: {
      usageAt: true, quantity: true, unit: { select: { symbol: true } },
      factory: { select: { factoryCode: true } },
      machine: { select: { machineId: true, machineCode: true, machineName: true } },
      checkpoint: { select: { checkpointId: true, checkpointCode: true, checkpointName: true } },
    },
  });
  if (rows.length === 0) return null;
  const unitCount = new Map<string, number>();
  for (const r of rows) unitCount.set(r.unit.symbol, (unitCount.get(r.unit.symbol) ?? 0) + 1);
  const unit = [...unitCount].sort((a, b) => b[1] - a[1])[0][0];

  const weekly = daysBetween(from, to) > MAX_DAY_COLUMNS;
  const monday = (day: string) => addDays(day, -((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7));
  const colKeys: string[] = [];
  for (let d = weekly ? monday(from) : from; d <= to; d = addDays(d, weekly ? 7 : 1)) colKeys.push(d);
  const colOf = new Map(colKeys.map((k, i) => [k, i]));

  const targets = new Map<string, { label: string; sort: string; cells: (number | null)[]; total: number }>();
  for (const r of rows) {
    if (r.unit.symbol !== unit) continue;
    const t = r.machine ?? r.checkpoint;
    const key = r.machine ? `m${r.machine.machineId}` : r.checkpoint ? `c${r.checkpoint.checkpointId}` : "none";
    const code = r.machine?.machineCode ?? r.checkpoint?.checkpointCode ?? "";
    const name = r.machine?.machineName ?? r.checkpoint?.checkpointName ?? "ไม่ระบุเป้าหมาย";
    if (!targets.has(key)) targets.set(key, { label: t ? `${code} ${name}` : name, sort: `${r.factory?.factoryCode ?? "~"} ${code}`, cells: colKeys.map(() => null), total: 0 });
    const day = bkkDay(r.usageAt);
    const i = colOf.get(weekly ? monday(day) : day);
    if (i === undefined) continue;
    const row = targets.get(key)!;
    const q = num(r.quantity);
    row.cells[i] = (row.cells[i] ?? 0) + q;
    row.total += q;
  }
  const all = [...targets.values()];
  const shown = all.sort((a, b) => b.total - a.total).slice(0, MAX_HEAT_ROWS).sort((a, b) => a.sort.localeCompare(b.sort));
  const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });
  return {
    resource: resource.resourceName,
    unit,
    weekly,
    hiddenRows: all.length - shown.length,
    cols: colKeys.map((k) => (weekly ? `สัปดาห์ ${fmt.format(new Date(`${k}T00:00:00Z`))}` : fmt.format(new Date(`${k}T00:00:00Z`)))),
    rows: shown.map((r) => r.label),
    values: shown.map((r) => r.cells),
  };
}
