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

type CompanyUserSeed = {
  companyId: number;
  factoryId: number | null;
  roleId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

async function upsertCompanyUser(input: CompanyUserSeed) {
  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.user.upsert({
    where: {
      email: input.email,
    },
    update: {
      companyId: input.companyId,
      factoryId: input.factoryId,
      roleId: input.roleId,
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      passwordHash,
      status: "ACTIVE",
    },
    create: {
      companyId: input.companyId,
      factoryId: input.factoryId,
      roleId: input.roleId,
      employeeCode: input.employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      username: input.username,
      passwordHash,
      status: "ACTIVE",
    },
  });
}

async function main() {
  /*
   * ============================================================
   * ROLES
   * ============================================================
   */
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
      description: "ผู้จัดการ ดูแดชบอร์ด วิเคราะห์ข้อมูล การแจ้งเตือน และรายงาน",
    },
    {
      roleName: "OPERATOR",
      description: "ผู้ปฏิบัติงาน บันทึกข้อมูลหน้างานและสแกน QR Code",
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

  const [
    platformAdminRole,
    companyAdminRole,
    managerRole,
    operatorRole,
  ] = await Promise.all([
    prisma.role.findUnique({
      where: { roleName: "PLATFORM_ADMIN" },
    }),
    prisma.role.findUnique({
      where: { roleName: "COMPANY_ADMIN" },
    }),
    prisma.role.findUnique({
      where: { roleName: "MANAGER" },
    }),
    prisma.role.findUnique({
      where: { roleName: "OPERATOR" },
    }),
  ]);

  if (!platformAdminRole) {
    throw new Error("ไม่พบ Role PLATFORM_ADMIN");
  }

  if (!companyAdminRole) {
    throw new Error("ไม่พบ Role COMPANY_ADMIN");
  }

  if (!managerRole) {
    throw new Error("ไม่พบ Role MANAGER");
  }

  if (!operatorRole) {
    throw new Error("ไม่พบ Role OPERATOR");
  }

  /*
   * ============================================================
   * PLATFORM ADMIN
   * ============================================================
   */
  const platformAdminPassword = "Admin1234!";
  const platformAdminPasswordHash = await bcrypt.hash(
    platformAdminPassword,
    12,
  );

  await prisma.user.upsert({
    where: {
      email: "admin@greenfactory.local",
    },
    update: {
      companyId: null,
      factoryId: null,
      firstName: "Platform",
      lastName: "Administrator",
      roleId: platformAdminRole.roleId,
      passwordHash: platformAdminPasswordHash,
      status: "ACTIVE",
    },
    create: {
      companyId: null,
      factoryId: null,
      roleId: platformAdminRole.roleId,
      firstName: "Platform",
      lastName: "Administrator",
      email: "admin@greenfactory.local",
      username: "platformadmin",
      passwordHash: platformAdminPasswordHash,
      status: "ACTIVE",
    },
  });

  /*
   * ============================================================
   * COMPANIES
   * ============================================================
   *
   * บริษัท 1 สร้าง/อัปเดตจาก seed หลัก
   * บริษัท 2 และ 3 มีอยู่แล้วในฐานข้อมูลจาก demo company seed
   */
  const greenFactory = await prisma.company.upsert({
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

  const [nextron, voltera] = await Promise.all([
    prisma.company.findUnique({
      where: {
        companyCode: "NEXTRON",
      },
    }),
    prisma.company.findUnique({
      where: {
        companyCode: "VOLTERA",
      },
    }),
  ]);

  if (!nextron) {
    throw new Error(
      "ไม่พบบริษัท NEXTRON กรุณารัน seed บริษัทตัวอย่างก่อน",
    );
  }

  if (!voltera) {
    throw new Error(
      "ไม่พบบริษัท VOLTERA กรุณารัน seed บริษัทตัวอย่างก่อน",
    );
  }

  /*
   * ============================================================
   * FACTORIES
   * ============================================================
   *
   * ไม่ hard-code factoryId
   * ระบบหาโรงงานจาก companyId + factoryCode จริงใน Database
   */
  const [greenFactoryKorat, nextronKorat, volteraChonburi] =
    await Promise.all([
      prisma.factory.findUnique({
        where: {
          companyId_factoryCode: {
            companyId: greenFactory.companyId,
            factoryCode: "GF-001",
          },
        },
      }),
      prisma.factory.findUnique({
        where: {
          companyId_factoryCode: {
            companyId: nextron.companyId,
            factoryCode: "NEX-KORAT",
          },
        },
      }),
      prisma.factory.findUnique({
        where: {
          companyId_factoryCode: {
            companyId: voltera.companyId,
            factoryCode: "VOLT-CHONBURI",
          },
        },
      }),
    ]);

  if (!greenFactoryKorat) {
    throw new Error(
      "ไม่พบโรงงาน GF-001 / GreenFactory Korat ในบริษัท GF001",
    );
  }

  if (!nextronKorat) {
    throw new Error(
      "ไม่พบโรงงาน NEX-KORAT / Nextron Korat Plant",
    );
  }

  if (!volteraChonburi) {
    throw new Error(
      "ไม่พบโรงงาน VOLT-CHONBURI / Voltera Chonburi Plant",
    );
  }

  /*
   * ============================================================
   * TEST USERS — GREENFACTORY ELECTRONICS
   * ============================================================
   *
   * COMPANY_ADMIN = ระดับบริษัท → factoryId = null
   * MANAGER / OPERATOR = ระดับโรงงาน → ผูก GreenFactory Korat
   */
  await upsertCompanyUser({
    companyId: greenFactory.companyId,
    factoryId: null,
    roleId: companyAdminRole.roleId,
    employeeCode: "GF-CA-001",
    firstName: "ศิริพร",
    lastName: "วัฒนกุล",
    email: "admin@gf.com",
    username: "gf.siriporn.admin",
    password: "GfAdmin1234!",
  });

  await upsertCompanyUser({
    companyId: greenFactory.companyId,
    factoryId: greenFactoryKorat.factoryId,
    roleId: managerRole.roleId,
    employeeCode: "GF-MGR-001",
    firstName: "ธนกฤต",
    lastName: "พิพัฒน์ชัย",
    email: "manager@gf.com",
    username: "gf.thanakrit.manager",
    password: "GfManager1234!",
  });

  const operatorUser = await upsertCompanyUser({
    companyId: greenFactory.companyId,
    factoryId: greenFactoryKorat.factoryId,
    roleId: operatorRole.roleId,
    employeeCode: "GF-OP-001",
    firstName: "กานต์พิชชา",
    lastName: "นาคทอง",
    email: "operator@gf.com",
    username: "gf.kanpitcha.operator",
    password: "GfOperator1234!",
  });

  /*
   * ============================================================
   * TEST USERS — NEXTRON
   * ============================================================
   */
  await upsertCompanyUser({
    companyId: nextron.companyId,
    factoryId: null,
    roleId: companyAdminRole.roleId,
    employeeCode: "NEX-CA-001",
    firstName: "ปวีณ์นุช",
    lastName: "ศรีสวัสดิ์",
    email: "admin@nextron.com",
    username: "nex.paveenuch.admin",
    password: "NexAdmin1234!",
  });

  await upsertCompanyUser({
    companyId: nextron.companyId,
    factoryId: nextronKorat.factoryId,
    roleId: managerRole.roleId,
    employeeCode: "NEX-MGR-001",
    firstName: "อิทธิกร",
    lastName: "ชัยภักดี",
    email: "manager@nextron.com",
    username: "nex.ittikorn.manager",
    password: "NexManager1234!",
  });

  await upsertCompanyUser({
    companyId: nextron.companyId,
    factoryId: nextronKorat.factoryId,
    roleId: operatorRole.roleId,
    employeeCode: "NEX-OP-001",
    firstName: "ณัฐชา",
    lastName: "วงศ์ประเสริฐ",
    email: "operator@nextron.com",
    username: "nex.natcha.operator",
    password: "NexOperator1234!",
  });

  /*
   * ============================================================
   * TEST USERS — VOLTERA
   * ============================================================
   */
  await upsertCompanyUser({
    companyId: voltera.companyId,
    factoryId: null,
    roleId: companyAdminRole.roleId,
    employeeCode: "VOLT-CA-001",
    firstName: "ชญานิน",
    lastName: "ภูวดล",
    email: "admin@voltera.com",
    username: "volt.chayanin.admin",
    password: "VoltAdmin1234!",
  });

  await upsertCompanyUser({
    companyId: voltera.companyId,
    factoryId: volteraChonburi.factoryId,
    roleId: managerRole.roleId,
    employeeCode: "VOLT-MGR-001",
    firstName: "พีรพัฒน์",
    lastName: "เจริญกิจ",
    email: "manager@voltera.com",
    username: "volt.peerapat.manager",
    password: "VoltManager1234!",
  });

  await upsertCompanyUser({
    companyId: voltera.companyId,
    factoryId: volteraChonburi.factoryId,
    roleId: operatorRole.roleId,
    employeeCode: "VOLT-OP-001",
    firstName: "มนัสวี",
    lastName: "แสงทอง",
    email: "operator@voltera.com",
    username: "volt.manaswee.operator",
    password: "VoltOperator1234!",
  });

  /*
   * ============================================================
   * LEGACY TEST DATA
   * ============================================================
   *
   * ส่วนนี้ยังคงไว้ชั่วคราว เพราะหน้า Operator เดิมยังใช้
   * Equipment + ResourceRecord
   *
   * ภายหลังจะ migrate ไป Machine + ResourceUsage
   */
  const equipmentSeed = [
    {
      name: "Reflow Oven-01",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "SMT1-RO-01",
      equipmentType: "Reflow Oven",
      productionLine: "SMT Line 1",
      department: "Production",
      resourceType: "NITROGEN" as const,
      status: "NORMAL",
    },
    {
      name: "Pick and Place-01",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "SMT1-PP-01",
      equipmentType: "Pick and Place",
      productionLine: "SMT Line 1",
      department: "Production",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "AOI-01",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "SMT1-AOI-01",
      equipmentType: "AOI Inspection",
      productionLine: "SMT Line 1",
      department: "Quality Control",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "Reflow Oven-02",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "SMT2-RO-01",
      equipmentType: "Reflow Oven",
      productionLine: "SMT Line 2",
      department: "Production",
      resourceType: "NITROGEN" as const,
      status: "MAINTENANCE",
    },
    {
      name: "Wave Soldering-01",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "SMT2-WS-01",
      equipmentType: "Wave Soldering Machine",
      productionLine: "SMT Line 2",
      department: "Production",
      resourceType: "GAS" as const,
      status: "NORMAL",
    },
    {
      name: "Wave Soldering-02",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "THT1-WS-01",
      equipmentType: "Wave Soldering Machine",
      productionLine: "THT Line 1",
      department: "Production",
      resourceType: "GAS" as const,
      status: "NORMAL",
    },
    {
      name: "Conveyor-01",
      location: "อาคารผลิต ชั้น 1",
      equipmentCode: "THT1-CV-01",
      equipmentType: "Conveyor",
      productionLine: "THT Line 1",
      department: "Production",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "Plasma Cleaner-01",
      location: "อาคารผลิต ชั้น 2",
      equipmentCode: "CLN1-PC-01",
      equipmentType: "Plasma Cleaner",
      productionLine: "Cleaning Line 1",
      department: "Production",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "PCB Washer-01",
      location: "อาคารผลิต ชั้น 2",
      equipmentCode: "CLN1-PW-01",
      equipmentType: "PCB Cleaning Machine",
      productionLine: "Cleaning Line 1",
      department: "Production",
      resourceType: "DI_WATER" as const,
      status: "NORMAL",
    },
    {
      name: "X-Ray Inspection-01",
      location: "อาคารผลิต ชั้น 2",
      equipmentCode: "TST1-XR-01",
      equipmentType: "X-Ray Inspection",
      productionLine: "Testing Line 1",
      department: "Quality Control",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "Packing Conveyor-01",
      location: "อาคารผลิต ชั้น 2",
      equipmentCode: "PKG1-CV-01",
      equipmentType: "Conveyor",
      productionLine: "Packing Line 1",
      department: "Production",
      resourceType: "ELECTRICITY" as const,
      status: "MAINTENANCE",
    },
    {
      name: "Clean Room HVAC-01",
      location: "อาคาร Clean Room",
      equipmentCode: "CR1-HVAC-01",
      equipmentType: "Clean Room HVAC",
      productionLine: "Clean Room 1",
      department: "Facility",
      resourceType: "ELECTRICITY" as const,
      status: "NORMAL",
    },
    {
      name: "DI Water Plant-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-DIW-01",
      equipmentType: "DI Water System",
      productionLine: null,
      department: "Utility",
      resourceType: "DI_WATER" as const,
      status: "NORMAL",
    },
    {
      name: "Chiller-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-CH-01",
      equipmentType: "Chiller",
      productionLine: null,
      department: "Utility",
      resourceType: "CHILLED_WATER" as const,
      status: "NORMAL",
    },
    {
      name: "Air Compressor-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-AC-01",
      equipmentType: "Air Compressor",
      productionLine: null,
      department: "Utility",
      resourceType: "COMPRESSED_AIR" as const,
      status: "NORMAL",
    },
    {
      name: "Nitrogen Generator-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-N2-01",
      equipmentType: "Nitrogen Generator",
      productionLine: null,
      department: "Utility",
      resourceType: "NITROGEN" as const,
      status: "NORMAL",
    },
    {
      name: "Diesel Generator-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-GEN-01",
      equipmentType: "Diesel Generator",
      productionLine: null,
      department: "Utility",
      resourceType: "DIESEL" as const,
      status: "OFFLINE",
    },
    {
      name: "Boiler-01",
      location: "อาคารระบบสาธารณูปโภค",
      equipmentCode: "UTL-BLR-01",
      equipmentType: "Boiler",
      productionLine: null,
      department: "Utility",
      resourceType: "STEAM" as const,
      status: "NORMAL",
    },
    {
      name: "Main Water Meter",
      location: "อาคารคลังสินค้า",
      equipmentCode: "UTL-WM-01",
      equipmentType: "Water Meter",
      productionLine: null,
      department: "Warehouse",
      resourceType: "WATER" as const,
      status: "NORMAL",
    },
  ];

  for (const eq of equipmentSeed) {
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        companyId: greenFactory.companyId,
        name: eq.name,
      },
    });

    const equipment = existingEquipment
      ? await prisma.equipment.update({
          where: {
            equipmentId: existingEquipment.equipmentId,
          },
          data: {
            ...eq,
            companyId: greenFactory.companyId,
          },
        })
      : await prisma.equipment.create({
          data: {
            ...eq,
            companyId: greenFactory.companyId,
          },
        });

    const existingRecord = await prisma.resourceRecord.findFirst({
      where: {
        equipmentId: equipment.equipmentId,
      },
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

  /*
   * ============================================================
   * TEST ACCOUNT SUMMARY
   * ============================================================
   */
  console.log("");
  console.log("================================================");
  console.log("GREENFACTORY TEST ACCOUNTS");
  console.log("================================================");
  console.log("");

  console.log("PLATFORM ADMIN");
  console.log("Company Code: GREENFACTORY");
  console.log("Name: Platform Administrator");
  console.log("Email: admin@greenfactory.local");
  console.log(`Password: ${platformAdminPassword}`);
  console.log("");

  console.log("GREENFACTORY ELECTRONICS");
  console.log("Company Code: GF001");
  console.log("Factory: GreenFactory Korat / GF-001");
  console.log("Company Admin: ศิริพร วัฒนกุล");
  console.log("  Email: admin@gf.com");
  console.log("  Password: GfAdmin1234!");
  console.log("Manager: ธนกฤต พิพัฒน์ชัย");
  console.log("  Email: manager@gf.com");
  console.log("  Password: GfManager1234!");
  console.log("Operator: กานต์พิชชา นาคทอง");
  console.log("  Email: operator@gf.com");
  console.log("  Password: GfOperator1234!");
  console.log("");

  console.log("NEXTRON");
  console.log("Company Code: NEXTRON");
  console.log("Factory: Nextron Korat Plant / NEX-KORAT");
  console.log("Company Admin: ปวีณ์นุช ศรีสวัสดิ์");
  console.log("  Email: admin@nextron.com");
  console.log("  Password: NexAdmin1234!");
  console.log("Manager: อิทธิกร ชัยภักดี");
  console.log("  Email: manager@nextron.com");
  console.log("  Password: NexManager1234!");
  console.log("Operator: ณัฐชา วงศ์ประเสริฐ");
  console.log("  Email: operator@nextron.com");
  console.log("  Password: NexOperator1234!");
  console.log("");

  console.log("VOLTERA");
  console.log("Company Code: VOLTERA");
  console.log("Factory: Voltera Chonburi Plant / VOLT-CHONBURI");
  console.log("Company Admin: ชญานิน ภูวดล");
  console.log("  Email: admin@voltera.com");
  console.log("  Password: VoltAdmin1234!");
  console.log("Manager: พีรพัฒน์ เจริญกิจ");
  console.log("  Email: manager@voltera.com");
  console.log("  Password: VoltManager1234!");
  console.log("Operator: มนัสวี แสงทอง");
  console.log("  Email: operator@voltera.com");
  console.log("  Password: VoltOperator1234!");
  console.log("");

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });