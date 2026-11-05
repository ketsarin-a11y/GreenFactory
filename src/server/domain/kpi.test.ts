import { describe, expect, it } from "vitest";
import { evaluateKpi, periodBounds } from "./kpi";

describe("evaluateKpi", () => {
  it("<= passes when actual is at or under target, achievement = target/actual", () => {
    expect(evaluateKpi(90, 100, "<=")).toEqual({ pass: true, variance: -10, achievement: 100 });
    const r = evaluateKpi(125, 100, "<=");
    expect(r.pass).toBe(false);
    expect(r.achievement).toBeCloseTo(80);
  });

  it(">= uses actual/target", () => {
    expect(evaluateKpi(50, 100, ">=")).toMatchObject({ pass: false, achievement: 50 });
    expect(evaluateKpi(120, 100, "GTE")).toMatchObject({ pass: true, achievement: 100 });
  });

  it("= is closeness to target", () => {
    expect(evaluateKpi(90, 100, "=")).toMatchObject({ pass: false, achievement: 90 });
    expect(evaluateKpi(100, 100, "EQ")).toMatchObject({ pass: true, achievement: 100 });
  });

  it("handles zeros without dividing by zero", () => {
    expect(evaluateKpi(0, 100, "<=").achievement).toBe(100);
    expect(evaluateKpi(5, 0, ">=").achievement).toBe(100);
  });
});

describe("periodBounds (Asia/Bangkok calendar)", () => {
  const at = new Date("2026-11-04T20:00:00Z"); // Thu 5 Nov 2026, 03:00 in Bangkok
  it("daily", () => {
    expect(periodBounds("DAILY", at)).toEqual({ start: "2026-11-05", end: "2026-11-05" });
  });
  it("weekly is Monday–Sunday", () => {
    expect(periodBounds("WEEKLY", at)).toEqual({ start: "2026-11-02", end: "2026-11-08" });
  });
  it("monthly and quarterly", () => {
    expect(periodBounds("MONTHLY", at)).toEqual({ start: "2026-11-01", end: "2026-11-30" });
    expect(periodBounds("QUARTERLY", at)).toEqual({ start: "2026-10-01", end: "2026-12-31" });
    expect(periodBounds("YEARLY", at)).toEqual({ start: "2026-01-01", end: "2026-12-31" });
  });
});
