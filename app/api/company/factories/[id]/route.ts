import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateFactoryBody = {
  factoryCode?: string;
  factoryName?: string;
  address?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapUrl?: string;
  mapZoom?: number | null;
  phone?: string;
  email?: string;
  timezone?: string;
  status?: "ACTIVE" | "INACTIVE";
};

async function requireCompanyAdmin() {
  const session = await getSession();

  if (!session || session.roleName !== "COMPANY_ADMIN" || !session.companyId) {
    return null;
  }

  return session;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireCompanyAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์จัดการข้อมูลโรงงาน" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const factoryId = Number(id);

    if (!Number.isInteger(factoryId)) {
      return NextResponse.json(
        { success: false, message: "Factory ID ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const current = await prisma.factory.findFirst({
      where: {
        factoryId,
        companyId: session.companyId,
      },
      select: {
        factoryId: true,
        factoryCode: true,
      },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, message: "ไม่พบโรงงานในบริษัทนี้" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as UpdateFactoryBody;

    const factoryCode =
      body.factoryCode === undefined
        ? undefined
        : body.factoryCode.trim().toUpperCase();

    if (factoryCode !== undefined && !factoryCode) {
      return NextResponse.json(
        { success: false, message: "รหัสโรงงานต้องไม่เป็นค่าว่าง" },
        { status: 400 },
      );
    }

    if (body.factoryName !== undefined && !body.factoryName.trim()) {
      return NextResponse.json(
        { success: false, message: "ชื่อโรงงานต้องไม่เป็นค่าว่าง" },
        { status: 400 },
      );
    }

    if (factoryCode && factoryCode !== current.factoryCode) {
      const duplicate = await prisma.factory.findFirst({
        where: {
          companyId: session.companyId,
          factoryCode,
          NOT: { factoryId },
        },
        select: { factoryId: true },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "รหัสโรงงานนี้มีอยู่ในบริษัทแล้ว" },
          { status: 409 },
        );
      }
    }

    if (body.status !== undefined && !["ACTIVE", "INACTIVE"].includes(body.status)) {
      return NextResponse.json(
        { success: false, message: "สถานะโรงงานไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const latitude =
      body.latitude === undefined ? undefined : toNumber(body.latitude);

    const longitude =
      body.longitude === undefined ? undefined : toNumber(body.longitude);

    if (
      latitude !== undefined &&
      latitude !== null &&
      (latitude < -90 || latitude > 90)
    ) {
      return NextResponse.json(
        { success: false, message: "Latitude ต้องอยู่ระหว่าง -90 ถึง 90" },
        { status: 400 },
      );
    }

    if (
      longitude !== undefined &&
      longitude !== null &&
      (longitude < -180 || longitude > 180)
    ) {
      return NextResponse.json(
        { success: false, message: "Longitude ต้องอยู่ระหว่าง -180 ถึง 180" },
        { status: 400 },
      );
    }

    await prisma.factory.update({
      where: { factoryId },
      data: {
        ...(factoryCode !== undefined && { factoryCode }),
        ...(body.factoryName !== undefined && {
          factoryName: body.factoryName.trim(),
        }),
        ...(body.address !== undefined && {
          address: body.address.trim() || null,
        }),
        ...(body.province !== undefined && {
          province: body.province.trim() || null,
        }),
        ...(body.postalCode !== undefined && {
          postalCode: body.postalCode.trim() || null,
        }),
        ...(body.country !== undefined && {
          country: body.country.trim() || null,
        }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(body.googleMapUrl !== undefined && {
          googleMapUrl: body.googleMapUrl.trim() || null,
        }),
        ...(body.mapZoom !== undefined && { mapZoom: body.mapZoom }),
        ...(body.phone !== undefined && {
          phone: body.phone.trim() || null,
        }),
        ...(body.email !== undefined && {
          email: body.email.trim().toLowerCase() || null,
        }),
        ...(body.timezone !== undefined && {
          timezone: body.timezone.trim() || null,
        }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลโรงงานเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("PATCH /api/company/factories/[id] failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "ไม่สามารถแก้ไขข้อมูลโรงงานได้",
      },
      { status: 500 },
    );
  }
}
