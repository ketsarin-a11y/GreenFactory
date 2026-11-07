"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { deleteStoredFile, saveFile } from "@/server/storage";
import { checkpointWhere, machineWhere, usageWhere } from "@/server/scope";
import { processUsage } from "@/server/domain/process-usage";
import { parseBkkLocal, scanProblem, usageReference, usageTimeProblem } from "@/server/domain/qr-scan";
import { action, fail, zId } from "./_action";

const EVIDENCE_MAX = 10 * 1024 * 1024;
const zBigId = z.string().regex(/^\d{1,18}$/, "ข้อมูลอ้างอิงไม่ถูกต้อง").transform((s) => BigInt(s));

const recordSchema = z.object({
  targetType: z.enum(["MACHINE", "CHECKPOINT"], { message: "กรุณาเลือกเครื่องจักรหรือจุดตรวจ" }),
  targetId: z.coerce.number({ message: "กรุณาเลือกเครื่องจักรหรือจุดตรวจ" }).int().positive("กรุณาเลือกเครื่องจักรหรือจุดตรวจ"),
  resourceTypeId: z.coerce.number({ message: "กรุณาเลือกประเภททรัพยากร" }).int().positive("กรุณาเลือกประเภททรัพยากร"),
  unitId: zId,
  quantity: z.coerce
    .number({ message: "กรุณากรอกปริมาณ" })
    .positive("ปริมาณการใช้ทรัพยากรต้องมากกว่า 0")
    .max(999_999_999_999, "ปริมาณมากเกินไป"),
  usageAt: z.string().transform((s, ctx) => parseBkkLocal(s) ?? (ctx.addIssue({ code: "custom", message: "กรุณาระบุวันที่และเวลา" }), z.NEVER)),
  scanId: z.union([zBigId, z.literal("")]).optional().transform((v) => (v === "" ? undefined : v)),
  remark: z.string().trim().max(1000, "หมายเหตุยาวเกิน 1000 ตัวอักษร").optional().transform((s) => s || null),
  evidence: z.instanceof(File).optional().transform((f) => (f && f.size > 0 ? f : undefined)),
});

/** Saves one reading (machine or checkpoint), then runs carbon + anomaly before returning. */
export const createUsage = action(["OPERATOR"], recordSchema, async (input, user) => {
  const now = new Date();
  const timeProblem = usageTimeProblem(input.usageAt, now);
  if (timeProblem) fail(timeProblem);

  // Target inside MY factory; org ids come from the hierarchy, never from the client.
  const lineInc = { productionLine: { include: { department: { include: { building: { include: { factory: true } } } } } } } as const;
  const target =
    input.targetType === "MACHINE"
      ? await db.machine.findFirst({ where: { machineId: input.targetId, status: "ACTIVE", ...machineWhere(user) }, include: lineInc })
      : await db.checkpoint.findFirst({ where: { checkpointId: input.targetId, status: "ACTIVE", ...checkpointWhere(user) }, include: lineInc });
  if (!target) return fail("ไม่พบเครื่องจักรหรือจุดตรวจ");
  const line = target.productionLine;

  const resource = await db.resourceTypeMaster.findFirst({
    where: { resourceTypeId: input.resourceTypeId, status: "ACTIVE", defaultUnit: { status: "ACTIVE" } },
  });
  if (!resource) return fail("ไม่พบประเภททรัพยากร");
  if (resource.defaultUnitId !== input.unitId) fail("หน่วยวัดไม่ตรงกับประเภททรัพยากร");

  const checkScan = async (tx: Pick<typeof db, "qRScanLog">) => {
    if (input.scanId === undefined) return;
    const scan = await tx.qRScanLog.findFirst({
      where: { scanId: input.scanId, userId: user.id },
      include: { qrCode: true, _count: { select: { resourceUsages: true } } },
    });
    const problem = scanProblem(
      scan && {
        userId: scan.userId,
        scanResult: scan.scanResult,
        scannedAt: scan.scannedAt,
        machineId: scan.qrCode.machineId,
        checkpointId: scan.qrCode.checkpointId,
        usedByUsage: scan._count.resourceUsages > 0,
      },
      user.id,
      { kind: input.targetType, id: input.targetId },
      now,
    );
    if (problem) fail(problem);
    if (scan!.qrCode.qrStatus !== "ACTIVE") fail("QR Code นี้ถูกระงับหรือยกเลิกแล้ว กรุณาติดต่อผู้ดูแลระบบ");
  };
  await checkScan(db);

  // Upload only after every check passed, and remove it again if the insert fails.
  const evidence = input.evidence
    ? await saveFile("evidence", input.evidence, ["image/jpeg", "image/png", "application/pdf"], EVIDENCE_MAX).catch((e: Error) => fail(e.message))
    : null;

  let usage;
  try {
    usage = await db.$transaction(async (tx) => {
      if (input.scanId !== undefined) {
        // Lock the scan row so two quick submits cannot both use it (single use).
        await tx.$queryRaw`SELECT scan_id FROM qr_scan_log WHERE scan_id = ${input.scanId} FOR UPDATE`;
        await checkScan(tx);
      }
      return tx.resourceUsage.create({
        data: {
          usageReference: usageReference(now),
          companyId: line.department.building.factory.companyId,
          factoryId: line.department.building.factoryId,
          buildingId: line.department.buildingId,
          departmentId: line.departmentId,
          lineId: line.lineId,
          machineId: input.targetType === "MACHINE" ? input.targetId : null,
          checkpointId: input.targetType === "CHECKPOINT" ? input.targetId : null,
          resourceTypeId: resource.resourceTypeId,
          unitId: resource.defaultUnitId,
          qrScanId: input.scanId ?? null,
          scopeType: input.targetType,
          sourceType: input.scanId !== undefined ? "QR" : "MANUAL",
          quantity: input.quantity,
          usageAt: input.usageAt,
          evidenceFilePath: evidence?.key ?? null,
          remark: input.remark,
          recordedBy: user.id,
        },
      });
    });
  } catch (e) {
    await deleteStoredFile(evidence?.key);
    throw e;
  }

  await processUsage(db, usage.usageId);
  await audit(user.id, "resource_usage", usage.usageId, "CREATE", undefined, { ...usage, quantity: String(usage.quantity) });
  revalidatePath("/operator", "layout");
  return { usageReference: usage.usageReference };
});

/** Soft delete of my own reading within 24h; also withdraws its carbon result and open alerts. */
export const deleteUsage = action(["OPERATOR"], z.object({ usageId: zBigId }), async ({ usageId }, user) => {
  const usage = await db.resourceUsage.findFirst({ where: { usageId, recordedBy: user.id, ...usageWhere(user) } });
  if (!usage) return fail("ไม่พบข้อมูล");
  if (Date.now() - usage.createdAt.getTime() > 24 * 3_600_000) fail("ลบได้เฉพาะรายการที่บันทึกภายใน 24 ชั่วโมง");

  const now = new Date();
  await db.$transaction([
    db.resourceUsage.update({ where: { usageId }, data: { status: "INACTIVE" } }),
    db.carbonResult.deleteMany({ where: { usageId } }),
    db.alert.updateMany({
      where: { usageId, status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      data: { status: "RESOLVED", resolvedAt: now, resolvedBy: user.id },
    }),
  ]);
  await audit(user.id, "resource_usage", usageId, "DELETE", { status: usage.status }, { status: "INACTIVE" });
  revalidatePath("/operator", "layout");
});
