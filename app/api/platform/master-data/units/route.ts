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

function normalizeUnitType(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase()
    : "";
}

function isValidUnitCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value);
}

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

    const unitCode = normalizeCode(body.unitCode);
    const unitName = normalizeText(body.unitName);
    const symbol = normalizeText(body.symbol);
    const unitType = normalizeUnitType(body.unitType);

    if (!unitCode || !unitName || !symbol || !unitType) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลหน่วยวัดให้ครบ",
        },
        { status: 400 },
      );
    }

    if (!isValidUnitCode(unitCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสหน่วยวัดใช้ได้เฉพาะ A-Z, 0-9 และ _ เท่านั้น",
        },
        { status: 400 },
      );
    }

    if (unitCode.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหน่วยวัดต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (unitName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อหน่วยวัดต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (symbol.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "สัญลักษณ์หน่วยต้องไม่เกิน 30 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (unitType.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "ประเภทหน่วยต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    const [
      existingByCode,
      existingByName,
      existingBySymbolAndType,
    ] = await Promise.all([
      prisma.unit.findUnique({
        where: {
          unitCode,
        },
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
          unitType: true,
          status: true,
        },
      }),

      prisma.unit.findFirst({
        where: {
          unitName: {
            equals: unitName,
          },
        },
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
          unitType: true,
          status: true,
        },
      }),

      prisma.unit.findFirst({
        where: {
          symbol: {
            equals: symbol,
          },
          unitType: {
            equals: unitType,
          },
        },
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
          unitType: true,
          status: true,
        },
      }),
    ]);

    /*
     * ถ้า CODE เดิมเคยถูกปิดใช้งาน
     * ให้นำ Unit เดิมกลับมาใช้แทนการสร้าง record ใหม่
     */
    if (existingByCode) {
      if (existingByCode.status !== "ACTIVE") {
        const reactivated = await prisma.unit.update({
          where: {
            unitId: existingByCode.unitId,
          },
          data: {
            unitName,
            symbol,
            unitType,
            status: "ACTIVE",
          },
        });

        return NextResponse.json(
          {
            success: true,
            reactivated: true,
            message: `นำหน่วย ${unitCode} กลับมาใช้งานแล้ว`,
            data: reactivated,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `รหัสหน่วยวัด ${unitCode} มีอยู่แล้ว`,
        },
        { status: 409 },
      );
    }

    /*
     * กันชื่อซ้ำใน Master Data
     */
    if (existingByName) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingByName.status === "ACTIVE"
              ? `ชื่อหน่วย "${unitName}" มีอยู่แล้ว (${existingByName.unitCode})`
              : `ชื่อหน่วย "${unitName}" มีอยู่แล้วแต่ถูกปิดใช้งาน (${existingByName.unitCode})`,
        },
        { status: 409 },
      );
    }

    /*
     * สัญลักษณ์เดียวกันสามารถมีได้ ถ้า unitType ต่างกัน
     * แต่ symbol + unitType เดียวกันไม่ควรซ้ำ
     */
    if (existingBySymbolAndType) {
      return NextResponse.json(
        {
          success: false,
          message:
            `สัญลักษณ์ "${symbol}" ในประเภท ${unitType} มีอยู่แล้ว ` +
            `(${existingBySymbolAndType.unitCode})`,
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
