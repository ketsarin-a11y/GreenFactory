"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { checkpointWhere, machineWhere, qrWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { action, fail, zCode, zId } from "../_action";
import { ADMIN } from "./_shared";

const done = () => revalidatePath("/company/qr-codes");
const DUP = "รหัส QR นี้มีอยู่ในบริษัทแล้ว";

/** QR codes are unique per company; the DB only has a global token key, so check here. */
async function codeTaken(user: CurrentUser, qrCode: string, exceptId?: bigint) {
  const hit = await db.qRCode.findFirst({ where: { qrCode, ...qrWhere(user), ...(exceptId ? { NOT: { qrId: exceptId } } : {}) }, select: { qrId: true } });
  return hit !== null;
}

async function findQr(user: CurrentUser, id: string) {
  const qr = await db.qRCode.findFirst({ where: { qrId: BigInt(id), ...qrWhere(user) } });
  return qr ?? fail("ไม่พบข้อมูล");
}
const zQrId = z.string().regex(/^\d+$/, "ข้อมูลอ้างอิงไม่ถูกต้อง");

export const createQr = action(
  ADMIN,
  z.object({ targetType: z.enum(["MACHINE", "CHECKPOINT"]), targetId: zId, qrCode: zCode, qrStatus: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE") }),
  async ({ targetType, targetId, qrCode, qrStatus }, user) => {
    const target =
      targetType === "MACHINE"
        ? await db.machine.findFirst({ where: { machineId: targetId, status: "ACTIVE", ...machineWhere(user) }, select: { machineId: true } })
        : await db.checkpoint.findFirst({ where: { checkpointId: targetId, status: "ACTIVE", ...checkpointWhere(user) }, select: { checkpointId: true } });
    if (!target) return fail("ไม่พบเป้าหมายที่เลือก หรือถูกปิดใช้งาน");
    if (await codeTaken(user, qrCode)) return fail(DUP);
    const data = {
      qrCode,
      qrStatus,
      qrToken: randomUUID(),
      machineId: targetType === "MACHINE" ? targetId : null,
      checkpointId: targetType === "CHECKPOINT" ? targetId : null,
    };
    const qr = await db.qRCode.create({ data });
    await audit(user.id, "qr_code", qr.qrId, "CREATE", undefined, { ...data, qrToken: undefined });
    done();
    return { id: qr.qrId.toString() };
  },
);

export const updateQrCode = action(ADMIN, z.object({ id: zQrId, qrCode: zCode }), async ({ id, qrCode }, user) => {
  const qr = await findQr(user, id);
  if (await codeTaken(user, qrCode, qr.qrId)) return fail(DUP);
  await db.qRCode.update({ where: { qrId: qr.qrId }, data: { qrCode } });
  await audit(user.id, "qr_code", qr.qrId, "UPDATE", { qrCode: qr.qrCode }, { qrCode });
  done();
});

/** ACTIVE ↔ SUSPENDED, or REVOKED (final: a revoked code cannot come back). */
export const setQrStatus = action(ADMIN, z.object({ id: zQrId, status: z.enum(["ACTIVE", "SUSPENDED", "REVOKED"]) }), async ({ id, status }, user) => {
  const qr = await findQr(user, id);
  if (qr.qrStatus === "REVOKED") return fail("QR Code นี้ถูกยกเลิกแล้ว ไม่สามารถเปลี่ยนสถานะได้");
  const data = { qrStatus: status, revokedAt: status === "REVOKED" ? new Date() : null };
  await db.qRCode.update({ where: { qrId: qr.qrId }, data });
  await audit(user.id, "qr_code", qr.qrId, "STATUS", { qrStatus: qr.qrStatus }, data);
  done();
});

/** New token: every label printed before stops working. */
export const rotateQrToken = action(ADMIN, z.object({ id: zQrId }), async ({ id }, user) => {
  const qr = await findQr(user, id);
  if (qr.qrStatus === "REVOKED") return fail("QR Code นี้ถูกยกเลิกแล้ว");
  await db.qRCode.update({ where: { qrId: qr.qrId }, data: { qrToken: randomUUID(), generatedAt: new Date() } });
  await audit(user.id, "qr_code", qr.qrId, "UPDATE", undefined, { tokenRotated: true });
  done();
});
