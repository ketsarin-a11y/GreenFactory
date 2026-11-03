"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getSystemSettings } from "@/server/queries/platform/settings";
import { action } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];
const int = (min: number, max: number) => z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(min, `ต่ำสุด ${min}`).max(max, `สูงสุด ${max}`);

/** The only fields a platform admin may change. `.strict()` rejects anything else (no mass assignment). */
const settingsSchema = z
  .object({
    maintenanceMode: z.boolean(),
    forceMfa: z.boolean(),
    ipProtection: z.boolean(),
    anomalyDetection: z.boolean(),
    autoBlock: z.boolean(),
    sessionTimeoutMinutes: int(5, 1440),
    maxLoginAttempts: int(3, 20),
    auditRetentionDays: int(30, 3650),
    loginRetentionDays: int(30, 3650),
    backupFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    carbonAnalyticsEnabled: z.boolean(),
    sensorMonitoringEnabled: z.boolean(),
    aiRecommendationsEnabled: z.boolean(),
    machineQrEnabled: z.boolean(),
    reportBuilderEnabled: z.boolean(),
  })
  .strict();

export const updateSystemSettings = action(PA, settingsSchema, async (input, user) => {
  const before = await getSystemSettings();
  const changedOld: Record<string, unknown> = {};
  const changedNew: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    const old = before[k as keyof typeof before];
    if (old !== v) {
      changedOld[k] = old;
      changedNew[k] = v;
    }
  }
  if (!Object.keys(changedNew).length) return { changed: 0 };
  await db.systemSetting.update({ where: { systemSettingId: before.systemSettingId }, data: { ...input, updatedBy: user.id } });
  await audit(user.id, "system_setting", before.systemSettingId, "UPDATE", changedOld, changedNew);
  revalidatePath("/platform/settings");
  return { changed: Object.keys(changedNew).length };
});
