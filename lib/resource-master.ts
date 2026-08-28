import "server-only";

import { prisma } from "@/lib/prisma";

export async function getActiveResourceTypes() {
  return prisma.resourceTypeMaster.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      resourceName: "asc",
    },
    select: {
      resourceTypeId: true,
      resourceCode: true,
      resourceName: true,
      carbonCalculable: true,
      defaultUnit: {
        select: {
          unitId: true,
          unitCode: true,
          unitName: true,
          symbol: true,
        },
      },
      category: {
        select: {
          categoryId: true,
          categoryCode: true,
          categoryName: true,
        },
      },
    },
  });
}