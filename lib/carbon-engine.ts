import "server-only";

import { prisma } from "@/lib/prisma";

const CALCULATION_VERSION = "CARBON-V2";
const CARBON_UNIT = "kgCO2e";

/**
 * Default accounting region for factors that are country-specific.
 *
 * This is NOT a company/factory hardcode.
 * It represents the jurisdiction of the emission-factor dataset.
 *
 * Future improvement:
 * resolve this from Factory.country / company configuration.
 */
const DEFAULT_FACTOR_REGION = "TH";

type CarbonSkipReason =
  | "RESOURCE_NOT_CARBON_CALCULABLE"
  | "NO_ACTIVE_EMISSION_FACTOR"
  | "INCOMPATIBLE_FACTOR_UNIT";

type CarbonProcessResult =
  | {
      processed: true;
      created: boolean;
      skipped: false;
      usageId: bigint;
      carbonId: bigint;
      factorId: number;
      carbonValue: number;
      carbonUnit: string;
      scope: string;
    }
  | {
      processed: true;
      created: false;
      skipped: true;
      usageId: bigint;
      reason: CarbonSkipReason;
    };

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value);
}

/**
 * Normalize unit text so harmless formatting differences do not break
 * compatibility checks.
 *
 * Examples:
 *   kWh -> kwh
 *   kgCO2e/kWh -> kgco2e/kwh
 *   kg CO2e / kWh -> kgco2e/kwh
 */
function normalizeUnit(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/₂/g, "2")
    .replace(/³/g, "3");
}

/**
 * Extract the activity-data denominator from an emission-factor unit.
 *
 * Examples:
 *   kgCO2e/kWh -> kwh
 *   kgCO2e/m3  -> m3
 *   kgCO2e/kg  -> kg
 *
 * Carbon Engine V2 intentionally requires a direct unit match.
 * It does NOT silently perform kWh/MWh, L/m3, kg/tonne conversions.
 *
 * Explicit conversion support can be introduced later with reviewed
 * conversion metadata.
 */
function getFactorActivityUnit(factorUnit: string): string | null {
  const normalized = normalizeUnit(factorUnit);
  const slashIndex = normalized.lastIndexOf("/");

  if (slashIndex < 0 || slashIndex === normalized.length - 1) {
    return null;
  }

  return normalized.slice(slashIndex + 1);
}

function isFactorUnitCompatible(
  usageUnitSymbol: string,
  factorUnit: string,
): boolean {
  const usageUnit = normalizeUnit(usageUnitSymbol);
  const factorActivityUnit = getFactorActivityUnit(factorUnit);

  if (!factorActivityUnit) {
    return false;
  }

  return usageUnit === factorActivityUnit;
}

/**
 * Process carbon for one ResourceUsage.
 *
 * Carbon V2 rules:
 *
 * 1. ResourceUsage is the activity-data source of truth.
 * 2. EmissionFactor comes only from the database.
 * 3. Resource must explicitly allow carbon calculation.
 * 4. Factor must be ACTIVE.
 * 5. Factor must be effective on usageAt.
 * 6. Country-specific factor selection prefers Thailand (TH).
 * 7. Usage unit must be directly compatible with factorUnit.
 * 8. CarbonResult snapshots quantity/factor/scope for auditability.
 * 9. Existing CALCULATED CarbonResult is reused.
 *
 * Important:
 * CarbonResult currently does not have a UNIQUE constraint on usageId.
 * Therefore concurrent processing of the same usage is still not allowed.
 * A reviewed database migration can enforce this later.
 */
export async function processResourceUsageCarbon(
  usageId: bigint,
): Promise<CarbonProcessResult> {
  const usage = await prisma.resourceUsage.findUnique({
    where: {
      usageId,
    },
    select: {
      usageId: true,
      quantity: true,
      usageAt: true,
      status: true,
      resourceTypeId: true,

      unit: {
        select: {
          unitId: true,
          symbol: true,
          status: true,
        },
      },

      resourceType: {
        select: {
          resourceTypeId: true,
          carbonCalculable: true,
          status: true,
        },
      },
    },
  });

  if (!usage) {
    throw new Error(
      `ResourceUsage ${usageId.toString()} not found`,
    );
  }

  if (usage.status !== "ACTIVE") {
    throw new Error(
      `ResourceUsage ${usageId.toString()} is not ACTIVE`,
    );
  }

  if (usage.resourceType.status !== "ACTIVE") {
    throw new Error(
      `Resource type ${usage.resourceTypeId} is not ACTIVE`,
    );
  }

  if (usage.unit.status !== "ACTIVE") {
    throw new Error(
      `Unit ${usage.unit.unitId} is not ACTIVE`,
    );
  }

  /*
   * Idempotency guard.
   *
   * Historical calculated results are intentionally reused rather than
   * silently recalculated with a newer factor. This preserves the original
   * accounting result and audit trail.
   */
  const existingResult = await prisma.carbonResult.findFirst({
    where: {
      usageId: usage.usageId,
      calculationStatus: "CALCULATED",
    },
    orderBy: {
      calculatedAt: "desc",
    },
    select: {
      carbonId: true,
      factorId: true,
      carbonValue: true,
      carbonUnit: true,
      scope: true,
    },
  });

  if (existingResult) {
    return {
      processed: true,
      created: false,
      skipped: false,
      usageId: usage.usageId,
      carbonId: existingResult.carbonId,
      factorId: existingResult.factorId,
      carbonValue: toNumber(existingResult.carbonValue),
      carbonUnit: existingResult.carbonUnit,
      scope: existingResult.scope,
    };
  }

  if (!usage.resourceType.carbonCalculable) {
    return {
      processed: true,
      created: false,
      skipped: true,
      usageId: usage.usageId,
      reason: "RESOURCE_NOT_CARBON_CALCULABLE",
    };
  }

  /*
   * Get all factors that are valid for the usage date.
   *
   * We fetch candidates rather than immediately taking findFirst because
   * unit compatibility must be verified before a factor can be selected.
   *
   * Region policy:
   *   1. Prefer TH
   *   2. Allow region-less/global factor as fallback
   *
   * A factor belonging to another explicit country/region is never used.
   */
  const factorCandidates = await prisma.emissionFactor.findMany({
    where: {
      resourceTypeId: usage.resourceTypeId,
      status: "ACTIVE",

      effectiveDate: {
        lte: usage.usageAt,
      },

      OR: [
        {
          expiryDate: null,
        },
        {
          expiryDate: {
            gte: usage.usageAt,
          },
        },
      ],

      AND: [
        {
          OR: [
            {
              region: DEFAULT_FACTOR_REGION,
            },
            {
              region: null,
            },
          ],
        },
      ],
    },

    orderBy: [
      {
        effectiveDate: "desc",
      },
      {
        factorId: "desc",
      },
    ],

    select: {
      factorId: true,
      factor: true,
      factorUnit: true,
      scope: true,
      region: true,
    },
  });

  if (factorCandidates.length === 0) {
    return {
      processed: true,
      created: false,
      skipped: true,
      usageId: usage.usageId,
      reason: "NO_ACTIVE_EMISSION_FACTOR",
    };
  }

  /*
   * Prefer a Thailand-specific factor over a global/region-less factor.
   *
   * Within each region priority, candidates are already ordered by the
   * newest effectiveDate and factorId.
   */
  const orderedCandidates = [
    ...factorCandidates.filter(
      (candidate) =>
        candidate.region?.trim().toUpperCase() ===
        DEFAULT_FACTOR_REGION,
    ),
    ...factorCandidates.filter(
      (candidate) => !candidate.region?.trim(),
    ),
  ];

  const factor = orderedCandidates.find((candidate) =>
    isFactorUnitCompatible(
      usage.unit.symbol,
      candidate.factorUnit,
    ),
  );

  if (!factor) {
    return {
      processed: true,
      created: false,
      skipped: true,
      usageId: usage.usageId,
      reason: "INCOMPATIBLE_FACTOR_UNIT",
    };
  }

  const quantity = toNumber(usage.quantity);
  const factorValue = toNumber(factor.factor);

  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error(
      `ResourceUsage ${usageId.toString()} has invalid quantity`,
    );
  }

  if (!Number.isFinite(factorValue) || factorValue < 0) {
    throw new Error(
      `EmissionFactor ${factor.factorId} has invalid factor`,
    );
  }

  /*
   * Carbon V2 only reaches this point after direct activity-unit
   * compatibility has been verified.
   *
   * Example:
   *
   *   ResourceUsage:
   *     100 kWh
   *
   *   EmissionFactor:
   *     0.4021 kgCO2e/kWh
   *
   *   Carbon:
   *     100 × 0.4021
   *     = 40.21 kgCO2e
   */
  const carbonValue = quantity * factorValue;

  if (!Number.isFinite(carbonValue)) {
    throw new Error(
      `Carbon calculation overflow for ResourceUsage ${usageId.toString()}`,
    );
  }

  /*
   * Do not silently classify an unclassified factor as Scope 1/2/3.
   */
  const scope = factor.scope?.trim() || "UNKNOWN";

  const created = await prisma.carbonResult.create({
    data: {
      usageId: usage.usageId,
      factorId: factor.factorId,

      /*
       * Snapshot accounting inputs.
       * Historical CarbonResult therefore remains auditable even if the
       * master factor is updated in the future.
       */
      quantityUsed: usage.quantity,
      factorUsed: factor.factor,

      carbonValue,
      carbonUnit: CARBON_UNIT,
      scope,

      calculationStatus: "CALCULATED",
      calculationVersion: CALCULATION_VERSION,
    },

    select: {
      carbonId: true,
      factorId: true,
      carbonValue: true,
      carbonUnit: true,
      scope: true,
    },
  });

  return {
    processed: true,
    created: true,
    skipped: false,

    usageId: usage.usageId,
    carbonId: created.carbonId,
    factorId: created.factorId,

    carbonValue: toNumber(created.carbonValue),
    carbonUnit: created.carbonUnit,
    scope: created.scope,
  };
}