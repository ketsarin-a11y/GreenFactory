"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { buildingWhere, checkpointWhere, departmentWhere, factoryWhere, lineWhere } from "@/server/scope";
import { action, fail, zCode, zId, zName, zOptText, zStatus } from "../_action";
import { ADMIN, anyCount, deleteOrDeactivate, unique, zOptId, zOptPosInt } from "./_shared";

const done = () => revalidatePath("/company", "layout");
const notFound = () => fail("ไม่พบข้อมูล");

export const saveBuilding = action(
  ADMIN,
  z.object({
    id: zOptId,
    factoryId: zId,
    buildingCode: zCode,
    buildingName: zName(),
    buildingType: zOptText(100),
    floorCount: zOptPosInt("จำนวนชั้นต้องเป็นจำนวนเต็มมากกว่า 0"),
    description: zOptText(500),
    status: zStatus,
  }),
  async ({ id, ...input }, user) => {
    if (!(await db.factory.findFirst({ where: { factoryId: input.factoryId, ...factoryWhere(user) } }))) return notFound();
    const dup = "รหัสอาคารนี้มีอยู่ในโรงงานแล้ว";
    if (id) {
      const before = await db.building.findFirst({ where: { buildingId: id, ...buildingWhere(user) } });
      if (!before) return notFound();
      await unique(db.building.update({ where: { buildingId: id }, data: input }), dup);
      await audit(user.id, "building", id, "UPDATE", before, input);
    } else {
      const b = await unique(db.building.create({ data: input }), dup);
      await audit(user.id, "building", b.buildingId, "CREATE", undefined, input);
    }
    done();
  },
);

export const saveDepartment = action(
  ADMIN,
  z.object({ id: zOptId, buildingId: zId, departmentCode: zCode, departmentName: zName(), description: zOptText(500), status: zStatus }),
  async ({ id, ...input }, user) => {
    if (!(await db.building.findFirst({ where: { buildingId: input.buildingId, ...buildingWhere(user) } }))) return notFound();
    const dup = "รหัสแผนกนี้มีอยู่ในอาคารแล้ว";
    if (id) {
      const before = await db.department.findFirst({ where: { departmentId: id, ...departmentWhere(user) } });
      if (!before) return notFound();
      await unique(db.department.update({ where: { departmentId: id }, data: input }), dup);
      await audit(user.id, "department", id, "UPDATE", before, input);
    } else {
      const d = await unique(db.department.create({ data: input }), dup);
      await audit(user.id, "department", d.departmentId, "CREATE", undefined, input);
    }
    done();
  },
);

export const saveLine = action(
  ADMIN,
  z.object({ id: zOptId, departmentId: zId, lineCode: zCode, lineName: zName(), description: zOptText(500), status: zStatus }),
  async ({ id, ...input }, user) => {
    if (!(await db.department.findFirst({ where: { departmentId: input.departmentId, ...departmentWhere(user) } }))) return notFound();
    const dup = "รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว";
    if (id) {
      const before = await db.productionLine.findFirst({ where: { lineId: id, ...lineWhere(user) } });
      if (!before) return notFound();
      await unique(db.productionLine.update({ where: { lineId: id }, data: input }), dup);
      await audit(user.id, "production_line", id, "UPDATE", before, input);
    } else {
      const l = await unique(db.productionLine.create({ data: input }), dup);
      await audit(user.id, "production_line", l.lineId, "CREATE", undefined, input);
    }
    done();
  },
);

export const saveCheckpoint = action(
  ADMIN,
  z.object({
    id: zOptId,
    lineId: zId,
    checkpointCode: zCode,
    checkpointName: zName(),
    checkpointType: zOptText(100),
    description: zOptText(500),
    status: zStatus,
  }),
  async ({ id, ...input }, user) => {
    if (!(await db.productionLine.findFirst({ where: { lineId: input.lineId, ...lineWhere(user) } }))) return notFound();
    const dup = "รหัสจุดตรวจวัดนี้มีอยู่ในสายการผลิตแล้ว";
    if (id) {
      const before = await db.checkpoint.findFirst({ where: { checkpointId: id, ...checkpointWhere(user) } });
      if (!before) return notFound();
      await unique(db.checkpoint.update({ where: { checkpointId: id }, data: input }), dup);
      await audit(user.id, "checkpoint", id, "UPDATE", before, input);
    } else {
      const c = await unique(db.checkpoint.create({ data: input }), dup);
      await audit(user.id, "checkpoint", c.checkpointId, "CREATE", undefined, input);
    }
    done();
  },
);

const usageRefs = { resourceUsages: true, kpis: true, alerts: true, aiRecommendations: true } as const;

/** Delete-or-deactivate for any structure node. */
export const deleteStructureNode = action(
  ADMIN,
  z.object({ kind: z.enum(["building", "department", "line", "checkpoint"]), id: zId }),
  async ({ kind, id }, user) => {
    const off = { data: { status: "INACTIVE" } };
    let result;
    if (kind === "building") {
      const n = await db.building.findFirst({ where: { buildingId: id, ...buildingWhere(user) }, include: { _count: { select: { departments: true, ...usageRefs } } } });
      if (!n) return notFound();
      const where = { buildingId: id };
      result = await deleteOrDeactivate(anyCount(n._count), () => db.building.delete({ where }), () => db.building.update({ where, ...off }));
    } else if (kind === "department") {
      const n = await db.department.findFirst({ where: { departmentId: id, ...departmentWhere(user) }, include: { _count: { select: { productionLines: true, users: true, ...usageRefs } } } });
      if (!n) return notFound();
      const where = { departmentId: id };
      result = await deleteOrDeactivate(anyCount(n._count), () => db.department.delete({ where }), () => db.department.update({ where, ...off }));
    } else if (kind === "line") {
      const n = await db.productionLine.findFirst({ where: { lineId: id, ...lineWhere(user) }, include: { _count: { select: { machines: true, checkpoints: true, ...usageRefs } } } });
      if (!n) return notFound();
      const where = { lineId: id };
      result = await deleteOrDeactivate(anyCount(n._count), () => db.productionLine.delete({ where }), () => db.productionLine.update({ where, ...off }));
    } else {
      const n = await db.checkpoint.findFirst({ where: { checkpointId: id, ...checkpointWhere(user) }, include: { _count: { select: { qrCodes: true, resourceUsages: true } } } });
      if (!n) return notFound();
      const where = { checkpointId: id };
      result = await deleteOrDeactivate(anyCount(n._count), () => db.checkpoint.delete({ where }), () => db.checkpoint.update({ where, ...off }));
    }
    const table = kind === "line" ? "production_line" : kind;
    await audit(user.id, table, id, result.mode === "DELETED" ? "DELETE" : "STATUS", undefined, result);
    done();
    return result;
  },
);
