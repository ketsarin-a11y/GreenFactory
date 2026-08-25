import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["MANAGER", "OPERATOR"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

type CreateBody = {
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  factoryId?: number | null;
  departmentId?: number | null;
};

function isAllowedRole(value: string): value is AllowedRole {
  return ALLOWED_ROLES.includes(value as AllowedRole);
}

function formatLastLogin(value: Date | null) {
  if (!value) return "ยังไม่เคยเข้าสู่ระบบ";

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(value);
}

async function requireCompanyAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      ),
    };
  }

  if (session.roleName !== "COMPANY_ADMIN" || !session.companyId) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์จัดการผู้ใช้งานบริษัท" },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session };
}

async function validateScope(
  companyId: number,
  factoryId: number | null,
  departmentId: number | null,
) {
  if (!factoryId) {
    if (departmentId) {
      return { ok: false as const, message: "ต้องเลือกโรงงานก่อนเลือกแผนก" };
    }
    return { ok: true as const };
  }

  const factory = await prisma.factory.findFirst({
    where: { factoryId, companyId },
    select: { factoryId: true },
  });

  if (!factory) {
    return { ok: false as const, message: "โรงงานที่เลือกไม่ได้อยู่ในบริษัทนี้" };
  }

  if (!departmentId) return { ok: true as const };

  const department = await prisma.department.findFirst({
    where: {
      departmentId,
      building: {
        factoryId,
        factory: { companyId },
      },
    },
    select: { departmentId: true },
  });

  if (!department) {
    return { ok: false as const, message: "แผนกที่เลือกไม่ได้อยู่ในโรงงานนี้" };
  }

  return { ok: true as const };
}

async function makeUniqueUsername(email: string) {
  const base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
  let username = base;
  let suffix = 1;

  while (
    await prisma.user.findUnique({
      where: { username },
      select: { userId: true },
    })
  ) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
}

export async function GET() {
  try {
    const auth = await requireCompanyAdmin();
    if (!auth.ok) return auth.response;

    const companyId = auth.session.companyId;

    const [users, factories, departments] = await Promise.all([
      prisma.user.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        select: {
          userId: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          lastLogin: true,
          factoryId: true,
          departmentId: true,
          role: { select: { roleName: true } },
          factory: { select: { factoryName: true } },
          departmentRef: { select: { departmentName: true } },
        },
      }),
      prisma.factory.findMany({
        where: { companyId, status: "ACTIVE" },
        orderBy: { factoryName: "asc" },
        select: { factoryId: true, factoryCode: true, factoryName: true },
      }),
      prisma.department.findMany({
        where: {
          status: "ACTIVE",
          building: { factory: { companyId } },
        },
        orderBy: { departmentName: "asc" },
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true,
          building: {
            select: { factoryId: true, buildingName: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user.userId,
        employeeCode: user.employeeCode ?? "-",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.roleName,
        factoryId: user.factoryId,
        factoryName: user.factory?.factoryName ?? "ยังไม่กำหนด",
        departmentId: user.departmentId,
        department:
          user.departmentRef?.departmentName ??
          (user.role.roleName === "COMPANY_ADMIN" ? "ผู้บริหารบริษัท" : "ยังไม่กำหนด"),
        status: user.status,
        lastLogin: formatLastLogin(user.lastLogin),
      })),
      options: {
        factories,
        departments: departments.map((department) => ({
          departmentId: department.departmentId,
          departmentCode: department.departmentCode,
          departmentName: department.departmentName,
          factoryId: department.building.factoryId,
          buildingName: department.building.buildingName,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/company/users failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "ไม่สามารถโหลดผู้ใช้งานได้",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireCompanyAdmin();
    if (!auth.ok) return auth.response;

    const companyId = auth.session.companyId;
    const body = (await request.json()) as CreateBody;

    const employeeCode = body.employeeCode?.trim().toUpperCase() ?? "";
    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const roleName = body.role?.trim().toUpperCase() ?? "";
    const factoryId = body.factoryId ? Number(body.factoryId) : null;
    const departmentId = body.departmentId ? Number(body.departmentId) : null;

    if (!employeeCode || !firstName || !lastName || !email || !password || !roleName) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" },
        { status: 400 },
      );
    }

    if (!isAllowedRole(roleName)) {
      return NextResponse.json(
        { success: false, message: "Company Admin สร้างได้เฉพาะ Manager หรือ Operator" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
        { status: 400 },
      );
    }

    if (!factoryId) {
      return NextResponse.json(
        { success: false, message: "Manager และ Operator ต้องสังกัดโรงงาน" },
        { status: 400 },
      );
    }

    if (roleName === "OPERATOR" && !departmentId) {
      return NextResponse.json(
        { success: false, message: "Operator ต้องกำหนดแผนก" },
        { status: 400 },
      );
    }

    const scope = await validateScope(companyId, factoryId, departmentId);
    if (!scope.ok) {
      return NextResponse.json(
        { success: false, message: scope.message },
        { status: 400 },
      );
    }

    const [duplicateEmail, duplicateEmployee, role] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { userId: true } }),
      prisma.user.findFirst({
        where: { companyId, employeeCode },
        select: { userId: true },
      }),
      prisma.role.findFirst({
        where: {
          OR: [{ roleName }, { roleCode: roleName }],
          status: "ACTIVE",
        },
        select: { roleId: true },
      }),
    ]);

    if (duplicateEmail) {
      return NextResponse.json(
        { success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว" },
        { status: 409 },
      );
    }

    if (duplicateEmployee) {
      return NextResponse.json(
        { success: false, message: "รหัสพนักงานนี้มีอยู่ในบริษัทแล้ว" },
        { status: 409 },
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, message: `ไม่พบ Role ${roleName} ในระบบ` },
        { status: 400 },
      );
    }

    const [passwordHash, username] = await Promise.all([
      bcrypt.hash(password, 12),
      makeUniqueUsername(email),
    ]);

    const user = await prisma.user.create({
      data: {
        companyId,
        factoryId,
        departmentId,
        roleId: role.roleId,
        employeeCode,
        firstName,
        lastName,
        email,
        username,
        passwordHash,
        status: "ACTIVE",
      },
      select: { userId: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มผู้ใช้งานเรียบร้อยแล้ว",
        data: { id: user.userId },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/company/users failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "ไม่สามารถเพิ่มผู้ใช้งานได้",
      },
      { status: 500 },
    );
  }
}
