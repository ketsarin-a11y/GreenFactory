"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { machineWhere, sensorWhere } from "@/server/scope";
import { PROTOCOLS } from "@/components/company/labels";
import { action, fail, zCode, zId, zName, zOptText, zStatus } from "../_action";
import { ADMIN, anyCount, deleteOrDeactivate, unique, zOptDate, zOptId, zOptPosInt } from "./_shared";

const done = () => revalidatePath("/company", "layout");

export const saveSensor = action(
  ADMIN,
  z.object({
    id: zOptId,
    machineId: zId,
    sensorTypeId: zId,
    sensorCode: zCode,
    sensorName: zName(),
    serialNumber: zOptText(150),
    manufacturer: zOptText(150),
    protocol: z.enum(PROTOCOLS).default("Modbus TCP"),
    samplingIntervalSeconds: zOptPosInt("รอบการอ่านค่าต้องเป็นจำนวนเต็มวินาทีมากกว่า 0"),
    connectionAddress: zOptText(255),
    dataTopic: zOptText(255),
    installationDate: zOptDate,
    lastCalibrationDate: zOptDate,
    nextCalibrationDate: zOptDate,
    status: zStatus,
  }),
  async ({ id, ...input }, user) => {
    const before = id ? await db.sensor.findFirst({ where: { sensorId: id, ...sensorWhere(user) } }) : null;
    if (id && !before) return fail("ไม่พบข้อมูล");
    if (input.machineId !== before?.machineId && !(await db.machine.findFirst({ where: { machineId: input.machineId, status: "ACTIVE", ...machineWhere(user) } })))
      return fail("ไม่พบเครื่องจักรที่เลือก หรือเครื่องจักรถูกปิดใช้งาน");
    if (input.sensorTypeId !== before?.sensorTypeId && !(await db.sensorType.findFirst({ where: { sensorTypeId: input.sensorTypeId, status: "ACTIVE" } })))
      return fail("ไม่พบประเภทเซนเซอร์ที่เลือก");
    const dup = "รหัสเซนเซอร์นี้มีอยู่ในเครื่องจักรแล้ว";
    if (before) {
      await unique(db.sensor.update({ where: { sensorId: before.sensorId }, data: input }), dup);
      await audit(user.id, "sensor", before.sensorId, "UPDATE", before, input);
    } else {
      const s = await unique(db.sensor.create({ data: input }), dup);
      await audit(user.id, "sensor", s.sensorId, "CREATE", undefined, input);
    }
    done();
  },
);

export const deleteSensor = action(ADMIN, z.object({ id: zId }), async ({ id }, user) => {
  const s = await db.sensor.findFirst({ where: { sensorId: id, ...sensorWhere(user) }, include: { _count: { select: { data: true } } } });
  if (!s) return fail("ไม่พบข้อมูล");
  const where = { sensorId: id };
  const r = await deleteOrDeactivate(anyCount(s._count), () => db.sensor.delete({ where }), () => db.sensor.update({ where, data: { status: "INACTIVE" } }));
  await audit(user.id, "sensor", id, r.mode === "DELETED" ? "DELETE" : "STATUS", s, r);
  done();
  return r;
});

/**
 * Issues a new device token for a sensor (replaces the old one). The plain token is returned
 * once — only its sha256 is stored — so the admin must copy it into the device now.
 */
export const issueSensorToken = action(ADMIN, z.object({ id: zId }), async ({ id }, user) => {
  const sensor = await db.sensor.findFirst({ where: { sensorId: id, ...sensorWhere(user) } });
  if (!sensor) return fail("ไม่พบข้อมูล");
  const token = `gfs_${randomBytes(24).toString("base64url")}`;
  await db.sensor.update({ where: { sensorId: id }, data: { ingestTokenHash: createHash("sha256").update(token).digest("hex") } });
  await audit(user.id, "sensor", id, "UPDATE", undefined, { ingestToken: "issued" });
  done();
  return { token };
});
