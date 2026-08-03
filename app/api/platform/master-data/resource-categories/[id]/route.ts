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
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหมวดหมู่ทรัพยากรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await prisma.resourceCategory.findUnique({
      where: {
        categoryId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบหมวดหมู่ทรัพยากรนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // ใช้สำหรับเปิด/ปิดสถานะอย่างเดียว
    if (
      body.status !== undefined &&
      body.categoryCode === undefined &&
      body.categoryName === undefined &&
      body.description === undefined
    ) {
      if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
        return NextResponse.json(
          {
            success: false,
            message: "สถานะไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      const updated = await prisma.resourceCategory.update({
        where: {
          categoryId,
        },
        data: {
          status: body.status,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          body.status === "ACTIVE"
            ? "เปิดใช้งานหมวดหมู่ทรัพยากรแล้ว"
            : "ปิดใช้งานหมวดหมู่ทรัพยากรแล้ว",
        data: updated,
      });
    }

    const categoryCode =
      typeof body.categoryCode === "string"
        ? body.categoryCode.trim().toUpperCase()
        : "";

    const categoryName =
      typeof body.categoryName === "string"
        ? body.categoryName.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!categoryCode || !categoryName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อหมวดหมู่ทรัพยากร",
        },
        { status: 400 },
      );
    }

    const duplicate = await prisma.resourceCategory.findFirst({
      where: {
        categoryCode,
        NOT: {
          categoryId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหมวดหมู่ทรัพยากรนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const updated = await prisma.resourceCategory.update({
      where: {
        categoryId,
      },
      data: {
        categoryCode,
        categoryName,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขหมวดหมู่ทรัพยากรเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update resource category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขหมวดหมู่ทรัพยากรได้",
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
    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหมวดหมู่ทรัพยากรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const category = await prisma.resourceCategory.findUnique({
      where: {
        categoryId,
      },
      select: {
        categoryId: true,
        categoryName: true,

        _count: {
          select: {
            resourceTypes: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบหมวดหมู่ทรัพยากรนี้",
        },
        { status: 404 },
      );
    }

    // ป้องกันการลบ Master Data ที่ถูก Resource Type ใช้งานแล้ว
    if (category._count.resourceTypes > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${category.categoryName}" ได้ เนื่องจากมีประเภททรัพยากรใช้งานหมวดหมู่นี้อยู่ ${category._count.resourceTypes} รายการ`,
        },
        { status: 409 },
      );
    }

    await prisma.resourceCategory.delete({
      where: {
        categoryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบหมวดหมู่ทรัพยากรเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete resource category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบหมวดหมู่ทรัพยากรได้",
      },
      { status: 500 },
    );
  }
}