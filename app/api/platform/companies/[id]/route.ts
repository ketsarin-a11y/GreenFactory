import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = ["ACTIVE", "PENDING", "SUSPENDED"] as const;
const ALLOWED_PLANS = ["TRIAL", "STANDARD", "ENTERPRISE"] as const;

function parseCompanyId(value: string) {
  const companyId = Number(value);

  return Number.isInteger(companyId) && companyId > 0
    ? companyId
    : null;
}

const COMPANY_AUDIT_SELECT = {
  companyId: true,
  companyCode: true,
  companyName: true,
  taxId: true,
  industryType: true,
  address: true,
  province: true,
  postalCode: true,
  country: true,
  phone: true,
  email: true,
  website: true,
  logoPath: true,
  subscriptionPlan: true,
  carbonStandard: true,
  timezone: true,
  currency: true,
  language: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const companyId = parseCompanyId(id);

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสบริษัทไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { companyId },
      select: {
        ...COMPANY_AUDIT_SELECT,
        factories: {
          orderBy: { createdAt: "desc" },
          select: {
            factoryId: true,
            factoryCode: true,
            factoryName: true,
            province: true,
            status: true,
          },
        },
        users: {
          orderBy: [
            { lastLogin: "desc" },
            { createdAt: "desc" },
          ],
          take: 20,
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            lastLogin: true,
            role: {
              select: {
                roleName: true,
              },
            },
          },
        },
        _count: {
          select: {
            factories: true,
            users: true,
            resourceUsages: true,
            equipment: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบริษัทนี้",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Get company detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถโหลดรายละเอียดบริษัทได้",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const companyId = parseCompanyId(id);

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสบริษัทไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const current = await prisma.company.findUnique({
      where: { companyId },
      select: COMPANY_AUDIT_SELECT,
    });

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const data: {
      companyCode?: string;
      companyName?: string;
      taxId?: string | null;
      industryType?: string | null;
      address?: string | null;
      province?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      logoPath?: string | null;
      subscriptionPlan?: string | null;
      carbonStandard?: string | null;
      timezone?: string | null;
      currency?: string | null;
      language?: string | null;
      status?: string;
    } = {};

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !ALLOWED_STATUSES.includes(
          body.status as (typeof ALLOWED_STATUSES)[number],
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "สถานะบริษัทไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      data.status = body.status;
    }

    if (body.code !== undefined) {
      const companyCode =
        typeof body.code === "string"
          ? body.code.trim().toUpperCase()
          : "";

      if (!companyCode) {
        return NextResponse.json(
          {
            success: false,
            message: "รหัสบริษัทไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      const duplicate = await prisma.company.findFirst({
        where: {
          companyCode,
          NOT: { companyId },
        },
        select: { companyId: true },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "รหัสบริษัทนี้มีอยู่แล้ว",
          },
          { status: 409 },
        );
      }

      data.companyCode = companyCode;
    }

    if (body.name !== undefined) {
      const companyName =
        typeof body.name === "string" ? body.name.trim() : "";

      if (!companyName) {
        return NextResponse.json(
          {
            success: false,
            message: "ชื่อบริษัทไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      data.companyName = companyName;
    }

    if (body.email !== undefined) {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

      if (email) {
        const duplicate = await prisma.company.findFirst({
          where: {
            email,
            NOT: { companyId },
          },
          select: { companyId: true },
        });

        if (duplicate) {
          return NextResponse.json(
            {
              success: false,
              message: "อีเมลบริษัทนี้มีอยู่แล้ว",
            },
            { status: 409 },
          );
        }
      }

      data.email = email || null;
    }

    const nullableStringFields = [
      ["taxId", "taxId"],
      ["industry", "industryType"],
      ["address", "address"],
      ["province", "province"],
      ["postalCode", "postalCode"],
      ["country", "country"],
      ["phone", "phone"],
      ["website", "website"],
      ["logoPath", "logoPath"],
      ["carbonStandard", "carbonStandard"],
      ["timezone", "timezone"],
      ["currency", "currency"],
      ["language", "language"],
    ] as const;

    for (const [bodyKey, dataKey] of nullableStringFields) {
      if (body[bodyKey] !== undefined) {
        const value =
          typeof body[bodyKey] === "string"
            ? body[bodyKey].trim()
            : "";

        data[dataKey] = value || null;
      }
    }

    if (body.plan !== undefined) {
      if (
        typeof body.plan !== "string" ||
        !ALLOWED_PLANS.includes(
          body.plan as (typeof ALLOWED_PLANS)[number],
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "แพ็กเกจบริษัทไม่ถูกต้อง",
          },
          { status: 400 },
        );
      }

      data.subscriptionPlan = body.plan;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูลที่ต้องการแก้ไข",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.company.update({
      where: { companyId },
      data,
      select: COMPANY_AUDIT_SELECT,
    });

    await writeAuditLog({
      request,
      tableName: "company",
      recordId: companyId,
      action: "UPDATE",
      oldData: current,
      newData: updated,
    });

    return NextResponse.json({
      success: true,
      message:
        data.status !== undefined &&
        Object.keys(data).length === 1
          ? data.status === "ACTIVE"
            ? "เปิดใช้งานบริษัทเรียบร้อยแล้ว"
            : data.status === "PENDING"
              ? "เปลี่ยนบริษัทเป็นสถานะรอตรวจสอบแล้ว"
              : "ระงับการใช้งานบริษัทเรียบร้อยแล้ว"
          : "แก้ไขข้อมูลบริษัทเรียบร้อยแล้ว",
      data: updated,
    });
  } catch (error) {
    console.error("Update company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถแก้ไขข้อมูลบริษัทได้",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const companyId = parseCompanyId(id);

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสบริษัทไม่ถูกต้อง",
        },
        { status: 400 },
      );
    }

    const company = await prisma.company.findUnique({
      where: { companyId },
      select: {
        ...COMPANY_AUDIT_SELECT,
        _count: {
          select: {
            factories: true,
            users: true,
            resourceUsages: true,
            equipment: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบบริษัทนี้",
        },
        { status: 404 },
      );
    }

    const relatedCount =
      company._count.factories +
      company._count.users +
      company._count.resourceUsages +
      company._count.equipment;

    if (relatedCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `ไม่สามารถลบ "${company.companyName}" ได้ เนื่องจากมีข้อมูลอ้างอิงอยู่ ${relatedCount} รายการ กรุณาระงับการใช้งานแทน`,
          details: {
            factoryCount: company._count.factories,
            userCount: company._count.users,
            resourceUsageCount:
              company._count.resourceUsages,
            legacyEquipmentCount:
              company._count.equipment,
          },
        },
        { status: 409 },
      );
    }

    const { _count, ...oldCompanyData } = company;

    await prisma.company.delete({
      where: { companyId },
    });

    await writeAuditLog({
      request,
      tableName: "company",
      recordId: companyId,
      action: "DELETE",
      oldData: oldCompanyData,
    });

    return NextResponse.json({
      success: true,
      message: "ลบบริษัทเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Delete company error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ไม่สามารถลบบริษัทได้",
      },
      { status: 500 },
    );
  }
}