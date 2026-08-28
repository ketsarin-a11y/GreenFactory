import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

    const existing = await prisma.resourceCategory.findUnique({
      where: {
        categoryCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหมวดหมู่ทรัพยากรนี้มีอยู่แล้ว",
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