import { redirect } from "next/navigation";

import ProfilePageClient from "@/components/company/profile/ProfilePageClient";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "COMPANY_ADMIN") {
    redirect("/");
  }

  if (session.companyId === null) {
    throw new Error("Company Admin account does not have a companyId");
  }

  const user = await prisma.user.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId,
    },
    select: {
      userId: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,

      department: true,

      role: {
        select: {
          roleName: true,
        },
      },

      departmentRef: {
        select: {
          departmentName: true,
        },
      },

      company: {
        select: {
          companyId: true,
          companyCode: true,
          companyName: true,
          timezone: true,
          language: true,

          _count: {
            select: {
              factories: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
  }

  if (!user.company) {
    throw new Error("ไม่พบข้อมูลบริษัทของผู้ใช้งาน");
  }

  const factoryCount = user.company._count.factories;

  /*
   * COMPANY_ADMIN ทำงานในระดับบริษัท
   * จึงไม่ผูกกับโรงงานใดโรงงานหนึ่ง
   */
  const factoryDisplay =
    factoryCount > 0
      ? `ดูแลทุกโรงงานในบริษัท (${factoryCount} โรงงาน)`
      : "ยังไม่มีโรงงาน";

  /*
   * ถ้ามี departmentId ให้ใช้ชื่อแผนกจาก relation จริง
   * ถ้ายังใช้ legacy department ให้ fallback ไปใช้ค่านั้น
   */
  const departmentDisplay =
    user.departmentRef?.departmentName ??
    user.department ??
    "บริหารระบบบริษัท";

  return (
    <ProfilePageClient
      initialData={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
        employeeCode: user.employeeCode ?? "-",

        position:
          user.role.roleName === "COMPANY_ADMIN"
            ? "Company Admin"
            : user.role.roleName,

        department: departmentDisplay,

        companyName: user.company.companyName,
        factoryName: factoryDisplay,

        preferredLanguage: user.company.language ?? "th",
        timezone: user.company.timezone ?? "Asia/Bangkok",
      }}
    />
  );
}