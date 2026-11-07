"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { bkkDay } from "@/lib/time";
import { ROLES } from "@/server/auth/roles";
import { hashPassword, passwordProblem, verifyPassword } from "@/server/auth/password";
import { SESSION_COOKIE, signSession } from "@/server/auth/session";
import { audit } from "@/server/audit";
import { deleteStoredFile, saveFile } from "@/server/storage";
import { action, fail } from "./_action";

const ALL = [...ROLES];

export const updateProfile = action(
  ALL,
  z.object({
    firstName: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100),
    lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล").max(100),
    phone: z.string().trim().max(30).regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง").optional().transform((s) => s || null),
  }),
  async (input, user) => {
    const before = await db.user.findUniqueOrThrow({ where: { userId: user.id }, select: { firstName: true, lastName: true, phone: true } });
    await db.user.update({ where: { userId: user.id }, data: input });
    await audit(user.id, "user", user.id, "UPDATE", before, input);
    revalidatePath("/", "layout");
  },
);

export const changePassword = action(
  ALL,
  z.object({ current: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"), next: z.string(), confirm: z.string() }),
  async ({ current, next, confirm }, user) => {
    if (next !== confirm) fail("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน");
    const problem = passwordProblem(next);
    if (problem) fail(problem);
    if (next === current) fail("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
    const u = await db.user.findUniqueOrThrow({ where: { userId: user.id } });
    if (!(await verifyPassword(current, u.passwordHash))) fail("รหัสผ่านปัจจุบันไม่ถูกต้อง");

    const updated = await db.user.update({
      where: { userId: user.id },
      data: { passwordHash: await hashPassword(next), passwordChangedAt: new Date(), sessionVersion: { increment: 1 } },
    });
    // Other devices are signed out by the version bump; keep this one signed in.
    const jar = await cookies();
    const maxAge = 60 * 60 * 8;
    jar.set(SESSION_COOKIE, await signSession({ uid: user.id, ver: updated.sessionVersion }, maxAge), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge,
    });
    await audit(user.id, "user", user.id, "UPDATE", undefined, { passwordChanged: true });
  },
);

export const uploadAvatar = action(ALL, z.object({ file: z.instanceof(File, { message: "กรุณาเลือกไฟล์" }) }), async ({ file }, user) => {
  const saved = await saveFile("avatars", file, ["image/jpeg", "image/png", "image/webp"], 5 * 1024 * 1024).catch((e: Error) => fail(e.message));
  const before = await db.user.findUniqueOrThrow({ where: { userId: user.id }, select: { profileImagePath: true } });
  await db.user.update({ where: { userId: user.id }, data: { profileImagePath: saved.key } });
  await deleteStoredFile(before.profileImagePath);
  revalidatePath("/", "layout");
});

const CATEGORIES = ["GENERAL", "QR", "RECORD", "ACCOUNT", "HISTORY", "REPORT", "SENSOR", "SYSTEM"] as const;
export const createSupportTicket = action(
  ALL,
  z.object({
    subject: z.string().trim().min(3, "กรุณากรอกหัวข้อ").max(150),
    category: z.enum(CATEGORIES).default("GENERAL"),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
    description: z.string().trim().min(10, "กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร").max(3000),
    pageUrl: z.string().trim().max(500).optional(),
  }),
  async (input, user) => {
    const day = bkkDay(new Date()).replaceAll("-", "");
    for (let attempt = 0; attempt < 5; attempt++) {
      const ticketReference = `SUP-${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
      try {
        const t = await db.supportTicket.create({
          data: { ...input, pageUrl: input.pageUrl || null, ticketReference, reporterId: user.id, companyId: user.companyId },
        });
        await audit(user.id, "support_tickets", t.ticketId, "CREATE", undefined, input);
        return { ticketReference };
      } catch (e) {
        if ((e as { code?: string }).code !== "P2002") throw e; // reference collision: retry
      }
    }
    return fail("สร้างคำร้องไม่สำเร็จ กรุณาลองใหม่");
  },
);
