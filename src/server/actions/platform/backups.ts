"use server";

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import {
  backupDir,
  backupFileName,
  dbTarget,
  isInsideDir,
  mysqlBin,
  mysqldumpBin,
  runDump,
  runRestore,
  toolStatus,
  verifyBackupFile,
} from "@/server/backup";
import { action, fail, zId } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];

export const createBackup = action(PA, z.object({}), async (_input, user) => {
  const tool = await toolStatus(mysqldumpBin());
  if (!tool.available) fail("เครื่องนี้ยังไม่มี mysqldump จึงสำรองข้อมูลไม่ได้ (ตั้งค่า MYSQLDUMP_PATH)");
  if (await db.backupRecord.findFirst({ where: { status: "RUNNING", startedAt: { gte: new Date(Date.now() - 30 * 60_000) } } }))
    fail("มีการสำรองข้อมูลที่กำลังทำงานอยู่ กรุณารอให้เสร็จก่อน");

  const started = new Date();
  const dir = backupDir();
  await mkdir(dir, { recursive: true });
  const fileName = backupFileName(started);
  const filePath = path.join(dir, fileName);
  const rec = await db.backupRecord.create({
    data: {
      backupCode: fileName.replace(/\.sql$/, ""),
      fileName,
      filePath,
      startedAt: started,
      createdByUserId: user.id,
      createdByName: `${user.firstName} ${user.lastName}`,
    },
  });

  let errorMessage: string | null = null;
  try {
    await runDump(dbTarget(), filePath);
  } catch (e) {
    errorMessage = (e as Error).message.slice(0, 1000);
  }
  const check = await verifyBackupFile(filePath);
  const completedAt = new Date();
  const ok = !errorMessage && check.ok;
  const after = await db.backupRecord.update({
    where: { backupId: rec.backupId },
    data: {
      status: ok ? "COMPLETED" : "FAILED",
      verified: check.ok,
      fileSize: BigInt(check.size),
      completedAt,
      durationSeconds: Math.round((completedAt.getTime() - started.getTime()) / 1000),
      errorMessage: ok ? null : (errorMessage ?? check.reason ?? "ไม่ทราบสาเหตุ"),
    },
  });
  await audit(user.id, "backup_record", rec.backupId, "CREATE", undefined, after);
  revalidatePath("/platform/backups");
  if (!ok) fail(`สำรองข้อมูลไม่สำเร็จ: ${after.errorMessage}`);
  return { code: after.backupCode };
});

export const restoreBackup = action(
  PA,
  z.object({
    backupId: zId,
    confirm: z.literal("RESTORE", "พิมพ์ RESTORE เพื่อยืนยัน"),
    reason: z.string().trim().min(5, "กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร").max(500),
  }),
  async ({ backupId, reason }, user) => {
    const tool = await toolStatus(mysqlBin());
    if (!tool.available) fail("เครื่องนี้ยังไม่มีโปรแกรม mysql จึงกู้คืนไม่ได้ (ตั้งค่า MYSQL_PATH)");
    const rec = await db.backupRecord.findUnique({ where: { backupId } });
    if (!rec || !rec.filePath) fail("ไม่พบข้อมูลสำรอง");
    if (rec!.status !== "COMPLETED" || !rec!.verified) fail("กู้คืนได้เฉพาะข้อมูลสำรองที่สำเร็จและผ่านการตรวจสอบแล้ว");
    if (!isInsideDir(rec!.filePath!, backupDir())) fail("ตำแหน่งไฟล์สำรองไม่ถูกต้อง");
    const check = await verifyBackupFile(rec!.filePath!);
    if (!check.ok) fail(`ไฟล์สำรองใช้ไม่ได้: ${check.reason}`);

    // The restore replaces every table, including audit_log and backup_record. Keep the backup
    // history (newer backups, this one's real status) by snapshotting it and writing it back after.
    const history = await db.backupRecord.findMany();
    try {
      await runRestore(dbTarget(), rec!.filePath!);
    } catch (e) {
      await audit(user.id, "backup_record", backupId, "RESTORE", undefined, { backupCode: rec!.backupCode, reason, ok: false, error: (e as Error).message.slice(0, 500) });
      fail(`กู้คืนไม่สำเร็จ: ${(e as Error).message.slice(0, 300)}`);
    }
    // Sessions revoked after the backup was taken would come back to life: sign everyone out.
    await db.user.updateMany({ data: { sessionVersion: { increment: 1 } } });
    const restoredAt = new Date();
    for (const { backupId: bid, ...row } of history) {
      const data = bid === backupId ? { ...row, restoredAt, restoredByUserId: user.id } : row;
      await db.backupRecord.upsert({ where: { backupId: bid }, update: data, create: { backupId: bid, ...data } });
    }
    await audit(user.id, "backup_record", backupId, "RESTORE", undefined, { backupCode: rec!.backupCode, reason, ok: true });
    revalidatePath("/platform/backups");
  },
);
