import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createLoginLog } from "@/lib/login-log";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";

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

    if (!companyCode || !email || !password) {
      await createLoginLog({
        request,
        attemptedEmail: email ?? null,
        loginStatus: "FAILED",
        failureReason: "MISSING_CREDENTIALS",
      });

      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกรหัสองค์กร อีเมล และรหัสผ่าน",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
        company: true,
        factory: true,
      },
    });

    if (!user) {
      await createLoginLog({
        request,
        attemptedEmail: email,
        loginStatus: "FAILED",
        failureReason: "INVALID_CREDENTIALS",
      });

      return NextResponse.json(
        {
          success: false,
          message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        },
        { status: 401 },
      );
    }

    if (user.status !== "ACTIVE") {
      await createLoginLog({
        request,
        userId: user.userId,
        attemptedEmail: email,
        loginStatus: "FAILED",
        failureReason: "ACCOUNT_INACTIVE",
      });

      return NextResponse.json(
        {
          success: false,
          message: "บัญชีนี้ไม่สามารถใช้งานได้",
        },
        { status: 403 },
      );
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );

      await createLoginLog({
        request,
        userId: user.userId,
        attemptedEmail: email,
        loginStatus: "FAILED",
        failureReason: "ACCOUNT_LOCKED",
      });

      return NextResponse.json(
        {
          success: false,
          message: `บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ในอีกประมาณ ${remainingMinutes} นาที`,
        },
        { status: 423 },
      );
    }

    const roleName = user.role.roleName;

    if (!isAllowedRole(roleName)) {
      await createLoginLog({
        request,
        userId: user.userId,
        attemptedEmail: email,
        loginStatus: "FAILED",
        failureReason: "UNSUPPORTED_ROLE",
      });

      return NextResponse.json(
        {
          success: false,
          message: "บัญชีนี้ไม่มีบทบาทที่รองรับในระบบ",
        },
        { status: 403 },
      );
    }

    /*
     * ============================================================
     * PLATFORM ADMIN
     * ============================================================
     *
     * PLATFORM_ADMIN:
     * - ไม่สังกัดบริษัท
     * - ไม่สังกัดโรงงาน
     * - ใช้ PLATFORM_ACCESS_CODE สำหรับเข้าสู่ระบบ
     */
    if (roleName === "PLATFORM_ADMIN") {
      const platformAccessCode =
        process.env.PLATFORM_ACCESS_CODE?.trim().toUpperCase();

      if (!platformAccessCode) {
        console.error("PLATFORM_ACCESS_CODE is not configured");

        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "PLATFORM_ACCESS_CODE_NOT_CONFIGURED",
        });

        return NextResponse.json(
          {
            success: false,
            message: "ระบบยังไม่ได้ตั้งค่ารหัสผู้ดูแลแพลตฟอร์ม",
          },
          { status: 500 },
        );
      }

      if (companyCode !== platformAccessCode) {
        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "INVALID_PLATFORM_CODE",
        });

        return NextResponse.json(
          {
            success: false,
            message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
          },
          { status: 401 },
        );
      }

      if (user.companyId !== null) {
        console.error(
          `Invalid PLATFORM_ADMIN company assignment: userId=${user.userId}`,
        );

        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "INVALID_PLATFORM_ADMIN_ASSIGNMENT",
        });

        return NextResponse.json(
          {
            success: false,
            message: "โครงสร้างบัญชีผู้ดูแลแพลตฟอร์มไม่ถูกต้อง",
          },
          { status: 500 },
        );
      }

      if (user.factoryId !== null) {
        console.error(
          `Invalid PLATFORM_ADMIN factory assignment: userId=${user.userId}`,
        );

        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "INVALID_PLATFORM_ADMIN_FACTORY_ASSIGNMENT",
        });

        return NextResponse.json(
          {
            success: false,
            message: "โครงสร้างโรงงานของบัญชีผู้ดูแลแพลตฟอร์มไม่ถูกต้อง",
          },
          { status: 500 },
        );
      }
    } else {
      /*
       * ============================================================
       * COMPANY USERS
       * ============================================================
       *
       * COMPANY_ADMIN / MANAGER / OPERATOR
       * ทุกคนต้องสังกัดบริษัท
       */

      if (!user.company || user.companyId === null) {
        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "NO_COMPANY",
        });

        return NextResponse.json(
          {
            success: false,
            message: "บัญชีนี้ยังไม่ได้ถูกกำหนดองค์กร",
          },
          { status: 403 },
        );
      }

      const actualCompanyCode =
        user.company.companyCode.trim().toUpperCase();

      if (companyCode !== actualCompanyCode) {
        await createLoginLog({
          request,
          userId: user.userId,
          attemptedEmail: email,
          loginStatus: "FAILED",
          failureReason: "INVALID_COMPANY_CODE",
        });

        return NextResponse.json(
          {
            success: false,
            message: "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
          },
          { status: 401 },
        );
      }

      /*
       * ============================================================
       * FACTORY SCOPE
       * ============================================================
       *
       * COMPANY_ADMIN
       * → ระดับบริษัท
       * → ไม่ล็อกโรงงานใน Session
       * → เลือกดูได้ทุกโรงงานภายในบริษัทตัวเอง
       *
       * MANAGER / OPERATOR
       * → ระดับโรงงาน
       * → ต้องมี factoryId
       * → ถูกล็อกไว้ที่โรงงานของตัวเอง
       */

      if (roleName === "MANAGER" || roleName === "OPERATOR") {
        if (user.factoryId === null || !user.factory) {
          await createLoginLog({
            request,
            userId: user.userId,
            attemptedEmail: email,
            loginStatus: "FAILED",
            failureReason: "NO_FACTORY_ASSIGNMENT",
          });

          return NextResponse.json(
            {
              success: false,
              message:
                "บัญชีนี้ยังไม่ได้ถูกกำหนดโรงงาน กรุณาติดต่อผู้ดูแลบริษัท",
            },
            { status: 403 },
          );
        }

        /*
         * Defense-in-depth:
         * โรงงานที่ user ถูกกำหนดต้องอยู่ภายใต้บริษัทเดียวกับ user
         */
        if (user.factory.companyId !== user.companyId) {
          console.error(
            `Invalid factory/company assignment: userId=${user.userId}, companyId=${user.companyId}, factoryId=${user.factoryId}`,
          );

          await createLoginLog({
            request,
            userId: user.userId,
            attemptedEmail: email,
            loginStatus: "FAILED",
            failureReason: "FACTORY_COMPANY_MISMATCH",
          });

          return NextResponse.json(
            {
              success: false,
              message: "โครงสร้างบริษัทและโรงงานของบัญชีนี้ไม่ถูกต้อง",
            },
            { status: 500 },
          );
        }
      }
    }

    /*
     * ============================================================
     * PASSWORD
     * ============================================================
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

      await createLoginLog({
        request,
        userId: user.userId,
        attemptedEmail: email,
        loginStatus: "FAILED",
        failureReason: shouldLock
          ? "PASSWORD_RETRY_LIMIT_REACHED"
          : "INVALID_PASSWORD",
      });

      return NextResponse.json(
        {
          success: false,
          message: shouldLock
            ? "บัญชีถูกล็อก 15 นาที เนื่องจากกรอกรหัสผ่านผิดหลายครั้ง"
            : "รหัสองค์กร อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        },
        { status: 401 },
      );
    }

    /*
     * ============================================================
     * LOGIN SUCCESS
     * ============================================================
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
     * COMPANY_ADMIN เป็นระดับบริษัท
     * จึงตั้ง factoryId ใน Session เป็น null
     *
     * MANAGER / OPERATOR ใช้ factoryId ที่ถูกกำหนดใน User
     */
    const sessionFactoryId =
      roleName === "MANAGER" || roleName === "OPERATOR"
        ? user.factoryId
        : null;

    const token = await createSessionToken(
      {
        userId: user.userId,
        email: user.email,
        roleName,

        companyId: user.companyId,
        companyCode: sessionCompanyCode,

        factoryId: sessionFactoryId,

        firstName: user.firstName,
        lastName: user.lastName,
      },
      rememberMe,
    );

    await setSessionCookie(token, rememberMe);

    await createLoginLog({
      request,
      userId: user.userId,
      attemptedEmail: email,
      loginStatus: "SUCCESS",
      failureReason: null,
    });

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
      { status: 500 },
    );
  }
}