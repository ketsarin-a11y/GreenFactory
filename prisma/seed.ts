import { prisma } from "./seed/client";
import seedMasterData from "./seed/master-data";
import seedPermissions from "./seed/permissions";
import seedRolePermissions from "./seed/role-permissions";
import seedDemo from "./seed/demo";

const ROLES = [
  ["PLATFORM_ADMIN", "ผู้ดูแลแพลตฟอร์ม"],
  ["COMPANY_ADMIN", "ผู้ดูแลบริษัท"],
  ["MANAGER", "ผู้จัดการโรงงาน"],
  ["OPERATOR", "ผู้ปฏิบัติงาน"],
] as const;

async function main() {
  for (const [code, description] of ROLES) {
    await prisma.role.upsert({
      where: { roleName: code },
      update: { roleCode: code, description },
      create: { roleCode: code, roleName: code, description },
    });
  }
  if (!(await prisma.systemSetting.findFirst())) await prisma.systemSetting.create({ data: {} });

  await seedMasterData();
  await seedPermissions();
  await seedRolePermissions();
  if (process.env.SEED_DEMO !== "false") await seedDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
