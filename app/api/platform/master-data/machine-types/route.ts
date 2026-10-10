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

function isValidMachineTypeCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value);
}

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

    const machineTypeCode = normalizeCode(body.machineTypeCode);
    const machineTypeName = normalizeText(body.machineTypeName);
    const description = normalizeText(body.description);

    if (!machineTypeCode || !machineTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเครื่องจักร",
        },
        { status: 400 },
      );
    }

    if (!isValidMachineTypeCode(machineTypeCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "รหัสประเภทเครื่องจักรใช้ได้เฉพาะ A-Z, 0-9 และ _ เท่านั้น",
        },
        { status: 400 },
      );
    }

    if (machineTypeCode.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเครื่องจักรต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (machineTypeName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "ชื่อประเภทเครื่องจักรต้องไม่เกิน 150 ตัวอักษร",
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
      prisma.machineType.findUnique({
        where: {
          machineTypeCode,
        },
        select: {
          machineTypeId: true,
          machineTypeCode: true,
          machineTypeName: true,
          description: true,
          status: true,
        },
      }),

      prisma.machineType.findFirst({
        where: {
          machineTypeName: {
            equals: machineTypeName,
          },
        },
        select: {
          machineTypeId: true,
          machineTypeCode: true,
          machineTypeName: true,
          description: true,
          status: true,
        },
      }),
    ]);

    /*
     * ถ้า CODE เดิมเคยถูกปิดใช้งาน
     * ให้นำ Master Data ตัวเดิมกลับมาใช้แทนการสร้าง record ซ้ำ
     */
    if (existingByCode) {
      if (existingByCode.status !== "ACTIVE") {
        const reactivated = await prisma.machineType.update({
          where: {
            machineTypeId: existingByCode.machineTypeId,
          },
          data: {
            machineTypeName,
            description: description || null,
            status: "ACTIVE",
          },
        });

        return NextResponse.json(
          {
            success: true,
            reactivated: true,
            message: `นำประเภทเครื่องจักร ${machineTypeCode} กลับมาใช้งานแล้ว`,
            data: reactivated,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `รหัสประเภทเครื่องจักร ${machineTypeCode} มีอยู่แล้ว`,
        },
        { status: 409 },
      );
    }

    /*
     * ชื่อ Machine Type ไม่ได้ unique ใน Prisma schema
     * แต่ใน Master Data เรากันชื่อซ้ำเพื่อไม่ให้ dropdown มีชื่อเหมือนกันหลายรายการ
     */
    if (existingByName) {
      if (existingByName.status !== "ACTIVE") {
        return NextResponse.json(
          {
            success: false,
            message:
              `ชื่อประเภท "${machineTypeName}" มีอยู่แล้วแต่ถูกปิดใช้งาน ` +
              `(${existingByName.machineTypeCode}) กรุณาเปิดรายการเดิมกลับมาใช้`,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            `ชื่อประเภทเครื่องจักร "${machineTypeName}" มีอยู่แล้ว ` +
            `(${existingByName.machineTypeCode})`,
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
