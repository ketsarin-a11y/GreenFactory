import "server-only";
import { db } from "@/server/db";

/** The single SystemSetting row; created with defaults if the table is empty. */
export async function getSystemSettings() {
  const row = await db.systemSetting.findFirst({ orderBy: { systemSettingId: "asc" } });
  return row ?? db.systemSetting.create({ data: {} });
}

export async function settingsUpdatedBy(userId: number | null) {
  if (!userId) return null;
  const u = await db.user.findUnique({ where: { userId }, select: { firstName: true, lastName: true } });
  return u ? `${u.firstName} ${u.lastName}` : null;
}
