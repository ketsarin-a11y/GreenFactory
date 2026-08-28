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

    const sensorTypeId = Number(id);

    if (!Number.isInteger(sensorTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเซนเซอร์ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

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

    const status =
      body.status === "ACTIVE" || body.status === "INACTIVE"
        ? body.status
        : undefined;

    if (!sensorTypeCode || !sensorTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเซนเซอร์",
        },
        { status: 400 },
      );
    }

    const current = await prisma.sensorType.findUnique({
      where: {
        sensorTypeId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภทเซนเซอร์นี้",
        },
        { status: 404 },
      );
    }

    const duplicate = await prisma.sensorType.findFirst({
      where: {
        sensorTypeCode,
        NOT: {
          sensorTypeId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเซนเซอร์นี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const updated = await prisma.sensorType.update({
      where: {
        sensorTypeId,
      },
      data: {
        sensorTypeCode,
        sensorTypeName,
        description: description || null,
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        status && status !== current.status
          ? "อัปเดตสถานะประเภทเซนเซอร์เรียบร้อยแล้ว"
          : "แก้ไขประเภทเซนเซอร์เรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update sensor type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขประเภทเซนเซอร์ได้",
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

    const sensorTypeId = Number(id);

    if (!Number.isInteger(sensorTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเซนเซอร์ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const sensorType = await prisma.sensorType.findUnique({
      where: {
        sensorTypeId,
      },
      select: {
        sensorTypeId: true,
        sensorTypeCode: true,
        sensorTypeName: true,
        _count: {
          select: {
            sensors: true,
          },
        },
      },
    });

    if (!sensorType) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภทเซนเซอร์นี้",
        },
        { status: 404 },
      );
    }

    if (sensorType._count.sensors > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${sensorType.sensorTypeName}" ได้ เนื่องจากมีเซนเซอร์ใช้งานประเภทนี้อยู่ ${sensorType._count.sensors} ตัว`,
        },
        { status: 409 },
      );
    }

    await prisma.sensorType.delete({
      where: {
        sensorTypeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบประเภทเซนเซอร์เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete sensor type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบประเภทเซนเซอร์ได้",
      },
      { status: 500 },
    );
  }
}