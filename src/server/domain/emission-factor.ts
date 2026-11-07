// Emission factor rules. Dates are calendar days "YYYY-MM-DD" (the DB column is DATE).

export const SCOPES = ["SCOPE 1", "SCOPE 2", "SCOPE 3"] as const;
export type Scope = (typeof SCOPES)[number];

/** kgCO2e per one unit of the resource, e.g. "kgCO2e/kWh". */
export const factorUnitFor = (symbol: string) => `kgCO2e/${symbol}`;

export type FactorPeriod = {
  id?: number;
  resourceTypeId: number;
  scope: string | null;
  region: string | null;
  effectiveDate: string;
  /** null = open-ended (still in force). */
  expiryDate: string | null;
  status: string;
};

/** Inclusive day ranges; a missing end means "no end". ISO day strings compare correctly as text. */
export function periodsOverlap(a: { from: string; to: string | null }, b: { from: string; to: string | null }) {
  return (a.to === null || b.from <= a.to) && (b.to === null || a.from <= b.to);
}

const norm = (s: string | null) => (s ?? "").trim().toUpperCase();

/**
 * The ACTIVE factor that would apply on the same days as `candidate` for the same
 * resource + scope + region, or null. Only matters when the candidate itself is ACTIVE.
 * `candidate.id` is skipped so editing a factor doesn't collide with itself.
 */
export function findOverlap<T extends FactorPeriod>(candidate: FactorPeriod, existing: T[]): T | null {
  if (candidate.status !== "ACTIVE") return null;
  return (
    existing.find(
      (e) =>
        e.status === "ACTIVE" &&
        (candidate.id === undefined || e.id !== candidate.id) &&
        e.resourceTypeId === candidate.resourceTypeId &&
        norm(e.scope) === norm(candidate.scope) &&
        norm(e.region) === norm(candidate.region) &&
        periodsOverlap(
          { from: candidate.effectiveDate, to: candidate.expiryDate },
          { from: e.effectiveDate, to: e.expiryDate },
        ),
    ) ?? null
  );
}

/** Expired = has an end day before today (Bangkok day string). */
export const isExpired = (expiryDate: string | null, today: string) => expiryDate !== null && expiryDate < today;
