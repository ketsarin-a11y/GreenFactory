import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";

/** Top-bar context: the factory (or company) the user is looking at, plus its parent. */
export async function factoryLabel(user: CurrentUser): Promise<{ primary: string; secondary?: string }> {
  if (user.role === "PLATFORM_ADMIN") return { primary: "GreenFactory Platform", secondary: "ผู้ดูแลระบบ" };
  if (!user.factoryId) return { primary: user.companyName ?? "" };
  const f = await db.factory.findUnique({ where: { factoryId: user.factoryId }, select: { factoryName: true } });
  return { primary: f?.factoryName ?? user.companyName ?? "", secondary: f ? user.companyName ?? undefined : undefined };
}
