import "server-only";
import { db } from "@/server/db";
import { machineWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import type { Prisma } from "@/generated/prisma/client";
import { machineProfile } from "@/server/domain/readiness";
import { bkkDay } from "@/lib/time";

export const MACHINE_PAGE = 20;

export async function listMachines(user: CurrentUser, f: { q?: string; factory?: number; status?: string; setup?: string; page: number }) {
  const and: Prisma.MachineWhereInput[] = [machineWhere(user)];
  if (f.q)
    and.push({
      OR: [
        { machineCode: { contains: f.q } }, { machineName: { contains: f.q } }, { machineType: { machineTypeName: { contains: f.q } } },
        { manufacturer: { contains: f.q } }, { model: { contains: f.q } }, { serialNumber: { contains: f.q } }, { locationNote: { contains: f.q } },
      ],
    });
  if (f.factory) and.push({ productionLine: { department: { building: { factoryId: f.factory } } } });
  if (f.status === "ACTIVE" || f.status === "INACTIVE") and.push({ status: f.status });
  else if (f.status) and.push({ operationalStatus: f.status, status: "ACTIVE" });
  if (f.setup === "no-sensor") and.push({ status: "ACTIVE", sensors: { none: { status: "ACTIVE" } } });
  if (f.setup === "no-qr") and.push({ status: "ACTIVE", qrCodes: { none: { qrStatus: "ACTIVE" } } });
  const where = { AND: and };

  const [total, rows, stats] = await Promise.all([
    db.machine.count({ where }),
    db.machine.findMany({
      where,
      orderBy: [{ status: "asc" }, { machineCode: "asc" }],
      skip: (f.page - 1) * MACHINE_PAGE,
      take: MACHINE_PAGE,
      include: {
        machineType: { select: { machineTypeName: true } },
        productionLine: { select: { lineId: true, lineName: true, department: { select: { departmentId: true, departmentName: true, building: { select: { buildingId: true, buildingName: true, factory: { select: { factoryId: true, factoryName: true } } } } } } } },
        _count: { select: { sensors: { where: { status: "ACTIVE" } }, qrCodes: { where: { qrStatus: "ACTIVE" } } } },
      },
    }),
    machineStats(user),
  ]);

  return {
    total,
    stats,
    rows: rows.map((m) => {
      const l = m.productionLine, d = l.department, b = d.building;
      const p = machineProfile({
        code: m.machineCode, name: m.machineName, typeId: m.machineTypeId, lineId: m.lineId, manufacturer: m.manufacturer, model: m.model,
        serialNumber: m.serialNumber, installationDate: m.installationDate, locationNote: m.locationNote, sensors: m._count.sensors, qrCodes: m._count.qrCodes,
      });
      return {
        id: m.machineId, machineCode: m.machineCode, machineName: m.machineName, machineTypeId: m.machineTypeId, typeName: m.machineType.machineTypeName,
        manufacturer: m.manufacturer, model: m.model, serialNumber: m.serialNumber, installationDate: m.installationDate ? bkkDay(m.installationDate) : null,
        locationNote: m.locationNote, operationalStatus: m.operationalStatus, status: m.status,
        path: [String(b.factory.factoryId), String(b.buildingId), String(d.departmentId), String(l.lineId)],
        location: `${b.factory.factoryName} › ${b.buildingName} › ${d.departmentName} › ${l.lineName}`,
        sensors: m._count.sensors, qrCodes: m._count.qrCodes, readiness: p.score, missing: p.checks.filter((c) => !c.ok).map((c) => c.label),
      };
    }),
  };
}
export type MachineRow = Awaited<ReturnType<typeof listMachines>>["rows"][number];

async function machineStats(user: CurrentUser) {
  const w = machineWhere(user);
  const [total, active, maintenance, withSensor, withQr] = await Promise.all([
    db.machine.count({ where: w }),
    db.machine.count({ where: { ...w, status: "ACTIVE" } }),
    db.machine.count({ where: { ...w, status: "ACTIVE", operationalStatus: "MAINTENANCE" } }),
    db.machine.count({ where: { ...w, status: "ACTIVE", sensors: { some: { status: "ACTIVE" } } } }),
    db.machine.count({ where: { ...w, status: "ACTIVE", qrCodes: { some: { qrStatus: "ACTIVE" } } } }),
  ]);
  return { total, active, maintenance, withSensor, withQr };
}
