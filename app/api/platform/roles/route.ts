import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        roleId: "asc",
      },
      select: {
        roleId: true,
        roleCode: true,
        roleName: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: roles.map((role) => ({
        id: role.roleId,
        key: role.roleCode ?? role.roleName,
        code: role.roleCode,
        name: role.roleName,
        description: role.description ?? "",
        status: role.status,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/platform/roles error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดข้อมูลบทบาทได้",
      },
      { status: 500 },
    );
  }
}