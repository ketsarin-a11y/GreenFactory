"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { action, fail, zId } from "../_action";

const PA = ["PLATFORM_ADMIN" as const];

export const saveRolePermissions = action(
  PA,
  z.object({ changes: z.array(z.object({ roleId: zId, permissionId: zId, level: z.enum(["FULL", "VIEW", "NONE"]) })).min(1, "ไม่มีการเปลี่ยนแปลง").max(1000) }),
  async ({ changes }, user) => {
    const roleIds = [...new Set(changes.map((c) => c.roleId))];
    const [roles, perms, current] = await Promise.all([
      db.role.findMany({ where: { roleId: { in: roleIds } }, select: { roleId: true, roleName: true } }),
      db.permission.findMany({ where: { permissionId: { in: [...new Set(changes.map((c) => c.permissionId))] } }, select: { permissionId: true, permissionCode: true } }),
      db.rolePermission.findMany({ where: { roleId: { in: roleIds } }, select: { roleId: true, permissionId: true, permissionLevel: true } }),
    ]);
    const roleName = new Map(roles.map((r) => [r.roleId, r.roleName]));
    const permCode = new Map(perms.map((p) => [p.permissionId, p.permissionCode]));
    if (changes.some((c) => !roleName.has(c.roleId) || !permCode.has(c.permissionId))) fail("ข้อมูลบทบาทหรือสิทธิ์ไม่ถูกต้อง");
    if (changes.some((c) => roleName.get(c.roleId) === "PLATFORM_ADMIN")) fail("สิทธิ์ของผู้ดูแลแพลตฟอร์มแก้ไขไม่ได้");

    const was = new Map(current.map((g) => [`${g.roleId}:${g.permissionId}`, g.permissionLevel]));
    await db.$transaction(
      changes.map((c) =>
        db.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: c.roleId, permissionId: c.permissionId } },
          update: { permissionLevel: c.level },
          create: { roleId: c.roleId, permissionId: c.permissionId, permissionLevel: c.level },
        }),
      ),
    );
    // One audit row per role, listing only the cells that changed.
    for (const rid of roleIds) {
      const mine = changes.filter((c) => c.roleId === rid);
      await audit(
        user.id,
        "role_permission",
        rid,
        "UPDATE",
        Object.fromEntries(mine.map((c) => [permCode.get(c.permissionId)!, was.get(`${rid}:${c.permissionId}`) ?? "NONE"])),
        Object.fromEntries(mine.map((c) => [permCode.get(c.permissionId)!, c.level])),
      );
    }
    revalidatePath("/platform/roles");
    return { count: changes.length };
  },
);
