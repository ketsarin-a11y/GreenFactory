"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { ROLES, type Role } from "@/server/auth/roles";
import { hashPassword, passwordProblem } from "@/server/auth/password";
import { userLoginLogs } from "@/server/queries/platform/logs";
import { action, fail, zId, zName } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];
const optId = z
  .union([zId, z.literal(""), z.null()])
  .optional()
  .transform((v) => (typeof v === "number" ? v : null));

const profile = {
  firstName: zName(100),
  lastName: zName(100),
  username: z.string().trim().min(3, "ชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร").max(100).regex(/^[A-Za-z0-9._@-]+$/, "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, 0-9 . _ - @"),
  email: z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง").max(255),
  phone: z.string().trim().max(30).regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง").optional().transform((s) => s || null),
  employeeCode: z.string().trim().max(50).optional().transform((s) => s || null),
  role: z.enum(ROLES, "กรุณาเลือกบทบาท"),
  companyId: optId,
  factoryId: optId,
  departmentId: optId,
};

/**
 * Tenant placement rules: platform admins have no company; everyone else needs one;
 * managers/operators need a factory (their data scope); factory and department must
 * belong to the chosen company/factory.
 */
async function placement(i: { role: Role; companyId: number | null; factoryId: number | null; departmentId: number | null }) {
  if (i.role === "PLATFORM_ADMIN") return { companyId: null, factoryId: null, departmentId: null };
  if (!i.companyId) fail("กรุณาเลือกบริษัท");
  const company = await db.company.findUnique({ where: { companyId: i.companyId! }, select: { companyId: true } });
  if (!company) fail("ไม่พบบริษัท");
  if ((i.role === "MANAGER" || i.role === "OPERATOR") && !i.factoryId) fail("ผู้จัดการและผู้ปฏิบัติงานต้องระบุโรงงาน");
  if (i.factoryId) {
    const f = await db.factory.findFirst({ where: { factoryId: i.factoryId, companyId: i.companyId! }, select: { factoryId: true } });
    if (!f) fail("โรงงานที่เลือกไม่ได้อยู่ในบริษัทนี้");
  }
  if (i.departmentId) {
    if (!i.factoryId) fail("กรุณาเลือกโรงงานก่อนเลือกแผนก");
    const d = await db.department.findFirst({ where: { departmentId: i.departmentId, building: { factoryId: i.factoryId! } }, select: { departmentId: true } });
    if (!d) fail("แผนกที่เลือกไม่ได้อยู่ในโรงงานนี้");
  }
  return { companyId: i.companyId, factoryId: i.factoryId, departmentId: i.departmentId };
}

async function assertUnique(email: string, username: string, exceptId?: number) {
  const clash = await db.user.findFirst({
    where: { OR: [{ email }, { username }], ...(exceptId ? { NOT: { userId: exceptId } } : {}) },
    select: { email: true },
  });
  if (clash) fail(clash.email === email ? "อีเมลนี้มีบัญชีอยู่แล้ว" : "ชื่อผู้ใช้นี้ถูกใช้แล้ว");
}

const roleId = async (role: Role) => {
  const r = await db.role.findUnique({ where: { roleName: role }, select: { roleId: true } });
  if (!r) fail("ไม่พบบทบาทในระบบ");
  return r!.roleId;
};

const safe = { userId: true, firstName: true, lastName: true, email: true, username: true, phone: true, employeeCode: true, roleId: true, companyId: true, factoryId: true, departmentId: true, status: true } as const;

export const createUser = action(
  PA,
  z.object({ ...profile, status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"), password: z.string(), confirm: z.string() }),
  async ({ password, confirm, role, ...i }, user) => {
    if (password !== confirm) fail("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    const problem = passwordProblem(password);
    if (problem) fail(problem);
    await assertUnique(i.email, i.username);
    const where = await placement({ ...i, role });
    const created = await db.user.create({
      data: { ...i, ...where, roleId: await roleId(role), passwordHash: await hashPassword(password), passwordChangedAt: new Date() },
      select: safe,
    });
    await audit(user.id, "user", created.userId, "CREATE", undefined, { ...created, role });
    revalidatePath("/platform/users");
    return { userId: created.userId };
  },
);

export const updateUser = action(PA, z.object({ userId: zId, ...profile }), async ({ userId, role, ...i }, user) => {
  const before = await db.user.findUnique({ where: { userId }, select: { ...safe, role: { select: { roleName: true } } } });
  if (!before) fail("ไม่พบข้อมูล");
  if (userId === user.id && role !== "PLATFORM_ADMIN") fail("ไม่สามารถเปลี่ยนบทบาทของบัญชีตัวเองได้");
  await assertUnique(i.email, i.username, userId);
  const where = await placement({ ...i, role });
  const after = await db.user.update({ where: { userId }, data: { ...i, ...where, roleId: await roleId(role) }, select: safe });
  await audit(user.id, "user", userId, "UPDATE", { ...before, role: before!.role.roleName }, { ...after, role });
  revalidatePath("/platform/users");
});

export const setUserStatus = action(PA, z.object({ userId: zId, status: z.enum(["ACTIVE", "LOCKED"]) }), async ({ userId, status }, user) => {
  if (userId === user.id) fail("ไม่สามารถระงับหรือเปลี่ยนสถานะบัญชีของตัวเองได้");
  const before = await db.user.findUnique({ where: { userId }, select: { status: true } });
  if (!before) fail("ไม่พบข้อมูล");
  await db.user.update({
    where: { userId },
    data:
      status === "LOCKED"
        ? { status, sessionVersion: { increment: 1 } } // signs the user out everywhere
        : { status, failedLogin: 0, lockedUntil: null },
  });
  await audit(user.id, "user", userId, "STATUS", { status: before!.status }, { status });
  revalidatePath("/platform/users");
});

export const resetUserPassword = action(PA, z.object({ userId: zId, password: z.string() }), async ({ userId, password }, user) => {
  if (userId === user.id) fail("เปลี่ยนรหัสผ่านของตัวเองได้ที่หน้าโปรไฟล์");
  const problem = passwordProblem(password);
  if (problem) fail(problem);
  const target = await db.user.findUnique({ where: { userId }, select: { userId: true } });
  if (!target) fail("ไม่พบข้อมูล");
  await db.user.update({
    where: { userId },
    data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), failedLogin: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
  });
  await audit(user.id, "user", userId, "UPDATE", undefined, { passwordReset: true });
});

/** Read-only, but through action() so the role check is the same as every write. */
export const getUserLoginHistory = action(PA, z.object({ userId: zId }), async ({ userId }) => userLoginLogs(userId, 20));
