import { describe, expect, it } from "vitest";
import { pickEmissionFactor, unitMatchesFactor, type FactorCandidate } from "./carbon";

const d = (s: string) => new Date(s + "T00:00:00Z");
const f = (o: Partial<FactorCandidate>): FactorCandidate => ({
  factorId: 1,
  factor: 0.5,
  factorUnit: "kgCO2e/kWh",
  region: "TH",
  effectiveDate: d("2024-01-01"),
  expiryDate: null,
  ...o,
});

describe("unitMatchesFactor", () => {
  it("compares the unit symbol with the denominator of the factor unit", () => {
    expect(unitMatchesFactor("kWh", "kgCO2e/kWh")).toBe(true);
    expect(unitMatchesFactor("m³", "kgCO₂e / m3")).toBe(true);
    expect(unitMatchesFactor("L", "kgCO2e/l")).toBe(true);
    expect(unitMatchesFactor("kg", "kgCO2e/kWh")).toBe(false);
  });
});

describe("pickEmissionFactor", () => {
  const at = d("2026-06-01");

  it("prefers TH over a global factor", () => {
    const r = pickEmissionFactor([f({ factorId: 1, region: null }), f({ factorId: 2, region: "TH" })], at);
    expect(r?.factorId).toBe(2);
  });

  it("takes the latest effective factor that has started and not expired", () => {
    const r = pickEmissionFactor(
      [
        f({ factorId: 1, effectiveDate: d("2024-01-01") }),
        f({ factorId: 2, effectiveDate: d("2025-01-01") }),
        f({ factorId: 3, effectiveDate: d("2027-01-01") }),
        f({ factorId: 4, effectiveDate: d("2025-06-01"), expiryDate: d("2025-12-31") }),
      ],
      at,
    );
    expect(r?.factorId).toBe(2);
  });

  it("ignores other regions and returns null when nothing applies", () => {
    expect(pickEmissionFactor([f({ region: "EU" })], at)).toBeNull();
    expect(pickEmissionFactor([], at)).toBeNull();
  });
});
