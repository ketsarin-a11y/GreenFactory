"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { isDay } from "@/lib/time";
import { SCOPES, findOverlap, type FactorPeriod } from "@/server/domain/emission-factor";
import { MASTER_KINDS, UNIT_TYPES, type MasterKind } from "@/components/platform/master-data/config";
import { action, fail, zId, zName, zOptText } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];

// ---------- Validation ----------

const zMasterCode = z
  .string()
  .trim()
  .min(1, "กรุณากรอกรหัส")
  .max(50, "รหัสยาวเกิน 50 ตัวอักษร")
  .transform((s) => s.toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9_]+$/, "รหัสใช้ได้เฉพาะ A-Z, 0-9 และ _"));
const zDay = z.string().refine(isDay, "วันที่ไม่ถูกต้อง");
const id = zId.optional();
const simple = { id, code: zMasterCode, name: zName(150), description: zOptText(500) };

const saveSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("machine-types"), ...simple }),
  z.object({ kind: z.literal("sensor-types"), ...simple }),
  z.object({ kind: z.literal("resource-categories"), ...simple }),
  z.object({
    kind: z.literal("units"),
    id,
    code: zMasterCode,
    name: zName(100),
    symbol: z.string().trim().min(1, "กรุณากรอกสัญลักษณ์").max(30, "ยาวเกิน 30 ตัวอักษร"),
    unitType: z.enum(UNIT_TYPES, "กรุณาเลือกประเภทหน่วย"),
  }),
  z.object({
    kind: z.literal("resource-types"),
    ...simple,
    categoryId: zId,
    defaultUnitId: zId,
    carbonCalculable: z.boolean().default(false),
  }),
  z.object({
    kind: z.literal("emission-factors"),
    id,
    resourceTypeId: zId,
    scope: z.enum(SCOPES, "กรุณาเลือก Scope"),
    region: z.string().trim().max(100).optional().transform((s) => (s ? s.toUpperCase() : "TH")),
    source: zOptText(255),
    factor: z.coerce.number("กรุณากรอกตัวเลข").min(0, "ค่า Factor ต้องไม่ติดลบ").max(1_000_000, "ค่ามากเกินไป"),
    factorUnit: z.string().trim().min(1, "กรุณากรอกหน่วย").max(100),
    effectiveDate: zDay,
    expiryDate: z.union([zDay, z.literal(""), z.null()]).optional().transform((s) => s || null),
  }),
]);
type SaveInput = z.output<typeof saveSchema>;
type Simple = { code: string; name: string; description: string | null };

// ---------- One adapter per simple table ----------

type Base = {
  table: string;
  get(id: number): Promise<{ code: string; status: string; snapshot: object } | null>;
  setStatus(id: number, status: string): Promise<unknown>;
  remove(id: number): Promise<unknown>;
  refs(id: number): Promise<number>;
};
type Adapter<I> = Base & {
  byCode(code: string): Promise<{ id: number; status: string } | null>;
  create(i: I): Promise<number>;
  update(id: number, i: I, status?: "ACTIVE"): Promise<unknown>;
};

const machineTypes: Adapter<Simple> = {
  table: "machine_type",
  get: (id) => db.machineType.findUnique({ where: { machineTypeId: id } }).then((r) => r && { code: r.machineTypeCode, status: r.status, snapshot: r }),
  byCode: (code) => db.machineType.findUnique({ where: { machineTypeCode: code } }).then((r) => r && { id: r.machineTypeId, status: r.status }),
  create: (i) => db.machineType.create({ data: { machineTypeCode: i.code, machineTypeName: i.name, description: i.description } }).then((r) => r.machineTypeId),
  update: (id, i, status) => db.machineType.update({ where: { machineTypeId: id }, data: { machineTypeName: i.name, description: i.description, ...(status && { status }) } }),
  setStatus: (id, status) => db.machineType.update({ where: { machineTypeId: id }, data: { status } }),
  remove: (id) => db.machineType.delete({ where: { machineTypeId: id } }),
  refs: (id) => db.machine.count({ where: { machineTypeId: id } }),
};

const sensorTypes: Adapter<Simple> = {
  table: "sensor_type",
  get: (id) => db.sensorType.findUnique({ where: { sensorTypeId: id } }).then((r) => r && { code: r.sensorTypeCode, status: r.status, snapshot: r }),
  byCode: (code) => db.sensorType.findUnique({ where: { sensorTypeCode: code } }).then((r) => r && { id: r.sensorTypeId, status: r.status }),
  create: (i) => db.sensorType.create({ data: { sensorTypeCode: i.code, sensorTypeName: i.name, description: i.description } }).then((r) => r.sensorTypeId),
  update: (id, i, status) => db.sensorType.update({ where: { sensorTypeId: id }, data: { sensorTypeName: i.name, description: i.description, ...(status && { status }) } }),
  setStatus: (id, status) => db.sensorType.update({ where: { sensorTypeId: id }, data: { status } }),
  remove: (id) => db.sensorType.delete({ where: { sensorTypeId: id } }),
  refs: (id) => db.sensor.count({ where: { sensorTypeId: id } }),
};

const categories: Adapter<Simple> = {
  table: "resource_category",
  get: (id) => db.resourceCategory.findUnique({ where: { categoryId: id } }).then((r) => r && { code: r.categoryCode, status: r.status, snapshot: r }),
  byCode: (code) => db.resourceCategory.findUnique({ where: { categoryCode: code } }).then((r) => r && { id: r.categoryId, status: r.status }),
  create: (i) => db.resourceCategory.create({ data: { categoryCode: i.code, categoryName: i.name, description: i.description } }).then((r) => r.categoryId),
  update: (id, i, status) => db.resourceCategory.update({ where: { categoryId: id }, data: { categoryName: i.name, description: i.description, ...(status && { status }) } }),
  setStatus: (id, status) => db.resourceCategory.update({ where: { categoryId: id }, data: { status } }),
  remove: (id) => db.resourceCategory.delete({ where: { categoryId: id } }),
  refs: (id) => db.resourceTypeMaster.count({ where: { categoryId: id } }),
};

type UnitIn = { code: string; name: string; symbol: string; unitType: string };
const units: Adapter<UnitIn> = {
  table: "unit",
  get: (id) => db.unit.findUnique({ where: { unitId: id } }).then((r) => r && { code: r.unitCode, status: r.status, snapshot: r }),
  byCode: (code) => db.unit.findUnique({ where: { unitCode: code } }).then((r) => r && { id: r.unitId, status: r.status }),
  create: (i) => db.unit.create({ data: { unitCode: i.code, unitName: i.name, symbol: i.symbol, unitType: i.unitType } }).then((r) => r.unitId),
  update: (id, i, status) => db.unit.update({ where: { unitId: id }, data: { unitName: i.name, symbol: i.symbol, unitType: i.unitType, ...(status && { status }) } }),
  setStatus: (id, status) => db.unit.update({ where: { unitId: id }, data: { status } }),
  remove: (id) => db.unit.delete({ where: { unitId: id } }),
  refs: async (id) => {
    const c = await db.unit.findUnique({ where: { unitId: id }, select: { _count: { select: { resourceTypes: true, resourceUsages: true, sensorData: true, kpis: true } } } });
    return c ? Object.values(c._count).reduce((a, b) => a + b, 0) : 0;
  },
};

type ResourceIn = Simple & { categoryId: number; defaultUnitId: number; carbonCalculable: boolean };
const resourceTypes: Adapter<ResourceIn> = {
  table: "resource_type",
  get: (id) => db.resourceTypeMaster.findUnique({ where: { resourceTypeId: id } }).then((r) => r && { code: r.resourceCode, status: r.status, snapshot: r }),
  byCode: (code) => db.resourceTypeMaster.findUnique({ where: { resourceCode: code } }).then((r) => r && { id: r.resourceTypeId, status: r.status }),
  create: (i) =>
    db.resourceTypeMaster
      .create({ data: { resourceCode: i.code, resourceName: i.name, description: i.description, categoryId: i.categoryId, defaultUnitId: i.defaultUnitId, carbonCalculable: i.carbonCalculable } })
      .then((r) => r.resourceTypeId),
  update: (id, i, status) =>
    db.resourceTypeMaster.update({
      where: { resourceTypeId: id },
      data: { resourceName: i.name, description: i.description, categoryId: i.categoryId, defaultUnitId: i.defaultUnitId, carbonCalculable: i.carbonCalculable, ...(status && { status }) },
    }),
  setStatus: (id, status) => db.resourceTypeMaster.update({ where: { resourceTypeId: id }, data: { status } }),
  remove: (id) => db.resourceTypeMaster.delete({ where: { resourceTypeId: id } }),
  refs: async (id) => {
    const c = await db.resourceTypeMaster.findUnique({ where: { resourceTypeId: id }, select: { _count: { select: { emissionFactors: true, resourceUsages: true, kpis: true } } } });
    return c ? Object.values(c._count).reduce((a, b) => a + b, 0) : 0;
  },
};

const emissionFactors: Base = {
  table: "emission_factor",
  get: (id) => db.emissionFactor.findUnique({ where: { factorId: id } }).then((r) => r && { code: String(r.factorId), status: r.status, snapshot: r }),
  setStatus: (id, status) => db.emissionFactor.update({ where: { factorId: id }, data: { status } }),
  remove: (id) => db.emissionFactor.delete({ where: { factorId: id } }),
  refs: (id) => db.carbonResult.count({ where: { factorId: id } }),
};

const BASE: Record<MasterKind, Base> = {
  "machine-types": machineTypes,
  "sensor-types": sensorTypes,
  "resource-categories": categories,
  units,
  "resource-types": resourceTypes,
  "emission-factors": emissionFactors,
};

// ---------- Rules ----------

/** Create, or update; creating an INACTIVE code again reactivates that row instead of failing. */
async function saveSimple<I extends { code: string }>(ad: Adapter<I>, input: I & { id?: number }, userId: number) {
  const { id, ...rest } = input;
  const data = rest as unknown as I;
  if (id) {
    const before = await ad.get(id);
    if (!before) fail("ไม่พบข้อมูล");
    await ad.update(id, { ...data, code: before!.code });
    await audit(userId, ad.table, id, "UPDATE", before!.snapshot, data);
    return { id, reactivated: false };
  }
  const existing = await ad.byCode(data.code);
  if (existing?.status === "ACTIVE") fail(`รหัส ${data.code} มีอยู่ในระบบแล้ว`);
  if (existing) {
    const before = await ad.get(existing.id);
    await ad.update(existing.id, data, "ACTIVE");
    await audit(userId, ad.table, existing.id, "UPDATE", before?.snapshot, { ...data, status: "ACTIVE", reactivated: true });
    return { id: existing.id, reactivated: true };
  }
  const newId = await ad.create(data);
  await audit(userId, ad.table, newId, "CREATE", undefined, data);
  return { id: newId, reactivated: false };
}

async function checkUnitUnique(i: UnitIn, id?: number) {
  const clash = await db.unit.findFirst({ where: { symbol: i.symbol, unitType: i.unitType, ...(id ? { NOT: { unitId: id } } : {}) }, select: { unitCode: true } });
  if (clash) fail(`สัญลักษณ์ ${i.symbol} ประเภท ${i.unitType} ใช้แล้วในหน่วย ${clash.unitCode}`);
}

async function checkResourceRefs(i: ResourceIn) {
  const [cat, unit] = await Promise.all([
    db.resourceCategory.findFirst({ where: { categoryId: i.categoryId, status: "ACTIVE" } }),
    db.unit.findFirst({ where: { unitId: i.defaultUnitId, status: "ACTIVE" } }),
  ]);
  if (!cat) fail("หมวดหมู่ที่เลือกไม่มีอยู่หรือปิดใช้งานแล้ว");
  if (!unit) fail("หน่วยที่เลือกไม่มีอยู่หรือปิดใช้งานแล้ว");
}

const toDate = (day: string) => new Date(`${day}T00:00:00Z`); // DATE column: store the calendar day as UTC midnight
const dayOf = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

async function assertNoOverlap(candidate: FactorPeriod) {
  const existing = await db.emissionFactor.findMany({
    where: { resourceTypeId: candidate.resourceTypeId, status: "ACTIVE" },
    select: { factorId: true, resourceTypeId: true, scope: true, region: true, effectiveDate: true, expiryDate: true, status: true },
  });
  const clash = findOverlap(
    candidate,
    existing.map((e) => ({ ...e, id: e.factorId, effectiveDate: dayOf(e.effectiveDate)!, expiryDate: dayOf(e.expiryDate) })),
  );
  if (clash)
    fail(`ช่วงเวลาซ้อนกับ Factor เดิม (${clash.effectiveDate} ถึง ${clash.expiryDate ?? "ปัจจุบัน"}) กรุณากำหนดวันสิ้นสุดของ Factor เดิมก่อน`);
}

async function saveFactor(input: Extract<SaveInput, { kind: "emission-factors" }>, userId: number) {
  const { id, resourceTypeId, scope, region, source, factor, factorUnit, effectiveDate, expiryDate } = input;
  const f = { resourceTypeId, scope, region, source, factor, factorUnit, effectiveDate, expiryDate };
  if (f.expiryDate && f.expiryDate < f.effectiveDate) fail("วันสิ้นสุดต้องไม่ก่อนวันที่เริ่มใช้");
  const before = id ? await db.emissionFactor.findUnique({ where: { factorId: id } }) : null;
  if (id && !before) fail("ไม่พบข้อมูล");
  if (!before || before.resourceTypeId !== f.resourceTypeId) {
    const rt = await db.resourceTypeMaster.findUnique({ where: { resourceTypeId: f.resourceTypeId }, select: { status: true, carbonCalculable: true } });
    if (!rt || rt.status !== "ACTIVE" || !rt.carbonCalculable) fail("ทรัพยากรนี้ปิดใช้งานหรือไม่ได้ตั้งค่าให้คำนวณคาร์บอน");
  }
  const status = before?.status ?? "ACTIVE";
  await assertNoOverlap({ id, resourceTypeId: f.resourceTypeId, scope: f.scope, region: f.region, effectiveDate: f.effectiveDate, expiryDate: f.expiryDate, status });
  const data = { ...f, effectiveDate: toDate(f.effectiveDate), expiryDate: f.expiryDate ? toDate(f.expiryDate) : null };
  if (before) {
    await db.emissionFactor.update({ where: { factorId: before.factorId }, data });
    await audit(userId, "emission_factor", before.factorId, "UPDATE", before, f);
    return { id: before.factorId, reactivated: false };
  }
  const created = await db.emissionFactor.create({ data });
  await audit(userId, "emission_factor", created.factorId, "CREATE", undefined, f);
  return { id: created.factorId, reactivated: false };
}

// ---------- Actions ----------

export const saveMasterItem = action(PA, saveSchema, async (input, user) => {
  let result: { id: number; reactivated: boolean };
  switch (input.kind) {
    case "machine-types":
      result = await saveSimple(machineTypes, input, user.id);
      break;
    case "sensor-types":
      result = await saveSimple(sensorTypes, input, user.id);
      break;
    case "resource-categories":
      result = await saveSimple(categories, input, user.id);
      break;
    case "units":
      await checkUnitUnique(input, input.id ?? (await units.byCode(input.code))?.id);
      result = await saveSimple(units, input, user.id);
      break;
    case "resource-types":
      await checkResourceRefs(input);
      result = await saveSimple(resourceTypes, input, user.id);
      break;
    case "emission-factors":
      result = await saveFactor(input, user.id);
      break;
  }
  revalidatePath(`/platform/master-data/${input.kind}`);
  return result;
});

const kindId = { kind: z.enum(MASTER_KINDS), id: zId };

export const setMasterStatus = action(PA, z.object({ ...kindId, status: z.enum(["ACTIVE", "INACTIVE"]) }), async ({ kind, id, status }, user) => {
  const ad = BASE[kind];
  const before = await ad.get(id);
  if (!before) fail("ไม่พบข้อมูล");
  if (kind === "emission-factors" && status === "ACTIVE") {
    const f = await db.emissionFactor.findUniqueOrThrow({ where: { factorId: id } });
    await assertNoOverlap({ id, resourceTypeId: f.resourceTypeId, scope: f.scope, region: f.region, effectiveDate: dayOf(f.effectiveDate)!, expiryDate: dayOf(f.expiryDate), status });
  }
  await ad.setStatus(id, status);
  await audit(user.id, ad.table, id, "STATUS", { status: before!.status }, { status });
  revalidatePath(`/platform/master-data/${kind}`);
});

export const deleteMasterItem = action(PA, z.object(kindId), async ({ kind, id }, user) => {
  const ad = BASE[kind];
  const before = await ad.get(id);
  if (!before) fail("ไม่พบข้อมูล");
  const refs = await ad.refs(id);
  if (refs > 0) fail(`ลบไม่ได้ เพราะมีข้อมูลอ้างอิงอยู่ ${refs.toLocaleString("th-TH")} รายการ ให้ใช้ "ปิดใช้งาน" แทน`);
  await ad.remove(id);
  await audit(user.id, ad.table, id, "DELETE", before!.snapshot);
  revalidatePath(`/platform/master-data/${kind}`);
});
