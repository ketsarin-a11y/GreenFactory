import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [roles, companies, factories, departments] = await Promise.all([
      prisma.role.findMany({
        where: { status: "ACTIVE", roleCode: { not: null } },
        orderBy: { roleId: "asc" },
        select: {
          roleId: true,
          roleCode: true,
          roleName: true,
          description: true,
        },
      }),
      prisma.company.findMany({
        where: { status: "ACTIVE" },
        orderBy: { companyName: "asc" },
        select: {
          companyId: true,
          companyCode: true,
          companyName: true,
        },
      }),
      prisma.factory.findMany({
        where: { status: "ACTIVE" },
        orderBy: { factoryName: "asc" },
        select: {
          factoryId: true,
          companyId: true,
          factoryCode: true,
          factoryName: true,
        },
      }),
      prisma.department.findMany({
        where: { status: "ACTIVE" },
        orderBy: { departmentName: "asc" },
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
          building: { select: { factoryId: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        roles: roles
          .filter((role): role is typeof role & { roleCode: string } => Boolean(role.roleCode))
          .map((role) => ({
            id: role.roleId,
            code: role.roleCode,
            name: role.roleName,
            description: role.description ?? "",
          })),
        companies: companies.map((company) => ({
          id: company.companyId,
          code: company.companyCode,
          name: company.companyName,
        })),
        factories: factories.map((factory) => ({
          id: factory.factoryId,
          companyId: factory.companyId,
          code: factory.factoryCode,
          name: factory.factoryName,
        })),
        departments: departments.map((department) => ({
          id: department.departmentId,
          factoryId: department.building.factoryId,
          code: department.departmentCode,
          name: department.departmentName,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/platform/users/options failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดตัวเลือกผู้ใช้งานได้",
      },
      { status: 500 },
    );
  }
}
