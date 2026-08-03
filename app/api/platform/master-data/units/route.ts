import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          unitName: "asc",
        },
      ],
      select: {
        unitId: true,
        unitCode: true,
        unitName: true,
        symbol: true,
        unitType: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            sensorData: true,
            resourceTypes: true,
            resourceUsages: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: units.map((item) => ({
        unitId: item.unitId,
        unitCode: item.unitCode,
        unitName: item.unitName,
        symbol: item.symbol,
        unitType: item.unitType,
        status: item.status,

        sensorDataCount: item._count.sensorData,
        resourceTypeCount: item._count.resourceTypes,
        resourceUsageCount: item._count.resourceUsages,

        relatedCount:
          item._count.sensorData +
          item._count.resourceTypes +
          item._count.resourceUsages,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get units error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลหน่วยวัดได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const unitCode =
      typeof body.unitCode === "string"
        ? body.unitCode.trim().toUpperCase()
        : "";

    const unitName =
      typeof body.unitName === "string"
        ? body.unitName.trim()
        : "";

    const symbol =
      typeof body.symbol === "string"
        ? body.symbol.trim()
        : "";

    const unitType =
      typeof body.unitType === "string"
        ? body.unitType.trim()
        : "";

    if (!unitCode || !unitName || !symbol || !unitType) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลหน่วยวัดให้ครบ",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.unit.findUnique({
      where: {
        unitCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหน่วยวัดนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const unit = await prisma.unit.create({
      data: {
        unitCode,
        unitName,
        symbol,
        unitType,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มหน่วยวัดเรียบร้อยแล้ว",
        data: unit,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create unit error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มหน่วยวัดได้",
      },
      { status: 500 },
    );
  }
}