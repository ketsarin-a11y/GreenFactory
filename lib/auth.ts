import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import type { AuthUser } from "@/contexts/AuthContext";

/**
 * lib/auth.ts
 * -----------
 * อ่าน session cookie (lib/session.ts) แล้วโหลด user จริงจาก DB ผ่าน Prisma
 * รวม role (จาก Role table) และ company มาด้วย
 *
 * ห่อด้วย React cache() เพื่อให้เรียกกี่ครั้งในคำขอ (request) เดียวกัน
 * (เช่นจาก layout.tsx และ page.tsx) ก็ query DB แค่ครั้งเดียว
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { userId: session.userId },
    include: { role: true, company: true },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.userId,
    companyId: user.companyId,
    name: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role.roleName, // เช่น "Operator", "Supervisor", "Admin" — มาจาก Role table จริง
    avatarInitial: user.firstName.charAt(0),
    email: user.email,
  };
});