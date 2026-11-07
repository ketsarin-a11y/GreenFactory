// No "server-only": the seed and domain pipeline read settings too.
import type { PrismaClient } from "@/generated/prisma/client";

const DEFAULTS = {
  maintenanceMode: false,
  maxLoginAttempts: 5,
  autoBlock: true,
  anomalyDetection: true,
  aiRecommendationsEnabled: false,
};
export type RuntimeSettings = typeof DEFAULTS;

/** The platform-wide switches the app actually obeys. Missing row → safe defaults. */
export async function getRuntimeSettings(db: PrismaClient): Promise<RuntimeSettings> {
  const s = await db.systemSetting.findFirst({ orderBy: { systemSettingId: "asc" } });
  if (!s) return DEFAULTS;
  return {
    maintenanceMode: s.maintenanceMode,
    maxLoginAttempts: Math.max(1, s.maxLoginAttempts),
    autoBlock: s.autoBlock,
    anomalyDetection: s.anomalyDetection,
    aiRecommendationsEnabled: s.aiRecommendationsEnabled,
  };
}
