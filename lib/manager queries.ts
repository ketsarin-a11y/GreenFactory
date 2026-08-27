import "server-only";

import { prisma } from "@/lib/prisma";

export interface KpiWithTrend {
  total: number;
  unit: string;
  changePct: number;
}

export interface TrendPoint {
  dateLabel: string;
  [department: string]: number | string;
}

export interface DepartmentShare {
  department: string;
  value: number;
  percent: number;
}

export interface ResourceDetailData {
  total: number;
  unit: string;
  changePct: number;
  trend: TrendPoint[];
  departments: string[];
  breakdown: DepartmentShare[];
  lastUpdatedAt: string | null;
}

export interface ManagerDashboardData {
  energy: KpiWithTrend;
  water: KpiWithTrend;
  trend: TrendPoint[];
  departments: string[];
  breakdown: DepartmentShare[];
  lastUpdatedAt: string | null;
}

export const WATER_TYPES = ["WATER", "DI_WATER", "CHILLED_WATER"] as const;
export const ENERGY_TYPES = ["ELECTRICITY"] as const;

/**
 * ค่าประมาณสำหรับ Dashboard
 * ภายหลังควรเปลี่ยนไปใช้ EmissionFactor/CarbonResult ที่ผ่าน workflow จริง
 */
export const EMISSION_FACTORS_KGCO2E: Record<string, number> = {
  ELECTRICITY: 0.4999,
  WATER: 0.344,
  DI_WATER: 0.344,
  CHILLED_WATER: 0.4,
  COMPRESSED_AIR: 0.15,
  NITROGEN: 0.2,
  GAS: 3.0,
  STEAM: 0.2,
  DIESEL: 2.68,
};

export const SCOPE_MAP: Record<
  string,
  "Scope 1" | "Scope 2" | "Scope 3"
> = {
  DIESEL: "Scope 1",
  GAS: "Scope 1",
  STEAM: "Scope 1",
  NITROGEN: "Scope 1",
  ELECTRICITY: "Scope 2",
  WATER: "Scope 3",
  DI_WATER: "Scope 3",
  CHILLED_WATER: "Scope 3",
  COMPRESSED_AIR: "Scope 3",
};

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function previousRange(startDate: Date, endDate: Date) {
  const rangeDays = Math.max(
    1,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / 86400000,
    ) + 1,
  );

  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  prevStart.setHours(0, 0, 0, 0);

  const prevEnd = new Date(startDate);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  return { prevStart, prevEnd };
}

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

/**
 * Source of truth:
 * ResourceUsage = ตารางเดียวกับที่ Operator บันทึกจริง
 */
export async function computeResourceMetrics(
  companyId: number | null,
  resourceCodes: readonly string[],
  startDate: Date,
  endDate: Date,
  fallbackUnit: string,
): Promise<ResourceDetailData> {
  if (companyId === null) {
    return {
      total: 0,
      unit: fallbackUnit,
      changePct: 0,
      trend: [],
      departments: [],
      breakdown: [],
      lastUpdatedAt: null,
    };
  }

  const rangeEnd = endOfDay(endDate);
  const { prevStart, prevEnd } = previousRange(startDate, endDate);

  const [currentUsages, previousUsages, latestUsage] =
    await Promise.all([
      prisma.resourceUsage.findMany({
        where: {
          companyId,
          status: "ACTIVE",
          usageAt: {
            gte: startDate,
            lte: rangeEnd,
          },
          resourceType: {
            resourceCode: {
              in: [...resourceCodes],
            },
          },
        },
        select: {
          quantity: true,
          usageAt: true,
          department: {
            select: {
              departmentId: true,
              departmentName: true,
            },
          },
          unit: {
            select: {
              symbol: true,
            },
          },
        },
        orderBy: {
          usageAt: "asc",
        },
      }),

      prisma.resourceUsage.findMany({
        where: {
          companyId,
          status: "ACTIVE",
          usageAt: {
            gte: prevStart,
            lte: prevEnd,
          },
          resourceType: {
            resourceCode: {
              in: [...resourceCodes],
            },
          },
        },
        select: {
          quantity: true,
        },
      }),

      prisma.resourceUsage.findFirst({
        where: {
          companyId,
          status: "ACTIVE",
          resourceType: {
            resourceCode: {
              in: [...resourceCodes],
            },
          },
        },
        orderBy: {
          usageAt: "desc",
        },
        select: {
          usageAt: true,
          unit: {
            select: {
              symbol: true,
            },
          },
        },
      }),
    ]);

  const currentTotal = currentUsages.reduce(
    (sum, usage) => sum + toNumber(usage.quantity),
    0,
  );

  const previousTotal = previousUsages.reduce(
    (sum, usage) => sum + toNumber(usage.quantity),
    0,
  );

  const departmentSet = new Set<string>();
  const departmentTotals = new Map<string, number>();
  const trendMap = new Map<string, Record<string, number>>();

  for (const usage of currentUsages) {
    const quantity = toNumber(usage.quantity);

    const departmentName =
      usage.department?.departmentName ?? "ไม่ระบุแผนก";

    departmentSet.add(departmentName);

    departmentTotals.set(
      departmentName,
      (departmentTotals.get(departmentName) ?? 0) + quantity,
    );

    const dateKey = usage.usageAt.toISOString().slice(0, 10);
    const day = trendMap.get(dateKey) ?? {};

    day[departmentName] =
      (day[departmentName] ?? 0) + quantity;

    trendMap.set(dateKey, day);
  }

  const departments = Array.from(departmentSet);

  const trend: TrendPoint[] = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, values]) => ({
      dateLabel: new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
      }).format(new Date(`${dateKey}T00:00:00`)),
      ...values,
    }));

  const breakdown: DepartmentShare[] = Array.from(
    departmentTotals.entries(),
  )
    .map(([department, value]) => ({
      department,
      value: round2(value),
      percent:
        currentTotal > 0
          ? Math.round((value / currentTotal) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    total: round2(currentTotal),
    unit:
      latestUsage?.unit.symbol ??
      currentUsages[0]?.unit.symbol ??
      fallbackUnit,
    changePct: pctChange(currentTotal, previousTotal),
    trend,
    departments,
    breakdown,
    lastUpdatedAt:
      latestUsage?.usageAt.toISOString() ?? null,
  };
}

export async function getManagerDashboardData(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<ManagerDashboardData> {
  const [energyDetail, waterDetail] = await Promise.all([
    computeResourceMetrics(
      companyId,
      ENERGY_TYPES,
      startDate,
      endDate,
      "kWh",
    ),
    computeResourceMetrics(
      companyId,
      WATER_TYPES,
      startDate,
      endDate,
      "m³",
    ),
  ]);

  return {
    energy: {
      total: energyDetail.total,
      unit: energyDetail.unit,
      changePct: energyDetail.changePct,
    },
    water: {
      total: waterDetail.total,
      unit: waterDetail.unit,
      changePct: waterDetail.changePct,
    },
    trend: energyDetail.trend,
    departments: energyDetail.departments,
    breakdown: energyDetail.breakdown,
    lastUpdatedAt:
      energyDetail.lastUpdatedAt ??
      waterDetail.lastUpdatedAt,
  };
}

export interface DepartmentSummary {
  department: string;
  equipmentCount: number;
  energyTotal: number;
  waterTotal: number;
}

/**
 * equipmentCount ใน interface เดิมคงชื่อไว้เพื่อไม่ให้หน้าเก่าพัง
 * แต่ค่าที่คืนคือจำนวน Machine จริงในแผนก
 */
export async function getDepartmentSummaries(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<DepartmentSummary[]> {
  if (companyId === null) return [];

  const rangeEnd = endOfDay(endDate);

  const [departments, usages] = await Promise.all([
    prisma.department.findMany({
      where: {
        building: {
          factory: {
            companyId,
          },
        },
        status: "ACTIVE",
      },
      select: {
        departmentId: true,
        departmentName: true,
        productionLines: {
          select: {
            machines: {
              where: {
                status: "ACTIVE",
              },
              select: {
                machineId: true,
              },
            },
          },
        },
      },
    }),

    prisma.resourceUsage.findMany({
      where: {
        companyId,
        status: "ACTIVE",
        usageAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
      select: {
        quantity: true,
        departmentId: true,
        resourceType: {
          select: {
            resourceCode: true,
          },
        },
      },
    }),
  ]);

  const summary = new Map<number, DepartmentSummary>();

  for (const department of departments) {
    const machineIds = new Set(
      department.productionLines.flatMap((line) =>
        line.machines.map((machine) => machine.machineId),
      ),
    );

    summary.set(department.departmentId, {
      department: department.departmentName,
      equipmentCount: machineIds.size,
      energyTotal: 0,
      waterTotal: 0,
    });
  }

  for (const usage of usages) {
    if (usage.departmentId === null) continue;

    const row = summary.get(usage.departmentId);
    if (!row) continue;

    const quantity = toNumber(usage.quantity);
    const code = usage.resourceType.resourceCode;

    if ((ENERGY_TYPES as readonly string[]).includes(code)) {
      row.energyTotal += quantity;
    }

    if ((WATER_TYPES as readonly string[]).includes(code)) {
      row.waterTotal += quantity;
    }
  }

  return Array.from(summary.values())
    .map((row) => ({
      ...row,
      energyTotal: round2(row.energyTotal),
      waterTotal: round2(row.waterTotal),
    }))
    .sort((a, b) => b.energyTotal - a.energyTotal);
}

export interface CarbonBreakdownItem {
  resourceType: string;
  label: string;
  usageValue: number;
  unit: string;
  carbonKg: number;
  percent: number;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
}

export interface ScopeTotal {
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  carbonKg: number;
  percent: number;
}

export interface CarbonFootprintData {
  totalKgCO2e: number;
  changePct: number;
  breakdown: CarbonBreakdownItem[];
  scopeTotals: ScopeTotal[];
  lastUpdatedAt: string | null;
}

/**
 * Carbon ใน Dashboard คำนวณทันทีจาก ResourceUsage
 * จึงเห็นข้อมูลหลัง Operator บันทึกได้เลย
 *
 * หมายเหตุ: factor ชุดนี้ยังเป็นค่าประมาณของ dashboard
 * เมื่อ workflow CarbonResult พร้อม ควรเปลี่ยนไปอ่าน CarbonResult
 */
export async function getCarbonFootprint(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<CarbonFootprintData> {
  if (companyId === null) {
    return {
      totalKgCO2e: 0,
      changePct: 0,
      breakdown: [],
      scopeTotals: [],
      lastUpdatedAt: null,
    };
  }

  const rangeEnd = endOfDay(endDate);
  const { prevStart, prevEnd } = previousRange(startDate, endDate);

  const [currentUsages, previousUsages, latestUsage] =
    await Promise.all([
      prisma.resourceUsage.findMany({
        where: {
          companyId,
          status: "ACTIVE",
          usageAt: {
            gte: startDate,
            lte: rangeEnd,
          },
        },
        select: {
          quantity: true,
          usageAt: true,
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
      }),

      prisma.resourceUsage.findMany({
        where: {
          companyId,
          status: "ACTIVE",
          usageAt: {
            gte: prevStart,
            lte: prevEnd,
          },
        },
        select: {
          quantity: true,
          resourceType: {
            select: {
              resourceCode: true,
            },
          },
        },
      }),

      prisma.resourceUsage.findFirst({
        where: {
          companyId,
          status: "ACTIVE",
        },
        orderBy: {
          usageAt: "desc",
        },
        select: {
          usageAt: true,
        },
      }),
    ]);

  const carbonTotal = (
    usages: {
      quantity: unknown;
      resourceType: { resourceCode: string };
    }[],
  ) =>
    usages.reduce((sum, usage) => {
      const code = usage.resourceType.resourceCode;
      const factor =
        EMISSION_FACTORS_KGCO2E[code] ?? 0;

      return sum + toNumber(usage.quantity) * factor;
    }, 0);

  const currentCarbon = carbonTotal(currentUsages);
  const previousCarbon = carbonTotal(previousUsages);

  const byType = new Map<
    string,
    {
      label: string;
      usageValue: number;
      unit: string;
      carbonKg: number;
      scope: "Scope 1" | "Scope 2" | "Scope 3";
    }
  >();

  for (const usage of currentUsages) {
    const code = usage.resourceType.resourceCode;
    const factor =
      EMISSION_FACTORS_KGCO2E[code] ?? 0;

    if (factor <= 0) continue;

    const quantity = toNumber(usage.quantity);
    const carbonKg = quantity * factor;

    const current = byType.get(code) ?? {
      label: usage.resourceType.resourceName,
      usageValue: 0,
      unit: usage.unit.symbol,
      carbonKg: 0,
      scope: SCOPE_MAP[code] ?? "Scope 3",
    };

    current.usageValue += quantity;
    current.carbonKg += carbonKg;

    byType.set(code, current);
  }

  const breakdown: CarbonBreakdownItem[] = Array.from(
    byType.entries(),
  )
    .map(([resourceType, item]) => ({
      resourceType,
      label: item.label,
      usageValue: round2(item.usageValue),
      unit: item.unit,
      carbonKg: round2(item.carbonKg),
      percent:
        currentCarbon > 0
          ? Math.round(
              (item.carbonKg / currentCarbon) * 1000,
            ) / 10
          : 0,
      scope: item.scope,
    }))
    .sort((a, b) => b.carbonKg - a.carbonKg);

  const scopeMap = new Map<
    "Scope 1" | "Scope 2" | "Scope 3",
    number
  >();

  for (const item of breakdown) {
    scopeMap.set(
      item.scope,
      (scopeMap.get(item.scope) ?? 0) +
        item.carbonKg,
    );
  }

  const scopeTotals: ScopeTotal[] = (
    ["Scope 1", "Scope 2", "Scope 3"] as const
  )
    .map((scope) => {
      const carbonKg = round2(scopeMap.get(scope) ?? 0);

      return {
        scope,
        carbonKg,
        percent:
          currentCarbon > 0
            ? Math.round(
                (carbonKg / currentCarbon) * 1000,
              ) / 10
            : 0,
      };
    })
    .filter((scope) => scope.carbonKg > 0);

  return {
    totalKgCO2e: round2(currentCarbon),
    changePct: pctChange(
      currentCarbon,
      previousCarbon,
    ),
    breakdown,
    scopeTotals,
    lastUpdatedAt:
      latestUsage?.usageAt.toISOString() ?? null,
  };
}

export interface BuildingSummary {
  location: string;
  equipmentCount: number;
  energyTotal: number;
  waterTotal: number;
}

/**
 * location ใน interface เดิมคงชื่อไว้เพื่อให้ UI เดิมใช้ต่อได้
 * แต่ค่าจริงคือ Building.buildingName
 */
export async function getBuildingSummaries(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<BuildingSummary[]> {
  if (companyId === null) return [];

  const rangeEnd = endOfDay(endDate);

  const [buildings, usages] = await Promise.all([
    prisma.building.findMany({
      where: {
        factory: {
          companyId,
        },
        status: "ACTIVE",
      },
      select: {
        buildingId: true,
        buildingName: true,
        departments: {
          select: {
            productionLines: {
              select: {
                machines: {
                  where: {
                    status: "ACTIVE",
                  },
                  select: {
                    machineId: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.resourceUsage.findMany({
      where: {
        companyId,
        status: "ACTIVE",
        usageAt: {
          gte: startDate,
          lte: rangeEnd,
        },
      },
      select: {
        quantity: true,
        buildingId: true,
        resourceType: {
          select: {
            resourceCode: true,
          },
        },
      },
    }),
  ]);

  const summary = new Map<number, BuildingSummary>();

  for (const building of buildings) {
    const machineIds = new Set(
      building.departments.flatMap((department) =>
        department.productionLines.flatMap((line) =>
          line.machines.map((machine) => machine.machineId),
        ),
      ),
    );

    summary.set(building.buildingId, {
      location: building.buildingName,
      equipmentCount: machineIds.size,
      energyTotal: 0,
      waterTotal: 0,
    });
  }

  for (const usage of usages) {
    if (usage.buildingId === null) continue;

    const row = summary.get(usage.buildingId);
    if (!row) continue;

    const quantity = toNumber(usage.quantity);
    const code = usage.resourceType.resourceCode;

    if ((ENERGY_TYPES as readonly string[]).includes(code)) {
      row.energyTotal += quantity;
    }

    if ((WATER_TYPES as readonly string[]).includes(code)) {
      row.waterTotal += quantity;
    }
  }

  return Array.from(summary.values())
    .map((row) => ({
      ...row,
      energyTotal: round2(row.energyTotal),
      waterTotal: round2(row.waterTotal),
    }))
    .sort((a, b) => b.energyTotal - a.energyTotal);
}

export interface ComparisonPeriodResult {
  label: string;
  from: string;
  to: string;
  energy: number;
  water: number;
}

export async function getComparisonMetrics(
  companyId: number | null,
  periods: {
    label: string;
    from: Date;
    to: Date;
  }[],
): Promise<ComparisonPeriodResult[]> {
  if (companyId === null) {
    return periods.map((period) => ({
      label: period.label,
      from: period.from.toISOString().slice(0, 10),
      to: period.to.toISOString().slice(0, 10),
      energy: 0,
      water: 0,
    }));
  }

  return Promise.all(
    periods.map(async (period) => {
      const usages =
        await prisma.resourceUsage.findMany({
          where: {
            companyId,
            status: "ACTIVE",
            usageAt: {
              gte: period.from,
              lte: endOfDay(period.to),
            },
            resourceType: {
              resourceCode: {
                in: [
                  ...ENERGY_TYPES,
                  ...WATER_TYPES,
                ],
              },
            },
          },
          select: {
            quantity: true,
            resourceType: {
              select: {
                resourceCode: true,
              },
            },
          },
        });

      let energy = 0;
      let water = 0;

      for (const usage of usages) {
        const quantity = toNumber(usage.quantity);
        const code =
          usage.resourceType.resourceCode;

        if (
          (ENERGY_TYPES as readonly string[]).includes(
            code,
          )
        ) {
          energy += quantity;
        }

        if (
          (WATER_TYPES as readonly string[]).includes(
            code,
          )
        ) {
          water += quantity;
        }
      }

      return {
        label: period.label,
        from: period.from.toISOString().slice(0, 10),
        to: period.to.toISOString().slice(0, 10),
        energy: round2(energy),
        water: round2(water),
      };
    }),
  );
}


export interface ManagerResourceSummary {
  resourceCode: string;
  resourceName: string;
  total: number;
  unit: string;
  recordCount: number;
}

export interface ManagerActivityPoint {
  dateKey: string;
  label: string;
  count: number;
}

export interface ManagerRecentRecord {
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
  dateLabel: string;
  timeLabel: string;
}

export interface ManagerResourceDashboard {
  totalRecords: number;
  totalMachines: number;
  resourceTypeCount: number;
  pendingCount: number;
  qrCount: number;
  manualCount: number;
  activity: ManagerActivityPoint[];
  resources: ManagerResourceSummary[];
  recentRecords: ManagerRecentRecord[];
  lastUpdatedAt: string | null;
}

/**
 * Dashboard หลักของ Manager
 * อ่านจาก ResourceUsage ซึ่งเป็น source of truth เดียวกับ Operator
 *
 * ไม่รวมปริมาณของ resource ที่คนละหน่วยเข้าด้วยกัน
 * เช่น kg, L, kWh จะแสดงแยกประเภท
 */
export async function getManagerResourceDashboard(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<ManagerResourceDashboard> {
  if (companyId === null) {
    return {
      totalRecords: 0,
      totalMachines: 0,
      resourceTypeCount: 0,
      pendingCount: 0,
      qrCount: 0,
      manualCount: 0,
      activity: [],
      resources: [],
      recentRecords: [],
      lastUpdatedAt: null,
    };
  }

  const rangeEnd = endOfDay(endDate);

  const usages = await prisma.resourceUsage.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      usageAt: {
        gte: startDate,
        lte: rangeEnd,
      },
    },
    select: {
      usageId: true,
      usageReference: true,
      quantity: true,
      usageAt: true,
      sourceType: true,
      processingStatus: true,
      machineId: true,
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
    orderBy: {
      usageAt: "desc",
    },
  });

  const resourceMap = new Map<string, ManagerResourceSummary>();
  const machineIds = new Set<number>();
  const activityMap = new Map<string, number>();

  let pendingCount = 0;
  let qrCount = 0;
  let manualCount = 0;

  for (const usage of usages) {
    if (usage.machineId !== null) {
      machineIds.add(usage.machineId);
    }

    if (usage.processingStatus === "PENDING") {
      pendingCount += 1;
    }

    if (usage.sourceType === "QR") {
      qrCount += 1;
    } else {
      manualCount += 1;
    }

    const resourceKey =
      `${usage.resourceType.resourceCode}::${usage.unit.symbol}`;

    const existing = resourceMap.get(resourceKey) ?? {
      resourceCode: usage.resourceType.resourceCode,
      resourceName: usage.resourceType.resourceName,
      total: 0,
      unit: usage.unit.symbol,
      recordCount: 0,
    };

    existing.total += toNumber(usage.quantity);
    existing.recordCount += 1;
    resourceMap.set(resourceKey, existing);

    const dateKey = usage.usageAt.toISOString().slice(0, 10);
    activityMap.set(
      dateKey,
      (activityMap.get(dateKey) ?? 0) + 1,
    );
  }

  const activity: ManagerActivityPoint[] = [];

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateKey = date.toISOString().slice(0, 10);

    activity.push({
      dateKey,
      label: new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
      }).format(date),
      count: activityMap.get(dateKey) ?? 0,
    });
  }

  const resources = Array.from(resourceMap.values())
    .map((item) => ({
      ...item,
      total: round2(item.total),
    }))
    .sort((a, b) => b.recordCount - a.recordCount);

  const recentRecords: ManagerRecentRecord[] = usages
    .slice(0, 8)
    .map((usage) => ({
      id: String(usage.usageId),
      reference: usage.usageReference,
      machineName:
        usage.machine?.machineName ?? "จุดตรวจ",
      departmentName:
        usage.department?.departmentName ?? "-",
      buildingName:
        usage.building?.buildingName ?? "-",
      resourceCode:
        usage.resourceType.resourceCode,
      resourceName:
        usage.resourceType.resourceName,
      quantity: round2(toNumber(usage.quantity)),
      unit: usage.unit.symbol,
      sourceType: usage.sourceType,
      processingStatus: usage.processingStatus,
      dateLabel: new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(usage.usageAt),
      timeLabel: new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(usage.usageAt),
    }));

  return {
    totalRecords: usages.length,
    totalMachines: machineIds.size,
    resourceTypeCount: resources.length,
    pendingCount,
    qrCount,
    manualCount,
    activity,
    resources,
    recentRecords,
    lastUpdatedAt:
      usages[0]?.usageAt.toISOString() ?? null,
  };
}
