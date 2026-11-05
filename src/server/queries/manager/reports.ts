import "server-only";
import { z } from "zod";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";
import { ownedWhere } from "@/server/scope";
import { bkkDay, isDay } from "@/lib/time";
import { sumByResourceUnit } from "@/server/domain/analytics";
import { kpiWhere, loadUsageRows, sortGroups } from "./common";

export const REPORT_TYPE_LABEL: Record<string, string> = { RESOURCE_USAGE: "การใช้ทรัพยากร", CARBON: "การปล่อยคาร์บอน", KPI: "ผล KPI" };
export const CARBON_DISCLAIMER = "ค่าคาร์บอนเป็นการประมาณจาก Emission Factor ในระบบ (ค่าตัวอย่างยังไม่ผ่านการทวนสอบ) ไม่ใช่ผลการทวนสอบ";

export const filterScopeSchema = z.object({
  type: z.enum(["RESOURCE_USAGE", "CARBON", "KPI"]),
  from: z.string().refine(isDay),
  to: z.string().refine(isDay),
});
export type FilterScope = z.infer<typeof filterScopeSchema>;

export type Col = { header: string; key: string; num?: "int" | "dec" | "pct"; width?: number };
export type Sheet = { name: string; columns: Col[]; rows: Record<string, string | number | null>[] };
export type ReportData = { title: string; facts: [string, string | number][]; sheets: Sheet[]; notes: string[] };

/** "2026-11-03 08:15" in Bangkok. */
export const bkkDateTime = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");

export async function listReports(user: CurrentUser) {
  const rows = await db.report.findMany({ where: ownedWhere(user), orderBy: { requestedAt: "desc" }, take: 12, include: { generator: { select: { firstName: true, lastName: true } } } });
  return rows.map((r) => ({
    id: String(r.reportId), name: r.reportName, type: r.reportType, format: r.reportFormat, status: r.reportStatus, downloads: r.downloadCount,
    requestedAt: r.requestedAt, by: `${r.generator.firstName} ${r.generator.lastName}`,
  }));
}

/** Scoped lookup: another tenant's id behaves as "not found". */
export async function findReport(user: CurrentUser, id: string) {
  if (!/^\d{1,19}$/.test(id)) return null;
  const r = await db.report.findFirst({ where: { reportId: BigInt(id), ...ownedWhere(user) } });
  if (!r) return null;
  const scope = filterScopeSchema.safeParse(safeJson(r.filterScope));
  return { report: r, scope: scope.success ? scope.data : null };
}
const safeJson = (s: string | null) => { try { return JSON.parse(s ?? ""); } catch { return null; } };

const usageRaw = (rows: Awaited<ReturnType<typeof loadUsageRows>>): Sheet => ({
  name: "ข้อมูลดิบ",
  columns: [
    { header: "เลขอ้างอิง", key: "ref", width: 34 }, { header: "วันเวลา (กรุงเทพฯ)", key: "at", width: 18 },
    { header: "รหัสทรัพยากร", key: "code", width: 16 }, { header: "ทรัพยากร", key: "resource", width: 18 },
    { header: "ปริมาณ", key: "qty", num: "dec" }, { header: "หน่วย", key: "unit", width: 8 },
    { header: "รหัสเครื่องจักร", key: "mcode", width: 14 }, { header: "เครื่องจักร / จุดตรวจ", key: "target", width: 24 },
    { header: "อาคาร", key: "building", width: 18 }, { header: "แผนก", key: "department", width: 18 }, { header: "ไลน์ผลิต", key: "line", width: 18 },
    { header: "ที่มา", key: "source" }, { header: "สถานะประมวลผล", key: "processing", width: 14 },
    { header: "คาร์บอน (kgCO2e)", key: "carbon", num: "dec" }, { header: "หมายเหตุ", key: "remark", width: 24 },
  ],
  rows: rows.map((r) => ({
    ref: r.reference, at: bkkDateTime(r.usageAt), code: r.resourceCode, resource: r.resourceName, qty: r.quantity, unit: r.unit,
    mcode: r.targetCode ?? "", target: r.target, building: r.buildingName, department: r.departmentName, line: r.lineName,
    source: r.sourceType, processing: r.processingStatus, carbon: r.carbon?.kg ?? null, remark: r.remark ?? "",
  })),
});

export async function buildReport(user: CurrentUser, s: FilterScope): Promise<ReportData> {
  const period = `${s.from} ถึง ${s.to}`;
  if (s.type === "KPI") {
    const results = await db.kPIResult.findMany({
      where: { kpi: kpiWhere(user), periodStart: { lte: new Date(`${s.to}T00:00:00Z`) }, periodEnd: { gte: new Date(`${s.from}T00:00:00Z`) } },
      orderBy: [{ kpiId: "asc" }, { periodStart: "asc" }],
      include: { kpi: { select: { kpiCode: true, kpiName: true, targetValue: true, targetOperator: true, unit: { select: { symbol: true } } } } },
    });
    const pass = results.filter((r) => r.resultStatus === "PASS").length;
    const byKpi = new Map<string, { name: string; pass: number; fail: number }>();
    for (const r of results) {
      const g = byKpi.get(r.kpi.kpiCode) ?? { name: r.kpi.kpiName, pass: 0, fail: 0 };
      if (r.resultStatus === "PASS") g.pass++; else g.fail++;
      byKpi.set(r.kpi.kpiCode, g);
    }
    return {
      title: `รายงานผล KPI ${period}`,
      facts: [["ช่วงเวลา", period], ["จำนวนผล", results.length], ["ผ่านเป้า", pass], ["ไม่ผ่านเป้า", results.length - pass], ["อัตราผ่านเป้า (%)", results.length ? Math.round((pass / results.length) * 1000) / 10 : "—"]],
      sheets: [
        { name: "สรุปตาม KPI", columns: [{ header: "รหัส KPI", key: "code", width: 16 }, { header: "KPI", key: "name", width: 32 }, { header: "ผ่าน", key: "pass", num: "int" }, { header: "ไม่ผ่าน", key: "fail", num: "int" }],
          rows: [...byKpi.entries()].map(([code, g]) => ({ code, ...g })) },
        { name: "ผลรายงวด", columns: [
            { header: "รหัส KPI", key: "code", width: 16 }, { header: "KPI", key: "name", width: 32 }, { header: "เริ่มงวด", key: "start", width: 12 }, { header: "สิ้นงวด", key: "end", width: 12 },
            { header: "ค่าจริง", key: "actual", num: "dec" }, { header: "เป้าหมาย", key: "target", num: "dec" }, { header: "เงื่อนไข", key: "op" }, { header: "หน่วย", key: "unit" },
            { header: "ส่วนต่าง", key: "variance", num: "dec" }, { header: "ความสำเร็จ (%)", key: "ach", num: "dec" }, { header: "ผล", key: "status" }],
          rows: results.map((r) => ({
            code: r.kpi.kpiCode, name: r.kpi.kpiName, start: bkkDay(r.periodStart), end: bkkDay(r.periodEnd),
            actual: Number(r.actualValue), target: Number(r.kpi.targetValue), op: r.kpi.targetOperator, unit: r.kpi.unit.symbol,
            variance: Number(r.varianceValue), ach: Number(r.achievementPercent), status: r.resultStatus === "PASS" ? "ผ่าน" : "ไม่ผ่าน",
          })) },
      ],
      notes: [],
    };
  }

  const rows = await loadUsageRows(user, s.from, s.to);
  const groups = sortGroups(sumByResourceUnit(rows));
  const carbonOf = (key: string) => rows.filter((r) => `${r.resourceCode}|${r.unit}` === key).reduce((a, r) => a + (r.carbon?.kg ?? 0), 0);
  const machine = new Map<string, { target: string; code: string; resource: string; unit: string; total: number; count: number; carbon: number }>();
  for (const r of rows) {
    const k = `${r.target}|${r.resourceCode}|${r.unit}`;
    const g = machine.get(k) ?? { target: r.target, code: r.targetCode ?? "", resource: r.resourceName, unit: r.unit, total: 0, count: 0, carbon: 0 };
    g.total += r.quantity; g.count++; g.carbon += r.carbon?.kg ?? 0;
    machine.set(k, g);
  }
  const carbonTotal = rows.reduce((a, r) => a + (r.carbon?.kg ?? 0), 0);
  const qr = rows.filter((r) => r.sourceType === "QR").length;
  const facts: [string, string | number][] = [
    ["ช่วงเวลา", period], ["จำนวนรายการ", rows.length], ["เครื่องจักรที่มีข้อมูล", new Set(rows.map((r) => r.machineId).filter(Boolean)).size],
    ["ประเภททรัพยากร", groups.length], ["บันทึกผ่าน QR", qr], ["กรอกเอง", rows.length - qr], ["คาร์บอนรวม (kgCO2e)", Math.round(carbonTotal * 100) / 100],
  ];
  const resourceSheet: Sheet = {
    name: "ทรัพยากร",
    columns: [{ header: "หน่วย", key: "unit", width: 8 }, { header: "ทรัพยากร", key: "resource", width: 20 }, { header: "จำนวนรายการ", key: "count", num: "int" }, { header: "ปริมาณรวม", key: "total", num: "dec" }, { header: "คาร์บอน (kgCO2e)", key: "carbon", num: "dec" }],
    rows: [...groups].sort((a, b) => a.unit.localeCompare(b.unit)).map((g) => ({ unit: g.unit, resource: g.resourceName, count: g.count, total: g.total, carbon: carbonOf(g.key) })),
  };
  const machineSheet: Sheet = {
    name: "เครื่องจักร",
    columns: [{ header: "รหัส", key: "code", width: 12 }, { header: "เครื่องจักร / จุดตรวจ", key: "target", width: 26 }, { header: "ทรัพยากร", key: "resource", width: 18 }, { header: "หน่วย", key: "unit" }, { header: "จำนวนรายการ", key: "count", num: "int" }, { header: "ปริมาณรวม", key: "total", num: "dec" }, { header: "คาร์บอน (kgCO2e)", key: "carbon", num: "dec" }],
    rows: [...machine.values()].sort((a, b) => a.target.localeCompare(b.target) || a.unit.localeCompare(b.unit)),
  };

  if (s.type === "CARBON") {
    const scopes = new Map<string, number>();
    for (const r of rows) if (r.carbon) scopes.set(r.carbon.scope, (scopes.get(r.carbon.scope) ?? 0) + r.carbon.kg);
    const withC = rows.filter((r) => r.carbon);
    return {
      title: `รายงานการปล่อยคาร์บอน ${period}`,
      facts: [["ช่วงเวลา", period], ["คาร์บอนรวม (kgCO2e)", Math.round(carbonTotal * 100) / 100], ["รายการที่มีผลคาร์บอน", withC.length], ["รายการที่ยังไม่มีผล", rows.length - withC.length]],
      sheets: [
        { name: "ตาม Scope", columns: [{ header: "Scope", key: "scope", width: 12 }, { header: "คาร์บอน (kgCO2e)", key: "kg", num: "dec" }], rows: [...scopes.entries()].map(([scope, kg]) => ({ scope, kg })) },
        { name: "ตามทรัพยากร", columns: [{ header: "ทรัพยากร", key: "resource", width: 20 }, { header: "ปริมาณกิจกรรม", key: "activity", num: "dec" }, { header: "หน่วย", key: "unit" }, { header: "Emission Factor", key: "factor", width: 16 }, { header: "หน่วย Factor", key: "fu", width: 16 }, { header: "คาร์บอน (kgCO2e)", key: "kg", num: "dec" }],
          rows: sortGroups(sumByResourceUnit(withC)).map((g) => {
            const rs = withC.filter((r) => r.resourceCode === g.resourceCode && r.unit === g.unit);
            const fs = new Set(rs.map((r) => r.carbon!.factor));
            return { resource: g.resourceName, activity: g.total, unit: g.unit, factor: fs.size === 1 ? String([...fs][0]) : "หลายค่า", fu: rs[0]?.carbon?.factorUnit ?? "", kg: rs.reduce((a, r) => a + r.carbon!.kg, 0) };
          }) },
        { ...machineSheet, rows: machineSheet.rows.filter((r) => (r.carbon as number) > 0) },
        usageRaw(withC),
      ],
      notes: [CARBON_DISCLAIMER],
    };
  }

  return {
    title: `รายงานการใช้ทรัพยากร ${period}`,
    facts,
    sheets: [resourceSheet, machineSheet, usageRaw(rows)],
    notes: ["ยอดรวมแยกตามทรัพยากรและหน่วย ไม่รวมค่าที่ต่างหน่วยเข้าด้วยกัน", CARBON_DISCLAIMER],
  };
}
