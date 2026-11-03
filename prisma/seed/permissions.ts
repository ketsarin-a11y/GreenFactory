import { prisma } from "./client";

const permissions = [
  // 1. การดำเนินงาน
  {
    permissionCode: "DASHBOARD",
    permissionName: "Dashboard",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "ดูภาพรวมและแดชบอร์ดของระบบ",
    icon: "dashboard",
    sortOrder: 10,
  },
  {
    permissionCode: "CARBON_RESULT",
    permissionName: "Carbon Result",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "ดูผลการคำนวณการปล่อยคาร์บอน",
    icon: "chart",
    sortOrder: 20,
  },
  {
    permissionCode: "KPI",
    permissionName: "KPI",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "ดูและจัดการตัวชี้วัดขององค์กร",
    icon: "target",
    sortOrder: 30,
  },
  {
    permissionCode: "ALERT",
    permissionName: "Alert",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "ดูและจัดการเหตุการณ์แจ้งเตือน",
    icon: "bell",
    sortOrder: 40,
  },
  {
    permissionCode: "AI_RECOMMENDATION",
    permissionName: "AI Recommendation",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "ดูและพิจารณาคำแนะนำจากระบบ AI",
    icon: "sparkles",
    sortOrder: 50,
  },
  {
    permissionCode: "REPORT_EXPORT",
    permissionName: "Report & Export",
    groupCode: "OPERATION",
    groupName: "1. การดำเนินงาน",
    description: "สร้างรายงานและส่งออกข้อมูล",
    icon: "file",
    sortOrder: 60,
  },

  // 2. การจัดการข้อมูลองค์กร
  {
    permissionCode: "COMPANY_MANAGEMENT",
    permissionName: "จัดการข้อมูลบริษัท",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดู เพิ่ม แก้ไข และจัดการข้อมูลบริษัท",
    icon: "building",
    sortOrder: 110,
  },
  {
    permissionCode: "USER_MANAGEMENT",
    permissionName: "จัดการผู้ใช้งาน",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดู เพิ่ม แก้ไข และจัดการบัญชีผู้ใช้งาน",
    icon: "users",
    sortOrder: 120,
  },
  {
    permissionCode: "ROLE_PERMISSION_MANAGEMENT",
    permissionName: "กำหนดสิทธิ์การใช้งาน",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "จัดการบทบาทและสิทธิ์ของผู้ใช้งาน",
    icon: "shield",
    sortOrder: 130,
  },
  {
    permissionCode: "FACTORY_MANAGEMENT",
    permissionName: "จัดการข้อมูลโรงงาน",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดูและจัดการข้อมูลโรงงาน",
    icon: "factory",
    sortOrder: 140,
  },
  {
    permissionCode: "BUILDING_MANAGEMENT",
    permissionName: "จัดการอาคาร",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดูและจัดการอาคารภายในโรงงาน",
    icon: "building",
    sortOrder: 150,
  },
  {
    permissionCode: "DEPARTMENT_MANAGEMENT",
    permissionName: "จัดการแผนก",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดูและจัดการแผนกภายในอาคาร",
    icon: "boxes",
    sortOrder: 160,
  },
  {
    permissionCode: "PRODUCTION_LINE_MANAGEMENT",
    permissionName: "จัดการไลน์การผลิต",
    groupCode: "ORGANIZATION",
    groupName: "2. การจัดการข้อมูลองค์กร",
    description: "ดูและจัดการไลน์การผลิต",
    icon: "factory",
    sortOrder: 170,
  },

  // 3. เครื่องจักรและ IoT
  {
    permissionCode: "MACHINE_MANAGEMENT",
    permissionName: "จัดการเครื่องจักร",
    groupCode: "ASSET_IOT",
    groupName: "3. เครื่องจักรและ IoT",
    description: "ดูและจัดการเครื่องจักร",
    icon: "factory",
    sortOrder: 210,
  },
  {
    permissionCode: "SENSOR_MANAGEMENT",
    permissionName: "จัดการเซนเซอร์",
    groupCode: "ASSET_IOT",
    groupName: "3. เครื่องจักรและ IoT",
    description: "ดูและจัดการเซนเซอร์",
    icon: "sensor",
    sortOrder: 220,
  },
  {
    permissionCode: "QR_CODE_MANAGEMENT",
    permissionName: "จัดการ QR Code",
    groupCode: "ASSET_IOT",
    groupName: "3. เครื่องจักรและ IoT",
    description: "สร้าง ยกเลิก และจัดการ QR Code",
    icon: "search",
    sortOrder: 230,
  },
  {
    permissionCode: "CHECKPOINT_MANAGEMENT",
    permissionName: "จัดการจุดตรวจ",
    groupCode: "ASSET_IOT",
    groupName: "3. เครื่องจักรและ IoT",
    description: "ดูและจัดการจุดตรวจภายในโรงงาน",
    icon: "clipboard",
    sortOrder: 240,
  },

  // 4. ทรัพยากรและสิ่งแวดล้อม
  {
    permissionCode: "RESOURCE_USAGE",
    permissionName: "บันทึกการใช้ทรัพยากร",
    groupCode: "ENVIRONMENT",
    groupName: "4. ทรัพยากรและสิ่งแวดล้อม",
    description: "บันทึกและตรวจสอบการใช้ทรัพยากร",
    icon: "zap",
    sortOrder: 310,
  },
  {
    permissionCode: "RESOURCE_MASTER_DATA",
    permissionName: "ข้อมูลมาตรฐานทรัพยากร",
    groupCode: "ENVIRONMENT",
    groupName: "4. ทรัพยากรและสิ่งแวดล้อม",
    description: "จัดการประเภท หมวดหมู่ และหน่วยของทรัพยากร",
    icon: "boxes",
    sortOrder: 320,
  },
  {
    permissionCode: "EMISSION_FACTOR",
    permissionName: "Emission Factor",
    groupCode: "ENVIRONMENT",
    groupName: "4. ทรัพยากรและสิ่งแวดล้อม",
    description: "ดูและจัดการค่าปัจจัยการปล่อย",
    icon: "leaf",
    sortOrder: 330,
  },

  // 5. การกำกับดูแลระบบ
  {
    permissionCode: "AUDIT_LOG",
    permissionName: "Audit Log",
    groupCode: "GOVERNANCE",
    groupName: "5. การกำกับดูแลระบบ",
    description: "ตรวจสอบประวัติการเปลี่ยนแปลงข้อมูล",
    icon: "clipboard",
    sortOrder: 410,
  },
  {
    permissionCode: "LOGIN_LOG",
    permissionName: "Login Log",
    groupCode: "GOVERNANCE",
    groupName: "5. การกำกับดูแลระบบ",
    description: "ตรวจสอบประวัติการเข้าสู่ระบบ",
    icon: "search",
    sortOrder: 420,
  },
  {
    permissionCode: "BACKUP_RESTORE",
    permissionName: "สำรองและกู้คืนข้อมูล",
    groupCode: "GOVERNANCE",
    groupName: "5. การกำกับดูแลระบบ",
    description: "จัดการการสำรองและกู้คืนฐานข้อมูล",
    icon: "database",
    sortOrder: 430,
  },
  {
    permissionCode: "SYSTEM_SETTINGS",
    permissionName: "ตั้งค่าระบบ",
    groupCode: "GOVERNANCE",
    groupName: "5. การกำกับดูแลระบบ",
    description: "จัดการการตั้งค่าระดับแพลตฟอร์ม",
    icon: "settings",
    sortOrder: 440,
  },
] as const;

export default async function main() {
  console.log("Seeding permissions...");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        permissionCode: permission.permissionCode,
      },
      update: {
        permissionName: permission.permissionName,
        groupCode: permission.groupCode,
        groupName: permission.groupName,
        description: permission.description,
        icon: permission.icon,
        sortOrder: permission.sortOrder,
        status: "ACTIVE",
      },
      create: {
        ...permission,
        status: "ACTIVE",
      },
    });
  }

  console.log(`Permission seed completed: ${permissions.length} permissions.`);
}

