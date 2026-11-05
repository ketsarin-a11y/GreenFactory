import { prisma } from "./client";

type PermissionLevel = "FULL" | "VIEW" | "NONE";

const companyAdminFull = new Set([
  "COMPANY_MANAGEMENT",
  "USER_MANAGEMENT",
  "FACTORY_MANAGEMENT",
  "BUILDING_MANAGEMENT",
  "DEPARTMENT_MANAGEMENT",
  "PRODUCTION_LINE_MANAGEMENT",
  "REPORT_EXPORT",
]);

const companyAdminView = new Set([
  "DASHBOARD",
  "CARBON_RESULT",
  "KPI",
  "ALERT",
  "AI_RECOMMENDATION",
  "MACHINE_MANAGEMENT",
  "SENSOR_MANAGEMENT",
  "QR_CODE_MANAGEMENT",
  "CHECKPOINT_MANAGEMENT",
  "RESOURCE_USAGE",
  "RESOURCE_MASTER_DATA",
  "EMISSION_FACTOR",
]);

const factoryManagerFull = new Set([
  "FACTORY_MANAGEMENT",
  "BUILDING_MANAGEMENT",
  "DEPARTMENT_MANAGEMENT",
  "PRODUCTION_LINE_MANAGEMENT",
  "MACHINE_MANAGEMENT",
  "SENSOR_MANAGEMENT",
  "QR_CODE_MANAGEMENT",
  "CHECKPOINT_MANAGEMENT",
  "RESOURCE_USAGE",
  "ALERT",
  "REPORT_EXPORT",
]);

const factoryManagerView = new Set([
  "DASHBOARD",
  "CARBON_RESULT",
  "KPI",
  "AI_RECOMMENDATION",
  "RESOURCE_MASTER_DATA",
  "EMISSION_FACTOR",
]);

const environmentOfficerFull = new Set([
  "RESOURCE_USAGE",
  "CARBON_RESULT",
  "EMISSION_FACTOR",
  "REPORT_EXPORT",
]);

const environmentOfficerView = new Set([
  "DASHBOARD",
  "KPI",
  "ALERT",
  "AI_RECOMMENDATION",
  "FACTORY_MANAGEMENT",
  "BUILDING_MANAGEMENT",
  "DEPARTMENT_MANAGEMENT",
  "PRODUCTION_LINE_MANAGEMENT",
  "MACHINE_MANAGEMENT",
  "SENSOR_MANAGEMENT",
  "QR_CODE_MANAGEMENT",
  "CHECKPOINT_MANAGEMENT",
  "RESOURCE_MASTER_DATA",
]);

function resolvePermissionLevel(
  roleCode: string,
  permissionCode: string,
): PermissionLevel {
  if (roleCode === "PLATFORM_ADMIN") {
    return "FULL";
  }

  if (roleCode === "COMPANY_ADMIN") {
    if (companyAdminFull.has(permissionCode)) {
      return "FULL";
    }

    if (companyAdminView.has(permissionCode)) {
      return "VIEW";
    }

    return "NONE";
  }

  if (roleCode === "MANAGER") {
    if (factoryManagerFull.has(permissionCode)) {
      return "FULL";
    }

    if (factoryManagerView.has(permissionCode)) {
      return "VIEW";
    }

    return "NONE";
  }

  if (roleCode === "OPERATOR") {
    if (environmentOfficerFull.has(permissionCode)) {
      return "FULL";
    }

    if (environmentOfficerView.has(permissionCode)) {
      return "VIEW";
    }

    return "NONE";
  }

  return "NONE";
}

export default async function main() {
  console.log("Seeding role permissions...");

  const roles = await prisma.role.findMany({
    where: {
      roleCode: {
        not: null,
      },
    },
    select: {
      roleId: true,
      roleCode: true,
    },
  });

  const permissions = await prisma.permission.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      permissionId: true,
      permissionCode: true,
    },
  });

  if (roles.length === 0) {
    throw new Error("ไม่พบ Role ที่มี roleCode");
  }

  if (permissions.length === 0) {
    throw new Error(
      "ยังไม่มี Permission กรุณารัน seed-permissions.ts ก่อน",
    );
  }

  let total = 0;

  for (const role of roles) {
    if (!role.roleCode) {
      continue;
    }

    for (const permission of permissions) {
      const permissionLevel = resolvePermissionLevel(
        role.roleCode,
        permission.permissionCode,
      );

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.roleId,
            permissionId: permission.permissionId,
          },
        },
        update: {
          permissionLevel,
        },
        create: {
          roleId: role.roleId,
          permissionId: permission.permissionId,
          permissionLevel,
        },
      });

      total += 1;
    }
  }

  console.log(
    `Role permission seed completed: ${total} records.`,
  );
}

