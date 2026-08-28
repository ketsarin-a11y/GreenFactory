import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

const STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;

function parseId(value: string) {
  const id = Number(value);

  return Number.isInteger(id) && id > 0
    ? id
    : null;
}

export async function GET(
  _request: Request,
  context: Context,
) {
  try {
    const { id } = await context.params;
    const factoryId = parseId(id);

    if (!factoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสโรงงานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const factory = await prisma.factory.findUnique({
      where: {
        factoryId,
      },
      select: {
        factoryId: true,
        companyId: true,
        factoryCode: true,
        factoryName: true,

        address: true,
        province: true,
        postalCode: true,
        country: true,

        latitude: true,
        longitude: true,
        googleMapUrl: true,
        mapZoom: true,
        layoutImagePath: true,

        phone: true,
        email: true,
        timezone: true,
        status: true,

        createdAt: true,
        updatedAt: true,

        company: {
          select: {
            companyId: true,
            companyCode: true,
            companyName: true,
          },
        },

        buildings: {
          orderBy: {
            buildingName: "asc",
          },
          select: {
            buildingId: true,
            buildingCode: true,
            buildingName: true,
            buildingType: true,
            floorCount: true,
            status: true,
          },
        },

        _count: {
          select: {
            buildings: true,
            users: true,
            resourceUsages: true,
          },
        },
      },
    });

    if (!factory) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลโรงงาน",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...factory,
        latitude:
          factory.latitude?.toString() ?? null,
        longitude:
          factory.longitude?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error(
      "Get factory detail error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลโรงงานได้",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const { id } = await context.params;
    const factoryId = parseId(id);

    if (!factoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสโรงงานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (
      typeof body.status !== "string" ||
      !STATUSES.includes(
        body.status as (typeof STATUSES)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "สถานะโรงงานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const exists =
      await prisma.factory.findUnique({
        where: {
          factoryId,
        },
        select: {
          factoryId: true,
        },
      });

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบโรงงานนี้",
        },
        { status: 404 },
      );
    }

    await prisma.factory.update({
      where: {
        factoryId,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        body.status === "ACTIVE"
          ? "เปิดใช้งานโรงงานเรียบร้อยแล้ว"
          : body.status === "INACTIVE"
            ? "ปิดใช้งานโรงงานเรียบร้อยแล้ว"
            : "ระงับการใช้งานโรงงานเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "Update factory status error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถเปลี่ยนสถานะโรงงานได้",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: Context,
) {
  try {
    const { id } = await context.params;
    const factoryId = parseId(id);

    if (!factoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสโรงงานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const factory =
      await prisma.factory.findUnique({
        where: {
          factoryId,
        },
        select: {
          factoryName: true,
          _count: {
            select: {
              buildings: true,
              users: true,
              resourceUsages: true,
            },
          },
        },
      });

    if (!factory) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบโรงงานนี้",
        },
        { status: 404 },
      );
    }

    const related =
      factory._count.buildings +
      factory._count.users +
      factory._count.resourceUsages;

    if (related > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${factory.factoryName}" ได้ เพราะมีข้อมูลอ้างอิงอยู่ ${related} รายการ กรุณาระงับใช้งานแทน`,
        },
        { status: 409 },
      );
    }

    await prisma.factory.delete({
      where: {
        factoryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบโรงงานเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(
      "Delete factory error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบโรงงานได้",
      },
      { status: 500 },
    );
  }
}