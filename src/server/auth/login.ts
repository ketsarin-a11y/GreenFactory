import "server-only";
import { cookies, headers } from "next/headers";
import { db } from "@/server/db";
import { getRuntimeSettings } from "@/server/settings";
import { isLocked, registerFailure } from "./lockout";
import { verifyPassword } from "./password";
import { isRole, type Role } from "./roles";
import { SESSION_COOKIE, signSession } from "./session";

type Failure =
  | "MISSING_CREDENTIALS"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_INACTIVE"
  | "ACCOUNT_LOCKED"
  | "INVALID_ORGANIZATION"
  | "MAINTENANCE";

export type LoginResult = { ok: true; role: Role } | { ok: false; message: string };

const MESSAGE: Record<Failure, string> = {
  MISSING_CREDENTIALS: "กรุณากรอกรหัสองค์กร อีเมล และรหัสผ่าน",
  // Same text for wrong email / wrong password / wrong org so the form can't be used to probe accounts.
  INVALID_CREDENTIALS: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
  INVALID_ORGANIZATION: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
  ACCOUNT_INACTIVE: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
  ACCOUNT_LOCKED: "เข้าสู่ระบบผิดหลายครั้ง บัญชีถูกล็อกชั่วคราว 15 นาที",
  MAINTENANCE: "ระบบปิดปรับปรุงชั่วคราว กรุณาลองใหม่ภายหลัง",
};

// bcrypt hash of a random string, cost 12
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO6v1QF0Yk3m3v2xR6W1Y8oQyQ0Z1aX1K";

async function requestMeta() {
  const h = await headers();
  return {
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null,
    userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
  };
}

async function log(userId: number | null, email: string, status: "SUCCESS" | "FAILED", reason?: Failure) {
  await db.loginLog.create({
    data: {
      userId,
      attemptedEmail: email.slice(0, 255),
      loginStatus: status,
      loginMethod: "PASSWORD",
      failureReason: reason ?? null,
      ...(await requestMeta()),
    },
  });
}

async function fail(userId: number | null, email: string, reason: Failure): Promise<LoginResult> {
  await log(userId, email, "FAILED", reason);
  return { ok: false, message: MESSAGE[reason] };
}

export async function login(input: {
  organizationCode: string;
  email: string;
  password: string;
  remember: boolean;
}): Promise<LoginResult> {
  const code = input.organizationCode.trim().toUpperCase();
  const email = input.email.trim().toLowerCase();
  if (!code || !email || !input.password) return fail(null, email, "MISSING_CREDENTIALS");

  const user = await db.user.findUnique({ where: { email }, include: { role: true, company: true, factory: { select: { status: true } } } });
  if (!user || !isRole(user.role.roleName)) {
    await verifyPassword(input.password, DUMMY_HASH); // keep response time the same as a real check
    return fail(null, email, "INVALID_CREDENTIALS");
  }

  const now = new Date();
  const settings = await getRuntimeSettings(db);
  // Check the password first: lock/suspension is only revealed to someone who knows it,
  // so the form can't be used to discover which emails have accounts.
  const locked = isLocked(user.lockedUntil, now);
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    if (!locked) {
      const next = registerFailure(user.failedLogin, now, settings.maxLoginAttempts, settings.autoBlock);
      await db.user.update({ where: { userId: user.userId }, data: next });
    }
    return fail(user.userId, email, "INVALID_CREDENTIALS");
  }
  if (locked) return fail(user.userId, email, "ACCOUNT_LOCKED");
  if (user.status !== "ACTIVE" || (user.factory && user.factory.status !== "ACTIVE")) return fail(user.userId, email, "ACCOUNT_INACTIVE");

  // Platform admins sign in with the platform access code instead of a company code.
  const orgOk =
    user.role.roleName === "PLATFORM_ADMIN"
      ? !!process.env.PLATFORM_ACCESS_CODE && code === process.env.PLATFORM_ACCESS_CODE.toUpperCase()
      : user.company?.companyCode === code && user.company.status === "ACTIVE";
  if (!orgOk) return fail(user.userId, email, "INVALID_ORGANIZATION");
  if (settings.maintenanceMode && user.role.roleName !== "PLATFORM_ADMIN") return fail(user.userId, email, "MAINTENANCE");

  await db.user.update({
    where: { userId: user.userId },
    data: { failedLogin: 0, lockedUntil: null, lastLogin: now },
  });
  await log(user.userId, email, "SUCCESS");

  const maxAge = input.remember ? 60 * 60 * 24 * 7 : 60 * 60 * 8;
  (await cookies()).set(SESSION_COOKIE, await signSession({ uid: user.userId, ver: user.sessionVersion }, maxAge), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return { ok: true, role: user.role.roleName };
}

export async function logout(userId: number | null) {
  if (userId) {
    const last = await db.loginLog.findFirst({
      where: { userId, loginStatus: "SUCCESS", logoutAt: null },
      orderBy: { loginAt: "desc" },
    });
    if (last) await db.loginLog.update({ where: { loginLogId: last.loginLogId }, data: { logoutAt: new Date() } });
  }
  (await cookies()).delete(SESSION_COOKIE);
}
