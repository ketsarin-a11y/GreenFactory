import "server-only";
import { db } from "@/server/db";
import type { CurrentUser } from "@/server/auth/current-user";

/** "บริษัท · โรงงาน" for the top bar. */
export async function factoryLabel(user: CurrentUser) {
  if (user.role === "PLATFORM_ADMIN") return "GreenFactory Platform · ผู้ดูแลระบบ";
  if (!user.factoryId) return user.companyName ?? "";
  const f = await db.factory.findUnique({ where: { factoryId: user.factoryId }, select: { factoryName: true } });
  return [user.companyName, f?.factoryName].filter(Boolean).join(" · ");
}
