// No "server-only" here: the seed script (plain Node) runs this too.
import type { PrismaClient } from "@/generated/prisma/client";
import { detectAnomaly, HISTORY_LIMIT, type Anomaly } from "./anomaly";
import { isBkkWeekend } from "../../lib/time";
import { getRuntimeSettings } from "../settings";
import { CALCULATION_VERSION, CARBON_UNIT, pickEmissionFactor, unitMatchesFactor } from "./carbon";

const PRIORITY = { CRITICAL: 1, HIGH: 2, MEDIUM: 3 } as const;
const fmt = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** Carbon first, then anomaly check. Marks the usage COMPLETED or FAILED. Safe to re-run. */
export async function processUsage(db: PrismaClient, usageId: bigint) {
  let failed = false;
  try {
    await calculateCarbon(db, usageId);
  } catch (e) {
    failed = true;
    console.error("[processUsage] carbon", usageId, e);
  }
  try {
    if ((await getRuntimeSettings(db)).anomalyDetection) await checkAnomaly(db, usageId);
  } catch (e) {
    failed = true;
    console.error("[processUsage] anomaly", usageId, e);
  }
  await db.resourceUsage.update({
    where: { usageId },
    data: { processingStatus: failed ? "FAILED" : "COMPLETED" },
  });
}

async function calculateCarbon(db: PrismaClient, usageId: bigint) {
  const u = await db.resourceUsage.findUniqueOrThrow({
    where: { usageId },
    include: { resourceType: { include: { emissionFactors: { where: { status: "ACTIVE" } } } }, unit: true },
  });
  if (!u.resourceType.carbonCalculable) return;
  if (await db.carbonResult.findFirst({ where: { usageId, calculationStatus: "CALCULATED" } })) return;

  const candidates = u.resourceType.emissionFactors
    .filter((f) => unitMatchesFactor(u.unit.symbol, f.factorUnit))
    .map((f) => ({ ...f, factor: Number(f.factor) }));
  const factor = pickEmissionFactor(candidates, u.usageAt);
  if (!factor) return; // no factor for this resource yet: usage stays without carbon, not an error

  const quantity = Number(u.quantity);
  await db.carbonResult.create({
    data: {
      usageId,
      factorId: factor.factorId,
      quantityUsed: quantity,
      factorUsed: factor.factor,
      carbonValue: quantity * factor.factor,
      carbonUnit: CARBON_UNIT,
      scope: u.resourceType.emissionFactors.find((f) => f.factorId === factor.factorId)?.scope ?? "UNKNOWN",
      calculationVersion: CALCULATION_VERSION,
    },
  });
}

async function checkAnomaly(db: PrismaClient, usageId: bigint) {
  const u = await db.resourceUsage.findUniqueOrThrow({
    where: { usageId },
    include: { resourceType: true, unit: true, machine: true, checkpoint: true },
  });
  const history = await db.resourceUsage.findMany({
    where: {
      companyId: u.companyId,
      resourceTypeId: u.resourceTypeId,
      status: "ACTIVE",
      usageAt: { lt: u.usageAt },
      ...(u.machineId ? { machineId: u.machineId } : { checkpointId: u.checkpointId }),
    },
    orderBy: { usageAt: "desc" },
    take: HISTORY_LIMIT * 3,
    select: { quantity: true, usageAt: true, unitId: true },
  });
  // Compare like with like: weekday readings against weekdays, weekends against weekends,
  // otherwise a normal quiet Sunday looks like a drop and hides real spikes.
  const weekend = isBkkWeekend(u.usageAt);
  const comparable = history
    .filter((h) => h.unitId === u.unitId && isBkkWeekend(h.usageAt) === weekend)
    .slice(0, HISTORY_LIMIT)
    .map((h) => Number(h.quantity));
  const current = Number(u.quantity);
  const a = detectAnomaly(comparable, current);
  if (!a) return;

  const alertCode = `ANOM-${usageId}-${a.direction}`;
  if (await db.alert.findUnique({ where: { alertCode } })) return;

  const target = u.machine?.machineName ?? u.checkpoint?.checkpointName ?? "จุดตรวจ";
  const text = describe(a, target, u.resourceType.resourceName, u.unit.symbol, current);
  const scope = {
    companyId: u.companyId,
    factoryId: u.factoryId,
    buildingId: u.buildingId,
    departmentId: u.departmentId,
    lineId: u.lineId,
    machineId: u.machineId,
    usageId,
  };

  const alert = await db.alert.create({
    data: {
      ...scope,
      alertCode,
      alertType: a.direction === "SPIKE" ? "RESOURCE_USAGE_SPIKE" : "RESOURCE_USAGE_DROP",
      severity: a.severity,
      title: text.title,
      message: text.message,
      thresholdValue: a.mean,
      actualValue: current,
      triggeredAt: u.usageAt,
    },
  });
  await db.aIRecommendation.create({
    data: {
      ...scope,
      alertId: alert.alertId,
      recommendationType: "ANOMALY_RESPONSE",
      title: text.recTitle,
      description: text.recommendation,
      priority: PRIORITY[a.severity],
      confidenceScore: a.zScore === null ? 0.6 : Math.min(0.95, 0.5 + Math.abs(a.zScore) / 10),
    },
  });
}

function describe(a: Anomaly, target: string, resource: string, unit: string, current: number) {
  const pct = Math.abs(a.deviationPct).toFixed(0);
  const spike = a.direction === "SPIKE";
  return {
    title: `${resource}${spike ? "สูง" : "ต่ำ"}ผิดปกติที่ ${target}`.slice(0, 255),
    message: `ค่าที่บันทึก ${fmt(current)} ${unit} ${spike ? "สูงกว่า" : "ต่ำกว่า"}ค่าเฉลี่ยย้อนหลัง (${fmt(a.mean)} ${unit}) ${pct}%`,
    recTitle: `คำแนะนำ: ตรวจสอบ${resource}ที่ ${target}`.slice(0, 255),
    recommendation: spike
      ? `ตรวจสอบการรั่วไหลหรือการเดินเครื่องนอกเวลาผลิตของ ${target} เทียบกับแผนการผลิตในช่วงเดียวกัน และยืนยันว่าค่ามิเตอร์ถูกอ่านและกรอกหน่วยถูกต้อง`
      : `ยืนยันว่า ${target} หยุดตามแผนหรือมิเตอร์ทำงานปกติ หากไม่ได้หยุดตามแผน ให้ตรวจสอบเซนเซอร์และการกรอกข้อมูล`,
  };
}
