"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { login, logout } from "@/server/auth/login";
import { hashPassword, passwordProblem } from "@/server/auth/password";
import { homeFor, safeReturnTo } from "@/server/auth/roles";
import { sendEmail } from "@/server/email";

export type FormState = { error?: string; success?: string } | undefined;

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const result = await login({
    organizationCode: String(form.get("organizationCode") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    remember: form.get("remember") === "on",
  });
  if (!result.ok) return { error: result.message };
  redirect(safeReturnTo(String(form.get("returnTo") ?? "")) ?? homeFor(result.role));
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await logout(user?.id ?? null);
  redirect("/login");
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const RESET_MINUTES = 30;

export async function forgotPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  // Same answer whether or not the account exists.
  const done: FormState = { success: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ให้แล้ว ลิงก์มีอายุ 30 นาที" };
  if (!email.success) return { error: "กรุณากรอกอีเมลให้ถูกต้อง" };

  const user = await db.user.findUnique({ where: { email: email.data } });
  if (!user || user.status !== "ACTIVE") return done;

  const token = randomBytes(32).toString("base64url");
  await db.passwordResetToken.create({
    data: { userId: user.userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000) },
  });
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "ตั้งรหัสผ่านใหม่ — GreenFactory Insight",
    text: `สวัสดีคุณ ${user.firstName}\n\nกดลิงก์นี้เพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน ${RESET_MINUTES} นาที):\n${url}\n\nหากคุณไม่ได้ขอ ให้เพิกเฉยอีเมลนี้`,
  });
  return done;
}

export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirm") ?? "")) return { error: "รหัสผ่านทั้งสองช่องไม่ตรงกัน" };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };

  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { error: "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่" };

  // Claim the token atomically (two clicks can't both use it) and retire the user's other links.
  const claimed = await db.passwordResetToken.updateMany({ where: { resetTokenId: row.resetTokenId, usedAt: null }, data: { usedAt: new Date() } });
  if (claimed.count === 0) return { error: "ลิงก์นี้ถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่" };
  await db.$transaction([
    db.passwordResetToken.updateMany({ where: { userId: row.userId, usedAt: null }, data: { usedAt: new Date() } }),
    db.user.update({
      where: { userId: row.userId },
      data: {
        passwordHash: await hashPassword(password),
        passwordChangedAt: new Date(),
        failedLogin: 0,
        lockedUntil: null,
        sessionVersion: { increment: 1 }, // sign out everywhere
      },
    }),
  ]);
  return { success: "ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย" };
}
