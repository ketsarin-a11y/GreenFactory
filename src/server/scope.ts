import "server-only";
import type { CurrentUser } from "@/server/auth/current-user";

/**
 * Prisma `where` fragments that limit every query to what the user may see.
 * Company admins see their whole company; managers and operators only their factory.
 * Use these in EVERY tenant query — never trust an id from the client on its own.
 */
type Scoped = Pick<CurrentUser, "role" | "companyId" | "factoryId">;

function tenant(user: Scoped) {
  if (user.companyId === null) throw new Error("Tenant scope requested for a user without a company");
  if (user.role === "MANAGER" || user.role === "OPERATOR") {
    // Fail closed: a factory-level user without a factory must not see the whole company.
    if (user.factoryId === null) throw new Error("Factory-level user has no factory assigned");
    return { companyId: user.companyId, factoryId: user.factoryId };
  }
  return { companyId: user.companyId, factoryId: undefined };
}

export const factoryWhere = (u: Scoped) => {
  const t = tenant(u);
  return { companyId: t.companyId, ...(t.factoryId ? { factoryId: t.factoryId } : {}) };
};
export const buildingWhere = (u: Scoped) => ({ factory: factoryWhere(u) });
export const departmentWhere = (u: Scoped) => ({ building: buildingWhere(u) });
export const lineWhere = (u: Scoped) => ({ department: departmentWhere(u) });
export const machineWhere = (u: Scoped) => ({ productionLine: lineWhere(u) });
export const checkpointWhere = (u: Scoped) => ({ productionLine: lineWhere(u) });
export const sensorWhere = (u: Scoped) => ({ machine: machineWhere(u) });
export const qrWhere = (u: Scoped) => ({ OR: [{ machine: machineWhere(u) }, { checkpoint: checkpointWhere(u) }] });

/** Rows that carry companyId/factoryId directly (usage, alert, recommendation, KPI, report). */
export const ownedWhere = (u: Scoped) => {
  const t = tenant(u);
  return { companyId: t.companyId, ...(t.factoryId ? { factoryId: t.factoryId } : {}) };
};
export const usageWhere = (u: Scoped) => ({ ...ownedWhere(u), status: "ACTIVE" });
export const companyUserWhere = (u: Scoped) => ({ companyId: tenant(u).companyId });
