"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { factoryWhere } from "@/server/scope";
import { action, fail, zCode, zName, zOptText, zStatus } from "../_action";
import { ADMIN, unique, zEmail, zOptId, zOptRange, zPhone, zUrl } from "./_shared";

const factorySchema = z.object({
  id: zOptId,
  factoryCode: zCode,
  factoryName: zName(),
  address: zOptText(500),
  province: zOptText(100),
  postalCode: zOptText(20),
  country: zOptText(100).transform((s) => s ?? "Thailand"),
  latitude: zOptRange(-90, 90, "ละติจูดต้องอยู่ระหว่าง -90 ถึง 90"),
  longitude: zOptRange(-180, 180, "ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180"),
  googleMapUrl: zUrl,
  phone: zPhone,
  email: zEmail,
  timezone: zOptText(100).transform((s) => s ?? "Asia/Bangkok"),
});

export const saveFactory = action(ADMIN, factorySchema, async ({ id, ...input }, user) => {
  const dup = "รหัสโรงงานนี้มีอยู่ในบริษัทแล้ว";
  if (id) {
    const before = await db.factory.findFirst({ where: { factoryId: id, ...factoryWhere(user) } });
    if (!before) return fail("ไม่พบข้อมูล");
    await unique(db.factory.update({ where: { factoryId: id }, data: input }), dup);
    await audit(user.id, "factory", id, "UPDATE", before, input);
  } else {
    const f = await unique(db.factory.create({ data: { ...input, companyId: user.companyId!, mapZoom: 16 } }), dup);
    await audit(user.id, "factory", f.factoryId, "CREATE", undefined, input);
  }
  revalidatePath("/company", "layout");
});

export const setFactoryStatus = action(ADMIN, z.object({ id: z.coerce.number().int().positive(), status: zStatus }), async ({ id, status }, user) => {
  const before = await db.factory.findFirst({ where: { factoryId: id, ...factoryWhere(user) }, select: { status: true } });
  if (!before) return fail("ไม่พบข้อมูล");
  await db.factory.update({ where: { factoryId: id }, data: { status } });
  await audit(user.id, "factory", id, "STATUS", before, { status });
  revalidatePath("/company", "layout");
});
