"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { action, fail } from "./_action";
import { ownedWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { kpiWhere } from "@/server/queries/manager/common";
import { evaluateKpi, periodBounds } from "@/server/domain/kpi";
import { dayList } from "@/server/domain/analytics";
import { addDays, bkkDay, daysBetween, endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";

const M = ["MANAGER"] as const satisfies ["MANAGER"];
const zDay = z.string().refine(isDay, "วันที่ไม่ถูกต้อง");
const zAlertId = z.coerce.bigint().refine((v) => v > BigInt(0), "ข้อมูลอ้างอิงไม่ถูกต้อง");

// ---------- Alerts ----------

async function scopedAlert(user: CurrentUser, alertId: bigint) {
  return (await db.alert.findFirst({ where: { alertId, ...ownedWhere(user) } })) ?? fail("ไม่พบข้อมูล");
}

export const acknowledgeAlert = action([...M], z.object({ alertId: zAlertId }), async ({ alertId }, user) => {
  const a = await scopedAlert(user, alertId);
  if (a.status !== "OPEN") fail("การแจ้งเตือนนี้ถูกรับทราบหรือปิดไปแล้ว");
  const now = new Date();
  await db.alert.update({ where: { alertId }, data: { status: "ACKNOWLEDGED", acknowledgedAt: now } });
  await audit(user.id, "alert", alertId, "STATUS", { status: a.status }, { status: "ACKNOWLEDGED", acknowledgedAt: now });
  revalidatePath("/manager", "layout");
  return null;
});

export const resolveAlert = action([...M], z.object({ alertId: zAlertId }), async ({ alertId }, user) => {
  const a = await scopedAlert(user, alertId);
  if (a.status === "RESOLVED") fail("การแจ้งเตือนนี้ปิดไปแล้ว");
  const now = new Date();
  const data = { status: "RESOLVED", resolvedAt: now, resolvedBy: user.id, acknowledgedAt: a.acknowledgedAt ?? now };
  await db.alert.update({ where: { alertId }, data });
  await audit(user.id, "alert", alertId, "STATUS", { status: a.status }, data);
  revalidatePath("/manager", "layout");
  return null;
});

export const acknowledgeAllAlerts = action([...M], z.object({}), async (_i, user) => {
  const open = await db.alert.findMany({ where: { ...ownedWhere(user), status: "OPEN" }, select: { alertId: true } });
  if (!open.length) return { count: 0 };
  const now = new Date();
  await db.alert.updateMany({ where: { ...ownedWhere(user), status: "OPEN", alertId: { in: open.map((a) => a.alertId) } }, data: { status: "ACKNOWLEDGED", acknowledgedAt: now } });
  for (const a of open) await audit(user.id, "alert", a.alertId, "STATUS", { status: "OPEN" }, { status: "ACKNOWLEDGED", acknowledgedAt: now });
  revalidatePath("/manager", "layout");
  return { count: open.length };
});

// ---------- KPI ----------

/**
 * Recomputes KPIResult for every closed period (ends before today, Bangkok) that overlaps from..to,
 * for the manager's KPIs. actual = Σ quantity of the KPI's resource + unit inside its scope.
 */
export const recalculateKpis = action([...M], z.object({ from: zDay, to: zDay }), async ({ from, to }, user) => {
  if (from > to) fail("วันที่เริ่มต้องไม่หลังวันที่สิ้นสุด");
  if (daysBetween(from, to) > 400) fail("เลือกช่วงได้ไม่เกิน 400 วัน");
  const today = bkkDay(new Date());
  const kpis = await db.kPI.findMany({ where: { ...kpiWhere(user), status: "ACTIVE" } });
  let written = 0;
  for (const k of kpis) {
    const effFrom = bkkDay(k.effectiveFrom), effTo = k.effectiveTo ? bkkDay(k.effectiveTo) : null;
    const lo = from > effFrom ? from : effFrom, hi = effTo && effTo < to ? effTo : to;
    const periods = new Map<string, { start: string; end: string }>();
    for (const d of lo <= hi ? dayList(lo, hi) : []) {
      const p = periodBounds(k.periodType, startOfBkkDay(d));
      if (p.end < today) periods.set(p.start, p);
    }
    for (const p of periods.values()) {
      const agg = await db.resourceUsage.aggregate({
        _sum: { quantity: true },
        _count: true,
        where: {
          companyId: k.companyId,
          status: "ACTIVE",
          unitId: k.unitId,
          ...(k.resourceTypeId ? { resourceTypeId: k.resourceTypeId } : {}),
          ...(k.factoryId ? { factoryId: k.factoryId } : {}),
          ...(k.buildingId ? { buildingId: k.buildingId } : {}),
          ...(k.departmentId ? { departmentId: k.departmentId } : {}),
          ...(k.lineId ? { lineId: k.lineId } : {}),
          ...(k.machineId ? { machineId: k.machineId } : {}),
          usageAt: { gte: startOfBkkDay(p.start), lt: endOfBkkDayExclusive(p.end) },
        },
      });
      if (agg._count === 0) continue; // nothing recorded: not a PASS, just no result
      const actual = Number(agg._sum.quantity ?? 0);
      const r = evaluateKpi(actual, Number(k.targetValue), k.targetOperator);
      const data = { actualValue: actual, varianceValue: r.variance, achievementPercent: r.achievement, resultStatus: r.pass ? "PASS" : "FAIL", calculatedAt: new Date() };
      const periodStart = new Date(`${p.start}T00:00:00Z`), periodEnd = new Date(`${p.end}T00:00:00Z`);
      await db.kPIResult.upsert({
        where: { kpiId_periodStart_periodEnd: { kpiId: k.kpiId, periodStart, periodEnd } },
        create: { kpiId: k.kpiId, periodStart, periodEnd, ...data },
        update: data,
      });
      written++;
    }
  }
  await audit(user.id, "kpi_result", 0, "UPDATE", undefined, { from, to, kpis: kpis.length, results: written });
  revalidatePath("/manager/kpi");
  return { kpis: kpis.length, results: written };
});

// ---------- Reports ----------

const REPORT_TYPES = ["RESOURCE_USAGE", "CARBON", "KPI"] as const;
const REPORT_LABEL = { RESOURCE_USAGE: "รายงานการใช้ทรัพยากร", CARBON: "รายงานการปล่อยคาร์บอน", KPI: "รายงานผล KPI" };

export const createReport = action(
  [...M],
  z.object({ type: z.enum(REPORT_TYPES), format: z.enum(["XLSX", "CSV", "PDF"]), from: zDay, to: zDay }),
  async ({ type, format, from, to }, user) => {
    if (from > to) fail("วันที่เริ่มต้องไม่หลังวันที่สิ้นสุด");
    if (daysBetween(from, to) > 366) fail("เลือกช่วงได้ไม่เกิน 366 วัน");
    if (!user.factoryId) fail("บัญชีนี้ยังไม่ได้ผูกกับโรงงาน");
    const now = new Date();
    const r = await db.report.create({
      data: {
        companyId: user.companyId!,
        factoryId: user.factoryId,
        generatedBy: user.id,
        reportName: `${REPORT_LABEL[type]} ${from} ถึง ${to}`,
        reportType: type,
        reportFormat: format,
        filterScope: JSON.stringify({ type, from, to }),
        periodStart: new Date(`${from}T00:00:00Z`),
        periodEnd: new Date(`${to}T00:00:00Z`),
        reportStatus: "COMPLETED",
        generatedAt: now,
        expiresAt: new Date(`${addDays(bkkDay(now), 90)}T00:00:00Z`),
      },
    });
    await audit(user.id, "report", r.reportId, "CREATE", undefined, { type, format, from, to });
    revalidatePath("/manager/reports");
    return { id: String(r.reportId), format };
  },
);

// ---------- G-FAY chat history ----------

export const deleteConversation = action([...M], z.object({ id: z.string().min(1).max(64) }), async ({ id }, user) => {
  const row = await db.managerChatHistory.findUnique({ where: { userId_companyId: { userId: user.id, companyId: user.companyId! } } });
  if (!row) fail("ไม่พบข้อมูล");
  const t = (row!.transcript ?? {}) as { conversations?: { id: string }[] };
  const conversations = (t.conversations ?? []).filter((c) => c.id !== id);
  await db.managerChatHistory.update({ where: { id: row!.id }, data: { transcript: { conversations } as Prisma.InputJsonValue } });
  await audit(user.id, "manager_chat_history", row!.id, "UPDATE", undefined, { deletedConversation: id });
  revalidatePath("/manager/assistant");
  return null;
});

