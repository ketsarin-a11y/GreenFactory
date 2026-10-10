import "server-only";

import { prisma } from "@/lib/prisma";

export interface KpiWithTrend {

  total: number;

  unit: string;

  changePct: number;

}

export interface TrendPoint {

  dateKey: string;

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

  changePct: number | null;

  hasPreviousPeriodData: boolean;

  trend: TrendPoint[];

  departments: string[];

  breakdown: DepartmentShare[];

  lastUpdatedAt: string | null;

}

export interface ResourceMetricFilters {

  buildingId?: number;

  departmentId?: number;

  productionLineId?: number;

  machineId?: number;

}

export interface ManagerAnalyticsBuildingOption {

  id: number;

  name: string;

}

export interface ManagerAnalyticsDepartmentOption {

  id: number;

  name: string;

  buildingId: number;

}

export interface ManagerAnalyticsLineOption {

  id: number;

  name: string;

  departmentId: number;

  buildingId: number;

}

export interface ManagerAnalyticsMachineOption {

  id: number;

  code: string;

  name: string;

  lineId: number;

  departmentId: number;

  buildingId: number;

}

export interface ManagerAnalyticsFilterOptions {

  buildings: ManagerAnalyticsBuildingOption[];

  departments: ManagerAnalyticsDepartmentOption[];

  productionLines: ManagerAnalyticsLineOption[];

  machines: ManagerAnalyticsMachineOption[];

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

 * Carbon dashboard does not use hardcoded emission factors.

 * Carbon values are read from CALCULATED CARBON-V2 CarbonResult records.

 */

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

function toLocalDateKey(date: Date): string {

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

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

  filters: ResourceMetricFilters = {},

): Promise<ResourceDetailData> {

  if (companyId === null) {

    return {

  total: 0,

  unit: fallbackUnit,

  changePct: null,

  hasPreviousPeriodData: false,

  trend: [],

  departments: [],

  breakdown: [],

  lastUpdatedAt: null,

};

  }

  const rangeEnd = endOfDay(endDate);

  const { prevStart, prevEnd } = previousRange(startDate, endDate);

  const hierarchyWhere = {

    ...(filters.buildingId ? { buildingId: filters.buildingId } : {}),

    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),

    ...(filters.machineId ? { machineId: filters.machineId } : {}),

    ...(filters.productionLineId

      ? {

          machine: {

            lineId: filters.productionLineId,

          },

        }

      : {}),

  };

  const [currentUsages, previousUsages, latestUsage] =

    await Promise.all([

      prisma.resourceUsage.findMany({

        where: {

          companyId,

          status: "ACTIVE",

          ...hierarchyWhere,

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

          ...hierarchyWhere,

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

          ...hierarchyWhere,

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

  const hasPreviousPeriodData = previousUsages.length > 0;

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

    const dateKey = toLocalDateKey(usage.usageAt);

    const day = trendMap.get(dateKey) ?? {};

    day[departmentName] =

      (day[departmentName] ?? 0) + quantity;

    trendMap.set(dateKey, day);

  }

  const departments = Array.from(departmentSet);

  const trend: TrendPoint[] = Array.from(trendMap.entries())

    .sort(([a], [b]) => a.localeCompare(b))

    .map(([dateKey, values]) => ({

      dateKey,

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

    changePct:

  hasPreviousPeriodData && previousTotal > 0

    ? Math.round(

        ((currentTotal - previousTotal) / previousTotal) * 1000,

      ) / 10

    : null,

hasPreviousPeriodData,

    trend,

    departments,

    breakdown,

    lastUpdatedAt:

      latestUsage?.usageAt.toISOString() ?? null,

  };

}

export async function getManagerAnalyticsFilterOptions(

  companyId: number | null,

): Promise<ManagerAnalyticsFilterOptions> {

  if (companyId === null) {

    return {

      buildings: [],

      departments: [],

      productionLines: [],

      machines: [],

    };

  }

  const buildingRows = await prisma.building.findMany({

    where: {

      factory: {

        companyId,

      },

      status: "ACTIVE",

    },

    orderBy: {

      buildingName: "asc",

    },

    select: {

      buildingId: true,

      buildingName: true,

      departments: {

        where: {

          status: "ACTIVE",

        },

        orderBy: {

          departmentName: "asc",

        },

        select: {

          departmentId: true,

          departmentName: true,

          productionLines: {

            where: {

              status: "ACTIVE",

            },

            orderBy: {

              lineName: "asc",

            },

            select: {

              lineId: true,

              lineName: true,

              machines: {

                where: {

                  status: "ACTIVE",

                },

                orderBy: {

                  machineName: "asc",

                },

                select: {

                  machineId: true,

                  machineCode: true,

                  machineName: true,

                },

              },

            },

          },

        },

      },

    },

  });

  const buildings: ManagerAnalyticsBuildingOption[] = [];

  const departments: ManagerAnalyticsDepartmentOption[] = [];

  const productionLines: ManagerAnalyticsLineOption[] = [];

  const machines: ManagerAnalyticsMachineOption[] = [];

  for (const building of buildingRows) {

    buildings.push({

      id: building.buildingId,

      name: building.buildingName,

    });

    for (const department of building.departments) {

      departments.push({

        id: department.departmentId,

        name: department.departmentName,

        buildingId: building.buildingId,

      });

      for (const line of department.productionLines) {

        productionLines.push({

          id: line.lineId,

          name: line.lineName,

          departmentId: department.departmentId,

          buildingId: building.buildingId,

        });

        for (const machine of line.machines) {

          machines.push({

            id: machine.machineId,

            code: machine.machineCode,

            name: machine.machineName,

            lineId: line.lineId,

            departmentId: department.departmentId,

            buildingId: building.buildingId,

          });

        }

      }

    }

  }

  return {

    buildings,

    departments,

    productionLines,

    machines,

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

      changePct: energyDetail.changePct ?? 0,

    },

    water: {

      total: waterDetail.total,

      unit: waterDetail.unit,

      changePct: waterDetail.changePct ?? 0,

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

  factorUsed: number | null;

  factorUnit: string | null;

  factorSource: string | null;

  calculationVersion: string | null;

  hasMixedFactors: boolean;

}

export interface ScopeTotal {

  scope: "Scope 1" | "Scope 2" | "Scope 3";

  carbonKg: number;

  percent: number;

}

export interface CarbonFootprintData {

  totalKgCO2e: number;

  changePct: number | null;

  hasPreviousPeriodData: boolean;

  previousKgCO2e: number;

  breakdown: CarbonBreakdownItem[];

  scopeTotals: ScopeTotal[];

  lastUpdatedAt: string | null;

}

export async function getCarbonFootprint(

  companyId: number | null,

  startDate: Date,

  endDate: Date,

): Promise<CarbonFootprintData> {

  if (companyId === null) {

    return {

      totalKgCO2e: 0,

      changePct: null,

      hasPreviousPeriodData: false,

      previousKgCO2e: 0,

      breakdown: [],

      scopeTotals: [],

      lastUpdatedAt: null,

    };

  }

  const rangeEnd = endOfDay(endDate);

  const { prevStart, prevEnd } = previousRange(startDate, endDate);

  const normalizeScope = (

    scope: string,

  ): "Scope 1" | "Scope 2" | "Scope 3" | null => {

    const normalized = scope

      .trim()

      .toUpperCase()

      .replace(/[\s-]+/g, "_");

    if (

      normalized === "SCOPE_1" ||

      normalized === "SCOPE1"

    ) {

      return "Scope 1";

    }

    if (

      normalized === "SCOPE_2" ||

      normalized === "SCOPE2"

    ) {

      return "Scope 2";

    }

    if (

      normalized === "SCOPE_3" ||

      normalized === "SCOPE3"

    ) {

      return "Scope 3";

    }

    return null;

  };

  const carbonWhere = (from: Date, to: Date) => ({

    calculationStatus: "CALCULATED",

    calculationVersion: "CARBON-V2",

    usage: {

      companyId,

      status: "ACTIVE",

      usageAt: {

        gte: from,

        lte: to,

      },

    },

  });

  const [currentResults, previousResults, latestResult] =

    await Promise.all([

      prisma.carbonResult.findMany({

        where: carbonWhere(startDate, rangeEnd),

        select: {

          carbonValue: true,

          factorUsed: true,

          carbonUnit: true,

          scope: true,

          calculationVersion: true,

          calculatedAt: true,

          factor: {

            select: {

              factorUnit: true,

              source: true,

            },

          },

          usage: {

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

          },

        },

      }),

      prisma.carbonResult.findMany({

        where: carbonWhere(prevStart, prevEnd),

        select: {

          carbonValue: true,

        },

      }),

      prisma.carbonResult.findFirst({

        where: carbonWhere(startDate, rangeEnd),

        orderBy: [

          {

            usage: {

              usageAt: "desc",

            },

          },

          {

            calculatedAt: "desc",

          },

        ],

        select: {

          calculatedAt: true,

          usage: {

            select: {

              usageAt: true,

            },

          },

        },

      }),

    ]);

  const currentCarbon = currentResults.reduce(

    (sum, result) =>

      sum + toNumber(result.carbonValue),

    0,

  );

  const previousCarbon = previousResults.reduce(

    (sum, result) =>

      sum + toNumber(result.carbonValue),

    0,

  );

  const hasPreviousPeriodData =

    previousResults.length > 0;

  const changePct =

    hasPreviousPeriodData && previousCarbon > 0

      ? Math.round(

          ((currentCarbon - previousCarbon) /

            previousCarbon) *

            1000,

        ) / 10

      : null;

  const byType = new Map<

    string,

    {

      label: string;

      usageValue: number;

      unit: string;

      carbonKg: number;

      scope:

        | "Scope 1"

        | "Scope 2"

        | "Scope 3";

      factors: Set<number>;

      factorUnits: Set<string>;

      factorSources: Set<string>;

      calculationVersions: Set<string>;

    }

  >();

  for (const result of currentResults) {

    const code =

      result.usage.resourceType.resourceCode;

    const quantity =

      toNumber(result.usage.quantity);

    const carbonKg =

      toNumber(result.carbonValue);

    const scope =

      normalizeScope(result.scope);

    // Never guess an invalid/unknown scope as Scope 3.

    // The carbon total still comes from CarbonResult; only scope-classified views skip invalid scope rows.

    if (scope === null) continue;

    const current = byType.get(code) ?? {

      label:

        result.usage.resourceType.resourceName,

      usageValue: 0,

      unit: result.usage.unit.symbol,

      carbonKg: 0,

      scope,

      factors: new Set<number>(),

      factorUnits: new Set<string>(),

      factorSources: new Set<string>(),

      calculationVersions: new Set<string>(),

    };

    current.usageValue += quantity;

    current.carbonKg += carbonKg;

    const factorUsed =

      toNumber(result.factorUsed);

    if (Number.isFinite(factorUsed)) {

      current.factors.add(factorUsed);

    }

    if (result.factor?.factorUnit) {

      current.factorUnits.add(

        result.factor.factorUnit,

      );

    }

    if (result.factor?.source) {

      current.factorSources.add(

        result.factor.source,

      );

    }

    if (result.calculationVersion) {

      current.calculationVersions.add(

        result.calculationVersion,

      );

    }

    byType.set(code, current);

  }

  const breakdown: CarbonBreakdownItem[] =

    Array.from(byType.entries())

      .map(([resourceType, item]) => {

        const factors =

          Array.from(item.factors);

        const factorUnits =

          Array.from(item.factorUnits);

        const factorSources =

          Array.from(item.factorSources);

        const calculationVersions =

          Array.from(

            item.calculationVersions,

          );

        const hasMixedFactors =

          factors.length > 1 ||

          factorUnits.length > 1 ||

          factorSources.length > 1 ||

          calculationVersions.length > 1;

        return {

          resourceType,

          label: item.label,

          usageValue:

            round2(item.usageValue),

          unit: item.unit,

          carbonKg:

            round2(item.carbonKg),

          percent:

            currentCarbon > 0

              ? Math.round(

                  (item.carbonKg /

                    currentCarbon) *

                    1000,

                ) / 10

              : 0,

          scope: item.scope,

          factorUsed:

            !hasMixedFactors &&

            factors.length === 1

              ? factors[0]

              : null,

          factorUnit:

            !hasMixedFactors &&

            factorUnits.length === 1

              ? factorUnits[0]

              : null,

          factorSource:

            !hasMixedFactors &&

            factorSources.length === 1

              ? factorSources[0]

              : null,

          calculationVersion:

            !hasMixedFactors &&

            calculationVersions.length === 1

              ? calculationVersions[0]

              : null,

          hasMixedFactors,

        };

      })

      .sort(

        (a, b) =>

          b.carbonKg - a.carbonKg,

      );

  const scopeMap = new Map<

    "Scope 1" | "Scope 2" | "Scope 3",

    number

  >();

  for (const result of currentResults) {

    const scope =

      normalizeScope(result.scope);

    if (scope === null) continue;

    scopeMap.set(

      scope,

      (scopeMap.get(scope) ?? 0) +

        toNumber(result.carbonValue),

    );

  }

  const scopeTotals: ScopeTotal[] = (

    [

      "Scope 1",

      "Scope 2",

      "Scope 3",

    ] as const

  )

    .map((scope) => {

      const carbonKg = round2(

        scopeMap.get(scope) ?? 0,

      );

      return {

        scope,

        carbonKg,

        percent:

          currentCarbon > 0

            ? Math.round(

                (carbonKg /

                  currentCarbon) *

                  1000,

              ) / 10

            : 0,

      };

    })

    .filter(

      (scope) =>

        scope.carbonKg > 0,

    );

  return {

    totalKgCO2e:

      round2(currentCarbon),

    changePct,

    hasPreviousPeriodData,

    previousKgCO2e:

      round2(previousCarbon),

    breakdown,

    scopeTotals,

    lastUpdatedAt:

      latestResult?.usage.usageAt.toISOString() ??

      latestResult?.calculatedAt.toISOString() ??

      null,

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

export interface ManagerEnergyPoint {

  dateKey: string;

  label: string;

  total: number;

  mean: number;

  upperBand: number;

  lowerBand: number;

  zScore: number;

  isAnomaly: boolean;

}

export interface ManagerEnergyContributor {

  machineId: number;

  machineName: string;

  totalKwh: number;

  percent: number;

  recordCount: number;

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

  previousRecords: number;

  recordChangePct: number;

  totalMachines: number;

  resourceTypeCount: number;

  pendingCount: number;

  qrCount: number;

  manualCount: number;

  qrSharePct: number;

  dataQualityScore: number;

  activity: ManagerActivityPoint[];

  resources: ManagerResourceSummary[];

  recentRecords: ManagerRecentRecord[];

  lastUpdatedAt: string | null;

  intelligence: {

    energyTotal: number;

    previousEnergyTotal: number;

    energyChangePct: number | null;

    dailyMean: number;

    standardDeviation: number;

    maxAbsZScore: number;

    anomalyCount: number;

    peakLabel: string | null;

    peakValue: number;

    dailyEnergy: ManagerEnergyPoint[];

    topEnergyContributors: ManagerEnergyContributor[];

  };

}

function mean(values: number[]): number {

  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;

}

function populationStdDev(values: number[], average: number): number {

  if (values.length === 0) return 0;

  const variance =

    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /

    values.length;

  return Math.sqrt(variance);

}

/**

 * Dashboard หลักของ Manager

 * Source of truth = ResourceUsage ชุดเดียวกับ Operator

 *

 * Intelligence layer ในฟังก์ชันนี้เป็น deterministic analytics:

 * - % change = เทียบช่วงที่ผู้ใช้เลือกกับช่วงก่อนหน้าที่มีความยาวเท่ากัน

 * - mean / standard deviation = คำนวณจากไฟฟ้ารายวัน

 * - z-score = (x - mean) / standard deviation

 * - anomaly = |z| >= 2

 * - Data Quality = ความครบถ้วนของ Machine / Department / Building / Unit / ResourceType

 *

 * ไม่มีการสร้างตัวเลขสุ่ม และไม่รวม resource ที่คนละหน่วยเข้าด้วยกัน

 */

export async function getManagerResourceDashboard(

  companyId: number | null,

  startDate: Date,

  endDate: Date,

): Promise<ManagerResourceDashboard> {

  const empty: ManagerResourceDashboard = {

    totalRecords: 0,

    previousRecords: 0,

    recordChangePct: 0,

    totalMachines: 0,

    resourceTypeCount: 0,

    pendingCount: 0,

    qrCount: 0,

    manualCount: 0,

    qrSharePct: 0,

    dataQualityScore: 0,

    activity: [],

    resources: [],

    recentRecords: [],

    lastUpdatedAt: null,

    intelligence: {

      energyTotal: 0,

      previousEnergyTotal: 0,

      energyChangePct: null,

      dailyMean: 0,

      standardDeviation: 0,

      maxAbsZScore: 0,

      anomalyCount: 0,

      peakLabel: null,

      peakValue: 0,

      dailyEnergy: [],

      topEnergyContributors: [],

    },

  };

  if (companyId === null) return empty;

  const rangeEnd = endOfDay(endDate);

  const { prevStart, prevEnd } = previousRange(startDate, endDate);

  const [usages, previousUsages, activeMachineCount] = await Promise.all([

    prisma.resourceUsage.findMany({

      where: {

        companyId,

        status: "ACTIVE",

        usageAt: { gte: startDate, lte: rangeEnd },

      },

      select: {

        usageId: true,

        usageReference: true,

        quantity: true,

        usageAt: true,

        sourceType: true,

        processingStatus: true,

        machineId: true,

        departmentId: true,

        buildingId: true,

        machine: { select: { machineName: true } },

        department: { select: { departmentName: true } },

        building: { select: { buildingName: true } },

        resourceType: {

          select: { resourceCode: true, resourceName: true },

        },

        unit: { select: { symbol: true } },

      },

      orderBy: { usageAt: "desc" },

    }),

    prisma.resourceUsage.findMany({

      where: {

        companyId,

        status: "ACTIVE",

        usageAt: { gte: prevStart, lte: prevEnd },

      },

      select: {

        quantity: true,

        resourceType: { select: { resourceCode: true } },

      },

    }),

    prisma.machine.count({

      where: {

        status: "ACTIVE",

        productionLine: {

          department: {

            building: {

              factory: {

                companyId,

              },

            },

          },

        },

      },

    }),

  ]);

  const resourceMap = new Map<string, ManagerResourceSummary>();

  const machineIds = new Set<number>();

  const activityMap = new Map<string, number>();

  const energyByDay = new Map<string, number>();

  const energyByMachine = new Map<

    number,

    { machineName: string; total: number; recordCount: number }

  >();

  let pendingCount = 0;

  let qrCount = 0;

  let manualCount = 0;

  let completenessPoints = 0;

  const completenessFields = 5;

  for (const usage of usages) {

    if (usage.machineId !== null) machineIds.add(usage.machineId);

    if (usage.processingStatus === "PENDING") pendingCount += 1;

    if (usage.sourceType === "QR") qrCount += 1;
    if (usage.sourceType === "MANUAL") manualCount += 1;

    // 5 required/traceability dimensions used for the quality score.

    completenessPoints += usage.machineId !== null ? 1 : 0;

    completenessPoints += usage.departmentId !== null ? 1 : 0;

    completenessPoints += usage.buildingId !== null ? 1 : 0;

    completenessPoints += usage.unit.symbol ? 1 : 0;

    completenessPoints += usage.resourceType.resourceCode ? 1 : 0;

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

    activityMap.set(dateKey, (activityMap.get(dateKey) ?? 0) + 1);

    if (usage.resourceType.resourceCode === "ELECTRICITY") {

      const quantity = toNumber(usage.quantity);

      energyByDay.set(dateKey, (energyByDay.get(dateKey) ?? 0) + quantity);

      if (usage.machineId !== null) {

        const machine = energyByMachine.get(usage.machineId) ?? {

          machineName: usage.machine?.machineName ?? `Machine ${usage.machineId}`,

          total: 0,

          recordCount: 0,

        };

        machine.total += quantity;

        machine.recordCount += 1;

        energyByMachine.set(usage.machineId, machine);

      }

    }

  }

  const activity: ManagerActivityPoint[] = [];

  const energyDailyBase: { dateKey: string; label: string; total: number }[] = [];

  const rangeStartDay = new Date(startDate);

  rangeStartDay.setHours(0, 0, 0, 0);

  const rangeEndDay = new Date(endDate);

  rangeEndDay.setHours(0, 0, 0, 0);

  for (

    const date = new Date(rangeStartDay);

    date <= rangeEndDay;

    date.setDate(date.getDate() + 1)

  ) {

    const dateKey = toLocalDateKey(date);

    const label = new Intl.DateTimeFormat("th-TH", {

      day: "numeric",

      month: "short",

    }).format(date);

    activity.push({

      dateKey,

      label,

      count: activityMap.get(dateKey) ?? 0,

    });

    energyDailyBase.push({

      dateKey,

      label,

      total: round2(energyByDay.get(dateKey) ?? 0),

    });

  }

  const resources = Array.from(resourceMap.values())

    .map((item) => ({ ...item, total: round2(item.total) }))

    .sort((a, b) => b.recordCount - a.recordCount);

  const energyValues = energyDailyBase

    .filter((item) => energyByDay.has(item.dateKey))

    .map((item) => item.total);

  const dailyMeanRaw = mean(energyValues);

  const stdRaw = populationStdDev(energyValues, dailyMeanRaw);

  const upperBandRaw = dailyMeanRaw + 2 * stdRaw;

  const lowerBandRaw = Math.max(0, dailyMeanRaw - 2 * stdRaw);

  const dailyEnergy: ManagerEnergyPoint[] = energyDailyBase.map((item) => {

    const hasEnergyData = energyByDay.has(item.dateKey);

    const zScore =

      hasEnergyData && stdRaw > 0

        ? (item.total - dailyMeanRaw) / stdRaw

        : 0;

    return {

      ...item,

      mean: round2(dailyMeanRaw),

      upperBand: round2(upperBandRaw),

      lowerBand: round2(lowerBandRaw),

      zScore: Math.round(zScore * 100) / 100,

      isAnomaly: hasEnergyData && Math.abs(zScore) >= 2,

    };

  });

  const energyTotal = round2(

    usages.reduce((sum, usage) =>

      usage.resourceType.resourceCode === "ELECTRICITY"

        ? sum + toNumber(usage.quantity)

        : sum,

    0),

  );

  const previousEnergyTotal = round2(

    previousUsages.reduce((sum, usage) => {

      return usage.resourceType.resourceCode === "ELECTRICITY"

        ? sum + toNumber(usage.quantity)

        : sum;

    }, 0),

  );

  const topEnergyContributors: ManagerEnergyContributor[] = Array.from(

    energyByMachine.entries(),

  )

    .map(([machineId, machine]) => ({

      machineId,

      machineName: machine.machineName,

      totalKwh: round2(machine.total),

      percent:

        energyTotal > 0

          ? Math.round((machine.total / energyTotal) * 1000) / 10

          : 0,

      recordCount: machine.recordCount,

    }))

    .sort((a, b) => b.totalKwh - a.totalKwh)

    .slice(0, 5);

  const peak = dailyEnergy.reduce<ManagerEnergyPoint | null>(

    (best, point) => (!best || point.total > best.total ? point : best),

    null,

  );

  const recentRecords: ManagerRecentRecord[] = usages.slice(0, 8).map((usage) => ({

    id: String(usage.usageId),

    reference: usage.usageReference,

    machineName: usage.machine?.machineName ?? "จุดตรวจ",

    departmentName: usage.department?.departmentName ?? "-",

    buildingName: usage.building?.buildingName ?? "-",

    resourceCode: usage.resourceType.resourceCode,

    resourceName: usage.resourceType.resourceName,

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

  const dataQualityScore =

    usages.length > 0

      ? Math.round(

          (completenessPoints / (usages.length * completenessFields)) * 100,

        )

      : 0;

  return {

    totalRecords: usages.length,

    previousRecords: previousUsages.length,

    recordChangePct: pctChange(usages.length, previousUsages.length),

    totalMachines: activeMachineCount,

    resourceTypeCount: new Set(

      usages.map((usage) => usage.resourceType.resourceCode),

    ).size,

    pendingCount,

    qrCount,

    manualCount,

    qrSharePct: usages.length > 0 ? round2((qrCount / usages.length) * 100) : 0,

    dataQualityScore,

    activity,

    resources,

    recentRecords,

    lastUpdatedAt: usages[0]?.usageAt.toISOString() ?? null,

    intelligence: {

      energyTotal,

      previousEnergyTotal,

      energyChangePct:

        previousUsages.some(

          (usage) => usage.resourceType.resourceCode === "ELECTRICITY",

        ) && previousEnergyTotal > 0

          ? pctChange(energyTotal, previousEnergyTotal)

          : null,

      dailyMean: round2(dailyMeanRaw),

      standardDeviation: round2(stdRaw),

      maxAbsZScore: round2(

        Math.max(0, ...dailyEnergy.map((point) => Math.abs(point.zScore))),

      ),

      anomalyCount: dailyEnergy.filter((point) => point.isAnomaly).length,

      peakLabel: peak?.label ?? null,

      peakValue: peak?.total ?? 0,

      dailyEnergy,

      topEnergyContributors,

    },

  };

}

/* ============================================================================
 * REAL KPI ENGINE
 * KPI = target/operator/period/scope
 * ResourceUsage = Actual source of truth
 * KPIResult = persisted calculation result
 * ========================================================================== */

export type ManagerKpiResultStatus = "PASS" | "FAIL";

export interface ManagerKpiPerformanceItem {
  kpiId: number;
  kpiCode: string;
  kpiName: string;
  kpiType: string;
  scopeType: string;
  periodType: string;
  targetValue: number;
  targetOperator: string;
  actualValue: number;
  varianceValue: number;
  achievementPercent: number;
  resultStatus: ManagerKpiResultStatus;
  unit: string;
  resourceCode: string;
  resourceName: string;
  periodStart: string;
  periodEnd: string;
  calculatedAt: string;
  scopeLabel: string;
}

export interface ManagerKpiPerformanceData {
  total: number;
  passed: number;
  failed: number;
  achievementRate: number;
  items: ManagerKpiPerformanceItem[];
}

function kpiDayStart(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function kpiPeriodStart(reference: Date, periodType: string): Date {
  const value = kpiDayStart(reference);
  const type = periodType.trim().toUpperCase();

  if (type === "WEEKLY" || type === "WEEK") {
    const day = value.getDay();
    value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  } else if (type === "MONTHLY" || type === "MONTH") {
    value.setDate(1);
  } else if (type === "QUARTERLY" || type === "QUARTER") {
    value.setMonth(Math.floor(value.getMonth() / 3) * 3, 1);
  } else if (type === "YEARLY" || type === "ANNUAL" || type === "YEAR") {
    value.setMonth(0, 1);
  }

  return value;
}

function kpiPeriodEnd(reference: Date, periodType: string): Date {
  const type = periodType.trim().toUpperCase();
  const value = kpiPeriodStart(reference, periodType);

  if (type === "WEEKLY" || type === "WEEK") {
    value.setDate(value.getDate() + 6);
  } else if (type === "MONTHLY" || type === "MONTH") {
    value.setMonth(value.getMonth() + 1, 0);
  } else if (type === "QUARTERLY" || type === "QUARTER") {
    value.setMonth(value.getMonth() + 3, 0);
  } else if (type === "YEARLY" || type === "ANNUAL" || type === "YEAR") {
    value.setFullYear(value.getFullYear() + 1, 0, 0);
  }

  return endOfDay(value);
}

function normalizeKpiOperator(value: string): "<=" | ">=" | "<" | ">" | "=" | null {
  const operator = value.trim().toUpperCase();
  if (["<=", "LTE", "LESS_THAN_OR_EQUAL"].includes(operator)) return "<=";
  if ([">=", "GTE", "GREATER_THAN_OR_EQUAL"].includes(operator)) return ">=";
  if (["<", "LT", "LESS_THAN"].includes(operator)) return "<";
  if ([">", "GT", "GREATER_THAN"].includes(operator)) return ">";
  if (["=", "==", "EQ", "EQUAL"].includes(operator)) return "=";
  return null;
}

function kpiPassed(actual: number, target: number, operator: string): boolean {
  const op = normalizeKpiOperator(operator);
  if (op === "<=") return actual <= target;
  if (op === ">=") return actual >= target;
  if (op === "<") return actual < target;
  if (op === ">") return actual > target;
  if (op === "=") return actual === target;
  throw new Error(`Unsupported KPI targetOperator: ${operator}`);
}

function kpiAchievement(actual: number, target: number, operator: string): number {
  const op = normalizeKpiOperator(operator);
  if (!op) throw new Error(`Unsupported KPI targetOperator: ${operator}`);

  let result = 0;
  if (op === "<=" || op === "<") {
    result = actual === 0 ? (target >= 0 ? 100 : 0) : (target / actual) * 100;
  } else if (op === ">=" || op === ">") {
    result = target === 0 ? (actual >= 0 ? 100 : 0) : (actual / target) * 100;
  } else {
    result =
      target === 0
        ? actual === 0 ? 100 : 0
        : Math.max(0, (1 - Math.abs(actual - target) / Math.abs(target)) * 100);
  }

  return Math.round(result * 10000) / 10000;
}

function managerKpiScopeLabel(kpi: {
  machine?: { machineName: string } | null;
  productionLine?: { lineName: string } | null;
  department?: { departmentName: string } | null;
  building?: { buildingName: string } | null;
  factory?: { factoryName: string } | null;
}): string {
  return (
    kpi.machine?.machineName ??
    kpi.productionLine?.lineName ??
    kpi.department?.departmentName ??
    kpi.building?.buildingName ??
    kpi.factory?.factoryName ??
    "ทั้งบริษัท"
  );
}

/**
 * Calculates real resource KPI and persists KPIResult.
 * No KPI target is invented. No unit conversion is guessed.
 * KPI without resourceTypeId is skipped because its Actual formula is undefined
 * by the current schema alone.
 */
export async function calculateManagerKpiPerformance(
  companyId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<ManagerKpiPerformanceData> {
  const empty: ManagerKpiPerformanceData = {
    total: 0,
    passed: 0,
    failed: 0,
    achievementRate: 0,
    items: [],
  };
  if (companyId === null) return empty;

  const selectedStart = kpiDayStart(startDate);
  const selectedEnd = endOfDay(endDate);

  const kpis = await prisma.kPI.findMany({
    where: {
      companyId,
      status: "ACTIVE",
      resourceTypeId: { not: null },
      effectiveFrom: { lte: selectedEnd },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: selectedStart } }],
    },
    orderBy: [{ kpiName: "asc" }, { kpiId: "asc" }],
    select: {
      kpiId: true,
      kpiCode: true,
      kpiName: true,
      kpiType: true,
      scopeType: true,
      targetValue: true,
      targetOperator: true,
      periodType: true,
      effectiveFrom: true,
      effectiveTo: true,
      factoryId: true,
      buildingId: true,
      departmentId: true,
      lineId: true,
      machineId: true,
      resourceTypeId: true,
      unitId: true,
      unit: { select: { symbol: true } },
      resourceType: { select: { resourceCode: true, resourceName: true } },
      factory: { select: { factoryName: true } },
      building: { select: { buildingName: true } },
      department: { select: { departmentName: true } },
      productionLine: { select: { lineName: true } },
      machine: { select: { machineName: true } },
    },
  });

  const items: ManagerKpiPerformanceItem[] = [];

  for (const kpi of kpis) {
    if (kpi.resourceTypeId === null || kpi.resourceType === null) continue;

    const operator = normalizeKpiOperator(kpi.targetOperator);
    if (operator === null) {
      console.warn(`Skipping KPI ${kpi.kpiCode}: unsupported operator ${kpi.targetOperator}`);
      continue;
    }

    let periodStart = kpiPeriodStart(selectedEnd, kpi.periodType);
    let periodEnd = kpiPeriodEnd(selectedEnd, kpi.periodType);

    if (periodStart < selectedStart) periodStart = selectedStart;
    if (periodEnd > selectedEnd) periodEnd = selectedEnd;
    if (periodStart < kpi.effectiveFrom) periodStart = kpiDayStart(kpi.effectiveFrom);
    if (kpi.effectiveTo && periodEnd > endOfDay(kpi.effectiveTo)) {
      periodEnd = endOfDay(kpi.effectiveTo);
    }
    if (periodStart > periodEnd) continue;

    const usages = await prisma.resourceUsage.findMany({
      where: {
        companyId,
        status: "ACTIVE",
        resourceTypeId: kpi.resourceTypeId,
        unitId: kpi.unitId,
        usageAt: { gte: periodStart, lte: periodEnd },
        ...(kpi.factoryId !== null ? { factoryId: kpi.factoryId } : {}),
        ...(kpi.buildingId !== null ? { buildingId: kpi.buildingId } : {}),
        ...(kpi.departmentId !== null ? { departmentId: kpi.departmentId } : {}),
        ...(kpi.lineId !== null ? { lineId: kpi.lineId } : {}),
        ...(kpi.machineId !== null ? { machineId: kpi.machineId } : {}),
      },
      select: { quantity: true },
    });

    const actualValue = round2(
      usages.reduce((sum, usage) => sum + toNumber(usage.quantity), 0),
    );
    const targetValue = toNumber(kpi.targetValue);
    const varianceValue = round2(actualValue - targetValue);
    const achievementPercent = kpiAchievement(actualValue, targetValue, operator);
    const resultStatus: ManagerKpiResultStatus =
      kpiPassed(actualValue, targetValue, operator) ? "PASS" : "FAIL";

    const saved = await prisma.kPIResult.upsert({
      where: {
        kpiId_periodStart_periodEnd: {
          kpiId: kpi.kpiId,
          periodStart,
          periodEnd,
        },
      },
      create: {
        kpiId: kpi.kpiId,
        actualValue,
        varianceValue,
        achievementPercent,
        periodStart,
        periodEnd,
        resultStatus,
      },
      update: {
        actualValue,
        varianceValue,
        achievementPercent,
        resultStatus,
      },
      select: { calculatedAt: true, updatedAt: true },
    });

    items.push({
      kpiId: kpi.kpiId,
      kpiCode: kpi.kpiCode,
      kpiName: kpi.kpiName,
      kpiType: kpi.kpiType,
      scopeType: kpi.scopeType,
      periodType: kpi.periodType,
      targetValue: round2(targetValue),
      targetOperator: operator,
      actualValue,
      varianceValue,
      achievementPercent,
      resultStatus,
      unit: kpi.unit.symbol,
      resourceCode: kpi.resourceType.resourceCode,
      resourceName: kpi.resourceType.resourceName,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      calculatedAt: saved.updatedAt.toISOString(),
      scopeLabel: managerKpiScopeLabel(kpi),
    });
  }

  const passed = items.filter((item) => item.resultStatus === "PASS").length;
  const failed = items.filter((item) => item.resultStatus === "FAIL").length;

  return {
    total: items.length,
    passed,
    failed,
    achievementRate: items.length > 0 ? Math.round((passed / items.length) * 1000) / 10 : 0,
    items,
  };
}
