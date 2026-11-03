"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { lineWhere, machineWhere } from "@/server/scope";
import { action, fail, zCode, zId, zName, zOptText, zStatus } from "../_action";
import { ADMIN, anyCount, deleteOrDeactivate, unique, zOptDate, zOptId } from "./_shared";

const done = () => revalidatePath("/company", "layout");

export const saveMachine = action(
  ADMIN,
  z.object({
    id: zOptId,
    lineId: zId,
    machineTypeId: zId,
    machineCode: zCode,
    machineName: zName(),
    manufacturer: zOptText(150),
    model: zOptText(150),
    serialNumber: zOptText(150),
    installationDate: zOptDate,
    locationNote: zOptText(500),
    operationalStatus: z.enum(["NORMAL", "WARNING", "MAINTENANCE", "STOPPED"]).default("NORMAL"),
    status: zStatus,
  }),
  async ({ id, ...input }, user) => {
    const before = id ? await db.machine.findFirst({ where: { machineId: id, ...machineWhere(user) } }) : null;
    if (id && !before) return fail("ไม่พบข้อมูล");
    // A new/changed line must be an ACTIVE line of this company; keeping the current line is always fine.
    if (input.lineId !== before?.lineId && !(await db.productionLine.findFirst({ where: { lineId: input.lineId, status: "ACTIVE", ...lineWhere(user) } })))
      return fail("ไม่พบสายการผลิตที่เลือก หรือสายการผลิตถูกปิดใช้งาน");
    if (input.machineTypeId !== before?.machineTypeId && !(await db.machineType.findFirst({ where: { machineTypeId: input.machineTypeId, status: "ACTIVE" } })))
      return fail("ไม่พบประเภทเครื่องจักรที่เลือก");
    const dup = "รหัสเครื่องจักรนี้มีอยู่ในสายการผลิตแล้ว";
    if (before) {
      await unique(db.machine.update({ where: { machineId: before.machineId }, data: input }), dup);
      await audit(user.id, "machine", before.machineId, "UPDATE", before, input);
    } else {
      const m = await unique(db.machine.create({ data: input }), dup);
      await audit(user.id, "machine", m.machineId, "CREATE", undefined, input);
    }
    done();
  },
);

export const setMachineStatus = action(ADMIN, z.object({ id: zId, status: zStatus }), async ({ id, status }, user) => {
  const before = await db.machine.findFirst({ where: { machineId: id, ...machineWhere(user) }, select: { status: true } });
  if (!before) return fail("ไม่พบข้อมูล");
  await db.machine.update({ where: { machineId: id }, data: { status } });
  await audit(user.id, "machine", id, "STATUS", before, { status });
  done();
});

export const deleteMachine = action(ADMIN, z.object({ id: zId }), async ({ id }, user) => {
  const m = await db.machine.findFirst({
    where: { machineId: id, ...machineWhere(user) },
    include: { _count: { select: { sensors: true, qrCodes: true, resourceUsages: true, kpis: true, alerts: true, aiRecommendations: true } } },
  });
  if (!m) return fail("ไม่พบข้อมูล");
  const where = { machineId: id };
  const r = await deleteOrDeactivate(anyCount(m._count), () => db.machine.delete({ where }), () => db.machine.update({ where, data: { status: "INACTIVE" } }));
  await audit(user.id, "machine", id, r.mode === "DELETED" ? "DELETE" : "STATUS", m, r);
  done();
  return r;
});
