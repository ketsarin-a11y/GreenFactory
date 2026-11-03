import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { PAGE_SIZE, intParam, oneOf, paging, str, type SP } from "./common";

export const FACTORY_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export async function listFactories(sp: SP, page: number) {
  const q = str(sp, "q");
  const companyId = intParam(sp, "company");
  const status = oneOf(sp, "status", FACTORY_STATUSES);
  const where: Prisma.FactoryWhereInput = {
    ...(companyId ? { companyId } : {}),
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ factoryCode: { contains: q } }, { factoryName: { contains: q } }, { province: { contains: q } }, { company: { companyName: { contains: q } } }] } : {}),
  };
  const [total, rows, companies] = await Promise.all([
    db.factory.count({ where }),
    db.factory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paging(page),
      select: {
        factoryId: true,
        factoryCode: true,
        factoryName: true,
        province: true,
        status: true,
        createdAt: true,
        company: { select: { companyId: true, companyName: true, companyCode: true } },
        _count: { select: { buildings: true, users: true, resourceUsages: true } },
      },
    }),
    db.company.findMany({ orderBy: { companyName: "asc" }, select: { companyId: true, companyName: true, status: true } }),
  ]);
  return { total, totalPages: Math.ceil(total / PAGE_SIZE), rows, companies };
}
