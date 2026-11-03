import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { getRuntimeSettings } from "@/server/settings";
import { SESSION_COOKIE, verifySession } from "./session";
import { homeFor, isRole, type Role } from "./roles";

export type CurrentUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: number | null;
  companyCode: string | null;
  companyName: string | null;
  factoryId: number | null;
  departmentId: number | null;
  avatarPath: string | null;
};

/**
 * The single place that turns a cookie into a user. The JWT only carries the id and
 * session version; status, role and tenant are re-read from the DB on every request so
 * suspending a user or changing a password takes effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const claims = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!claims) return null;

  const u = await db.user.findUnique({
    where: { userId: claims.uid },
    include: { role: true, company: true, factory: { select: { status: true } } },
  });
  if (!u || u.status !== "ACTIVE" || u.sessionVersion !== claims.ver) return null;
  if (!isRole(u.role.roleName)) return null;
  if (u.company && u.company.status !== "ACTIVE") return null;
  if (u.factory && u.factory.status !== "ACTIVE") return null;
  // Maintenance mode signs everyone out except platform admins.
  if (u.role.roleName !== "PLATFORM_ADMIN" && (await getRuntimeSettings(db)).maintenanceMode) return null;

  return {
    id: u.userId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role.roleName,
    companyId: u.companyId,
    companyCode: u.company?.companyCode ?? null,
    companyName: u.company?.companyName ?? null,
    factoryId: u.factoryId,
    departmentId: u.departmentId,
    avatarPath: u.profileImagePath,
  };
});

/** For pages and layouts: redirects instead of throwing. */
export async function requireUser(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export type TenantUser = CurrentUser & { companyId: number };

/** Company-scoped roles always have a company; fail loudly if data says otherwise. */
export async function requireTenantUser(...roles: Exclude<Role, "PLATFORM_ADMIN">[]): Promise<TenantUser> {
  const user = await requireUser(...roles);
  if (user.companyId === null) redirect("/login?error=no-company");
  return user as TenantUser;
}
