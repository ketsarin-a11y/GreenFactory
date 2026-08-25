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

function getActionLabel(action: string) {
  switch (action.toUpperCase()) {
    case "CREATE":
      return "เพิ่มข้อมูล";
    case "UPDATE":
      return "แก้ไขข้อมูล";
    case "DELETE":
      return "ลบข้อมูล";
    case "LOGIN":
      return "เข้าสู่ระบบ";
    default:
      return action;
  }
}

function toReference(tableName: string, recordId: bigint) {
  return `${tableName}#${recordId.toString()}`;
}

function toDescription(action: string, tableName: string) {
  return `${getActionLabel(action)}ใน ${tableName}`;
}

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        auditLogId: true,
        tableName: true,
        recordId: true,
        action: true,
        oldData: true,
        newData: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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

    const data = logs.map((log) => ({
      id: log.auditLogId.toString(),
      createdAt: log.createdAt.toISOString(),
      userName: log.user
        ? `${log.user.firstName} ${log.user.lastName}`.trim()
        : "System",
      email: log.user?.email ?? "-",
      role: log.user
        ? getRoleLabel(log.user.role.roleCode, log.user.role.roleName)
        : "System",
      action: log.action.toUpperCase(),
      module: log.tableName,
      reference: toReference(log.tableName, log.recordId),
      description: toDescription(log.action, log.tableName),
      ipAddress: log.ipAddress ?? "-",
      userAgent: log.userAgent ?? "-",
      oldData: log.oldData,
      newData: log.newData,
    }));

    const uniqueUsers = new Set(
      logs
        .map((log) => log.user?.email)
        .filter((email): email is string => Boolean(email)),
    ).size;

    const created = logs.filter(
      (log) => log.action.toUpperCase() === "CREATE",
    ).length;

    const updatedAndDeleted = logs.filter((log) =>
      ["UPDATE", "DELETE"].includes(log.action.toUpperCase()),
    ).length;

    return NextResponse.json({
      success: true,
      data,
      summary: {
        total: logs.length,
        uniqueUsers,
        created,
        updatedAndDeleted,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/audit-logs failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลด Audit Log ได้",
      },
      { status: 500 },
    );
  }
}
