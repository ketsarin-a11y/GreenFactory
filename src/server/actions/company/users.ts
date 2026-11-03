"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { companyUserWhere, factoryWhere } from "@/server/scope";
import { hashPassword, passwordProblem } from "@/server/auth/password";
import type { CurrentUser } from "@/server/auth/current-user";
import { action, fail, zCode, zId } from "../_action";
import { ADMIN, unique, zOptId, zPhone } from "./_shared";

const done = () => revalidatePath("/company", "layout");
const zPerson = (label: string) => z.string().trim().min(1, `กรุณากรอก${label}`).max(100, `${label}ยาวเกิน 100 ตัวอักษร`);

const assignment = {
  role: z.enum(["MANAGER", "OPERATOR"], "กรุณาเลือกบทบาท"),
  factoryId: zId,
  departmentId: zOptId,
  employeeCode: zCode,
  firstName: zPerson("ชื่อ"),
  lastName: zPerson("นามสกุล"),
  phone: zPhone,
};

/** Factory must be an ACTIVE factory of the company; OPERATOR needs a department inside it. */
async function checkAssignment(user: CurrentUser, a: { role: string; factoryId: number; departmentId?: number }) {
  if (!(await db.factory.findFirst({ where: { factoryId: a.factoryId, status: "ACTIVE", ...factoryWhere(user) } })))
    return fail("ไม่พบโรงงานที่เลือก หรือโรงงานถูกปิดใช้งาน");
  if (a.role === "OPERATOR" && !a.departmentId) return fail("ผู้ปฏิบัติงานต้องระบุแผนก");
  if (a.departmentId && !(await db.department.findFirst({ where: { departmentId: a.departmentId, status: "ACTIVE", building: { factoryId: a.factoryId } } })))
    return fail("แผนกที่เลือกไม่อยู่ในโรงงานนี้");
  const role = await db.role.findUnique({ where: { roleName: a.role } });
  return role ?? fail("ไม่พบบทบาทในระบบ");
}

async function employeeCodeTaken(user: CurrentUser, employeeCode: string, exceptId?: number) {
  const hit = await db.user.findFirst({ where: { employeeCode, ...companyUserWhere(user), ...(exceptId ? { NOT: { userId: exceptId } } : {}) } });
  return hit !== null;
}

async function freeUsername(email: string) {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 90) || "user";
  for (let i = 0; ; i++) {
    const name = i === 0 ? base : `${base}${i}`;
    if (!(await db.user.findUnique({ where: { username: name }, select: { userId: true } }))) return name;
  }
}

export const createUser = action(
  ADMIN,
  z.object({ ...assignment, email: z.string().trim().toLowerCase().max(255).pipe(z.email("อีเมลไม่ถูกต้อง")), password: z.string() }),
  async ({ password, ...input }, user) => {
    const problem = passwordProblem(password);
    if (problem) return fail(problem);
    const role = await checkAssignment(user, input);
    if (await employeeCodeTaken(user, input.employeeCode)) return fail("รหัสพนักงานนี้มีอยู่ในบริษัทแล้ว");
    if (await db.user.findUnique({ where: { email: input.email } })) return fail("อีเมลนี้ถูกใช้งานแล้ว");
    const data = {
      companyId: user.companyId,
      factoryId: input.factoryId,
      departmentId: input.departmentId ?? null,
      roleId: role.roleId,
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      username: await freeUsername(input.email),
      passwordHash: await hashPassword(password),
      passwordChangedAt: new Date(),
    };
    const created = await unique(db.user.create({ data }), "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
    await audit(user.id, "user", created.userId, "CREATE", undefined, { ...data, passwordHash: undefined });
    done();
  },
);

/** Only MANAGER / OPERATOR accounts of the company, never the caller. */
async function findManaged(user: CurrentUser, id: number) {
  const target = await db.user.findFirst({ where: { userId: id, ...companyUserWhere(user) }, include: { role: true } });
  if (!target) return fail("ไม่พบข้อมูล");
  if (target.userId === user.id) return fail("ไม่สามารถเปลี่ยนแปลงบัญชีของตนเองจากหน้านี้ได้");
  if (target.role.roleName !== "MANAGER" && target.role.roleName !== "OPERATOR") return fail("ไม่สามารถเปลี่ยนแปลงบัญชีผู้ดูแลบริษัทได้");
  return target;
}

export const updateUser = action(ADMIN, z.object({ id: zId, ...assignment }), async ({ id, ...input }, user) => {
  const target = await findManaged(user, id);
  const role = await checkAssignment(user, input);
  if (await employeeCodeTaken(user, input.employeeCode, id)) return fail("รหัสพนักงานนี้มีอยู่ในบริษัทแล้ว");
  const data = {
    roleId: role.roleId,
    factoryId: input.factoryId,
    departmentId: input.departmentId ?? null,
    employeeCode: input.employeeCode,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
  };
  await db.user.update({ where: { userId: id }, data });
  const before = { roleId: target.roleId, factoryId: target.factoryId, departmentId: target.departmentId, employeeCode: target.employeeCode, firstName: target.firstName, lastName: target.lastName, phone: target.phone };
  await audit(user.id, "user", id, "UPDATE", before, data);
  done();
});

/** Suspend (LOCKED) or re-activate. Bumping sessionVersion ends every open session at once. */
export const setUserStatus = action(ADMIN, z.object({ id: zId, status: z.enum(["ACTIVE", "LOCKED"]) }), async ({ id, status }, user) => {
  const target = await findManaged(user, id);
  await db.user.update({
    where: { userId: id },
    data: { status, sessionVersion: { increment: 1 }, ...(status === "ACTIVE" ? { failedLogin: 0, lockedUntil: null } : {}) },
  });
  await audit(user.id, "user", id, "STATUS", { status: target.status }, { status });
  done();
});

/** Admin sets a temporary password; the user's sessions end. */
export const resetUserPassword = action(ADMIN, z.object({ id: zId, password: z.string() }), async ({ id, password }, user) => {
  await findManaged(user, id);
  const problem = passwordProblem(password);
  if (problem) return fail(problem);
  await db.user.update({
    where: { userId: id },
    data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), sessionVersion: { increment: 1 }, failedLogin: 0, lockedUntil: null },
  });
  await audit(user.id, "user", id, "UPDATE", undefined, { passwordReset: true });
  done();
});
