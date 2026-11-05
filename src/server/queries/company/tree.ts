import "server-only";
import { db } from "@/server/db";
import { factoryWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { factoryReadiness } from "@/server/domain/readiness";

const byCode = <K extends string>(k: K) => ({ [k]: "asc" }) as Record<K, "asc">;

/**
 * The whole company hierarchy (factory → building → department → line → machines/checkpoints).
 * Company-sized, so one query feeds the dashboard, factories and structure pages.
 */
export function companyTree(user: CurrentUser) {
  return db.factory.findMany({
    where: factoryWhere(user),
    orderBy: byCode("factoryCode"),
    include: {
      _count: { select: { users: true } },
      buildings: {
        orderBy: byCode("buildingCode"),
        include: {
          departments: {
            orderBy: byCode("departmentCode"),
            include: {
              _count: { select: { users: true } },
              productionLines: {
                orderBy: byCode("lineCode"),
                include: {
                  checkpoints: { orderBy: byCode("checkpointCode") },
                  machines: {
                    orderBy: byCode("machineCode"),
                    select: {
                      machineId: true, machineCode: true, machineName: true, status: true,
                      _count: { select: { sensors: { where: { status: "ACTIVE" } }, qrCodes: { where: { qrStatus: "ACTIVE" } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
export type CompanyTree = Awaited<ReturnType<typeof companyTree>>;
type TreeFactory = CompanyTree[number];

const active = <T extends { status: string }>(xs: T[]) => xs.filter((x) => x.status === "ACTIVE");

/** Counts of ACTIVE structure and ACTIVE machine coverage for one factory. */
export function factoryCounts(f: TreeFactory) {
  const buildings = active(f.buildings);
  const departments = active(buildings.flatMap((b) => b.departments));
  const lines = active(departments.flatMap((d) => d.productionLines));
  const allMachines = f.buildings.flatMap((b) => b.departments.flatMap((d) => d.productionLines.flatMap((l) => l.machines)));
  const machines = active(lines.flatMap((l) => l.machines));
  const c = {
    buildings: buildings.length,
    departments: departments.length,
    lines: lines.length,
    checkpoints: active(lines.flatMap((l) => l.checkpoints)).length,
    allMachines: allMachines.length,
    machines: machines.length,
    machinesWithSensor: machines.filter((m) => m._count.sensors > 0).length,
    machinesWithQr: machines.filter((m) => m._count.qrCodes > 0).length,
    users: f._count.users,
  };
  return { ...c, readiness: factoryReadiness(c) };
}
