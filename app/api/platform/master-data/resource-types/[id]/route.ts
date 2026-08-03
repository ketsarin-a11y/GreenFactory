import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const resourceTypeId = Number(id);

    if (!Number.isInteger(resourceTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภททรัพยากรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await prisma.resourceTypeMaster.findUnique({
      where: {
        resourceTypeId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภททรัพยากรนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // เปลี่ยนสถานะอย่างเดียว
    if (
      body.status !== undefined &&
      body.resourceCode === undefined &&
      body.resourceName === undefined &&
      body.description === undefined &&
      body.categoryId === undefined &&
      body.defaultUnitId === undefined &&
      body.carbonCalculable === undefined
    ) {
      if (
        body.status !== "ACTIVE" &&
        body.status !== "INACTIVE"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "สถานะไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      const updated =
        await prisma.resourceTypeMaster.update({
          where: {
            resourceTypeId,
          },
          data: {
            status: body.status,
          },
        });

      return NextResponse.json({
        success: true,
        message:
          body.status === "ACTIVE"
            ? "เปิดใช้งานประเภททรัพยากรเรียบร้อยแล้ว"
            : "ปิดใช้งานประเภททรัพยากรเรียบร้อยแล้ว",
        data: updated,
      });
    }

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
      await prisma.resourceTypeMaster.findFirst({
        where: {
          resourceCode,
          NOT: {
            resourceTypeId,
          },
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

    const updated =
      await prisma.resourceTypeMaster.update({
        where: {
          resourceTypeId,
        },
        data: {
          resourceCode,
          resourceName,
          description: description || null,
          categoryId,
          defaultUnitId,
          carbonCalculable,
        },
        include: {
          category: true,
          defaultUnit: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "แก้ไขประเภททรัพยากรเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update resource type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขประเภททรัพยากรได้",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const resourceTypeId = Number(id);

    if (!Number.isInteger(resourceTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภททรัพยากรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const resourceType =
      await prisma.resourceTypeMaster.findUnique({
        where: {
          resourceTypeId,
        },
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,

          _count: {
            select: {
              emissionFactors: true,
              resourceUsages: true,
            },
          },
        },
      });

    if (!resourceType) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภททรัพยากรนี้",
        },
        { status: 404 },
      );
    }

    const relatedCount =
      resourceType._count.emissionFactors +
      resourceType._count.resourceUsages;

    if (relatedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${resourceType.resourceName}" ได้ เนื่องจากมีข้อมูลอ้างอิงอยู่ ${relatedCount} รายการ`,
          details: {
            emissionFactorCount:
              resourceType._count.emissionFactors,
            resourceUsageCount:
              resourceType._count.resourceUsages,
          },
        },
        { status: 409 },
      );
    }

    await prisma.resourceTypeMaster.delete({
      where: {
        resourceTypeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบประเภททรัพยากรเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete resource type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบประเภททรัพยากรได้",
      },
      { status: 500 },
    );
  }
}