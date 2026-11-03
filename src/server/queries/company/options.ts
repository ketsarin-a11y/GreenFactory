import "server-only";
import { db } from "@/server/db";
import { factoryWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { companyTree } from "./tree";

type HNode = { value: string; label: string; inactive?: boolean; children?: HNode[] };
const node = (id: number | string, code: string, name: string, status: string, children?: HNode[]): HNode => ({
  value: String(id), label: `${name} (${code})`, inactive: status !== "ACTIVE", children,
});

/**
 * Company hierarchy as cascade options. `leaf` decides how deep it goes:
 * "line" (machines), "machine" (sensors), "target" (QR: machines M:<id> + checkpoints C:<id>).
 */
export async function hierarchyOptions(user: CurrentUser, leaf: "line" | "machine" | "target"): Promise<HNode[]> {
  const tree = await companyTree(user);
  return tree.map((f) =>
    node(f.factoryId, f.factoryCode, f.factoryName, f.status, f.buildings.map((b) =>
      node(b.buildingId, b.buildingCode, b.buildingName, b.status, b.departments.map((d) =>
        node(d.departmentId, d.departmentCode, d.departmentName, d.status, d.productionLines.map((l) =>
          node(l.lineId, l.lineCode, l.lineName, l.status,
            leaf === "line" ? undefined
            : leaf === "machine" ? l.machines.map((m) => node(m.machineId, m.machineCode, m.machineName, m.status))
            : [
                ...l.machines.map((m) => ({ ...node(`M:${m.machineId}`, m.machineCode, m.machineName, m.status), label: `เครื่องจักร ${m.machineName} (${m.machineCode})` })),
                ...l.checkpoints.map((c) => ({ ...node(`C:${c.checkpointId}`, c.checkpointCode, c.checkpointName, c.status), label: `จุดตรวจวัด ${c.checkpointName} (${c.checkpointCode})` })),
              ]),
        )),
      )),
    )),
  );
}

/** Factory → department (building shown in the label) for user assignment. */
export async function factoryDepartmentOptions(user: CurrentUser): Promise<HNode[]> {
  const tree = await companyTree(user);
  return tree.map((f) =>
    node(f.factoryId, f.factoryCode, f.factoryName, f.status,
      f.buildings.flatMap((b) => b.departments.map((d) => ({ ...node(d.departmentId, d.departmentCode, d.departmentName, d.status === "ACTIVE" && b.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"), label: `${b.buildingName} › ${d.departmentName}` })))),
  );
}

export const factoryFilterOptions = async (user: CurrentUser) =>
  (await db.factory.findMany({ where: factoryWhere(user), orderBy: { factoryCode: "asc" }, select: { factoryId: true, factoryName: true } }))
    .map((f) => ({ value: String(f.factoryId), label: f.factoryName }));

export const machineTypeOptions = async () =>
  (await db.machineType.findMany({ where: { status: "ACTIVE" }, orderBy: { machineTypeName: "asc" } })).map((t) => ({ value: String(t.machineTypeId), label: t.machineTypeName }));

export const sensorTypeOptions = async () =>
  (await db.sensorType.findMany({ where: { status: "ACTIVE" }, orderBy: { sensorTypeName: "asc" } })).map((t) => ({ value: String(t.sensorTypeId), label: t.sensorTypeName }));

