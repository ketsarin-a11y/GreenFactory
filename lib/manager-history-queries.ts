import "server-only";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export type ManagerHistoryFilters = {
  page?: number;
  from?: string | null;
  to?: string | null;
  q?: string | null;
  source?: string | null;
};

export type ManagerHistoryRecord = {
  id: string;
  reference: string;
  machineName: string;
  departmentName: string;
  buildingName: string;
  resourceCode: string;
  resourceName: string;
  quantity: number;
  unit: string;
  sourceType: string;
  processingStatus: string;
  usageAt: string;
};

export type ManagerHistoryResult = {
  records: ManagerHistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value ?? 0);
}

function bangkokStart(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function bangkokEnd(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T23:59:59.999+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getManagerResourceHistory(
  companyId: number | null,
  filters: ManagerHistoryFilters = {},
): Promise<ManagerHistoryResult> {
  const requestedPage =
    Number.isInteger(filters.page) && Number(filters.page) > 0
      ? Number(filters.page)
      : 1;

  if (companyId === null) {
    return {
      records: [],
      total: 0,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
    };
  }

  const from = bangkokStart(filters.from);
  const to = bangkokEnd(filters.to);
  const q = filters.q?.trim() ?? "";
  const source =
    filters.source === "QR" || filters.source === "MANUAL"
      ? filters.source
      : null;

  const where = {
    companyId,
    status: "ACTIVE",
    ...(from || to
      ? {
          usageAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(source ? { sourceType: source } : {}),
    ...(q
      ? {
          OR: [
            { usageReference: { contains: q } },
            { machine: { machineName: { contains: q } } },
            { department: { departmentName: { contains: q } } },
            { building: { buildingName: { contains: q } } },
            { resourceType: { resourceName: { contains: q } } },
            { resourceType: { resourceCode: { contains: q } } },
          ],
        }
      : {}),
  };

  const total = await prisma.resourceUsage.count({ where });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const rows = await prisma.resourceUsage.findMany({
    where,
    orderBy: [{ usageAt: "desc" }, { usageId: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      usageId: true,
      usageReference: true,
      quantity: true,
      usageAt: true,
      sourceType: true,
      processingStatus: true,
      machine: {
        select: {
          machineName: true,
        },
      },
      department: {
        select: {
          departmentName: true,
        },
      },
      building: {
        select: {
          buildingName: true,
        },
      },
      resourceType: {
        select: {
          resourceCode: true,
          resourceName: true,
        },
      },
      unit: {
        select: {
          symbol: true,
        },
      },
    },
  });

  return {
    records: rows.map((row) => ({
      id: row.usageId.toString(),
      reference: row.usageReference,
      machineName: row.machine?.machineName ?? "จุดตรวจ",
      departmentName: row.department?.departmentName ?? "-",
      buildingName: row.building?.buildingName ?? "-",
      resourceCode: row.resourceType.resourceCode,
      resourceName: row.resourceType.resourceName,
      quantity: Math.round(numberValue(row.quantity) * 100) / 100,
      unit: row.unit.symbol,
      sourceType: row.sourceType,
      processingStatus: row.processingStatus,
      usageAt: row.usageAt.toISOString(),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}