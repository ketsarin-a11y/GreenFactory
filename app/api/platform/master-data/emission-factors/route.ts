import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({
      orderBy: [
        { status: "asc" },
        { effectiveDate: "desc" },
      ],
      select: {
        factorId: true,
        scope: true,
        region: true,
        source: true,
        factor: true,
        factorUnit: true,
        effectiveDate: true,
        expiryDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        resourceType: {
          select: {
            resourceTypeId: true,
            resourceCode: true,
            resourceName: true,
            carbonCalculable: true,

            category: {
              select: {
                categoryId: true,
                categoryCode: true,
                categoryName: true,
              },
            },

            defaultUnit: {
              select: {
                unitId: true,
                unitCode: true,
                unitName: true,
                symbol: true,
              },
            },
          },
        },

        _count: {
          select: {
            carbonResults: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: factors.map((item) => ({
        factorId: item.factorId,

        resourceType: item.resourceType,

        scope: item.scope,
        region: item.region,
        source: item.source,

        factor: item.factor.toString(),
        factorUnit: item.factorUnit,

        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate,

        status: item.status,

        carbonResultCount: item._count.carbonResults,

        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get emission factors error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูล Emission Factor ได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    if (!Number.isFinite(numericFactor) || numericFactor < 0) {
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

    const emissionFactor =
      await prisma.emissionFactor.create({
        data: {
          resourceTypeId,

          scope: scope || null,
          region: region || null,
          source: source || null,

          factor,
          factorUnit,

          effectiveDate: effective,
          expiryDate: expiry,

          status: "ACTIVE",
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

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่ม Emission Factor เรียบร้อยแล้ว",
        data: {
          ...emissionFactor,
          factor: emissionFactor.factor.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create emission factor error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่ม Emission Factor ได้",
      },
      { status: 500 },
    );
  }
}