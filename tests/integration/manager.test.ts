import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { acknowledgeAlert, acknowledgeAllAlerts, createReport, recalculateKpis, resolveAlert } from "@/server/actions/manager";
import { getAlertDetail, getAlerts } from "@/server/queries/manager/alerts";
import { findReport } from "@/server/queries/manager/reports";
import { loadUsageRows } from "@/server/queries/manager/common";
import { getCompare } from "@/server/queries/manager/compare";
import { getHome } from "@/server/queries/manager/home";
import { sumByResourceUnit } from "@/server/domain/analytics";
import { GET as download } from "@/app/api/manager/reports/[id]/download/route";
import { addDays, bkkDay, startOfBkkDay } from "@/lib/time";
import { DEMO, signInAs, signOut } from "./helpers";

afterEach(signOut);

const asManager = async () => {
  await signInAs(DEMO.manager);
  return (await getCurrentUser())!;
};
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (id: string) => new Request(`http://localhost/api/manager/reports/${id}/download`);

let other: { companyId: number; adminId: number };

beforeAll(async () => {
  const sp = await db.company.findUniqueOrThrow({ where: { companyCode: "SIAMPACK" } });
  const admin = await db.user.findUniqueOrThrow({ where: { email: DEMO.otherCompanyAdmin } });
  other = { companyId: sp.companyId, adminId: admin.userId };
});

describe("alerts are tenant-scoped", () => {
  it("cannot read or acknowledge another company's alert", async () => {
    const foreign = await db.alert.create({
      data: { companyId: other.companyId, alertCode: `TEST-FOREIGN-${Date.now()}`, alertType: "RESOURCE_USAGE_SPIKE", severity: "CRITICAL", title: "foreign", message: "foreign" },
    });
    const user = await asManager();
    expect(await getAlertDetail(user, String(foreign.alertId))).toBeNull();
    expect((await getAlerts(user, { page: 1, q: "foreign" })).total).toBe(0);
    for (const act of [acknowledgeAlert, resolveAlert]) {
      const r = await act({ alertId: String(foreign.alertId) });
      expect(r).toMatchObject({ ok: false, message: "ไม่พบข้อมูล" });
    }
    await acknowledgeAllAlerts({});
    expect((await db.alert.findUniqueOrThrow({ where: { alertId: foreign.alertId } })).status).toBe("OPEN");
  });

  it("acknowledges then resolves its own alert with who/when, audited", async () => {
    const user = await asManager();
    const a = await db.alert.create({
      data: { companyId: user.companyId!, factoryId: user.factoryId, alertCode: `TEST-OWN-${Date.now()}`, alertType: "RESOURCE_USAGE_SPIKE", severity: "HIGH", title: "own", message: "own" },
    });
    expect((await acknowledgeAlert({ alertId: String(a.alertId) })).ok).toBe(true);
    expect((await acknowledgeAlert({ alertId: String(a.alertId) })).ok).toBe(false); // already acknowledged
    expect((await resolveAlert({ alertId: String(a.alertId) })).ok).toBe(true);
    const after = await db.alert.findUniqueOrThrow({ where: { alertId: a.alertId } });
    expect(after).toMatchObject({ status: "RESOLVED", resolvedBy: user.id });
    expect(after.resolvedAt).not.toBeNull();
    expect(await db.auditLog.count({ where: { tableName: "alert", recordId: a.alertId, userId: user.id } })).toBe(2);
  });

  it("rejects other roles", async () => {
    await signInAs(DEMO.operator);
    expect(await acknowledgeAllAlerts({})).toMatchObject({ ok: false });
  });
});

describe("reports", () => {
  it("cannot download another company's report", async () => {
    const r = await db.report.create({
      data: { companyId: other.companyId, generatedBy: other.adminId, reportName: "foreign", reportType: "RESOURCE_USAGE", reportFormat: "CSV", filterScope: JSON.stringify({ type: "RESOURCE_USAGE", from: "2026-01-01", to: "2026-01-31" }) },
    });
    const user = await asManager();
    expect(await findReport(user, String(r.reportId))).toBeNull();
    const res = await download(req(String(r.reportId)), ctx(String(r.reportId)));
    expect(res.status).toBe(404);
    expect((await db.report.findUniqueOrThrow({ where: { reportId: r.reportId } })).downloadCount).toBe(0);
  });

  it("returns proper 4xx statuses", async () => {
    expect((await download(req("1"), ctx("1"))).status).toBe(401);
    await signInAs(DEMO.operator);
    expect((await download(req("1"), ctx("1"))).status).toBe(403);
    await asManager();
    expect((await download(req("abc"), ctx("abc"))).status).toBe(400);
  });

  it("creates and downloads its own CSV (BOM) and XLSX, counting downloads", async () => {
    await asManager();
    const to = bkkDay(new Date()), from = addDays(to, -6);
    const csv = await createReport({ type: "RESOURCE_USAGE", format: "CSV", from, to });
    expect(csv.ok).toBe(true);
    const id = (csv as { data: { id: string } }).data.id;
    const res = await download(req(id), ctx(id));
    expect(res.status).toBe(200);
    const raw = new Uint8Array(await res.arrayBuffer());
    expect([...raw.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(raw);
    expect(text).toContain("\r\n");
    expect(text.split("\r\n")[0]).toContain("เลขอ้างอิง");
    expect((await db.report.findUniqueOrThrow({ where: { reportId: BigInt(id) } })).downloadCount).toBe(1);

    const x = await createReport({ type: "CARBON", format: "XLSX", from, to });
    const xid = (x as { data: { id: string } }).data.id;
    const xr = await download(req(xid), ctx(xid));
    expect(xr.status).toBe(200);
    expect(xr.headers.get("content-type")).toContain("spreadsheetml");
    const bytes = new Uint8Array(await xr.arrayBuffer());
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
  });
});

describe("aggregation never mixes units", () => {
  it("keeps TAP_WATER in m³ and L as separate totals", async () => {
    const user = await asManager();
    const day = (await db.resourceUsage.findFirstOrThrow({ where: { companyId: user.companyId!, status: "ACTIVE" }, orderBy: { usageAt: "desc" } })).usageAt;
    const today = bkkDay(day);
    const water = await db.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: "TAP_WATER" } });
    const litre = await db.unit.findUniqueOrThrow({ where: { unitCode: "LITER" } });
    const tmpl = await db.resourceUsage.findFirstOrThrow({ where: { companyId: user.companyId!, resourceTypeId: water.resourceTypeId } });
    // 00:30 Bangkok belongs to that Bangkok day (17:30 UTC of the previous calendar day).
    const at = new Date(startOfBkkDay(today).getTime() + 30 * 60_000);
    await db.resourceUsage.create({
      data: {
        usageReference: `TEST-L-${Date.now()}`, companyId: tmpl.companyId, factoryId: tmpl.factoryId, buildingId: tmpl.buildingId, departmentId: tmpl.departmentId,
        lineId: tmpl.lineId, checkpointId: tmpl.checkpointId, resourceTypeId: water.resourceTypeId, unitId: litre.unitId, scopeType: tmpl.scopeType,
        quantity: 500, usageAt: at, sourceType: "MANUAL", recordedBy: tmpl.recordedBy,
      },
    });
    const rows = await loadUsageRows(user, today, today);
    const inL = rows.filter((r) => r.resourceCode === "TAP_WATER" && r.unit === "L");
    expect(inL).toHaveLength(1);
    expect(inL[0].day).toBe(today);
    const groups = sumByResourceUnit(rows).filter((g) => g.resourceCode === "TAP_WATER");
    expect(groups.map((g) => g.unit).sort()).toEqual(["L", "m³"]);
    expect(groups.find((g) => g.unit === "L")!.total).toBe(500);
    const m3 = rows.filter((r) => r.resourceCode === "TAP_WATER" && r.unit === "m³").reduce((a, r) => a + r.quantity, 0);
    expect(groups.find((g) => g.unit === "m³")!.total).toBeCloseTo(m3);

    const range = { from: today, to: today, days: 1, isDefault: false };
    const cmp = await getCompare(user, range);
    expect(cmp.rows.filter((r) => r.resourceCode === "TAP_WATER").map((r) => r.unit).sort()).toEqual(["L", "m³"]);
    const home = await getHome(user, range);
    expect(home.resources.filter((r) => r.resourceCode === "TAP_WATER")).toHaveLength(2);
  });
});

describe("KPI recalculation", () => {
  it("reproduces the seeded KPIResult rows exactly (upsert, no duplicates)", async () => {
    const user = await asManager();
    const where = { kpi: { companyId: user.companyId! } };
    const before = await db.kPIResult.findMany({ where, orderBy: [{ kpiId: "asc" }, { periodStart: "asc" }] });
    expect(before.length).toBeGreaterThan(100);
    const first = bkkDay(before[0].periodStart);
    const r = await recalculateKpis({ from: first, to: bkkDay(new Date()) });
    expect(r.ok).toBe(true);
    const after = await db.kPIResult.findMany({ where, orderBy: [{ kpiId: "asc" }, { periodStart: "asc" }] });
    expect(after.length).toBe(before.length);
    after.forEach((a, i) => {
      const b = before[i];
      expect([a.kpiId, bkkDay(a.periodStart), bkkDay(a.periodEnd), a.resultStatus]).toEqual([b.kpiId, bkkDay(b.periodStart), bkkDay(b.periodEnd), b.resultStatus]);
      expect(Number(a.actualValue)).toBeCloseTo(Number(b.actualValue), 4);
      expect(Number(a.achievementPercent)).toBeCloseTo(Number(b.achievementPercent), 2);
    });
  });
});
