import "server-only";

import { prisma } from "@/lib/prisma";

export async function getFactoriesByCompany(companyId: number) {
  return prisma.factory.findMany({
    where: {
      companyId,
      status: "ACTIVE",
    },
    orderBy: {
      factoryName: "asc",
    },
    select: {
      factoryId: true,
      factoryCode: true,
      factoryName: true,
      province: true,
      country: true,
    },
  });
}

export async function getBuildingsByFactory(factoryId: number) {
  return prisma.building.findMany({
    where: {
      factoryId,
      status: "ACTIVE",
    },
    orderBy: {
      buildingName: "asc",
    },
    select: {
      buildingId: true,
      buildingCode: true,
      buildingName: true,
      buildingType: true,
    },
  });
}

export async function getDepartmentsByBuilding(buildingId: number) {
  return prisma.department.findMany({
    where: {
      buildingId,
      status: "ACTIVE",
    },
    orderBy: {
      departmentName: "asc",
    },
    select: {
      departmentId: true,
      departmentCode: true,
      departmentName: true,
    },
  });
}

export async function getProductionLinesByDepartment(
  departmentId: number
) {
  return prisma.productionLine.findMany({
    where: {
      departmentId,
      status: "ACTIVE",
    },
    orderBy: {
      lineName: "asc",
    },
    select: {
      lineId: true,
      lineCode: true,
      lineName: true,
    },
  });
}

export async function getMachinesByLine(lineId: number) {
  return prisma.machine.findMany({
    where: {
      lineId,
      status: "ACTIVE",
    },
    orderBy: {
      machineName: "asc",
    },
    select: {
      machineId: true,
      machineCode: true,
      machineName: true,
      operationalStatus: true,
      machineType: {
        select: {
          machineTypeId: true,
          machineTypeCode: true,
          machineTypeName: true,
        },
      },
    },
  });
}