import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PERMISSION_LEVELS = ["FULL", "VIEW", "NONE"] as const;

type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

type PermissionMatrixPayload = Record<
  string,
  Record<string, PermissionLevel>
>;

type UpdatePermissionBody = {
  matrix?: PermissionMatrixPayload;
};

function isPermissionLevel(value: unknown): value is PermissionLevel {
  return (
    typeof value === "string" &&
    PERMISSION_LEVELS.includes(value as PermissionLevel)
  );
}

/**
 * GET /api/platform/roles/permissions
 *
 * โหลด:
 * - Role จริงจากฐานข้อมูล
 * - Permission จริงจากฐานข้อมูล
 * - Permission Matrix จริงจาก role_permission
 */
export async function GET() {
  try {
    const [roles, permissions, rolePermissions] = await Promise.all([
      prisma.role.findMany({
        where: {
          status: "ACTIVE",
          roleCode: {
            not: null,
          },
        },
        orderBy: {
          roleId: "asc",
        },
        select: {
          roleId: true,
          roleCode: true,
          roleName: true,
          description: true,
          status: true,

          _count: {
            select: {
              users: true,
              rolePermissions: true,
            },
          },
        },
      }),

      prisma.permission.findMany({
        where: {
          status: "ACTIVE",
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            permissionId: "asc",
          },
        ],
        select: {
          permissionId: true,
          permissionCode: true,
          permissionName: true,
          groupCode: true,
          groupName: true,
          description: true,
          icon: true,
          sortOrder: true,
          status: true,
        },
      }),

      prisma.rolePermission.findMany({
        select: {
          permissionLevel: true,

          role: {
            select: {
              roleCode: true,
            },
          },

          permission: {
            select: {
              permissionCode: true,
            },
          },
        },
      }),
    ]);

    const validRoles = roles.filter(
      (
        role,
      ): role is typeof role & {
        roleCode: string;
      } => Boolean(role.roleCode),
    );

    /*
     * สร้างค่าเริ่มต้นให้ทุกช่องเป็น NONE ก่อน
     * เพื่อให้ Matrix สมบูรณ์ แม้บางคู่ยังไม่มีข้อมูลใน DB
     */
    const matrix: PermissionMatrixPayload = {};

    for (const permission of permissions) {
      matrix[permission.permissionCode] = {};

      for (const role of validRoles) {
        matrix[permission.permissionCode][role.roleCode] = "NONE";
      }
    }

    /*
     * นำค่าจริงจาก role_permission มาทับค่าเริ่มต้น
     */
    for (const item of rolePermissions) {
      const roleCode = item.role.roleCode;
      const permissionCode = item.permission.permissionCode;

      if (
        !roleCode ||
        !matrix[permissionCode] ||
        !isPermissionLevel(item.permissionLevel)
      ) {
        continue;
      }

      matrix[permissionCode][roleCode] = item.permissionLevel;
    }

    /*
     * รวม Permission เป็นกลุ่มสำหรับหน้า Permission Matrix
     */
    const groupMap = new Map<
      string,
      {
        id: string;
        label: string;
        sortOrder: number;
        items: Array<{
          id: string;
          label: string;
          description: string;
          icon: string;
          sortOrder: number;
        }>;
      }
    >();

    for (const permission of permissions) {
      const existingGroup = groupMap.get(permission.groupCode);

      const permissionItem = {
        id: permission.permissionCode,
        label: permission.permissionName,
        description: permission.description ?? "",
        icon: permission.icon ?? "shield",
        sortOrder: permission.sortOrder,
      };

      if (existingGroup) {
        existingGroup.items.push(permissionItem);
        existingGroup.sortOrder = Math.min(
          existingGroup.sortOrder,
          permission.sortOrder,
        );

        continue;
      }

      groupMap.set(permission.groupCode, {
        id: permission.groupCode,
        label: permission.groupName,
        sortOrder: permission.sortOrder,
        items: [permissionItem],
      });
    }

    const groups = Array.from(groupMap.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ sortOrder: _sortOrder, ...group }) => ({
        ...group,
        items: group.items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ sortOrder: _itemSortOrder, ...item }) => item),
      }));

    return NextResponse.json({
      success: true,

      data: {
        roles: validRoles.map((role) => ({
          id: role.roleId,
          key: role.roleCode,
          code: role.roleCode,
          name: role.roleName,
          description: role.description ?? "",
          status: role.status,
          userCount: role._count.users,
          permissionCount: role._count.rolePermissions,
        })),

        groups,
        matrix,
      },

      summary: {
        totalRoles: validRoles.length,
        totalPermissions: permissions.length,
        totalAssignments: rolePermissions.length,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/platform/roles/permissions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดเมทริกซ์สิทธิ์ได้",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PUT /api/platform/roles/permissions
 *
 * รับข้อมูลรูปแบบ:
 *
 * {
 *   "matrix": {
 *     "DASHBOARD": {
 *       "PLATFORM_ADMIN": "FULL",
 *       "COMPANY_ADMIN": "VIEW"
 *     }
 *   }
 * }
 */
export async function PUT(request: Request) {
  try {
    let body: UpdatePermissionBody;

    try {
      body = (await request.json()) as UpdatePermissionBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "ข้อมูล JSON ไม่ถูกต้อง",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.matrix ||
      typeof body.matrix !== "object" ||
      Array.isArray(body.matrix)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบข้อมูล Permission Matrix",
        },
        {
          status: 400,
        },
      );
    }

    const [roles, permissions] = await Promise.all([
      prisma.role.findMany({
        where: {
          status: "ACTIVE",
          roleCode: {
            not: null,
          },
        },
        select: {
          roleId: true,
          roleCode: true,
        },
      }),

      prisma.permission.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          permissionId: true,
          permissionCode: true,
        },
      }),
    ]);

    const roleIdByCode = new Map<string, number>();

    for (const role of roles) {
      if (role.roleCode) {
        roleIdByCode.set(role.roleCode, role.roleId);
      }
    }

    const permissionIdByCode = new Map<string, number>(
      permissions.map((permission) => [
        permission.permissionCode,
        permission.permissionId,
      ]),
    );

    const operations: Array<{
      roleId: number;
      permissionId: number;
      permissionLevel: PermissionLevel;
    }> = [];

    for (const [permissionCode, roleMap] of Object.entries(
      body.matrix,
    )) {
      const permissionId =
        permissionIdByCode.get(permissionCode);

      if (!permissionId) {
        return NextResponse.json(
          {
            success: false,
            message: `ไม่พบ Permission: ${permissionCode}`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        !roleMap ||
        typeof roleMap !== "object" ||
        Array.isArray(roleMap)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `ข้อมูลสิทธิ์ของ ${permissionCode} ไม่ถูกต้อง`,
          },
          {
            status: 400,
          },
        );
      }

      for (const [roleCode, permissionLevel] of Object.entries(
        roleMap,
      )) {
        const roleId = roleIdByCode.get(roleCode);

        if (!roleId) {
          return NextResponse.json(
            {
              success: false,
              message: `ไม่พบ Role: ${roleCode}`,
            },
            {
              status: 400,
            },
          );
        }

        if (!isPermissionLevel(permissionLevel)) {
          return NextResponse.json(
            {
              success: false,
              message: `ระดับสิทธิ์ของ ${permissionCode} / ${roleCode} ไม่ถูกต้อง`,
            },
            {
              status: 400,
            },
          );
        }

        operations.push({
          roleId,
          permissionId,
          permissionLevel,
        });
      }
    }

    if (operations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีข้อมูลสิทธิ์สำหรับบันทึก",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$transaction(
      operations.map((item) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: item.roleId,
              permissionId: item.permissionId,
            },
          },

          update: {
            permissionLevel: item.permissionLevel,
          },

          create: {
            roleId: item.roleId,
            permissionId: item.permissionId,
            permissionLevel: item.permissionLevel,
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: "บันทึกสิทธิ์การใช้งานเรียบร้อยแล้ว",
      updatedCount: operations.length,
    });
  } catch (error) {
    console.error(
      "PUT /api/platform/roles/permissions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถบันทึกสิทธิ์การใช้งานได้",
      },
      {
        status: 500,
      },
    );
  }
}