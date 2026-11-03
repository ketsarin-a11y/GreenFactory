import "server-only";
import { db } from "@/server/db";

export type Level = "FULL" | "VIEW" | "NONE";

/** Permission matrix for the two roles a company admin assigns (read-only here). */
export async function roleMatrix() {
  const [perms, roles] = await Promise.all([
    db.permission.findMany({ where: { status: "ACTIVE" }, orderBy: [{ groupCode: "asc" }, { sortOrder: "asc" }] }),
    db.role.findMany({ where: { roleName: { in: ["MANAGER", "OPERATOR"] } }, include: { rolePermissions: true } }),
  ]);
  const level = (role: string, permissionId: number): Level => {
    const v = roles.find((r) => r.roleName === role)?.rolePermissions.find((rp) => rp.permissionId === permissionId)?.permissionLevel;
    return v === "FULL" || v === "VIEW" ? v : "NONE";
  };
  const groups = new Map<string, { name: string; rows: { code: string; name: string; description: string | null; MANAGER: Level; OPERATOR: Level }[] }>();
  for (const p of perms) {
    const g = groups.get(p.groupCode) ?? { name: p.groupName, rows: [] };
    g.rows.push({ code: p.permissionCode, name: p.permissionName, description: p.description, MANAGER: level("MANAGER", p.permissionId), OPERATOR: level("OPERATOR", p.permissionId) });
    groups.set(p.groupCode, g);
  }
  return [...groups.entries()].map(([code, g]) => ({ code, ...g }));
}
