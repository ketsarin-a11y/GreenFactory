import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const machineTypes = await prisma.machineType.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          machineTypeName: "asc",
        },
      ],
      select: {
        machineTypeId: true,
        machineTypeCode: true,
        machineTypeName: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            machines: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: machineTypes.map((item) => ({
        machineTypeId: item.machineTypeId,
        machineTypeCode: item.machineTypeCode,
        machineTypeName: item.machineTypeName,
        description: item.description,
        status: item.status,
        machineCount: item._count.machines,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get machine types error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลประเภทเครื่องจักรได้",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const machineTypeCode =
      typeof body.machineTypeCode === "string"
        ? body.machineTypeCode.trim().toUpperCase()
        : "";

    const machineTypeName =
      typeof body.machineTypeName === "string"
        ? body.machineTypeName.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!machineTypeCode || !machineTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเครื่องจักร",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.machineType.findUnique({
      where: {
        machineTypeCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเครื่องจักรนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const machineType = await prisma.machineType.create({
      data: {
        machineTypeCode,
        machineTypeName,
        description: description || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มประเภทเครื่องจักรเรียบร้อยแล้ว",
        data: machineType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create machine type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มประเภทเครื่องจักรได้",
      },
      { status: 500 },
    );
  }
}