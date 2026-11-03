import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { deleteMachine, saveMachine, setMachineStatus } from "@/server/actions/company/machines";
import { deleteSensor, issueSensorToken } from "@/server/actions/company/sensors";
import { POST as ingest } from "@/app/api/ingest/readings/route";
import { GET as sensorReadings } from "@/app/api/company/sensors/[id]/readings/route";
import { GET as reportExport } from "@/app/api/company/reports/route";
import { companyEnergy } from "@/server/queries/company/energy";
import { monthlyReport } from "@/server/queries/company/reports";
import { createQr, rotateQrToken, setQrStatus, updateQrCode } from "@/server/actions/company/qr";
import { createUser, resetUserPassword, setUserStatus, updateUser } from "@/server/actions/company/users";
import { deleteStructureNode, saveBuilding, saveDepartment, saveLine } from "@/server/actions/company/structure";
import { saveFactory, setFactoryStatus } from "@/server/actions/company/factories";
import { listMachines } from "@/server/queries/company/machines";
import { listUsers } from "@/server/queries/company/users";
import { listQr, qrByIds } from "@/server/queries/company/qr";
import { REFERENCED_MSG } from "@/server/actions/company/_shared";
import { DEMO as BASE_DEMO, signInAs, signOut } from "./helpers";

// The second seeded tenant is SIAMFOOD (helpers.ts still names the old SIAMPACK admin).
const DEMO = { ...BASE_DEMO, otherCompanyAdmin: "admin@siamfood.example" };

afterEach(signOut);

const NOT_FOUND = { ok: false, message: "ไม่พบข้อมูล" };
let v: { factoryId: number; machineId: number; lineId: number; typeId: number; sensorId: number; qrId: string; operatorId: number; departmentId: number };

beforeAll(async () => {
  const f = await db.factory.findFirstOrThrow({ where: { factoryCode: "VT-CB1" } });
  const m = await db.machine.findFirstOrThrow({ where: { productionLine: { department: { building: { factoryId: f.factoryId } } } }, include: { sensors: true, qrCodes: true } });
  const sensor = await db.sensor.findFirstOrThrow({ where: { machine: { productionLine: { department: { building: { factoryId: f.factoryId } } } } } });
  const op = await db.user.findUniqueOrThrow({ where: { email: DEMO.operator } });
  const dept = await db.department.findFirstOrThrow({ where: { building: { factoryId: f.factoryId } } });
  v = { factoryId: f.factoryId, machineId: m.machineId, lineId: m.lineId, typeId: m.machineTypeId, sensorId: sensor.sensorId, qrId: m.qrCodes[0].qrId.toString(), operatorId: op.userId, departmentId: dept.departmentId };
});

describe("cross-tenant ids (SIAMFOOD admin vs VOLTERA rows)", () => {
  it("cannot change VOLTERA machines, sensors or structure", async () => {
    await signInAs(DEMO.otherCompanyAdmin);
    expect(await saveMachine({ id: v.machineId, lineId: v.lineId, machineTypeId: v.typeId, machineCode: "HACK", machineName: "x" })).toEqual(NOT_FOUND);
    expect(await setMachineStatus({ id: v.machineId, status: "INACTIVE" })).toEqual(NOT_FOUND);
    expect(await deleteMachine({ id: v.machineId })).toEqual(NOT_FOUND);
    expect(await deleteSensor({ id: v.sensorId })).toEqual(NOT_FOUND);
    expect(await deleteStructureNode({ kind: "line", id: v.lineId })).toEqual(NOT_FOUND);
    expect(await saveBuilding({ factoryId: v.factoryId, buildingCode: "X", buildingName: "x" })).toEqual(NOT_FOUND);
    expect(await setFactoryStatus({ id: v.factoryId, status: "INACTIVE" })).toEqual(NOT_FOUND);
    expect((await db.machine.findUniqueOrThrow({ where: { machineId: v.machineId } })).status).toBe("ACTIVE");
  });

  it("cannot touch VOLTERA users", async () => {
    await signInAs(DEMO.otherCompanyAdmin);
    expect(await setUserStatus({ id: v.operatorId, status: "LOCKED" })).toEqual(NOT_FOUND);
    expect(await resetUserPassword({ id: v.operatorId, password: "Hacked123" })).toEqual(NOT_FOUND);
    expect(await updateUser({ id: v.operatorId, role: "OPERATOR", factoryId: v.factoryId, departmentId: v.departmentId, employeeCode: "X", firstName: "a", lastName: "b" })).toEqual(NOT_FOUND);
  });

  it("cannot see or change VOLTERA QR codes", async () => {
    await signInAs(DEMO.otherCompanyAdmin);
    expect(await setQrStatus({ id: v.qrId, status: "REVOKED" })).toEqual(NOT_FOUND);
    expect(await rotateQrToken({ id: v.qrId })).toEqual(NOT_FOUND);
    expect(await updateQrCode({ id: v.qrId, qrCode: "MINE" })).toEqual(NOT_FOUND);
    expect((await createQr({ targetType: "MACHINE", targetId: v.machineId, qrCode: "STEAL" })).ok).toBe(false);
    const u = (await getCurrentUser())!;
    expect(await qrByIds(u, [BigInt(v.qrId)])).toEqual([]);
    expect((await listQr(u, { page: 1 })).rows.some((r) => r.id === v.qrId || r.qrCode.startsWith("QR-VT"))).toBe(false);
    expect((await listMachines(u, { page: 1 })).rows.some((r) => r.id === v.machineId)).toBe(false);
    expect((await listUsers(u, { page: 1 })).rows.every((r) => r.email.endsWith("siamfood.example"))).toBe(true);
  });
});

describe("user creation rules", () => {
  const base = { role: "OPERATOR", firstName: "ทดสอบ", lastName: "ระบบ", password: "Passw0rd1" };

  it("operator needs a department that belongs to the chosen factory", async () => {
    await signInAs(DEMO.companyAdmin);
    expect(await createUser({ ...base, factoryId: v.factoryId, employeeCode: "T-001", email: "t1@voltera.example" })).toMatchObject({ ok: false, message: "ผู้ปฏิบัติงานต้องระบุแผนก" });

    // A department in a second VOLTERA factory must be rejected for VT-CB1.
    expect((await saveFactory({ factoryCode: "VT-T2", factoryName: "โรงงานทดสอบ 2" })).ok).toBe(true);
    const f2 = await db.factory.findFirstOrThrow({ where: { factoryCode: "VT-T2" } });
    expect((await saveBuilding({ factoryId: f2.factoryId, buildingCode: "B1", buildingName: "อาคาร" })).ok).toBe(true);
    const b2 = await db.building.findFirstOrThrow({ where: { factoryId: f2.factoryId } });
    expect((await saveDepartment({ buildingId: b2.buildingId, departmentCode: "D1", departmentName: "แผนก" })).ok).toBe(true);
    const d2 = await db.department.findFirstOrThrow({ where: { buildingId: b2.buildingId } });
    expect(await createUser({ ...base, factoryId: v.factoryId, departmentId: d2.departmentId, employeeCode: "T-001", email: "t1@voltera.example" }))
      .toMatchObject({ ok: false, message: "แผนกที่เลือกไม่อยู่ในโรงงานนี้" });

    const ok = await createUser({ ...base, factoryId: v.factoryId, departmentId: v.departmentId, employeeCode: " t-001 ", email: " T1@Voltera.Example " });
    expect(ok.ok).toBe(true);
    const created = await db.user.findUniqueOrThrow({ where: { email: "t1@voltera.example" } });
    expect(created).toMatchObject({ employeeCode: "T-001", username: "t1", departmentId: v.departmentId });
    expect(created.passwordHash).not.toContain("Passw0rd1");
  });

  it("rejects duplicate employee code / email, suffixes usernames, refuses COMPANY_ADMIN role", async () => {
    await signInAs(DEMO.companyAdmin);
    const other = { ...base, role: "MANAGER", factoryId: v.factoryId };
    expect(await createUser({ ...other, employeeCode: "T-001", email: "t1@other.example" })).toMatchObject({ ok: false, message: "รหัสพนักงานนี้มีอยู่ในบริษัทแล้ว" });
    expect(await createUser({ ...other, employeeCode: "T-002", email: "t1@voltera.example" })).toMatchObject({ ok: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
    expect((await createUser({ ...other, employeeCode: "T-002", email: "t1@other.example" })).ok).toBe(true);
    expect((await db.user.findUniqueOrThrow({ where: { email: "t1@other.example" } })).username).toBe("t11");
    expect((await createUser({ ...other, role: "COMPANY_ADMIN", employeeCode: "T-003", email: "t3@voltera.example" })).ok).toBe(false);
  });
});

describe("delete-or-deactivate", () => {
  it("hard-deletes an unreferenced line, deactivates a referenced one", async () => {
    await signInAs(DEMO.companyAdmin);
    expect((await saveLine({ departmentId: v.departmentId, lineCode: "tmp-line", lineName: "ชั่วคราว" })).ok).toBe(true);
    const tmp = await db.productionLine.findFirstOrThrow({ where: { departmentId: v.departmentId, lineCode: "TMP-LINE" } });
    expect(await saveLine({ departmentId: v.departmentId, lineCode: "TMP-LINE", lineName: "ซ้ำ" })).toMatchObject({ ok: false, message: "รหัสสายการผลิตนี้มีอยู่ในแผนกแล้ว" });

    expect(await deleteStructureNode({ kind: "line", id: tmp.lineId })).toMatchObject({ ok: true, data: { mode: "DELETED" } });
    expect(await db.productionLine.findUnique({ where: { lineId: tmp.lineId } })).toBeNull();

    expect(await deleteStructureNode({ kind: "line", id: v.lineId })).toMatchObject({ ok: true, data: { mode: "DEACTIVATED", message: REFERENCED_MSG } });
    expect((await db.productionLine.findUniqueOrThrow({ where: { lineId: v.lineId } })).status).toBe("INACTIVE");
    await db.productionLine.update({ where: { lineId: v.lineId }, data: { status: "ACTIVE" } });

    expect(await deleteMachine({ id: v.machineId })).toMatchObject({ ok: true, data: { mode: "DEACTIVATED" } });
    expect((await db.machine.findUniqueOrThrow({ where: { machineId: v.machineId } })).status).toBe("INACTIVE");
    expect((await setMachineStatus({ id: v.machineId, status: "ACTIVE" })).ok).toBe(true);
    expect(await db.auditLog.count({ where: { tableName: "machine", recordId: BigInt(v.machineId) } })).toBeGreaterThanOrEqual(2);
  });

  it("building codes are unique per factory, not per company", async () => {
    await signInAs(DEMO.companyAdmin);
    const existing = await db.building.findFirstOrThrow({ where: { factoryId: v.factoryId } });
    expect(await saveBuilding({ factoryId: v.factoryId, buildingCode: existing.buildingCode, buildingName: "ซ้ำ" })).toMatchObject({ ok: false, message: "รหัสอาคารนี้มีอยู่ในโรงงานแล้ว" });
    expect((await saveFactory({ factoryCode: "VT-T3", factoryName: "โรงงานทดสอบ 3" })).ok).toBe(true);
    const f3 = await db.factory.findFirstOrThrow({ where: { factoryCode: "VT-T3" } });
    expect((await saveBuilding({ factoryId: f3.factoryId, buildingCode: existing.buildingCode, buildingName: "ได้" })).ok).toBe(true);
  });
});

describe("suspend / reset password", () => {
  it("suspending bumps sessionVersion and ends the user's session", async () => {
    await signInAs(DEMO.operator);
    expect(await getCurrentUser()).not.toBeNull();
    const before = (await db.user.findUniqueOrThrow({ where: { userId: v.operatorId } })).sessionVersion;

    await signInAs(DEMO.companyAdmin);
    expect((await setUserStatus({ id: v.operatorId, status: "LOCKED" })).ok).toBe(true);
    const after = await db.user.findUniqueOrThrow({ where: { userId: v.operatorId } });
    expect(after).toMatchObject({ status: "LOCKED", sessionVersion: before + 1 });

    // The operator's old cookie (old version) no longer works, even after re-activation.
    expect((await setUserStatus({ id: v.operatorId, status: "ACTIVE" })).ok).toBe(true);
    const { testCookies } = await import("./setup");
    const { SESSION_COOKIE, signSession } = await import("@/server/auth/session");
    testCookies.set(SESSION_COOKIE, await signSession({ uid: v.operatorId, ver: before }, 3600));
    expect(await getCurrentUser()).toBeNull();
  });

  it("cannot suspend self or another company admin; reset password bumps the version", async () => {
    const me = await signInAs(DEMO.companyAdmin);
    expect(await setUserStatus({ id: me.userId, status: "LOCKED" })).toMatchObject({ ok: false });
    const v0 = (await db.user.findUniqueOrThrow({ where: { userId: v.operatorId } })).sessionVersion;
    expect(await resetUserPassword({ id: v.operatorId, password: "short" })).toMatchObject({ ok: false });
    expect((await resetUserPassword({ id: v.operatorId, password: "Temp12345" })).ok).toBe(true);
    expect((await db.user.findUniqueOrThrow({ where: { userId: v.operatorId } })).sessionVersion).toBe(v0 + 1);
  });
});

describe("sensor device tokens", () => {
  const post = (token: string | null, body: unknown) =>
    ingest(new Request("http://localhost/api/ingest/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }));

  it("another company's admin cannot issue a token for a VOLTERA sensor", async () => {
    await signInAs(DEMO.otherCompanyAdmin);
    const before = (await db.sensor.findUniqueOrThrow({ where: { sensorId: v.sensorId } })).ingestTokenHash;
    expect(await issueSensorToken({ id: v.sensorId })).toEqual(NOT_FOUND);
    expect((await db.sensor.findUniqueOrThrow({ where: { sensorId: v.sensorId } })).ingestTokenHash).toBe(before);
  });

  it("operators and managers cannot issue tokens", async () => {
    await signInAs(DEMO.manager);
    expect((await issueSensorToken({ id: v.sensorId })).ok).toBe(false);
  });

  it("an issued token is stored only as a hash, works against POST /api/ingest/readings, and replaces the old one", async () => {
    await signInAs(DEMO.companyAdmin);
    const r1 = await issueSensorToken({ id: v.sensorId });
    expect(r1.ok).toBe(true);
    const token = r1.ok ? r1.data.token : "";
    expect(token).toMatch(/^gfs_/);
    const stored = await db.sensor.findUniqueOrThrow({ where: { sensorId: v.sensorId } });
    expect(stored.ingestTokenHash).toHaveLength(64);
    expect(stored.ingestTokenHash).not.toContain(token);

    signOut(); // the device has no session
    const before = await db.sensorData.count({ where: { sensorId: v.sensorId } });
    const res = await post(token, { value: 42.1, unit: "KW" });
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ accepted: 1 });
    expect(await db.sensorData.count({ where: { sensorId: v.sensorId } })).toBe(before + 1);
    expect((await db.sensor.findUniqueOrThrow({ where: { sensorId: v.sensorId } })).lastConnectedAt).not.toBeNull();

    expect((await post(null, { value: 1 })).status).toBe(401);
    expect((await post(`${token}x`, { value: 1 })).status).toBe(401);
    expect((await post(token, { nope: true })).status).toBe(400);

    // Re-issuing invalidates the first token.
    await signInAs(DEMO.companyAdmin);
    const r2 = await issueSensorToken({ id: v.sensorId });
    expect(r2.ok).toBe(true);
    signOut();
    expect((await post(token, { value: 1, unit: "KW" })).status).toBe(401);
    expect((await post(r2.ok ? r2.data.token : "", { value: 2, unit: "KW" })).status).toBe(202);
  });

  it("24 h readings route is scoped to the admin's company", async () => {
    const call = () => sensorReadings(new Request(`http://localhost/api/company/sensors/${v.sensorId}/readings`), { params: Promise.resolve({ id: String(v.sensorId) }) });
    await signInAs(DEMO.companyAdmin);
    const ok = await call();
    expect(ok.status).toBe(200);
    const body = await ok.json();
    expect(body.points.length).toBeGreaterThan(100);
    expect(body.latest).not.toBeNull();
    await signInAs(DEMO.otherCompanyAdmin);
    expect((await call()).status).toBe(404);
    await signInAs(DEMO.manager);
    expect((await call()).status).toBe(401);
  });
});

describe("company overview and reports", () => {
  it("energy overview covers both VOLTERA factories and only VOLTERA data", async () => {
    const admin = (await signInAs(DEMO.companyAdmin)) && (await getCurrentUser())!;
    const e = await companyEnergy(admin);
    expect(e.factories.map((f) => f.code)).toEqual(expect.arrayContaining(["VT-CB1", "VT-RY2"]));
    expect(e.elec.total).toBeGreaterThan(0);
    expect(e.elec.total).toBeCloseTo(e.factories.reduce((a, f) => a + f.kwh, 0), 3);
    expect(e.days).toHaveLength(30);
    const other = (await signInAs(DEMO.otherCompanyAdmin)) && (await getCurrentUser())!;
    const o = await companyEnergy(other);
    expect(o.factories.some((f) => f.code.startsWith("VT-"))).toBe(false);
  });

  it("monthly report filters by factory and ignores other companies' factory ids", async () => {
    const admin = (await signInAs(DEMO.companyAdmin)) && (await getCurrentUser())!;
    const latest = await db.resourceUsage.findFirstOrThrow({ where: { companyId: admin.companyId! }, orderBy: { usageAt: "desc" } });
    const month = new Date(latest.usageAt.getTime() + 7 * 3600_000).toISOString().slice(0, 7);
    const all = await monthlyReport(admin, month);
    expect(all.factories.length).toBeGreaterThanOrEqual(2);
    const one = await monthlyReport(admin, month, v.factoryId);
    expect(one.factories.map((f) => f.id)).toEqual([v.factoryId]);
    const foreign = await db.factory.findFirstOrThrow({ where: { company: { companyCode: "SIAMFOOD" } } });
    expect((await monthlyReport(admin, month, foreign.factoryId)).metrics).toEqual([]);

    const res = await reportExport(new Request(`http://localhost/api/company/reports?month=${month}&format=xlsx`));
    expect(res.status).toBe(200);
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await res.arrayBuffer());
    expect(wb.worksheets.map((w) => w.name)).toEqual(["สรุปรายโรงงาน", "เทียบโรงงาน", "รายวัน"]);
    const csv = await (await reportExport(new Request(`http://localhost/api/company/reports?month=${month}&factory=${v.factoryId}`))).text();
    expect(csv).toContain("VT-CB1");
    expect(csv).not.toContain("VT-RY2");
  });
});
