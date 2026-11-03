"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { action, fail, zCode, zId, zName, zOptText } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];
const optNum = (min: number, max: number, msg: string) =>
  z
    .union([z.literal(""), z.null(), z.coerce.number(msg).min(min, msg).max(max, msg)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v));

export const createFactory = action(
  PA,
  z.object({
    companyId: zId,
    factoryCode: zCode,
    factoryName: zName(200),
    province: zOptText(100),
    postalCode: zOptText(20),
    phone: z.string().trim().max(30).regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง").optional().transform((s) => s || null),
    email: z.union([z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง").max(255), z.literal("")]).optional().transform((s) => s || null),
    latitude: optNum(-90, 90, "ละติจูดต้องอยู่ระหว่าง -90 ถึง 90"),
    longitude: optNum(-180, 180, "ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180"),
    address: zOptText(500),
    googleMapUrl: z.union([z.string().trim().url("URL ไม่ถูกต้อง").max(1000), z.literal("")]).optional().transform((s) => s || null),
  }),
  async (input, user) => {
    const company = await db.company.findUnique({ where: { companyId: input.companyId }, select: { status: true } });
    if (!company) fail("ไม่พบบริษัท");
    if (company!.status !== "ACTIVE") fail("เพิ่มโรงงานได้เฉพาะบริษัทที่ใช้งานอยู่");
    const dup = await db.factory.findFirst({ where: { companyId: input.companyId, factoryCode: input.factoryCode }, select: { factoryId: true } });
    if (dup) fail(`รหัสโรงงาน ${input.factoryCode} มีอยู่แล้วในบริษัทนี้`);
    if ((input.latitude === null) !== (input.longitude === null)) fail("กรุณากรอกละติจูดและลองจิจูดให้ครบทั้งคู่");
    const f = await db.factory.create({ data: { ...input, country: "Thailand", timezone: "Asia/Bangkok" } });
    await audit(user.id, "factory", f.factoryId, "CREATE", undefined, f);
    revalidatePath("/platform/factories");
    revalidatePath(`/platform/companies/${input.companyId}`);
    return { factoryId: f.factoryId };
  },
);

export const setFactoryStatus = action(
  PA,
  z.object({ factoryId: zId, status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]) }),
  async ({ factoryId, status }, user) => {
    const before = await db.factory.findUnique({ where: { factoryId }, select: { status: true, companyId: true } });
    if (!before) fail("ไม่พบข้อมูล");
    await db.factory.update({ where: { factoryId }, data: { status } });
    await audit(user.id, "factory", factoryId, "STATUS", { status: before!.status }, { status });
    revalidatePath("/platform/factories");
    revalidatePath(`/platform/companies/${before!.companyId}`);
  },
);
