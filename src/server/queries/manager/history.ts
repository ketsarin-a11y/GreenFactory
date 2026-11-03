import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { usageWhere } from "@/server/scope";
import { endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";

export const HISTORY_PAGE_SIZE = 20;

export async function getHistory(user: CurrentUser, f: { q?: string; resource?: string; source?: string; buildingId?: number; departmentId?: number; from?: string; to?: string; page: number }) {
  const where = {
    ...usageWhere(user),
    ...(f.resource ? { resourceType: { resourceCode: f.resource } } : {}),
    ...(f.source ? { sourceType: f.source } : {}),
    ...(f.buildingId ? { buildingId: f.buildingId } : {}),
    ...(f.departmentId ? { departmentId: f.departmentId } : {}),
    ...(isDay(f.from) || isDay(f.to)
      ? { usageAt: { ...(isDay(f.from) ? { gte: startOfBkkDay(f.from) } : {}), ...(isDay(f.to) ? { lt: endOfBkkDayExclusive(f.to) } : {}) } }
      : {}),
    ...(f.q
      ? {
          OR: [
            { usageReference: { contains: f.q } },
            { machine: { OR: [{ machineName: { contains: f.q } }, { machineCode: { contains: f.q } }] } },
            { checkpoint: { checkpointName: { contains: f.q } } },
            { department: { departmentName: { contains: f.q } } },
            { building: { buildingName: { contains: f.q } } },
            { resourceType: { resourceName: { contains: f.q } } },
          ],
        }
      : {}),
  };
  const [rows, total, resources] = await Promise.all([
    db.resourceUsage.findMany({
      where,
      orderBy: { usageAt: "desc" },
      skip: (f.page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
      select: {
        usageId: true, usageReference: true, usageAt: true, quantity: true, sourceType: true, processingStatus: true, evidenceFilePath: true,
        resourceType: { select: { resourceCode: true, resourceName: true } }, unit: { select: { symbol: true } },
        machine: { select: { machineName: true, machineCode: true } }, checkpoint: { select: { checkpointName: true } },
        department: { select: { departmentName: true } }, building: { select: { buildingName: true } },
        recorder: { select: { firstName: true, lastName: true } },
      },
    }),
    db.resourceUsage.count({ where }),
    db.resourceTypeMaster.findMany({ where: { resourceUsages: { some: usageWhere(user) } }, select: { resourceCode: true, resourceName: true }, orderBy: { resourceName: "asc" } }),
  ]);
  return {
    total,
    resources,
    rows: rows.map((r) => ({
      id: String(r.usageId),
      reference: r.usageReference,
      usageAt: r.usageAt,
      quantity: Number(r.quantity),
      unit: r.unit.symbol,
      resourceCode: r.resourceType.resourceCode,
      resourceName: r.resourceType.resourceName,
      source: r.sourceType,
      processing: r.processingStatus,
      hasEvidence: !!r.evidenceFilePath,
      target: r.machine ? `${r.machine.machineCode} · ${r.machine.machineName}` : r.checkpoint?.checkpointName ?? "—",
      location: [r.building?.buildingName, r.department?.departmentName].filter(Boolean).join(" › "),
      recorder: `${r.recorder.firstName} ${r.recorder.lastName}`,
    })),
  };
}
