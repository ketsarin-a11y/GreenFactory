import "server-only";
import { db } from "@/server/db";
import { departmentWhere, qrWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import type { Prisma } from "@/generated/prisma/client";

export const QR_PAGE = 20;

const lineInclude = {
  select: { lineName: true, department: { select: { departmentId: true, departmentName: true, building: { select: { buildingName: true, factory: { select: { factoryName: true } } } } } } },
} as const;
const include = {
  machine: { select: { machineCode: true, machineName: true, productionLine: lineInclude } },
  checkpoint: { select: { checkpointCode: true, checkpointName: true, productionLine: lineInclude } },
} satisfies Prisma.QRCodeInclude;

type Row = Prisma.QRCodeGetPayload<{ include: typeof include }>;

/** Plain, client-safe QR row (BigInt → string). The token is needed to draw the code. */
function toRow(q: Row) {
  const t = q.machine ?? q.checkpoint;
  const line = t?.productionLine;
  return {
    id: q.qrId.toString(),
    qrCode: q.qrCode,
    token: q.qrToken,
    status: q.qrStatus,
    generatedAt: q.generatedAt.toISOString(),
    revokedAt: q.revokedAt?.toISOString() ?? null,
    targetType: q.machine ? ("MACHINE" as const) : ("CHECKPOINT" as const),
    targetCode: q.machine?.machineCode ?? q.checkpoint?.checkpointCode ?? "—",
    targetName: q.machine?.machineName ?? q.checkpoint?.checkpointName ?? "—",
    factory: line?.department.building.factory.factoryName ?? "—",
    building: line?.department.building.buildingName ?? "—",
    department: line?.department.departmentName ?? "—",
    line: line?.lineName ?? "—",
  };
}
export type QrRow = ReturnType<typeof toRow>;

export async function listQr(user: CurrentUser, f: { q?: string; status?: string; target?: string; department?: number; page: number }) {
  const and: Prisma.QRCodeWhereInput[] = [qrWhere(user)];
  if (f.q)
    and.push({ OR: [{ qrCode: { contains: f.q } }, { machine: { OR: [{ machineCode: { contains: f.q } }, { machineName: { contains: f.q } }] } }, { checkpoint: { OR: [{ checkpointCode: { contains: f.q } }, { checkpointName: { contains: f.q } }] } }] });
  if (f.status) and.push({ qrStatus: f.status });
  if (f.target === "MACHINE") and.push({ machineId: { not: null } });
  if (f.target === "CHECKPOINT") and.push({ checkpointId: { not: null } });
  if (f.department) {
    const inDept = { productionLine: { departmentId: f.department } };
    and.push({ OR: [{ machine: inDept }, { checkpoint: inDept }] });
  }
  const where = { AND: and };
  const base = qrWhere(user);
  const [total, rows, byStatus] = await Promise.all([
    db.qRCode.count({ where }),
    db.qRCode.findMany({ where, include, orderBy: [{ qrStatus: "asc" }, { qrCode: "asc" }], skip: (f.page - 1) * QR_PAGE, take: QR_PAGE }),
    db.qRCode.groupBy({ by: ["qrStatus"], where: base, _count: { _all: true } }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.qrStatus === s)?._count._all ?? 0;
  return {
    total,
    rows: rows.map(toRow),
    stats: { total: byStatus.reduce((a, b) => a + b._count._all, 0), ACTIVE: count("ACTIVE"), SUSPENDED: count("SUSPENDED"), REVOKED: count("REVOKED") },
  };
}

/** For the print sheet: only ids inside the company are returned. */
export async function qrByIds(user: CurrentUser, ids: bigint[]) {
  if (ids.length === 0) return [];
  const rows = await db.qRCode.findMany({ where: { AND: [qrWhere(user), { qrId: { in: ids } }] }, include, orderBy: { qrCode: "asc" } });
  return rows.map(toRow);
}

export const departmentOptions = async (user: CurrentUser) =>
  (await db.department.findMany({ where: departmentWhere(user), orderBy: [{ building: { buildingCode: "asc" } }, { departmentCode: "asc" }], select: { departmentId: true, departmentName: true, building: { select: { buildingName: true } } } }))
    .map((d) => ({ value: String(d.departmentId), label: `${d.building.buildingName} › ${d.departmentName}` }));
