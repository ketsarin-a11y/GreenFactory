import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase()
    : "";
}

function normalizeText(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidResourceCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value);
}

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

    const resourceCode = normalizeCode(body.resourceCode);
    const resourceName = normalizeText(body.resourceName);
    const description = normalizeText(body.description);

    const categoryId = Number(body.categoryId);
    const defaultUnitId = Number(body.defaultUnitId);

    const carbonCalculable =
      body.carbonCalculable === true;

    if (
      !resourceCode ||
      !resourceName ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0 ||
      !Number.isInteger(defaultUnitId) ||
      defaultUnitId <= 0
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

    if (!isValidResourceCode(resourceCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสประเภททรัพยากรใช้ได้เฉพาะ A-Z, 0-9 และ _ เท่านั้น",
        },
        { status: 400 },
      );
    }

    if (resourceCode.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสประเภททรัพยากรต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (resourceName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ชื่อประเภททรัพยากรต้องไม่เกิน 150 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รายละเอียดต้องไม่เกิน 500 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    const [
      existingByCode,
      existingByName,
      category,
      unit,
    ] = await Promise.all([
      prisma.resourceTypeMaster.findUnique({
        where: {
          resourceCode,
        },
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,
          status: true,
        },
      }),

      prisma.resourceTypeMaster.findFirst({
        where: {
          resourceName: {
            equals: resourceName,
          },
        },
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,
          status: true,
        },
      }),

      prisma.resourceCategory.findUnique({
        where: {
          categoryId,
        },
        select: {
          categoryId: true,
          categoryCode: true,
          categoryName: true,
          status: true,
        },
      }),

      prisma.unit.findUnique({
        where: {
          unitId: defaultUnitId,
        },
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
          status: true,
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
          message:
            "หน่วยวัดที่เลือกไม่พร้อมใช้งาน",
        },
        { status: 400 },
      );
    }

    /*
     * ถ้า CODE เดิมเคยถูกปิดใช้งาน
     * ให้นำ Resource Type เดิมกลับมาใช้
     */
    if (existingByCode) {
      if (existingByCode.status !== "ACTIVE") {
        const reactivated =
          await prisma.resourceTypeMaster.update({
            where: {
              resourceTypeId:
                existingByCode.resourceTypeId,
            },
            data: {
              resourceName,
              description:
                description || null,
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
            reactivated: true,
            message:
              `นำประเภททรัพยากร ${resourceCode} กลับมาใช้งานแล้ว`,
            data: reactivated,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            `รหัสประเภททรัพยากร ${resourceCode} มีอยู่แล้ว`,
        },
        { status: 409 },
      );
    }

    /*
     * ชื่อ resourceName ไม่ได้ unique ใน schema
     * แต่ Master Data ไม่ควรมีชื่อซ้ำใน dropdown
     */
    if (existingByName) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingByName.status === "ACTIVE"
              ? `ชื่อประเภททรัพยากร "${resourceName}" มีอยู่แล้ว (${existingByName.resourceCode})`
              : `ชื่อประเภททรัพยากร "${resourceName}" มีอยู่แล้วแต่ถูกปิดใช้งาน (${existingByName.resourceCode})`,
        },
        { status: 409 },
      );
    }

    const resourceType =
      await prisma.resourceTypeMaster.create({
        data: {
          resourceCode,
          resourceName,
          description:
            description || null,
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
        message:
          "เพิ่มประเภททรัพยากรเรียบร้อยแล้ว",
        data: resourceType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create resource type error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถเพิ่มประเภททรัพยากรได้",
      },
      { status: 500 },
    );
  }
}
