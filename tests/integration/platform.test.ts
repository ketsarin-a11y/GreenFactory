import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { verifyPassword } from "@/server/auth/password";
import { createCompany, deleteCompany } from "@/server/actions/platform/companies";
import { resetUserPassword, setUserStatus } from "@/server/actions/platform/users";
import { updateSystemSettings } from "@/server/actions/platform/settings";
import { deleteMasterItem, saveMasterItem, setMasterStatus } from "@/server/actions/platform/master-data";
import { saveRolePermissions } from "@/server/actions/platform/roles";
import { updateFactory } from "@/server/actions/platform/factories";
import { DEMO, signInAs, signOut } from "./helpers";

afterEach(signOut);

const validSettings = {
  maintenanceMode: false,
  forceMfa: false,
  ipProtection: true,
  anomalyDetection: true,
  autoBlock: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  auditRetentionDays: 365,
  loginRetentionDays: 180,
  backupFrequency: "DAILY",
  carbonAnalyticsEnabled: true,
  sensorMonitoringEnabled: true,
  aiRecommendationsEnabled: false,
  machineQrEnabled: true,
  reportBuilderEnabled: false,
};

const newCompany = (code: string) => ({
  companyCode: code,
  companyName: `บริษัททดสอบ ${code}`,
  subscriptionPlan: "TRIAL",
  adminFirstName: "สมชาย",
  adminLastName: "ทดสอบ",
  adminEmail: `admin@${code.toLowerCase()}.example`,
  adminPassword: "Temp1234x",
});

describe("platform actions are platform-admin only", () => {
  it("refuses a COMPANY_ADMIN on every platform action and changes nothing", async () => {
    const ca = await signInAs(DEMO.companyAdmin);
    const before = await db.company.count();
    const results = await Promise.all([
      createCompany(newCompany("HACKCO")),
      setUserStatus({ userId: ca.userId + 1, status: "LOCKED" }),
      resetUserPassword({ userId: ca.userId, password: "Hacked1234" }),
      updateSystemSettings({ ...validSettings, maintenanceMode: true }),
      saveMasterItem({ kind: "machine-types", code: "HACK_TYPE", name: "x" }),
      saveRolePermissions({ changes: [{ roleId: 1, permissionId: 1, level: "FULL" }] }),
    ]);
    for (const r of results) expect(r).toMatchObject({ ok: false, message: "คุณไม่มีสิทธิ์ทำรายการนี้" });
    expect(await db.company.count()).toBe(before);
    expect(await db.machineType.findUnique({ where: { machineTypeCode: "HACK_TYPE" } })).toBeNull();
    expect((await db.systemSetting.findFirstOrThrow()).maintenanceMode).toBe(false);
  });

  it("refuses anonymous callers", async () => {
    expect(await createCompany(newCompany("ANONCO"))).toMatchObject({ ok: false });
  });
});

describe("companies", () => {
  it("creates the company and its first COMPANY_ADMIN in one go", async () => {
    const admin = await signInAs(DEMO.platform);
    const r = await createCompany(newCompany("NEWCO"));
    expect(r.ok).toBe(true);
    const c = await db.company.findUniqueOrThrow({ where: { companyCode: "NEWCO" }, include: { users: { include: { role: true } } } });
    expect(c).toMatchObject({ status: "ACTIVE", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", carbonStandard: "TGO" });
    expect(c.users).toHaveLength(1);
    expect(c.users[0]).toMatchObject({ email: "admin@newco.example", status: "ACTIVE", role: { roleName: "COMPANY_ADMIN" } });
    expect(await verifyPassword("Temp1234x", c.users[0].passwordHash)).toBe(true);
    expect(await db.auditLog.count({ where: { userId: admin.userId, tableName: "company", recordId: c.companyId, action: "CREATE" } })).toBe(1);
    expect(await db.auditLog.count({ where: { userId: admin.userId, tableName: "user", recordId: c.users[0].userId, action: "CREATE" } })).toBe(1);
  });

  it("rolls back the company when the admin cannot be created", async () => {
    await signInAs(DEMO.platform);
    const r = await createCompany({ ...newCompany("DUPADMIN"), adminEmail: DEMO.manager });
    expect(r.ok).toBe(false);
    expect(await db.company.findUnique({ where: { companyCode: "DUPADMIN" } })).toBeNull();
  });

  it("rejects a weak temporary password", async () => {
    await signInAs(DEMO.platform);
    expect(await createCompany({ ...newCompany("WEAKPW"), adminPassword: "short" })).toMatchObject({ ok: false });
  });

  it("refuses to delete a company that still has data, with counts", async () => {
    await signInAs(DEMO.platform);
    const voltera = await db.company.findUniqueOrThrow({ where: { companyCode: "VOLTERA" } });
    const r = await deleteCompany({ companyId: voltera.companyId });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/โรงงาน \d+ แห่ง/);
  });
});

describe("users", () => {
  it("suspending a user bumps sessionVersion and kills their existing session", async () => {
    const op = await db.user.findUniqueOrThrow({ where: { email: DEMO.operator } });
    await signInAs(DEMO.operator); // the operator's cookie, minted with the old version
    const { testCookies } = await import("./setup");
    const opCookie = new Map(testCookies);

    await signInAs(DEMO.platform);
    expect(await setUserStatus({ userId: op.userId, status: "LOCKED" })).toMatchObject({ ok: true });
    const after = await db.user.findUniqueOrThrow({ where: { userId: op.userId } });
    expect(after).toMatchObject({ status: "LOCKED", sessionVersion: op.sessionVersion + 1 });

    testCookies.clear();
    for (const [k, v] of opCookie) testCookies.set(k, v);
    expect(await getCurrentUser()).toBeNull();

    await signInAs(DEMO.platform);
    expect(await setUserStatus({ userId: op.userId, status: "ACTIVE" })).toMatchObject({ ok: true });
  });

  it("cannot suspend yourself", async () => {
    const me = await signInAs(DEMO.platform);
    expect(await setUserStatus({ userId: me.userId, status: "LOCKED" })).toMatchObject({ ok: false });
  });

  it("password reset sets a new hash and bumps sessionVersion", async () => {
    await signInAs(DEMO.platform);
    const m = await db.user.findUniqueOrThrow({ where: { email: DEMO.manager } });
    expect(await resetUserPassword({ userId: m.userId, password: "NewTemp9876" })).toMatchObject({ ok: true });
    const after = await db.user.findUniqueOrThrow({ where: { userId: m.userId } });
    expect(after.sessionVersion).toBe(m.sessionVersion + 1);
    expect(await verifyPassword("NewTemp9876", after.passwordHash)).toBe(true);
  });
});

describe("system settings", () => {
  it("rejects unknown keys (no mass assignment)", async () => {
    await signInAs(DEMO.platform);
    const r = await updateSystemSettings({ ...validSettings, updatedBy: 999, systemSettingId: 5 });
    expect(r.ok).toBe(false);
    const row = await db.systemSetting.findFirstOrThrow();
    expect(row.updatedBy).not.toBe(999);
  });

  it("validates ranges and saves a whitelisted change with an audit row", async () => {
    const me = await signInAs(DEMO.platform);
    expect(await updateSystemSettings({ ...validSettings, maxLoginAttempts: 1 })).toMatchObject({ ok: false, fieldErrors: { maxLoginAttempts: expect.any(String) } });
    expect(await updateSystemSettings({ ...validSettings, maxLoginAttempts: 7 })).toMatchObject({ ok: true, data: { changed: 1 } });
    const row = await db.systemSetting.findFirstOrThrow();
    expect(row).toMatchObject({ maxLoginAttempts: 7, updatedBy: me.userId });
    const a = await db.auditLog.findFirstOrThrow({ where: { tableName: "system_setting" }, orderBy: { createdAt: "desc" } });
    expect(a.oldData).toEqual({ maxLoginAttempts: 5 });
    expect(a.newData).toEqual({ maxLoginAttempts: 7 });
  });
});

describe("master data", () => {
  it("reactivates an INACTIVE code instead of failing, and blocks a duplicate ACTIVE code", async () => {
    await signInAs(DEMO.platform);
    const created = await saveMasterItem({ kind: "sensor-types", code: "test_probe", name: "หัววัดทดสอบ" });
    expect(created).toMatchObject({ ok: true, data: { reactivated: false } });
    const id = created.ok ? created.data.id : 0;
    expect(await db.sensorType.findUniqueOrThrow({ where: { sensorTypeId: id } })).toMatchObject({ sensorTypeCode: "TEST_PROBE" });

    expect(await saveMasterItem({ kind: "sensor-types", code: "TEST_PROBE", name: "ซ้ำ" })).toMatchObject({ ok: false });
    await setMasterStatus({ kind: "sensor-types", id, status: "INACTIVE" });
    expect(await saveMasterItem({ kind: "sensor-types", code: "TEST_PROBE", name: "ชื่อใหม่" })).toMatchObject({ ok: true, data: { id, reactivated: true } });
    expect(await db.sensorType.findUniqueOrThrow({ where: { sensorTypeId: id } })).toMatchObject({ status: "ACTIVE", sensorTypeName: "ชื่อใหม่" });

    expect(await deleteMasterItem({ kind: "sensor-types", id })).toMatchObject({ ok: true });
  });

  it("rejects bad codes and blocks deleting a referenced row", async () => {
    await signInAs(DEMO.platform);
    expect(await saveMasterItem({ kind: "machine-types", code: "BAD-CODE", name: "x" })).toMatchObject({ ok: false, fieldErrors: { code: expect.any(String) } });
    const used = await db.machineType.findFirstOrThrow({ where: { machines: { some: {} } } });
    const r = await deleteMasterItem({ kind: "machine-types", id: used.machineTypeId });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/ปิดใช้งาน/);
  });

  it("rejects an overlapping ACTIVE emission factor on create and on edit", async () => {
    await signInAs(DEMO.platform);
    const elec = await db.resourceTypeMaster.findUniqueOrThrow({ where: { resourceCode: "ELECTRICITY" } });
    const base = { kind: "emission-factors" as const, resourceTypeId: elec.resourceTypeId, scope: "SCOPE 2" as const, region: "TH", factor: 0.45, factorUnit: "kgCO2e/kWh" };
    // Seed has an open-ended 2024-01-01 factor for ELECTRICITY / SCOPE 2 / TH.
    const clash = await saveMasterItem({ ...base, effectiveDate: "2026-01-01" });
    expect(clash.ok).toBe(false);
    if (!clash.ok) expect(clash.message).toMatch(/วันสิ้นสุดของ Factor เดิม/);

    // Another region is fine; then moving it onto TH by edit must be refused too.
    const other = await saveMasterItem({ ...base, region: "LA", effectiveDate: "2026-01-01" });
    expect(other.ok).toBe(true);
    const id = other.ok ? other.data.id : 0;
    expect(await saveMasterItem({ ...base, id, region: "TH", effectiveDate: "2026-01-01" })).toMatchObject({ ok: false });
    expect(await saveMasterItem({ ...base, id, region: "LA", effectiveDate: "2026-01-01", expiryDate: "2025-12-31" })).toMatchObject({ ok: false });
    expect(await deleteMasterItem({ kind: "emission-factors", id })).toMatchObject({ ok: true });
  });
});

describe("factory edit", () => {
  let n = 0;
  const editable = async () => {
    const company = await db.company.findUniqueOrThrow({ where: { companyCode: "VOLTERA" } });
    return db.factory.create({ data: { companyId: company.companyId, factoryCode: `EDT${++n}`, factoryName: "โรงงานก่อนแก้ไข", timezone: "Asia/Bangkok" } });
  };
  const valid = (factoryId: number) => ({
    factoryId,
    factoryName: "โรงงานหลังแก้ไข",
    address: "99 ถ.สุขุมวิท",
    province: "ชลบุรี",
    postalCode: "20000",
    phone: "038-123-456",
    email: "Plant@Voltera.example",
    latitude: "13.3611",
    longitude: "100.9847",
    googleMapUrl: "https://maps.google.com/?q=13.3611,100.9847",
    timezone: "Asia/Bangkok",
  });

  it("saves every editable field and writes an UPDATE audit with before/after", async () => {
    const admin = await signInAs(DEMO.platform);
    const f = await editable();
    expect(await updateFactory(valid(f.factoryId))).toMatchObject({ ok: true });
    const after = await db.factory.findUniqueOrThrow({ where: { factoryId: f.factoryId } });
    expect(after).toMatchObject({ factoryName: "โรงงานหลังแก้ไข", province: "ชลบุรี", postalCode: "20000", phone: "038-123-456", email: "plant@voltera.example", timezone: "Asia/Bangkok", factoryCode: f.factoryCode });
    expect(Number(after.latitude)).toBeCloseTo(13.3611, 4);
    expect(Number(after.longitude)).toBeCloseTo(100.9847, 4);
    const log = await db.auditLog.findFirstOrThrow({ where: { userId: admin.userId, tableName: "factory", recordId: f.factoryId, action: "UPDATE" } });
    expect(log.oldData).toMatchObject({ factoryName: "โรงงานก่อนแก้ไข" });
    expect(log.newData).toMatchObject({ factoryName: "โรงงานหลังแก้ไข", province: "ชลบุรี" });
  });

  it("clears optional fields when left blank", async () => {
    await signInAs(DEMO.platform);
    const f = await editable();
    await updateFactory(valid(f.factoryId));
    const r = await updateFactory({ factoryId: f.factoryId, factoryName: "โรงงานว่าง", address: "", province: "", postalCode: "", phone: "", email: "", latitude: "", longitude: "", googleMapUrl: "", timezone: "" });
    expect(r).toMatchObject({ ok: true });
    expect(await db.factory.findUniqueOrThrow({ where: { factoryId: f.factoryId } })).toMatchObject({ province: null, postalCode: null, email: null, latitude: null, longitude: null, googleMapUrl: null, timezone: "Asia/Bangkok" });
  });

  it("validates each field and changes nothing on error", async () => {
    await signInAs(DEMO.platform);
    const f = await editable();
    const bad: [string, unknown][] = [
      ["factoryName", ""],
      ["postalCode", "2000"],
      ["phone", "call me"],
      ["email", "not-an-email"],
      ["latitude", "91"],
      ["longitude", "-181"],
      ["googleMapUrl", "javascript:alert(1)"],
      ["timezone", "Mars/Olympus"],
    ];
    for (const [field, value] of bad) {
      const r = await updateFactory({ ...valid(f.factoryId), [field]: value });
      expect(r, field).toMatchObject({ ok: false, fieldErrors: { [field]: expect.any(String) } });
    }
    expect(await updateFactory({ ...valid(f.factoryId), longitude: "" })).toMatchObject({ ok: false, message: "กรุณากรอกละติจูดและลองจิจูดให้ครบทั้งคู่" });
    expect(await updateFactory({ ...valid(999_999) })).toMatchObject({ ok: false, message: "ไม่พบข้อมูล" });
    expect((await db.factory.findUniqueOrThrow({ where: { factoryId: f.factoryId } })).factoryName).toBe("โรงงานก่อนแก้ไข");
    expect(await db.auditLog.count({ where: { tableName: "factory", recordId: f.factoryId, action: "UPDATE" } })).toBe(0);
  });

  it("refuses non-platform users", async () => {
    const f = await editable();
    for (const who of [DEMO.companyAdmin, DEMO.manager]) {
      await signInAs(who);
      expect(await updateFactory(valid(f.factoryId))).toMatchObject({ ok: false, message: "คุณไม่มีสิทธิ์ทำรายการนี้" });
    }
    signOut();
    expect(await updateFactory(valid(f.factoryId))).toMatchObject({ ok: false });
    expect((await db.factory.findUniqueOrThrow({ where: { factoryId: f.factoryId } })).factoryName).toBe("โรงงานก่อนแก้ไข");
  });
});
