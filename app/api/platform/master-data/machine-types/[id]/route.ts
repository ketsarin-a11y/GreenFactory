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

    const machineTypeId = Number(id);

    if (!Number.isInteger(machineTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเครื่องจักรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

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

    const status =
      body.status === "ACTIVE" || body.status === "INACTIVE"
        ? body.status
        : undefined;

    if (!machineTypeCode || !machineTypeName) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสและชื่อประเภทเครื่องจักร",
        },
        { status: 400 },
      );
    }

    const current = await prisma.machineType.findUnique({
      where: {
        machineTypeId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภทเครื่องจักรนี้",
        },
        { status: 404 },
      );
    }

    const duplicate = await prisma.machineType.findFirst({
      where: {
        machineTypeCode,
        NOT: {
          machineTypeId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเครื่องจักรนี้มีอยู่แล้ว",
        },
        { status: 409 },
      );
    }

    const updated = await prisma.machineType.update({
      where: {
        machineTypeId,
      },
      data: {
        machineTypeCode,
        machineTypeName,
        description: description || null,
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        status && status !== current.status
          ? "อัปเดตสถานะประเภทเครื่องจักรเรียบร้อยแล้ว"
          : "แก้ไขประเภทเครื่องจักรเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update machine type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขประเภทเครื่องจักรได้",
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

    const machineTypeId = Number(id);

    if (!Number.isInteger(machineTypeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสประเภทเครื่องจักรไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const machineType = await prisma.machineType.findUnique({
      where: {
        machineTypeId,
      },
      select: {
        machineTypeId: true,
        machineTypeCode: true,
        machineTypeName: true,
        _count: {
          select: {
            machines: true,
          },
        },
      },
    });

    if (!machineType) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภทเครื่องจักรนี้",
        },
        { status: 404 },
      );
    }

    if (machineType._count.machines > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${machineType.machineTypeName}" ได้ เนื่องจากมีเครื่องจักรใช้งานประเภทนี้อยู่ ${machineType._count.machines} เครื่อง`,
        },
        { status: 409 },
      );
    }

    await prisma.machineType.delete({
      where: {
        machineTypeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบประเภทเครื่องจักรเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete machine type error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบประเภทเครื่องจักรได้",
      },
      { status: 500 },
    );
  }
}