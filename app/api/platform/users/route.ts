import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLE_MAP = {
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  FACTORY_MANAGER: "MANAGER",
  ENVIRONMENT_OFFICER: "OPERATOR",
} as const;

const STATUS_MAP = {
  ACTIVE: "ACTIVE",
  LOCKED: "SUSPENDED",
  INACTIVE: "EXPIRED",
} as const;

function formatThaiDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatThaiTime(value: Date) {
  return `${new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)} น.`;
}

function formatLastLogin(value: Date | null) {
  if (!value) {
    return "ยังไม่เคยเข้าสู่ระบบ";
  }

  return `${formatThaiDate(value)} ${formatThaiTime(value)}`;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        profileImagePath: true,
        department: true,
        productionLine: true,
        status: true,
        lastLogin: true,
        createdAt: true,

        role: {
          select: {
            roleCode: true,
            roleName: true,
            description: true,
          },
        },

        company: {
          select: {
            companyCode: true,
            companyName: true,
          },
        },

        factory: {
          select: {
            factoryCode: true,
            factoryName: true,
          },
        },

        departmentRef: {
          select: {
            departmentName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: users.map((user) => {
        const roleCode = user.role.roleCode ?? user.role.roleName;

        return {
          id: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone ?? "",

          company: user.company?.companyName ?? "ผู้ใช้งานส่วนกลาง",
          companyCode: user.company?.companyCode ?? "PLATFORM",

          role:
            ROLE_MAP[roleCode as keyof typeof ROLE_MAP] ??
            "OPERATOR",

          position:
            user.departmentRef?.departmentName ??
            user.department ??
            user.role.description ??
            user.role.roleName,

          office:
            user.factory?.factoryName ??
            user.productionLine ??
            "สำนักงานใหญ่ / ส่วนกลาง",

          registeredAt: formatThaiDate(user.createdAt),
          registeredTime: formatThaiTime(user.createdAt),
          lastLogin: formatLastLogin(user.lastLogin),

          status:
            STATUS_MAP[user.status as keyof typeof STATUS_MAP] ??
            "EXPIRED",

          avatarUrl: user.profileImagePath,
        };
      }),
      summary: {
        total: users.length,
        active: users.filter((user) => user.status === "ACTIVE").length,
        suspended: users.filter((user) => user.status === "LOCKED").length,
        expired: users.filter((user) => user.status === "INACTIVE").length,
        newUsers: users.filter((user) => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          return user.createdAt >= thirtyDaysAgo;
        }).length,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/users failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้",
      },
      { status: 500 },
    );
  }
}