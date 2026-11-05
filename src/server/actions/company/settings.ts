"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { deleteStoredFile, saveFile } from "@/server/storage";
import { action, fail, zName, zOptText } from "../_action";
import { ADMIN, zEmail, zPhone, zUrl } from "./_shared";

export const updateCompany = action(
  ADMIN,
  z.object({
    companyName: zName(),
    taxId: zOptText(30).pipe(z.string().regex(/^[0-9-]*$/, "เลขผู้เสียภาษีใช้ได้เฉพาะตัวเลข").nullable()),
    industryType: zOptText(100),
    address: zOptText(500),
    province: zOptText(100),
    postalCode: zOptText(20),
    country: zOptText(100),
    phone: zPhone,
    email: zEmail,
    website: zUrl,
    timezone: zOptText(100).transform((s) => s ?? "Asia/Bangkok"),
    currency: zOptText(10).transform((s) => s?.toUpperCase() ?? "THB"),
    language: z.enum(["th", "en"]).default("th"),
  }),
  async (input, user) => {
    const where = { companyId: user.companyId! };
    const before = await db.company.findUniqueOrThrow({ where });
    await db.company.update({ where, data: input });
    await audit(user.id, "company", where.companyId, "UPDATE", before, input);
    revalidatePath("/company", "layout");
  },
);

export const uploadCompanyLogo = action(ADMIN, z.object({ file: z.instanceof(File, { message: "กรุณาเลือกไฟล์" }) }), async ({ file }, user) => {
  const saved = await saveFile("logos", file, ["image/png", "image/jpeg", "image/webp"], 2 * 1024 * 1024).catch((e: Error) => fail(e.message));
  const where = { companyId: user.companyId! };
  const before = await db.company.findUniqueOrThrow({ where, select: { logoPath: true } });
  await db.company.update({ where, data: { logoPath: saved.key } });
  await deleteStoredFile(before.logoPath);
  await audit(user.id, "company", where.companyId, "UPDATE", before, { logoPath: saved.key });
  revalidatePath("/company/settings");
});
