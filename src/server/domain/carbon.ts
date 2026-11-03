export const CARBON_UNIT = "kgCO2e";
export const CALCULATION_VERSION = "CARBON-V3";
export const DEFAULT_REGION = "TH";

export type FactorCandidate = {
  factorId: number;
  factor: number;
  factorUnit: string;
  region: string | null;
  effectiveDate: Date;
  expiryDate: Date | null;
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/₂/g, "2").replace(/³/g, "3");

/** "kgCO2e/kWh" applies to a quantity measured in kWh. No unit conversion is attempted. */
export function unitMatchesFactor(unitSymbol: string, factorUnit: string) {
  const per = factorUnit.split("/").pop() ?? "";
  return norm(per) === norm(unitSymbol);
}

/** Region-specific beats global; among those, the most recently effective factor in force at `at`. */
export function pickEmissionFactor(
  candidates: FactorCandidate[],
  at: Date,
  region = DEFAULT_REGION,
): FactorCandidate | null {
  const inForce = candidates.filter(
    (c) =>
      (c.region === region || c.region === null) &&
      c.effectiveDate <= at &&
      (c.expiryDate === null || c.expiryDate >= at),
  );
  inForce.sort(
    (a, b) =>
      Number(b.region === region) - Number(a.region === region) ||
      b.effectiveDate.getTime() - a.effectiveDate.getTime() ||
      b.factorId - a.factorId,
  );
  return inForce[0] ?? null;
}
