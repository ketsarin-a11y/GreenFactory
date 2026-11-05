import { describe, expect, it } from "vitest";
import { factorUnitFor, findOverlap, isExpired, periodsOverlap, type FactorPeriod } from "./emission-factor";

const base: FactorPeriod = { resourceTypeId: 1, scope: "SCOPE 2", region: "TH", effectiveDate: "2024-01-01", expiryDate: null, status: "ACTIVE" };

describe("periodsOverlap", () => {
  it("treats ranges as inclusive and open ends as infinite", () => {
    expect(periodsOverlap({ from: "2024-01-01", to: "2024-12-31" }, { from: "2024-12-31", to: null })).toBe(true);
    expect(periodsOverlap({ from: "2024-01-01", to: "2024-12-31" }, { from: "2025-01-01", to: null })).toBe(false);
    expect(periodsOverlap({ from: "2025-01-01", to: null }, { from: "2020-01-01", to: null })).toBe(true);
    expect(periodsOverlap({ from: "2020-01-01", to: "2020-06-30" }, { from: "2021-01-01", to: "2021-12-31" })).toBe(false);
  });
});

describe("findOverlap", () => {
  const existing = [{ ...base, id: 10 }];

  it("rejects a second open-ended ACTIVE factor for the same resource/scope/region", () => {
    expect(findOverlap({ ...base, effectiveDate: "2025-01-01" }, existing)?.id).toBe(10);
  });

  it("allows it once the old factor has an end date before the new one starts", () => {
    expect(findOverlap({ ...base, effectiveDate: "2025-01-01" }, [{ ...base, id: 10, expiryDate: "2024-12-31" }])).toBeNull();
  });

  it("ignores other scopes, regions, resources and inactive factors", () => {
    expect(findOverlap({ ...base, scope: "SCOPE 1" }, existing)).toBeNull();
    expect(findOverlap({ ...base, region: "LA" }, existing)).toBeNull();
    expect(findOverlap({ ...base, resourceTypeId: 2 }, existing)).toBeNull();
    expect(findOverlap(base, [{ ...base, id: 10, status: "INACTIVE" }])).toBeNull();
  });

  it("matches scope/region case- and space-insensitively", () => {
    expect(findOverlap({ ...base, region: " th " }, existing)?.id).toBe(10);
  });

  it("skips itself when editing, but still sees others", () => {
    expect(findOverlap({ ...base, id: 10 }, existing)).toBeNull();
    expect(findOverlap({ ...base, id: 10 }, [...existing, { ...base, id: 11, effectiveDate: "2030-01-01" }])?.id).toBe(11);
  });

  it("does not check an inactive candidate", () => {
    expect(findOverlap({ ...base, status: "INACTIVE" }, existing)).toBeNull();
  });
});

describe("helpers", () => {
  it("builds the factor unit from the unit symbol", () => {
    expect(factorUnitFor("kWh")).toBe("kgCO2e/kWh");
  });
  it("knows when a factor has expired", () => {
    expect(isExpired(null, "2026-01-01")).toBe(false);
    expect(isExpired("2025-12-31", "2026-01-01")).toBe(true);
    expect(isExpired("2026-01-01", "2026-01-01")).toBe(false);
  });
});
