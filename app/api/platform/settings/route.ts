import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  forceMfa: false,
  ipProtection: true,
  anomalyDetection: true,
  autoBlock: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  auditRetentionDays: 365,
  loginRetentionDays: 180,
  backupFrequency: "DAILY",
  carbonAnalyticsEnabled: true,
  sensorMonitoringEnabled: true,
  aiRecommendationsEnabled: false,
  machineQrEnabled: true,
  reportBuilderEnabled: false,
};

type UpdateSettingsBody = Partial<typeof DEFAULT_SETTINGS>;

async function requirePlatformAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      ),
    };
  }

  if (session.roleName !== "PLATFORM_ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงการตั้งค่าระบบ" },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session };
}

async function getOrCreateSettings() {
  const existing = await prisma.systemSetting.findFirst({
    orderBy: { systemSettingId: "asc" },
  });

  if (existing) return existing;

  return prisma.systemSetting.create({
    data: DEFAULT_SETTINGS,
  });
}

export async function GET() {
  try {
    const auth = await requirePlatformAdmin();
    if (!auth.ok) return auth.response;

    const settings = await getOrCreateSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET /api/platform/settings failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดการตั้งค่าระบบได้",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requirePlatformAdmin();
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as UpdateSettingsBody;
    const current = await getOrCreateSettings();

    if (
      body.backupFrequency !== undefined &&
      !["DAILY", "WEEKLY", "MONTHLY"].includes(body.backupFrequency)
    ) {
      return NextResponse.json(
        { success: false, message: "ความถี่การสำรองข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const updated = await prisma.systemSetting.update({
      where: { systemSettingId: current.systemSettingId },
      data: {
        ...body,
        updatedBy: auth.session.userId,
      },
    });

    await writeAuditLog({
      request,
      tableName: "system_setting",
      recordId: current.systemSettingId,
      action: "UPDATE",
      oldData: current,
      newData: updated,
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกการตั้งค่าระบบเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/platform/settings failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกการตั้งค่าระบบได้",
      },
      { status: 500 },
    );
  }
}