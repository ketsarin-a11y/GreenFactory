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

function isValidSensorTypeCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value);
}

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

    const sensorTypeCode = normalizeCode(body.sensorTypeCode);
    const sensorTypeName = normalizeText(body.sensorTypeName);
    const description = normalizeText(body.description);

    if (!sensorTypeCode || !sensorTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเซนเซอร์",
        },
        { status: 400 },
      );
    }

    if (!isValidSensorTypeCode(sensorTypeCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสประเภทเซนเซอร์ใช้ได้เฉพาะ A-Z, 0-9 และ _ เท่านั้น",
        },
        { status: 400 },
      );
    }

    if (sensorTypeCode.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเซนเซอร์ต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (sensorTypeName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อประเภทเซนเซอร์ต้องไม่เกิน 150 ตัวอักษร",
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
      prisma.sensorType.findUnique({
        where: {
          sensorTypeCode,
        },
        select: {
          sensorTypeId: true,
          sensorTypeCode: true,
          sensorTypeName: true,
          description: true,
          status: true,
        },
      }),

      prisma.sensorType.findFirst({
        where: {
          sensorTypeName: {
            equals: sensorTypeName,
          },
        },
        select: {
          sensorTypeId: true,
          sensorTypeCode: true,
          sensorTypeName: true,
          description: true,
          status: true,
        },
      }),
    ]);

    if (existingByCode) {
      if (existingByCode.status !== "ACTIVE") {
        const reactivated = await prisma.sensorType.update({
          where: {
            sensorTypeId: existingByCode.sensorTypeId,
          },
          data: {
            sensorTypeName,
            description: description || null,
            status: "ACTIVE",
          },
        });

        return NextResponse.json(
          {
            success: true,
            reactivated: true,
            message: `นำประเภทเซนเซอร์ ${sensorTypeCode} กลับมาใช้งานแล้ว`,
            data: reactivated,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `รหัสประเภทเซนเซอร์ ${sensorTypeCode} มีอยู่แล้ว`,
        },
        { status: 409 },
      );
    }

    if (existingByName) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingByName.status === "ACTIVE"
              ? `ชื่อประเภทเซนเซอร์ "${sensorTypeName}" มีอยู่แล้ว (${existingByName.sensorTypeCode})`
              : `ชื่อประเภทเซนเซอร์ "${sensorTypeName}" มีอยู่แล้วแต่ถูกปิดใช้งาน (${existingByName.sensorTypeCode})`,
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
