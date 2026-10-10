import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

    const scope = normalizeText(body.scope).toUpperCase();
    const region = normalizeText(body.region);
    const source = normalizeText(body.source);

    const factorRaw =
      typeof body.factor === "string" ||
      typeof body.factor === "number"
        ? String(body.factor).trim()
        : "";

    const factorUnit = normalizeText(body.factorUnit);

    const effectiveDate = normalizeText(body.effectiveDate);
    const expiryDate = normalizeText(body.expiryDate);

    if (
      !Number.isInteger(resourceTypeId) ||
      resourceTypeId <= 0 ||
      !factorRaw ||
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

    const numericFactor = Number(factorRaw);

    if (!Number.isFinite(numericFactor) || numericFactor < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ค่า Emission Factor ไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    if (factorUnit.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "หน่วยของ Emission Factor ต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (scope.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Scope ต้องไม่เกิน 30 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (region.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Region ต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    if (source.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: "Source ต้องไม่เกิน 255 ตัวอักษร",
        },
        { status: 400 },
      );
    }

    const effective = parseDateOnly(effectiveDate);

    if (!effective) {
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
      expiry = parseDateOnly(expiryDate);

      if (!expiry) {
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

    const resourceType =
      await prisma.resourceTypeMaster.findUnique({
        where: {
          resourceTypeId,
        },
        select: {
          resourceTypeId: true,
          resourceCode: true,
          resourceName: true,
          carbonCalculable: true,
          status: true,
          defaultUnit: {
            select: {
              unitCode: true,
              unitName: true,
              symbol: true,
            },
          },
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
          message:
            "ประเภททรัพยากรที่เลือกไม่ได้เปิดใช้งาน",
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

    /*
     * ป้องกันการสร้าง Factor ซ้ำแบบวันเริ่มใช้งานเดียวกัน
     * สำหรับ Resource + Scope + Region เดียวกัน
     *
     * ยังอนุญาตให้มีหลายเวอร์ชันตามช่วงเวลาได้
     */
    const existingFactor =
      await prisma.emissionFactor.findFirst({
        where: {
          resourceTypeId,
          effectiveDate: effective,
          scope: scope || null,
          region: region || null,
        },
        select: {
          factorId: true,
          status: true,
          factor: true,
          factorUnit: true,
        },
      });

    if (existingFactor) {
      if (existingFactor.status !== "ACTIVE") {
        const reactivated =
          await prisma.emissionFactor.update({
            where: {
              factorId: existingFactor.factorId,
            },
            data: {
              factor: numericFactor,
              factorUnit,
              scope: scope || null,
              region: region || null,
              source: source || null,
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
            reactivated: true,
            message:
              "นำ Emission Factor เดิมกลับมาใช้งานแล้ว",
            data: {
              ...reactivated,
              factor: reactivated.factor.toString(),
            },
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "มี Emission Factor ของทรัพยากรนี้ใน Scope / Region / วันที่เริ่มใช้งานเดียวกันแล้ว",
        },
        { status: 409 },
      );
    }

    /*
     * ตรวจช่วงเวลาทับซ้อนกับ Factor ACTIVE เดิม
     * ของ Resource + Scope + Region เดียวกัน
     *
     * ถ้ามีช่วงเดิมที่ยังครอบคลุมวันเริ่มของ Factor ใหม่
     * ให้ผู้ใช้ปิด/กำหนด expiry ของตัวเดิมก่อน
     */
    const overlappingFactor =
      await prisma.emissionFactor.findFirst({
        where: {
          resourceTypeId,
          status: "ACTIVE",
          scope: scope || null,
          region: region || null,
          effectiveDate: {
            lte: effective,
          },
          OR: [
            {
              expiryDate: null,
            },
            {
              expiryDate: {
                gte: effective,
              },
            },
          ],
        },
        select: {
          factorId: true,
          effectiveDate: true,
          expiryDate: true,
        },
      });

    if (overlappingFactor) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ช่วงเวลาของ Emission Factor ใหม่นี้ทับซ้อนกับ Factor ที่ใช้งานอยู่ กรุณากำหนดวันสิ้นสุดของ Factor เดิมก่อน",
        },
        { status: 409 },
      );
    }

    const emissionFactor =
      await prisma.emissionFactor.create({
        data: {
          resourceTypeId,
          scope: scope || null,
          region: region || null,
          source: source || null,
          factor: numericFactor,
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
        message:
          "เพิ่ม Emission Factor เรียบร้อยแล้ว",
        data: {
          ...emissionFactor,
          factor: emissionFactor.factor.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create emission factor error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "ไม่สามารถเพิ่ม Emission Factor ได้",
      },
      { status: 500 },
    );
  }
}
