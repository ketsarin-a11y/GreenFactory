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

function isValidCategoryCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value);
}

export async function GET() {
  try {
    const categories = await prisma.resourceCategory.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          categoryName: "asc",
        },
      ],
      select: {
        categoryId: true,
        categoryCode: true,
        categoryName: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            resourceTypes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((item) => ({
        categoryId: item.categoryId,
        categoryCode: item.categoryCode,
        categoryName: item.categoryName,
        description: item.description,
        status: item.status,
        resourceTypeCount: item._count.resourceTypes,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get resource categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลหมวดหมู่ทรัพยากรได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const categoryCode = normalizeCode(body.categoryCode);
    const categoryName = normalizeText(body.categoryName);
    const description = normalizeText(body.description);

    if (!categoryCode || !categoryName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อหมวดหมู่ทรัพยากร",
        },
        { status: 400 },
      );
    }

    if (!isValidCategoryCode(categoryCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสหมวดหมู่ใช้ได้เฉพาะ A-Z, 0-9 และ _ เท่านั้น",
        },
        { status: 400 },
      );
    }

    if (categoryCode.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหมวดหมู่ต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (categoryName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อหมวดหมู่ต้องไม่เกิน 150 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "รายละเอียดต้องไม่เกิน 500 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    const [existingByCode, existingByName] = await Promise.all([
      prisma.resourceCategory.findUnique({
        where: {
          categoryCode,
        },
        select: {
          categoryId: true,
          categoryCode: true,
          categoryName: true,
          description: true,
          status: true,
        },
      }),

      prisma.resourceCategory.findFirst({
        where: {
          categoryName: {
            equals: categoryName,
          },
        },
        select: {
          categoryId: true,
          categoryCode: true,
          categoryName: true,
          description: true,
          status: true,
        },
      }),
    ]);

    /*
     * ถ้า CODE เดิมเคยถูกปิดใช้งาน
     * ให้นำ Master Data เดิมกลับมาใช้ แทนการสร้าง record ซ้ำ
     */
    if (existingByCode) {
      if (existingByCode.status !== "ACTIVE") {
        const reactivated =
          await prisma.resourceCategory.update({
            where: {
              categoryId: existingByCode.categoryId,
            },
            data: {
              categoryName,
              description: description || null,
              status: "ACTIVE",
            },
          });

        return NextResponse.json(
          {
            success: true,
            reactivated: true,
            message: `นำหมวดหมู่ ${categoryCode} กลับมาใช้งานแล้ว`,
            data: reactivated,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `รหัสหมวดหมู่ ${categoryCode} มีอยู่แล้ว`,
        },
        { status: 409 },
      );
    }

    /*
     * ชื่อไม่ได้ unique ใน Prisma schema
     * แต่ Master Data ไม่ควรมีชื่อเดียวกันหลายรายการ
     */
    if (existingByName) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingByName.status === "ACTIVE"
              ? `ชื่อหมวดหมู่ "${categoryName}" มีอยู่แล้ว (${existingByName.categoryCode})`
              : `ชื่อหมวดหมู่ "${categoryName}" มีอยู่แล้วแต่ถูกปิดใช้งาน (${existingByName.categoryCode})`,
        },
        { status: 409 },
      );
    }

    const category = await prisma.resourceCategory.create({
      data: {
        categoryCode,
        categoryName,
        description: description || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มหมวดหมู่ทรัพยากรเรียบร้อยแล้ว",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create resource category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มหมวดหมู่ทรัพยากรได้",
      },
      { status: 500 },
    );
  }
}
