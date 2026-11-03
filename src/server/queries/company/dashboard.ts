import "server-only";
import { db } from "@/server/db";
import { companyUserWhere, machineWhere } from "@/server/scope";
import type { CurrentUser } from "@/server/auth/current-user";
import { companyReadiness } from "@/server/domain/readiness";
import { companyTree, factoryCounts } from "./tree";
import { connectionSummary, sensorsWithStatus } from "./sensors";

const nonAdmin = { role: { roleName: { in: ["MANAGER", "OPERATOR"] } } };

export async function companyDashboard(user: CurrentUser) {
  const users = companyUserWhere(user);
  const [tree, sensors, userTotal, userActive, managers, operators, inactive, noFactory, operatorNoDept, latestUsers, machinesNoSensor, machinesNoQr] =
    await Promise.all([
      companyTree(user),
      sensorsWithStatus(user),
      db.user.count({ where: users }),
      db.user.count({ where: { ...users, status: "ACTIVE" } }),
      db.user.count({ where: { ...users, status: "ACTIVE", role: { roleName: "MANAGER" } } }),
      db.user.count({ where: { ...users, status: "ACTIVE", role: { roleName: "OPERATOR" } } }),
      db.user.count({ where: { ...users, status: { not: "ACTIVE" } } }),
      db.user.count({ where: { ...users, ...nonAdmin, factoryId: null } }),
      db.user.count({ where: { ...users, role: { roleName: "OPERATOR" }, departmentId: null } }),
      db.user.findMany({
        where: users,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { userId: true, firstName: true, lastName: true, email: true, status: true, createdAt: true, role: { select: { roleName: true } }, factory: { select: { factoryName: true } } },
      }),
      db.machine.count({ where: { ...machineWhere(user), status: "ACTIVE", sensors: { none: { status: "ACTIVE" } } } }),
      db.machine.count({ where: { ...machineWhere(user), status: "ACTIVE", qrCodes: { none: { qrStatus: "ACTIVE" } } } }),
    ]);

  const factories = tree.map((f) => ({ id: f.factoryId, code: f.factoryCode, name: f.factoryName, status: f.status, ...factoryCounts(f) }));
  const activeFactories = factories.filter((f) => f.status === "ACTIVE");
  const sum = (k: "buildings" | "departments" | "lines" | "machines" | "allMachines" | "machinesWithSensor" | "machinesWithQr") =>
    activeFactories.reduce((a, f) => a + f[k], 0);
  const readiness = companyReadiness({
    factories: activeFactories.length,
    buildings: sum("buildings"),
    departments: sum("departments"),
    lines: sum("lines"),
    users: userTotal,
    activeUsers: userActive,
    machines: sum("allMachines"),
    activeMachines: sum("machines"),
    machinesWithSensor: sum("machinesWithSensor"),
    machinesWithQr: sum("machinesWithQr"),
  });

  return {
    readiness,
    users: { total: userTotal, active: userActive, managers, operators, inactive, noFactory, operatorNoDept },
    factories,
    machines: { total: sum("allMachines"), active: sum("machines"), noSensor: machinesNoSensor, noQr: machinesNoQr },
    sensors: connectionSummary(sensors),
    latestUsers,
  };
}
