import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ALLOWED_RESOURCE_CODES = new Set([
  "ELECTRICITY",
  "WATER",
  "DI_WATER",
  "CHILLED_WATER",
  "COMPRESSED_AIR",
  "GAS",
  "STEAM",
  "NITROGEN",
  "DIESEL",
]);

function toNumber(value: unknown): number {
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

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationStdDev(values: number[], average: number) {
  if (values.length === 0) return 0;
  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length;
  return Math.sqrt(variance);
}

function parsePositiveInt(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (session.roleName !== "MANAGER" || !session.companyId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const selectedDate = parseDate(params.get("date"));
  const fromDate = parseDate(params.get("from"));
  const toDate = parseDate(params.get("to"), true);

  if (!selectedDate || !fromDate || !toDate || fromDate > toDate) {
    return NextResponse.json({ error: "INVALID_DATE_RANGE" }, { status: 400 });
  }

  const selectedDayStart = new Date(selectedDate);
  selectedDayStart.setHours(0, 0, 0, 0);
  const selectedDayEnd = new Date(selectedDate);
  selectedDayEnd.setHours(23, 59, 59, 999);

  const resourceCodes = (params.get("resources") ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  if (
    resourceCodes.length === 0 ||
    resourceCodes.some((code) => !ALLOWED_RESOURCE_CODES.has(code))
  ) {
    return NextResponse.json({ error: "INVALID_RESOURCE" }, { status: 400 });
  }

  const buildingId = parsePositiveInt(params.get("building"));
  const departmentId = parsePositiveInt(params.get("department"));
  const productionLineId = parsePositiveInt(params.get("line"));
  const machineId = parsePositiveInt(params.get("machine"));

  const hierarchyWhere = {
    ...(buildingId ? { buildingId } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(machineId ? { machineId } : {}),
    ...(productionLineId
      ? {
          machine: {
            lineId: productionLineId,
          },
        }
      : {}),
  };

  const commonWhere = {
    companyId: session.companyId,
    status: "ACTIVE" as const,
    ...hierarchyWhere,
    resourceType: {
      resourceCode: {
        in: resourceCodes,
      },
    },
  };

  const [rangeUsages, selectedDayUsages] = await Promise.all([
    prisma.resourceUsage.findMany({
      where: {
        ...commonWhere,
        usageAt: { gte: fromDate, lte: toDate },
      },
      select: { quantity: true, usageAt: true },
      orderBy: { usageAt: "asc" },
    }),
    prisma.resourceUsage.findMany({
      where: {
        ...commonWhere,
        usageAt: { gte: selectedDayStart, lte: selectedDayEnd },
      },
      select: {
        usageId: true,
        usageReference: true,
        quantity: true,
        usageAt: true,
        sourceType: true,
        processingStatus: true,
        machineId: true,
        machine: { select: { machineCode: true, machineName: true } },
        building: { select: { buildingName: true } },
        department: { select: { departmentName: true } },
        resourceType: {
          select: { resourceCode: true, resourceName: true },
        },
        unit: { select: { symbol: true } },
      },
      orderBy: { usageAt: "desc" },
    }),
  ]);

  const dailyMap = new Map<string, number>();
  for (
    let cursor = new Date(fromDate);
    cursor <= toDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    dailyMap.set(dateKey(cursor), 0);
  }

  for (const usage of rangeUsages) {
    const key = dateKey(usage.usageAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + toNumber(usage.quantity));
  }

  const dailyValues = Array.from(dailyMap.values());
  const average = mean(dailyValues);
  const standardDeviation = populationStdDev(dailyValues, average);
  const observed = selectedDayUsages.reduce(
    (sum, usage) => sum + toNumber(usage.quantity),
    0,
  );
  const zScore =
    standardDeviation > 0 ? (observed - average) / standardDeviation : 0;
  const isAnomaly = Math.abs(zScore) >= 2;

  const machineMap = new Map<
    string,
    {
      machineId: number | null;
      machineCode: string;
      machineName: string;
      total: number;
      recordCount: number;
    }
  >();

  for (const usage of selectedDayUsages) {
    const key = usage.machineId !== null ? String(usage.machineId) : "unassigned";
    const current = machineMap.get(key) ?? {
      machineId: usage.machineId,
      machineCode: usage.machine?.machineCode ?? "-",
      machineName: usage.machine?.machineName ?? "ไม่ระบุเครื่องจักร",
      total: 0,
      recordCount: 0,
    };
    current.total += toNumber(usage.quantity);
    current.recordCount += 1;
    machineMap.set(key, current);
  }

  const contributors = Array.from(machineMap.values())
    .map((item) => ({
      ...item,
      total: round2(item.total),
      percent:
        observed > 0 ? Math.round((item.total / observed) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const records = selectedDayUsages.map((usage) => ({
    id: String(usage.usageId),
    reference: usage.usageReference,
    resourceCode: usage.resourceType.resourceCode,
    resourceName: usage.resourceType.resourceName,
    quantity: round2(toNumber(usage.quantity)),
    unit: usage.unit.symbol,
    machineCode: usage.machine?.machineCode ?? "-",
    machineName: usage.machine?.machineName ?? "ไม่ระบุเครื่องจักร",
    buildingName: usage.building?.buildingName ?? "-",
    departmentName: usage.department?.departmentName ?? "-",
    sourceType: usage.sourceType,
    processingStatus: usage.processingStatus,
    usageAt: usage.usageAt.toISOString(),
  }));

  const top = contributors[0] ?? null;
  let conclusion = "ยังไม่พบข้อมูลในวันที่เลือก";
  if (observed > 0 && isAnomaly && top) {
    conclusion = `${top.machineName} มีสัดส่วนสูงสุด ${top.percent}% ของการใช้ในวันที่ผิดปกติ`;
  } else if (observed > 0 && top?.percent >= 60) {
    conclusion = `${top.machineName} เป็นผู้ใช้หลัก คิดเป็น ${top.percent}% ของวันนี้`;
  } else if (observed > 0) {
    conclusion = "การใช้วันนี้ยังไม่เกินเกณฑ์ความผิดปกติทางสถิติ";
  }

  return NextResponse.json({
    date: dateKey(selectedDayStart),
    observed: round2(observed),
    unit: selectedDayUsages[0]?.unit.symbol ?? "",
    statistics: {
      mean: round2(average),
      standardDeviation: round2(standardDeviation),
      upperBand: round2(average + 2 * standardDeviation),
      lowerBand: round2(Math.max(0, average - 2 * standardDeviation)),
      zScore: round2(zScore),
      threshold: 2,
      isAnomaly,
      sampleDays: dailyValues.length,
    },
    conclusion,
    contributors,
    records,
    dataLineage: {
      source: "ResourceUsage",
      companyScoped: true,
      resourceCodes,
      from: dateKey(fromDate),
      to: dateKey(toDate),
      filters: {
        buildingId: buildingId ?? null,
        departmentId: departmentId ?? null,
        productionLineId: productionLineId ?? null,
        machineId: machineId ?? null,
      },
    },
  });
}
