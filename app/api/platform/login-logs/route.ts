import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getRoleLabel(roleCode: string | null, roleName: string | null) {
  const value = roleCode ?? roleName ?? "UNKNOWN";

  switch (value) {
    case "PLATFORM_ADMIN":
      return "Platform Admin";
    case "COMPANY_ADMIN":
      return "Company Admin";
    case "FACTORY_MANAGER":
    case "MANAGER":
      return "Factory Manager";
    case "ENVIRONMENT_OFFICER":
    case "OPERATOR":
      return "Environment Officer";
    default:
      return roleName ?? roleCode ?? "Unknown";
  }
}

function parseUserAgent(userAgent: string | null) {
  const ua = userAgent ?? "";

  let operatingSystem = "Unknown";
  let browser = "Unknown";

  if (/Windows NT 10\.0/i.test(ua)) {
    operatingSystem = "Windows";
  } else if (/Mac OS X/i.test(ua)) {
    operatingSystem = "macOS";
  } else if (/Android/i.test(ua)) {
    operatingSystem = "Android";
  } else if (/iPhone|iPad|iOS/i.test(ua)) {
    operatingSystem = "iOS";
  } else if (/Linux/i.test(ua)) {
    operatingSystem = "Linux";
  }

  const edge = ua.match(/Edg\/([0-9.]+)/i);
  const chrome = ua.match(/Chrome\/([0-9.]+)/i);
  const firefox = ua.match(/Firefox\/([0-9.]+)/i);
  const safari = ua.match(/Version\/([0-9.]+).*Safari/i);

  if (edge) {
    browser = `Edge ${edge[1]}`;
  } else if (chrome) {
    browser = `Chrome ${chrome[1]}`;
  } else if (firefox) {
    browser = `Firefox ${firefox[1]}`;
  } else if (safari) {
    browser = `Safari ${safari[1]}`;
  }

  return { operatingSystem, browser };
}

function mapFailureReason(reason: string | null) {
  switch (reason) {
    case "MISSING_CREDENTIALS":
      return "กรอกข้อมูลเข้าสู่ระบบไม่ครบ";
    case "INVALID_CREDENTIALS":
      return "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง";
    case "ACCOUNT_INACTIVE":
      return "บัญชีไม่สามารถใช้งานได้";
    case "ACCOUNT_LOCKED":
      return "บัญชีถูกล็อกชั่วคราว";
    case "UNSUPPORTED_ROLE":
      return "บทบาทไม่รองรับในระบบ";
    case "PLATFORM_ACCESS_CODE_NOT_CONFIGURED":
      return "ระบบยังไม่ได้ตั้งค่ารหัสผู้ดูแลแพลตฟอร์ม";
    case "INVALID_PLATFORM_CODE":
      return "รหัสผู้ดูแลแพลตฟอร์มไม่ถูกต้อง";
    case "INVALID_PLATFORM_ADMIN_ASSIGNMENT":
      return "โครงสร้างบัญชี Platform Admin ไม่ถูกต้อง";
    case "NO_COMPANY":
      return "บัญชียังไม่ได้กำหนดบริษัท";
    case "INVALID_COMPANY_CODE":
      return "รหัสองค์กรไม่ถูกต้อง";
    case "PASSWORD_RETRY_LIMIT_REACHED":
      return "กรอกรหัสผ่านผิดถึงจำนวนที่กำหนดและบัญชีถูกล็อก";
    case "INVALID_PASSWORD":
      return "รหัสผ่านไม่ถูกต้อง";
    default:
      return reason ?? "เข้าสู่ระบบสำเร็จ";
  }
}

export async function GET() {
  try {
    const logs = await prisma.loginLog.findMany({
      orderBy: { loginAt: "desc" },
      select: {
        loginLogId: true,
        attemptedEmail: true,
        loginAt: true,
        logoutAt: true,
        ipAddress: true,
        userAgent: true,
        device: true,
        loginMethod: true,
        loginStatus: true,
        failureReason: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            company: {
              select: { companyName: true },
            },
            role: {
              select: {
                roleCode: true,
                roleName: true,
              },
            },
          },
        },
      },
    });

    const data = logs.map((log) => {
      const userAgentInfo = parseUserAgent(log.userAgent);

      const userName = log.user
        ? `${log.user.firstName} ${log.user.lastName}`.trim()
        : log.attemptedEmail ?? "Unknown";

      const email =
        log.user?.email ??
        log.attemptedEmail ??
        "-";

      const role = log.user
        ? getRoleLabel(
            log.user.role.roleCode,
            log.user.role.roleName,
          )
        : "Unknown";

      const company =
        log.user?.company?.companyName ??
        (role === "Platform Admin"
          ? "แพลตฟอร์มส่วนกลาง"
          : "ไม่ทราบบริษัท");

      return {
        id: log.loginLogId.toString(),
        loginAt: log.loginAt.toISOString(),
        logoutAt: log.logoutAt?.toISOString() ?? null,
        userName,
        email,
        role,
        company,
        status:
          log.loginStatus === "SUCCESS"
            ? "SUCCESS"
            : "FAILED",
        ipAddress: log.ipAddress ?? "-",
        operatingSystem: userAgentInfo.operatingSystem,
        browser: userAgentInfo.browser,
        deviceType:
          log.device === "Mobile" ||
          log.device === "Tablet" ||
          log.device === "Desktop"
            ? log.device
            : "Desktop",
        location: "ไม่ระบุ",
        country: "ไม่ระบุ",
        reason:
          log.loginStatus === "SUCCESS"
            ? "เข้าสู่ระบบสำเร็จ"
            : mapFailureReason(log.failureReason),
        sessionId: `LOGIN-${log.loginLogId.toString()}`,
        loginMethod: log.loginMethod ?? "PASSWORD",
        userAgent: log.userAgent ?? "-",
      };
    });

    const successCount = logs.filter(
      (log) => log.loginStatus === "SUCCESS",
    ).length;

    const failedCount = logs.filter(
      (log) => log.loginStatus !== "SUCCESS",
    ).length;

    return NextResponse.json({
      success: true,
      data,
      summary: {
        total: logs.length,
        successCount,
        failedCount,
        successRate:
          logs.length > 0
            ? Math.round((successCount / logs.length) * 10000) / 100
            : 0,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/login-logs failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลด Login Log ได้",
      },
      { status: 500 },
    );
  }
}
