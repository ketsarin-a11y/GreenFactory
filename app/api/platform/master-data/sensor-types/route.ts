import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sensorTypes = await prisma.sensorType.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          sensorTypeName: "asc",
        },
      ],
      select: {
        sensorTypeId: true,
        sensorTypeCode: true,
        sensorTypeName: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sensors: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sensorTypes.map((item) => ({
        sensorTypeId: item.sensorTypeId,
        sensorTypeCode: item.sensorTypeCode,
        sensorTypeName: item.sensorTypeName,
        description: item.description,
        status: item.status,
        sensorCount: item._count.sensors,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get sensor types error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลประเภทเซนเซอร์ได้",
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

    const sensorTypeCode =
      typeof body.sensorTypeCode === "string"
        ? body.sensorTypeCode.trim().toUpperCase()
        : "";

    const sensorTypeName =
      typeof body.sensorTypeName === "string"
        ? body.sensorTypeName.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!sensorTypeCode || !sensorTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเซนเซอร์",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.sensorType.findUnique({
      where: {
        sensorTypeCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเซนเซอร์นี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const sensorType = await prisma.sensorType.create({
      data: {
        sensorTypeCode,
        sensorTypeName,
        description: description || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มประเภทเซนเซอร์เรียบร้อยแล้ว",
        data: sensorType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create sensor type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มประเภทเซนเซอร์ได้",
      },
      { status: 500 },
    );
  }
}