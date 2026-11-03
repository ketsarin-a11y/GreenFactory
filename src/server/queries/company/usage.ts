import "server-only";
import { db } from "@/server/db";
import { usageWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import type { Prisma } from "@/generated/prisma/client";
import { addDays, bkkDay, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";
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
    target: u.machine ? `${u.machine.machineCode} · ${u.machine.machineName}` : u.checkpoint ? `${u.checkpoint.checkpointCode} · ${u.checkpoint.checkpointName}` : "—",
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
