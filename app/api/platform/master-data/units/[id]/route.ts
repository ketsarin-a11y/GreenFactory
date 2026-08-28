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
    const unitId = Number(id);

    if (!Number.isInteger(unitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหน่วยวัดไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await prisma.unit.findUnique({
      where: {
        unitId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบหน่วยวัดนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // ใช้เปลี่ยนสถานะอย่างเดียว
    if (
      body.status !== undefined &&
      body.unitCode === undefined &&
      body.unitName === undefined &&
      body.symbol === undefined &&
      body.unitType === undefined
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

      const updated = await prisma.unit.update({
        where: {
          unitId,
        },
        data: {
          status: body.status,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          body.status === "ACTIVE"
            ? "เปิดใช้งานหน่วยวัดเรียบร้อยแล้ว"
            : "ปิดใช้งานหน่วยวัดเรียบร้อยแล้ว",
        data: updated,
      });
    }

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

    const duplicate = await prisma.unit.findFirst({
      where: {
        unitCode,
        NOT: {
          unitId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหน่วยวัดนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const updated = await prisma.unit.update({
      where: {
        unitId,
      },
      data: {
        unitCode,
        unitName,
        symbol,
        unitType,
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขหน่วยวัดเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update unit error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขหน่วยวัดได้",
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
    const unitId = Number(id);

    if (!Number.isInteger(unitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสหน่วยวัดไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const unit = await prisma.unit.findUnique({
      where: {
        unitId,
      },
      select: {
        unitId: true,
        unitName: true,
        symbol: true,

        _count: {
          select: {
            sensorData: true,
            resourceTypes: true,
            resourceUsages: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบหน่วยวัดนี้",
        },
        { status: 404 },
      );
    }

    const relatedCount =
      unit._count.sensorData +
      unit._count.resourceTypes +
      unit._count.resourceUsages;

    if (relatedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${unit.unitName} (${unit.symbol})" ได้ เนื่องจากมีข้อมูลในระบบอ้างอิงหน่วยนี้อยู่ ${relatedCount} รายการ`,
        },
        { status: 409 },
      );
    }

    await prisma.unit.delete({
      where: {
        unitId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบหน่วยวัดเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete unit error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบหน่วยวัดได้",
      },
      { status: 500 },
    );
  }
}