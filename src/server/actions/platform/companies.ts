"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { hashPassword, passwordProblem } from "@/server/auth/password";
import { action, fail, zCode, zId, zName, zOptText } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];
const zEmail = z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง").max(255);
const zOptEmail = z.union([zEmail, z.literal("")]).optional().transform((s) => s || null);
const zPhone = z.string().trim().max(30).regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง").optional().transform((s) => s || null);
const zPlan = z.enum(["TRIAL", "STANDARD", "ENTERPRISE"], "กรุณาเลือกแพ็กเกจ");
const zStatus = z.enum(["ACTIVE", "PENDING", "SUSPENDED"]);

const profile = {
  companyName: zName(200),
  email: zOptEmail,
  phone: zPhone,
  province: zOptText(100),
  industryType: zOptText(100),
  subscriptionPlan: zPlan,
};

export const createCompany = action(
  PA,
  z.object({
    companyCode: zCode,
    ...profile,
    status: zStatus.default("ACTIVE"),
    adminFirstName: zName(100),
    adminLastName: zName(100),
    adminEmail: zEmail,
    adminPassword: z.string().min(1, "กรุณากำหนดรหัสผ่านชั่วคราว"),
  }),
  async ({ adminFirstName, adminLastName, adminEmail, adminPassword, ...c }, user) => {
    const problem = passwordProblem(adminPassword);
    if (problem) fail(problem);
    const [codeTaken, emailTaken, userTaken, role] = await Promise.all([
      db.company.findUnique({ where: { companyCode: c.companyCode }, select: { companyId: true } }),
      c.email ? db.company.findFirst({ where: { email: c.email }, select: { companyId: true } }) : null,
      db.user.findFirst({ where: { OR: [{ email: adminEmail }, { username: adminEmail }] }, select: { userId: true } }),
      db.role.findUnique({ where: { roleName: "COMPANY_ADMIN" }, select: { roleId: true } }),
    ]);
    if (codeTaken) fail(`รหัสบริษัท ${c.companyCode} ถูกใช้แล้ว`);
    if (emailTaken) fail("อีเมลบริษัทนี้ถูกใช้แล้ว");
    if (userTaken) fail("อีเมลผู้ดูแลบริษัทนี้มีบัญชีอยู่แล้ว");
    if (!role) fail("ไม่พบบทบาท COMPANY_ADMIN ในระบบ");

    const passwordHash = await hashPassword(adminPassword);
    const { company, admin } = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { ...c, country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", language: "th", carbonStandard: "TGO" },
      });
      const admin = await tx.user.create({
        data: {
          companyId: company.companyId,
          roleId: role!.roleId,
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          username: adminEmail,
          passwordHash,
          passwordChangedAt: new Date(),
        },
        select: { userId: true, email: true, firstName: true, lastName: true },
      });
      return { company, admin };
    });
    await audit(user.id, "company", company.companyId, "CREATE", undefined, company);
    await audit(user.id, "user", admin.userId, "CREATE", undefined, { ...admin, role: "COMPANY_ADMIN", companyId: company.companyId });
    revalidatePath("/platform/companies");
    revalidatePath("/platform");
    return { companyId: company.companyId };
  },
);

export const updateCompany = action(
  PA,
  z.object({
    companyId: zId,
    ...profile,
    taxId: zOptText(30),
    address: zOptText(500),
    postalCode: zOptText(20),
    country: zOptText(100),
    website: z.union([z.string().trim().url("URL ไม่ถูกต้อง").max(255), z.literal("")]).optional().transform((s) => s || null),
    carbonStandard: zOptText(100),
    timezone: zOptText(100),
    currency: zOptText(10),
    language: zOptText(10),
  }),
  async ({ companyId, ...data }, user) => {
    const before = await db.company.findUnique({ where: { companyId } });
    if (!before) fail("ไม่พบข้อมูล");
    if (data.email && data.email !== before!.email) {
      const taken = await db.company.findFirst({ where: { email: data.email, NOT: { companyId } }, select: { companyId: true } });
      if (taken) fail("อีเมลบริษัทนี้ถูกใช้แล้ว");
    }
    const after = await db.company.update({ where: { companyId }, data });
    await audit(user.id, "company", companyId, "UPDATE", before, after);
    revalidatePath("/platform/companies");
    revalidatePath(`/platform/companies/${companyId}`);
  },
);

export const setCompanyStatus = action(PA, z.object({ companyId: zId, status: zStatus }), async ({ companyId, status }, user) => {
  const before = await db.company.findUnique({ where: { companyId }, select: { status: true } });
  if (!before) fail("ไม่พบข้อมูล");
  await db.company.update({ where: { companyId }, data: { status } });
  // Users of a non-ACTIVE company are rejected by getCurrentUser on their next request.
  await audit(user.id, "company", companyId, "STATUS", before, { status });
  revalidatePath("/platform/companies");
  revalidatePath(`/platform/companies/${companyId}`);
});

export const deleteCompany = action(PA, z.object({ companyId: zId }), async ({ companyId }, user) => {
  const company = await db.company.findUnique({
    where: { companyId },
    include: { _count: { select: { factories: true, users: true, resourceUsages: true, kpis: true, alerts: true, aiRecommendations: true, reports: true } } },
  });
  if (!company) fail("ไม่พบข้อมูล");
  const tickets = await db.supportTicket.count({ where: { companyId } });
  const c = company!._count;
  const parts = [
    [c.factories, "โรงงาน", "แห่ง"],
    [c.users, "ผู้ใช้งาน", "คน"],
    [c.resourceUsages, "รายการบันทึก", "รายการ"],
    [c.kpis, "KPI", "รายการ"],
    [c.alerts, "การแจ้งเตือน", "รายการ"],
    [c.aiRecommendations, "คำแนะนำ AI", "รายการ"],
    [c.reports, "รายงาน", "ฉบับ"],
    [tickets, "คำร้อง", "รายการ"],
  ].filter(([n]) => (n as number) > 0);
  if (parts.length) fail(`ลบไม่ได้ เพราะยังมี${parts.map(([n, l, u]) => `${l} ${(n as number).toLocaleString("th-TH")} ${u}`).join(", ")} ให้ใช้ "ระงับใช้งาน" แทน`);
  const { _count, ...snapshot } = company!;
  void _count;
  await db.company.delete({ where: { companyId } });
  await audit(user.id, "company", companyId, "DELETE", snapshot);
  revalidatePath("/platform/companies");
});
