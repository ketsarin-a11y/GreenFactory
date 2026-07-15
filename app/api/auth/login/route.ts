import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
} from "@/lib/session";

type LoginBody = {
  companyCode?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
};

const ALLOWED_ROLES = [
  "PLATFORM_ADMIN",
  "COMPANY_ADMIN",
  "MANAGER",
  "OPERATOR",
] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function isAllowedRole(roleName: string): roleName is AllowedRole {
  return ALLOWED_ROLES.includes(roleName as AllowedRole);
}

function getRedirectPath(roleName: AllowedRole) {
  switch (roleName) {
    case "PLATFORM_ADMIN":
      return "/platform";

    case "COMPANY_ADMIN":
      return "/company";

    case "MANAGER":
      return "/manager";

    case "OPERATOR":
      return "/operator";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    const companyCode = body.companyCode?.trim().toUpperCase();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const rememberMe = Boolean(body.rememberMe);

    /*
     * ตรวจข้อมูลเบื้องต้น
     */
    if (!companyCode || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสองค์กร อีเมล และรหัสผ่าน",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * ค้นหาผู้ใช้จากอีเมล พร้อม Role และ Company
     */
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
        company: true,
      },
    });

    /*
     * ไม่ควรบอกตรง ๆ ว่าไม่พบอีเมล
     * เพื่อไม่ให้ผู้ไม่หวังดีตรวจสอบว่ามีบัญชีใดอยู่ในระบบ
     */
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ตรวจสถานะบัญชี
     */
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "บัญชีนี้ไม่สามารถใช้งานได้",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ตรวจว่าบัญชียังถูกล็อกอยู่หรือไม่
     */
    if (
      user.lockedUntil &&
      user.lockedUntil.getTime() > Date.now()
    ) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );

      return NextResponse.json(
        {
          success: false,
          message: `บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ในอีกประมาณ ${remainingMinutes} นาที`,
        },
        {
          status: 423,
        },
      );
    }

    const roleName = user.role.roleName;

    /*
     * ป้องกัน Role ที่ไม่รู้จัก
     */
    if (!isAllowedRole(roleName)) {
      return NextResponse.json(
        {
          success: false,
          message: "บัญชีนี้ไม่มีบทบาทที่รองรับในระบบ",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ตรวจรหัสองค์กร
     *
     * PLATFORM_ADMIN:
     * - ไม่มี companyId
     * - ใช้ PLATFORM_ACCESS_CODE จาก .env
     *
     * บทบาทอื่น:
     * - ต้องมี Company
     * - รหัสที่กรอกต้องตรงกับ companyCode ในฐานข้อมูล
     */
    if (roleName === "PLATFORM_ADMIN") {
      const platformAccessCode =
        process.env.PLATFORM_ACCESS_CODE?.trim().toUpperCase();

      if (!platformAccessCode) {
        console.error(
          "PLATFORM_ACCESS_CODE is not configured",
        );

        return NextResponse.json(
          {
            success: false,
            message: "ระบบยังไม่ได้ตั้งค่ารหัสผู้ดูแลแพลตฟอร์ม",
          },
          {
            status: 500,
          },
        );
      }

      if (companyCode !== platformAccessCode) {
        return NextResponse.json(
          {
            success: false,
            message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
          },
          {
            status: 401,
          },
        );
      }

      /*
       * Platform Admin ไม่ควรสังกัด Company
       */
      if (user.companyId !== null) {
        console.error(
          `Invalid PLATFORM_ADMIN company assignment: userId=${user.userId}`,
        );

        return NextResponse.json(
          {
            success: false,
            message: "โครงสร้างบัญชีผู้ดูแลแพลตฟอร์มไม่ถูกต้อง",
          },
          {
            status: 500,
          },
        );
      }
    } else {
      /*
       * Company Admin, Manager และ Operator
       * ต้องมี Company
       */
      if (!user.company || user.companyId === null) {
        return NextResponse.json(
          {
            success: false,
            message: "บัญชีนี้ยังไม่ได้ถูกกำหนดองค์กร",
          },
          {
            status: 403,
          },
        );
      }

      const actualCompanyCode =
        user.company.companyCode.trim().toUpperCase();

      if (companyCode !== actualCompanyCode) {
        return NextResponse.json(
          {
            success: false,
            message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
          },
          {
            status: 401,
          },
        );
      }
    }

    /*
     * ตรวจรหัสผ่านที่ Hash ด้วย bcrypt
     */
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      const failedLogin = user.failedLogin + 1;
      const shouldLock = failedLogin >= 5;

      await prisma.user.update({
        where: {
          userId: user.userId,
        },
        data: {
          failedLogin: shouldLock ? 0 : failedLogin,

          lockedUntil: shouldLock
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
        },
      });

      return NextResponse.json(
        {
          success: false,

          message: shouldLock
            ? "บัญชีถูกล็อก 15 นาที เนื่องจากกรอกรหัสผ่านผิดหลายครั้ง"
            : "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * Login สำเร็จ
     * รีเซ็ตจำนวนครั้งที่กรอกผิดและบันทึกเวลา Login ล่าสุด
     */
    await prisma.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        failedLogin: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    const sessionCompanyCode =
      roleName === "PLATFORM_ADMIN"
        ? null
        : user.company?.companyCode ?? null;

    /*
     * สร้าง JWT Session
     */
    const token = await createSessionToken(
      {
        userId: user.userId,
        email: user.email,
        roleName,
        companyId: user.companyId,
        companyCode: sessionCompanyCode,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      rememberMe,
    );

    /*
     * เก็บ Session ใน HttpOnly Cookie
     */
    await setSessionCookie(token, rememberMe);

    return NextResponse.json({
      success: true,
      redirectTo: getRedirectPath(roleName),
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "ระบบเข้าสู่ระบบเกิดข้อผิดพลาด กรุณาลองใหม่",
      },
      {
        status: 500,
      },
    );
  }
}