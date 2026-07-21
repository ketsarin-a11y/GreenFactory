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
  // --- OPERATOR role + user ทดสอบ ---
  const operatorRole = await prisma.role.upsert({
    where: { roleName: "OPERATOR" },
    update: {},
    create: { roleName: "OPERATOR", description: "ผู้ปฏิบัติงาน บันทึกข้อมูลหน้างาน" },
  });

  const operatorPasswordHash = await bcrypt.hash("Operator1234!", 12);

  const operatorUser = await prisma.user.upsert({
    where: { email: "operator@gf.com" },
    update: {
      companyId: company.companyId,
      roleId: operatorRole.roleId,
      firstName: "เกศรินทร์",
      lastName: "นอพิมาย",
      passwordHash: operatorPasswordHash,
      status: "ACTIVE",
    },
    create: {
      companyId: company.companyId,
      roleId: operatorRole.roleId,
      employeeCode: "OP001",
      firstName: "เกศรินทร์",
      lastName: "นอพิมาย",
      email: "operator@gf.com",
      username: "operator1",
      passwordHash: operatorPasswordHash,
      status: "ACTIVE",
    },
  });

  // --- Equipment + ResourceRecord ตัวอย่าง ให้การ์ด "บันทึกล่าสุดของคุณ" มีข้อมูล ---
 const equipmentSeed = [
  // --- SMT Line 1 ---
  { name: "Reflow Oven-01", location: "อาคารผลิต ชั้น 1", equipmentCode: "SMT1-RO-01", equipmentType: "Reflow Oven", productionLine: "SMT Line 1", department: "Production", resourceType: "NITROGEN" as const, status: "NORMAL" },
  { name: "Pick and Place-01", location: "อาคารผลิต ชั้น 1", equipmentCode: "SMT1-PP-01", equipmentType: "Pick and Place", productionLine: "SMT Line 1", department: "Production", resourceType: "ELECTRICITY" as const, status: "NORMAL" },
  { name: "AOI-01", location: "อาคารผลิต ชั้น 1", equipmentCode: "SMT1-AOI-01", equipmentType: "AOI Inspection", productionLine: "SMT Line 1", department: "Quality Control", resourceType: "ELECTRICITY" as const, status: "NORMAL" },

  // --- SMT Line 2 ---
  { name: "Reflow Oven-02", location: "อาคารผลิต ชั้น 1", equipmentCode: "SMT2-RO-01", equipmentType: "Reflow Oven", productionLine: "SMT Line 2", department: "Production", resourceType: "NITROGEN" as const, status: "MAINTENANCE" },
  { name: "Wave Soldering-01", location: "อาคารผลิต ชั้น 1", equipmentCode: "SMT2-WS-01", equipmentType: "Wave Soldering Machine", productionLine: "SMT Line 2", department: "Production", resourceType: "GAS" as const, status: "NORMAL" },

  // --- THT Line 1 ---
  { name: "Wave Soldering-02", location: "อาคารผลิต ชั้น 1", equipmentCode: "THT1-WS-01", equipmentType: "Wave Soldering Machine", productionLine: "THT Line 1", department: "Production", resourceType: "GAS" as const, status: "NORMAL" },
  { name: "Conveyor-01", location: "อาคารผลิต ชั้น 1", equipmentCode: "THT1-CV-01", equipmentType: "Conveyor", productionLine: "THT Line 1", department: "Production", resourceType: "ELECTRICITY" as const, status: "NORMAL" },

  // --- Cleaning Line ---
  { name: "Plasma Cleaner-01", location: "อาคารผลิต ชั้น 2", equipmentCode: "CLN1-PC-01", equipmentType: "Plasma Cleaner", productionLine: "Cleaning Line 1", department: "Production", resourceType: "ELECTRICITY" as const, status: "NORMAL" },
  { name: "PCB Washer-01", location: "อาคารผลิต ชั้น 2", equipmentCode: "CLN1-PW-01", equipmentType: "PCB Cleaning Machine", productionLine: "Cleaning Line 1", department: "Production", resourceType: "DI_WATER" as const, status: "NORMAL" },

  // --- Testing / Packing ---
  { name: "X-Ray Inspection-01", location: "อาคารผลิต ชั้น 2", equipmentCode: "TST1-XR-01", equipmentType: "X-Ray Inspection", productionLine: "Testing Line 1", department: "Quality Control", resourceType: "ELECTRICITY" as const, status: "NORMAL" },
  { name: "Packing Conveyor-01", location: "อาคารผลิต ชั้น 2", equipmentCode: "PKG1-CV-01", equipmentType: "Conveyor", productionLine: "Packing Line 1", department: "Production", resourceType: "ELECTRICITY" as const, status: "MAINTENANCE" },

  // --- Clean Room ---
  { name: "Clean Room HVAC-01", location: "อาคาร Clean Room", equipmentCode: "CR1-HVAC-01", equipmentType: "Clean Room HVAC", productionLine: "Clean Room 1", department: "Facility", resourceType: "ELECTRICITY" as const, status: "NORMAL" },

  // --- Utility (ไม่ผูกกับไลน์การผลิตไหนโดยเฉพาะ) ---
  { name: "DI Water Plant-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-DIW-01", equipmentType: "DI Water System", productionLine: null, department: "Utility", resourceType: "DI_WATER" as const, status: "NORMAL" },
  { name: "Chiller-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-CH-01", equipmentType: "Chiller", productionLine: null, department: "Utility", resourceType: "CHILLED_WATER" as const, status: "NORMAL" },
  { name: "Air Compressor-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-AC-01", equipmentType: "Air Compressor", productionLine: null, department: "Utility", resourceType: "COMPRESSED_AIR" as const, status: "NORMAL" },
  { name: "Nitrogen Generator-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-N2-01", equipmentType: "Nitrogen Generator", productionLine: null, department: "Utility", resourceType: "NITROGEN" as const, status: "NORMAL" },
  { name: "Diesel Generator-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-GEN-01", equipmentType: "Diesel Generator", productionLine: null, department: "Utility", resourceType: "DIESEL" as const, status: "OFFLINE" },
  { name: "Boiler-01", location: "อาคารระบบสาธารณูปโภค", equipmentCode: "UTL-BLR-01", equipmentType: "Boiler", productionLine: null, department: "Utility", resourceType: "STEAM" as const, status: "NORMAL" },
  { name: "Main Water Meter", location: "อาคารคลังสินค้า", equipmentCode: "UTL-WM-01", equipmentType: "Water Meter", productionLine: null, department: "Warehouse", resourceType: "WATER" as const, status: "NORMAL" },
];

  for (const eq of equipmentSeed) {
    const existingEquipment = await prisma.equipment.findFirst({
      where: { companyId: company.companyId, name: eq.name },
    });
const equipment = existingEquipment
  ? await prisma.equipment.update({
      where: { equipmentId: existingEquipment.equipmentId },
      data: { ...eq, companyId: company.companyId },
    })
  : await prisma.equipment.create({
      data: { ...eq, companyId: company.companyId },
    });

    const existingRecord = await prisma.resourceRecord.findFirst({
      where: { equipmentId: equipment.equipmentId },
    });
if (!existingRecord) {
      const unitByType: Record<string, string> = {
        ELECTRICITY: "kWh",
        WATER: "m3",
        DI_WATER: "m3",
        CHILLED_WATER: "m3",
        COMPRESSED_AIR: "m3",
        NITROGEN: "m3",
        GAS: "kg",
        STEAM: "kg",
        DIESEL: "L",
      };

      await prisma.resourceRecord.create({
        data: {
          equipmentId: equipment.equipmentId,
          recordedById: operatorUser.userId,
          value: Math.round(Math.random() * 500) / 10,
          unit: unitByType[eq.resourceType] ?? "kWh",
          status: "RECORDED",
        },
      });
    }
  }

  console.log("");
  console.log("Operator");
  console.log("Company Code: GF001");
  console.log("Email: operator@gf.com");
  console.log("Password: Operator1234!");

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