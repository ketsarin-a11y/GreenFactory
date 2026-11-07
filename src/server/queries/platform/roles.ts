import "server-only";
import { db } from "@/server/db";
import { ROLES } from "@/server/auth/roles";

export const LEVELS = ["FULL", "VIEW", "NONE"] as const;
export type Level = (typeof LEVELS)[number];

export async function permissionMatrix() {
  const [roles, permissions, grants] = await Promise.all([
    db.role.findMany({ where: { roleName: { in: [...ROLES] } }, select: { roleId: true, roleName: true, _count: { select: { users: true } } } }),
    db.permission.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }],
      select: { permissionId: true, permissionCode: true, permissionName: true, groupCode: true, groupName: true, description: true },
    }),
    db.rolePermission.findMany({ select: { roleId: true, permissionId: true, permissionLevel: true } }),
  ]);
  const order = (name: string) => ROLES.indexOf(name as (typeof ROLES)[number]);
  const levels: Record<string, Level> = {};
  for (const g of grants) levels[`${g.roleId}:${g.permissionId}`] = (LEVELS as readonly string[]).includes(g.permissionLevel) ? (g.permissionLevel as Level) : "NONE";
  return {
    roles: roles.sort((a, b) => order(a.roleName) - order(b.roleName)).map((r) => ({ id: r.roleId, name: r.roleName, users: r._count.users })),
    permissions: permissions.map((p) => ({ id: p.permissionId, code: p.permissionCode, name: p.permissionName, group: p.groupName, description: p.description })),
    levels,
  };
}
