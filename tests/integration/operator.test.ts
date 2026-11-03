import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { createUsage, deleteUsage } from "@/server/actions/operator";
import { scanQr } from "@/server/queries/operator";
import { getCurrentUser } from "@/server/auth/current-user";
import { bkkLocalInput } from "@/server/domain/qr-scan";
import { DEMO, signInAs, signOut } from "./helpers";

afterEach(signOut);

const meta = { ip: "127.0.0.1", userAgent: "vitest" };
let machine: { machineId: number; token: string };
let checkpoint: { checkpointId: number; token: string };
let electricity: { resourceTypeId: number; defaultUnitId: number };
let foreignMachineId: number;
let foreignToken: string;

const base = () => ({
  targetType: "MACHINE" as const,
  targetId: machine.machineId,
  resourceTypeId: electricity.resourceTypeId,
  unitId: electricity.defaultUnitId,
  quantity: 12.5,
  usageAt: bkkLocalInput(new Date()),
});

beforeAll(async () => {
  const op = await db.user.findUniqueOrThrow({ where: { email: DEMO.operator } });
  const qrM = await db.qRCode.findFirstOrThrow({
    where: { qrStatus: "ACTIVE", machine: { status: "ACTIVE", productionLine: { department: { building: { factoryId: op.factoryId! } } } } },
  });
  machine = { machineId: qrM.machineId!, token: qrM.qrToken };
  const qrC = await db.qRCode.findFirstOrThrow({ where: { qrStatus: "ACTIVE", checkpointId: { not: null } } });
  checkpoint = { checkpointId: qrC.checkpointId!, token: qrC.qrToken };
  electricity = await db.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: "ELECTRICITY" } });

  // A machine + QR in another company (SIAMPACK ships empty, so build a tiny hierarchy).
  const other = await db.company.findFirstOrThrow({ where: { companyCode: "SIAMPACK" } });
  const type = await db.machineType.findFirstOrThrow();
  const f = await db.factory.create({ data: { companyId: other.companyId, factoryCode: "SP-T1", factoryName: "SP test" } });
  const b = await db.building.create({ data: { factoryId: f.factoryId, buildingCode: "B1", buildingName: "B1" } });
  const d = await db.department.create({ data: { buildingId: b.buildingId, departmentCode: "D1", departmentName: "D1" } });
  const l = await db.productionLine.create({ data: { departmentId: d.departmentId, lineCode: "L1", lineName: "L1" } });
  const m = await db.machine.create({ data: { lineId: l.lineId, machineTypeId: type.machineTypeId, machineCode: "SP-M1", machineName: "SP machine" } });
  foreignMachineId = m.machineId;
  foreignToken = (await db.qRCode.create({ data: { machineId: m.machineId, qrCode: "x", qrToken: "foreign-token-0001" } })).qrToken;
});

describe("operator: record resource usage", () => {
  it("records a manual machine reading with org ids from the server and processes it", async () => {
    const op = await signInAs(DEMO.operator);
    const r = await createUsage(base());
    expect(r.ok).toBe(true);
    const u = await db.resourceUsage.findFirstOrThrow({ where: { usageReference: r.ok ? r.data.usageReference : "" } });
    expect(u).toMatchObject({ sourceType: "MANUAL", scopeType: "MACHINE", factoryId: op.factoryId, recordedBy: op.userId, processingStatus: "COMPLETED" });
    expect(u.usageReference).toMatch(/^USG-\d+-[0-9A-F]{10}$/);
    expect(u.lineId).not.toBeNull();
  });

  it("rejects another company's machine id", async () => {
    await signInAs(DEMO.operator);
    const r = await createUsage({ ...base(), targetId: foreignMachineId });
    expect(r).toMatchObject({ ok: false, message: "ไม่พบเครื่องจักรหรือจุดตรวจ" });
  });

  it("records against a checkpoint", async () => {
    await signInAs(DEMO.operator);
    const water = await db.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: "TAP_WATER" } });
    const r = await createUsage({ ...base(), targetType: "CHECKPOINT", targetId: checkpoint.checkpointId, resourceTypeId: water.resourceTypeId, unitId: water.defaultUnitId });
    expect(r.ok).toBe(true);
    const u = await db.resourceUsage.findFirstOrThrow({ where: { usageReference: r.ok ? r.data.usageReference : "" } });
    expect(u).toMatchObject({ scopeType: "CHECKPOINT", checkpointId: checkpoint.checkpointId, machineId: null });
  });

  it("rejects a unit that is not the resource's default unit", async () => {
    await signInAs(DEMO.operator);
    const r = await createUsage({ ...base(), unitId: electricity.defaultUnitId + 1 });
    expect(r).toMatchObject({ ok: false, message: "หน่วยวัดไม่ตรงกับประเภททรัพยากร" });
  });

  it("rejects future and too-old dates", async () => {
    await signInAs(DEMO.operator);
    const future = await createUsage({ ...base(), usageAt: bkkLocalInput(new Date(Date.now() + 60 * 60_000)) });
    expect(future).toMatchObject({ ok: false, message: expect.stringMatching(/อนาคต/) });
    const old = await createUsage({ ...base(), usageAt: bkkLocalInput(new Date(Date.now() - 40 * 86_400_000)) });
    expect(old).toMatchObject({ ok: false, message: expect.stringMatching(/31/) });
  });
});

describe("operator: QR scan ids (Review Focus #5)", () => {
  it("scan → record works once, then the same scan id is rejected", async () => {
    await signInAs(DEMO.operator);
    const scan = await scanQr((await getCurrentUser())!, machine.token, meta);
    expect(scan?.target.kind).toBe("MACHINE");
    const first = await createUsage({ ...base(), scanId: scan!.scanId });
    expect(first.ok).toBe(true);
    const u = await db.resourceUsage.findFirstOrThrow({ where: { usageReference: first.ok ? first.data.usageReference : "" } });
    expect(u.sourceType).toBe("QR");
    const again = await createUsage({ ...base(), scanId: scan!.scanId });
    expect(again).toMatchObject({ ok: false, message: expect.stringMatching(/ถูกใช้/) });
  });

  it("rejects an expired scan id", async () => {
    const op = await signInAs(DEMO.operator);
    const qr = await db.qRCode.findUniqueOrThrow({ where: { qrToken: machine.token } });
    const s = await db.qRScanLog.create({ data: { qrId: qr.qrId, userId: op.userId, scanResult: "SUCCESS", scannedAt: new Date(Date.now() - 31 * 60_000) } });
    const r = await createUsage({ ...base(), scanId: String(s.scanId) });
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/หมดอายุ/) });
  });

  it("rejects another user's scan id and a scan of a different target", async () => {
    await signInAs(DEMO.operator);
    const other = await db.user.findUniqueOrThrow({ where: { email: "operator2@voltera.example" } });
    const qr = await db.qRCode.findUniqueOrThrow({ where: { qrToken: machine.token } });
    const s = await db.qRScanLog.create({ data: { qrId: qr.qrId, userId: other.userId, scanResult: "SUCCESS" } });
    expect(await createUsage({ ...base(), scanId: String(s.scanId) })).toMatchObject({ ok: false, message: expect.stringMatching(/ไม่พบข้อมูลการสแกน/) });

    const op = await db.user.findUniqueOrThrow({ where: { email: DEMO.operator } });
    const mine = await db.qRScanLog.create({ data: { qrId: qr.qrId, userId: op.userId, scanResult: "SUCCESS" } });
    const r = await createUsage({ ...base(), targetType: "CHECKPOINT", targetId: checkpoint.checkpointId, scanId: String(mine.scanId) });
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/ไม่ตรง/) });
  });

  it("does not resolve another company's QR token (and logs nothing)", async () => {
    await signInAs(DEMO.operator);
    const before = await db.qRScanLog.count();
    const r = await scanQr((await getCurrentUser())!, foreignToken, meta);
    expect(r).toBeNull();
    expect(await db.qRScanLog.count()).toBe(before);
  });
});

describe("operator: delete", () => {
  it("soft-deletes my own recent record and withdraws its carbon result; others' records are not found", async () => {
    await signInAs(DEMO.operator);
    const r = await createUsage(base());
    const u = await db.resourceUsage.findFirstOrThrow({ where: { usageReference: r.ok ? r.data.usageReference : "" } });

    await signInAs("operator2@voltera.example");
    expect(await deleteUsage({ usageId: String(u.usageId) })).toMatchObject({ ok: false, message: "ไม่พบข้อมูล" });

    await signInAs(DEMO.operator);
    expect((await deleteUsage({ usageId: String(u.usageId) })).ok).toBe(true);
    expect((await db.resourceUsage.findUniqueOrThrow({ where: { usageId: u.usageId } })).status).toBe("INACTIVE");
    expect(await db.carbonResult.count({ where: { usageId: u.usageId } })).toBe(0);
    expect(await db.alert.count({ where: { usageId: u.usageId, status: "OPEN" } })).toBe(0);
  });
});
