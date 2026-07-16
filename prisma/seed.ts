import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "greenfactory",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const roles = [
    {
      roleName: "PLATFORM_ADMIN",
      description: "ผู้ดูแลแพลตฟอร์มทั้งหมด",
    },
    {
      roleName: "COMPANY_ADMIN",
      description: "ผู้ดูแลบริษัทของตัวเอง",
    },
    {
      roleName: "MANAGER",
      description: "ผู้จัดการ ตรวจสอบและอนุมัติข้อมูล",
    },
    {
      roleName: "OPERATOR",
      description: "ผู้ปฏิบัติงาน บันทึกข้อมูลหน้างาน",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        roleName: role.roleName,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  const platformAdminRole = await prisma.role.findUnique({
    where: {
      roleName: "PLATFORM_ADMIN",
    },
  });

  const companyAdminRole = await prisma.role.findUnique({
    where: {
      roleName: "COMPANY_ADMIN",
    },
  });

  if (!platformAdminRole) {
    throw new Error("ไม่พบ Role PLATFORM_ADMIN");
  }

  if (!companyAdminRole) {
    throw new Error("ไม่พบ Role COMPANY_ADMIN");
  }

  const platformAdminPasswordHash = await bcrypt.hash(
    "Admin1234!",
    12,
  );

  const companyAdminPasswordHash = await bcrypt.hash(
    "Company1234!",
    12,
  );

  await prisma.user.upsert({
    where: {
      email: "admin@greenfactory.local",
    },
    update: {
      companyId: null,
      firstName: "Platform",
      lastName: "Admin",
      roleId: platformAdminRole.roleId,
      passwordHash: platformAdminPasswordHash,
      status: "ACTIVE",
    },
    create: {
      companyId: null,
      roleId: platformAdminRole.roleId,
      firstName: "Platform",
      lastName: "Admin",
      email: "admin@greenfactory.local",
      username: "platformadmin",
      passwordHash: platformAdminPasswordHash,
      status: "ACTIVE",
    },
  });

  const company = await prisma.company.upsert({
    where: {
      companyCode: "GF001",
    },
    update: {
      companyName: "GreenFactory Electronics",
      email: "contact@gf.com",
      status: "ACTIVE",
    },
    create: {
      companyCode: "GF001",
      companyName: "GreenFactory Electronics",
      email: "contact@gf.com",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "admin@gf.com",
    },
    update: {
      companyId: company.companyId,
      roleId: companyAdminRole.roleId,
      employeeCode: "CA001",
      firstName: "Company",
      lastName: "Admin",
      username: "companyadmin",
      passwordHash: companyAdminPasswordHash,
      status: "ACTIVE",
    },
    create: {
      companyId: company.companyId,
      roleId: companyAdminRole.roleId,
      employeeCode: "CA001",
      firstName: "Company",
      lastName: "Admin",
      email: "admin@gf.com",
      username: "companyadmin",
      passwordHash: companyAdminPasswordHash,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed");
  console.log("");
  console.log("Platform Admin");
  console.log("Company Code: GREENFACTORY");
  console.log("Email: admin@greenfactory.local");
  console.log("Password: Admin1234!");
  console.log("");
  console.log("Company Admin");
  console.log("Company Code: GF001");
  console.log("Email: admin@gf.com");
  console.log("Password: Company1234!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });