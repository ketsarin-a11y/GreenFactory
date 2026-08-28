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
    const factorId = Number(id);

    if (!Number.isInteger(factorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัส Emission Factor ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await prisma.emissionFactor.findUnique({
      where: {
        factorId,
      },
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบ Emission Factor นี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    // เปลี่ยนสถานะอย่างเดียว
    if (
      body.status !== undefined &&
      body.resourceTypeId === undefined &&
      body.scope === undefined &&
      body.region === undefined &&
      body.source === undefined &&
      body.factor === undefined &&
      body.factorUnit === undefined &&
      body.effectiveDate === undefined &&
      body.expiryDate === undefined
    ) {
      if (
        body.status !== "ACTIVE" &&
        body.status !== "INACTIVE"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "สถานะไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      const updated = await prisma.emissionFactor.update({
        where: {
          factorId,
        },
        data: {
          status: body.status,
        },
      });

      return NextResponse.json({
        success: true,
        message:
          body.status === "ACTIVE"
            ? "เปิดใช้งาน Emission Factor เรียบร้อยแล้ว"
            : "ปิดใช้งาน Emission Factor เรียบร้อยแล้ว",
        data: {
          ...updated,
          factor: updated.factor.toString(),
        },
      });
    }

    const resourceTypeId = Number(body.resourceTypeId);

    const scope =
      typeof body.scope === "string"
        ? body.scope.trim()
        : "";

    const region =
      typeof body.region === "string"
        ? body.region.trim()
        : "";

    const source =
      typeof body.source === "string"
        ? body.source.trim()
        : "";

    const factor =
      typeof body.factor === "string" ||
      typeof body.factor === "number"
        ? String(body.factor).trim()
        : "";

    const factorUnit =
      typeof body.factorUnit === "string"
        ? body.factorUnit.trim()
        : "";

    const effectiveDate =
      typeof body.effectiveDate === "string"
        ? body.effectiveDate.trim()
        : "";

    const expiryDate =
      typeof body.expiryDate === "string"
        ? body.expiryDate.trim()
        : "";

    if (
      !Number.isInteger(resourceTypeId) ||
      !factor ||
      !factorUnit ||
      !effectiveDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูล Emission Factor ให้ครบ",
        },
        { status: 400 },
      );
    }

    const numericFactor = Number(factor);

    if (
      !Number.isFinite(numericFactor) ||
      numericFactor < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ค่า Emission Factor ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const resourceType =
      await prisma.resourceTypeMaster.findUnique({
        where: {
          resourceTypeId,
        },
      });

    if (!resourceType) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบประเภททรัพยากรที่เลือก",
        },
        { status: 404 },
      );
    }

    if (resourceType.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "ประเภททรัพยากรที่เลือกไม่ได้เปิดใช้งาน",
        },
        { status: 400 },
      );
    }

    if (!resourceType.carbonCalculable) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ประเภททรัพยากรนี้ไม่ได้เปิดให้คำนวณคาร์บอน",
        },
        { status: 400 },
      );
    }

    const effective = new Date(effectiveDate);

    if (Number.isNaN(effective.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "วันที่เริ่มใช้งานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    let expiry: Date | null = null;

    if (expiryDate) {
      expiry = new Date(expiryDate);

      if (Number.isNaN(expiry.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: "วันที่สิ้นสุดไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      if (expiry < effective) {
        return NextResponse.json(
          {
            success: false,
            message:
              "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มใช้งาน",
          },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.emissionFactor.update({
      where: {
        factorId,
      },
      data: {
        resourceTypeId,
        scope: scope || null,
        region: region || null,
        source: source || null,
        factor,
        factorUnit,
        effectiveDate: effective,
        expiryDate: expiry,
      },
      include: {
        resourceType: {
          include: {
            category: true,
            defaultUnit: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไข Emission Factor เรียบร้อยแล้ว",
      data: {
        ...updated,
        factor: updated.factor.toString(),
      },
    });
  } catch (error) {
    console.error("Update emission factor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไข Emission Factor ได้",
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
    const factorId = Number(id);

    if (!Number.isInteger(factorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัส Emission Factor ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const factor = await prisma.emissionFactor.findUnique({
      where: {
        factorId,
      },
      select: {
        factorId: true,
        factor: true,
        factorUnit: true,
        resourceType: {
          select: {
            resourceName: true,
          },
        },
        _count: {
          select: {
            carbonResults: true,
          },
        },
      },
    });

    if (!factor) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบ Emission Factor นี้",
        },
        { status: 404 },
      );
    }

    if (factor._count.carbonResults > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ Emission Factor ของ "${factor.resourceType.resourceName}" ได้ เนื่องจากมี Carbon Result อ้างอิงอยู่ ${factor._count.carbonResults} รายการ`,
        },
        { status: 409 },
      );
    }

    await prisma.emissionFactor.delete({
      where: {
        factorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ลบ Emission Factor เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete emission factor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบ Emission Factor ได้",
      },
      { status: 500 },
    );
  }
}