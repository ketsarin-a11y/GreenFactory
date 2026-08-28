import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resourceTypes =
      await prisma.resourceTypeMaster.findMany({
        orderBy: [
          { status: "asc" },
          { resourceName: "asc" },
        ],
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,
          description: true,
          carbonCalculable: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          category: {
            select: {
              categoryId: true,
              categoryCode: true,
              categoryName: true,
            },
          },

          defaultUnit: {
            select: {
              unitId: true,
              unitCode: true,
              unitName: true,
              symbol: true,
              unitType: true,
            },
          },

          _count: {
            select: {
              emissionFactors: true,
              resourceUsages: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      data: resourceTypes.map((item) => ({
        resourceTypeId: item.resourceTypeId,
        resourceCode: item.resourceCode,
        resourceName: item.resourceName,
        description: item.description,
        carbonCalculable: item.carbonCalculable,
        status: item.status,

        category: item.category,
        defaultUnit: item.defaultUnit,

        emissionFactorCount:
          item._count.emissionFactors,

        resourceUsageCount:
          item._count.resourceUsages,

        relatedCount:
          item._count.emissionFactors +
          item._count.resourceUsages,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get resource types error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลประเภททรัพยากรได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const resourceCode =
      typeof body.resourceCode === "string"
        ? body.resourceCode.trim().toUpperCase()
        : "";

    const resourceName =
      typeof body.resourceName === "string"
        ? body.resourceName.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const categoryId = Number(body.categoryId);
    const defaultUnitId = Number(body.defaultUnitId);

    const carbonCalculable =
      body.carbonCalculable === true;

    if (
      !resourceCode ||
      !resourceName ||
      !Number.isInteger(categoryId) ||
      !Number.isInteger(defaultUnitId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณากรอกข้อมูลประเภททรัพยากรให้ครบ",
        },
        { status: 400 },
      );
    }

    const duplicate =
      await prisma.resourceTypeMaster.findUnique({
        where: {
          resourceCode,
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภททรัพยากรนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const [category, unit] = await Promise.all([
      prisma.resourceCategory.findUnique({
        where: {
          categoryId,
        },
      }),

      prisma.unit.findUnique({
        where: {
          unitId: defaultUnitId,
        },
      }),
    ]);

    if (!category || category.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "หมวดหมู่ทรัพยากรที่เลือกไม่พร้อมใช้งาน",
        },
        { status: 400 },
      );
    }

    if (!unit || unit.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "หน่วยวัดที่เลือกไม่พร้อมใช้งาน",
        },
        { status: 400 },
      );
    }

    const resourceType =
      await prisma.resourceTypeMaster.create({
        data: {
          resourceCode,
          resourceName,
          description: description || null,
          categoryId,
          defaultUnitId,
          carbonCalculable,
          status: "ACTIVE",
        },
        include: {
          category: true,
          defaultUnit: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มประเภททรัพยากรเรียบร้อยแล้ว",
        data: resourceType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create resource type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มประเภททรัพยากรได้",
      },
      { status: 500 },
    );
  }
}