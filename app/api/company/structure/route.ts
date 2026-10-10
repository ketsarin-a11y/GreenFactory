import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function auth() {
  const session = await getSession();

  if (
    !session ||
    session.roleName !== "COMPANY_ADMIN" ||
    session.companyId == null
  ) {
    return null;
  }

  return {
    session,
    companyId: session.companyId,
  };
}

export async function GET() {
  try {
    const authResult = await auth();

    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์เข้าถึงข้อมูลโครงสร้างบริษัท",
        },
        { status: 403 },
      );
    }

    const companyId = authResult.companyId;

    const factories = await prisma.factory.findMany({
      where: {
        companyId,
      },
      orderBy: [
        { status: "asc" },
        { factoryName: "asc" },
      ],
      select: {
        factoryId: true,
        factoryCode: true,
        factoryName: true,
        status: true,
        buildings: {
          orderBy: [
            { status: "asc" },
            { buildingName: "asc" },
          ],
          select: {
            buildingId: true,
            buildingCode: true,
            buildingName: true,
            buildingType: true,
            floorCount: true,
            description: true,
            status: true,
            _count: {
              select: {
                departments: true,
              },
            },
            departments: {
              orderBy: [
                { status: "asc" },
                { departmentName: "asc" },
              ],
              select: {
                departmentId: true,
                departmentCode: true,
                departmentName: true,
                description: true,
                status: true,
                _count: {
                  select: {
                    productionLines: true,
                    users: true,
                  },
                },
                productionLines: {
                  orderBy: [
                    { status: "asc" },
                    { lineName: "asc" },
                  ],
                  select: {
                    lineId: true,
                    lineCode: true,
                    lineName: true,
                    description: true,
                    status: true,
                    _count: {
                      select: {
                        machines: true,
                        checkpoints: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const summary = {
      factories: factories.length,
      buildings: 0,
      departments: 0,
      lines: 0,
      machines: 0,
    };

    for (const factory of factories) {
      for (const building of factory.buildings) {
        summary.buildings += 1;

        for (const department of building.departments) {
          summary.departments += 1;

          for (const line of department.productionLines) {
            summary.lines += 1;
            summary.machines += line._count.machines;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: factories,
      summary,
    });
  } catch (error) {
    console.error(
      "GET /api/company/structure failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดโครงสร้างโรงงานได้",
      },
      { status: 500 },
    );
  }
}