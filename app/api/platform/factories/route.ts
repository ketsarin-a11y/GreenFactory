import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function decimalOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "ALL";
    const companyIdRaw = searchParams.get("companyId")?.trim() ?? "";

    const page = positiveInt(searchParams.get("page"), 1);
    const pageSize = Math.min(
      positiveInt(searchParams.get("pageSize"), 8),
      100,
    );

    const companyId =
      companyIdRaw && Number.isInteger(Number(companyIdRaw))
        ? Number(companyIdRaw)
        : null;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { factoryCode: { contains: search } },
                { factoryName: { contains: search } },
                { province: { contains: search } },
                { email: { contains: search } },
                { company: { companyName: { contains: search } } },
                { company: { companyCode: { contains: search } } },
              ],
            }
          : {},
        status !== "ALL" ? { status } : {},
        companyId ? { companyId } : {},
      ],
    };

    const [
      factories,
      totalItems,
      totalFactories,
      activeFactories,
      inactiveFactories,
      suspendedFactories,
      totalBuildings,
      totalUsers,
    ] = await Promise.all([
      prisma.factory.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          factoryId: true,
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
          _count: {
            select: {
              buildings: true,
              users: true,
              resourceUsages: true,
            },
          },
        },
      }),
      prisma.factory.count({ where }),
      prisma.factory.count(),
      prisma.factory.count({ where: { status: "ACTIVE" } }),
      prisma.factory.count({ where: { status: "INACTIVE" } }),
      prisma.factory.count({ where: { status: "SUSPENDED" } }),
      prisma.building.count(),
      prisma.user.count({ where: { factoryId: { not: null } } }),
    ]);

    return NextResponse.json({
      success: true,
      data: factories.map((factory) => ({
        id: factory.factoryId,
        code: factory.factoryCode,
        name: factory.factoryName,
        company: factory.company,
        address: factory.address ?? "",
        province: factory.province ?? "",
        postalCode: factory.postalCode ?? "",
        country: factory.country ?? "Thailand",
        latitude: factory.latitude?.toString() ?? null,
        longitude: factory.longitude?.toString() ?? null,
        googleMapUrl: factory.googleMapUrl ?? "",
        mapZoom: factory.mapZoom ?? 17,
        layoutImagePath: factory.layoutImagePath ?? null,
        phone: factory.phone ?? "",
        email: factory.email ?? "",
        timezone: factory.timezone ?? "Asia/Bangkok",
        status: factory.status,
        buildings: factory._count.buildings,
        users: factory._count.users,
        resourceUsages: factory._count.resourceUsages,
        createdAt: factory.createdAt.toISOString(),
        updatedAt: factory.updatedAt.toISOString(),
      })),
      summary: {
        totalFactories,
        activeFactories,
        inactiveFactories,
        suspendedFactories,
        totalBuildings,
        totalUsers,
      },
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    });
  } catch (error) {
    console.error("Get factories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดข้อมูลโรงงานได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const companyId = Number(body.companyId);
    const factoryCode =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";
    const factoryName =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (
      !Number.isInteger(companyId) ||
      companyId <= 0 ||
      !factoryCode ||
      !factoryName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเลือกบริษัทและกรอกรหัสกับชื่อโรงงานให้ครบ",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { companyId },
      select: {
        companyId: true,
        status: true,
        _count: {
          select: {
            factories: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบริษัทที่เลือก",
        },
        { status: 404 },
      );
    }

    if (company.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "บริษัทที่เลือกไม่ได้เปิดใช้งาน",
        },
        { status: 400 },
      );
    }

    if (company._count.factories > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ช่วงเดโมกำหนดให้หนึ่งบริษัทมีโรงงานหลักหนึ่งแห่ง บริษัทนี้มีโรงงานแล้ว",
        },
        { status: 409 },
      );
    }

    const duplicate = await prisma.factory.findFirst({
      where: {
        companyId,
        factoryCode,
      },
      select: {
        factoryId: true,
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสโรงงานนี้มีอยู่แล้วในบริษัท",
        },
        { status: 409 },
      );
    }

    const latitude = decimalOrNull(body.latitude);
    const longitude = decimalOrNull(body.longitude);

    if (
      (body.latitude && latitude === null) ||
      (body.longitude && longitude === null)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ค่าพิกัดโรงงานไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const factory = await prisma.factory.create({
      data: {
        companyId,
        factoryCode,
        factoryName,
        address: body.address?.trim() || null,
        province: body.province?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
        country: body.country?.trim() || "Thailand",
        latitude,
        longitude,
        googleMapUrl: body.googleMapUrl?.trim() || null,
        mapZoom: 17,
        phone: body.phone?.trim() || null,
        email: body.email?.trim().toLowerCase() || null,
        timezone: body.timezone?.trim() || "Asia/Bangkok",
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มโรงงานเรียบร้อยแล้ว",
        data: factory,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create factory error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถเพิ่มโรงงานได้",
      },
      { status: 500 },
    );
  }
}
