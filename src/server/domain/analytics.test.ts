import { describe, expect, it } from "vitest";
import { anomalyBand, dailyTotals, dataQuality, dayList, findings, pctChange, previousRange, stats, sumByResourceUnit } from "./analytics";

describe("pctChange", () => {
  it("is null when the previous period is 0", () => expect(pctChange(50, 0)).toBeNull());
  it("rounds to 1 decimal", () => expect(pctChange(110, 90)).toBe(22.2));
  it("handles drops", () => expect(pctChange(80, 100)).toBe(-20));
});

describe("previousRange / dayList", () => {
  it("is the same length right before from", () => {
    expect(previousRange("2026-11-01", "2026-11-07")).toEqual({ from: "2026-10-25", to: "2026-10-31" });
    expect(dayList("2026-10-30", "2026-11-02")).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });
});

describe("sumByResourceUnit", () => {
  it("never adds different units of the same resource", () => {
    const g = sumByResourceUnit([
      { resourceCode: "TAP_WATER", resourceName: "น้ำประปา", unit: "m³", quantity: 2 },
      { resourceCode: "TAP_WATER", resourceName: "น้ำประปา", unit: "L", quantity: 500 },
      { resourceCode: "TAP_WATER", resourceName: "น้ำประปา", unit: "m³", quantity: 3 },
    ]);
    expect(g).toHaveLength(2);
    expect(g.find((x) => x.unit === "m³")).toMatchObject({ total: 5, count: 2 });
    expect(g.find((x) => x.unit === "L")).toMatchObject({ total: 500, count: 1 });
  });
});

describe("dailyTotals", () => {
  it("sums per day for one unit", () => {
    const m = dailyTotals([{ day: "2026-11-01", unit: "kWh", quantity: 1 }, { day: "2026-11-01", unit: "kWh", quantity: 2 }], "kWh");
    expect(m.get("2026-11-01")).toBe(3);
  });
  it("refuses mixed units", () => {
    expect(() => dailyTotals([{ day: "2026-11-01", unit: "L", quantity: 1 }], "m³")).toThrow(/mixed units/);
  });
});

describe("anomalyBand", () => {
  const days = dayList("2026-11-01", "2026-11-10");
  const totals = new Map(days.map((d, i) => [d, i === 9 ? 300 : 100] as [string, number]));
  it("computes μ, population σ, band and z", () => {
    const b = anomalyBand(days, totals);
    expect(b.mean).toBe(120);
    expect(b.sd).toBe(60);
    expect(b.upper).toBe(240);
    expect(b.lower).toBe(0);
    expect(b.points[9].z).toBe(3);
    expect(b.points[9].anomaly).toBe(true);
    expect(b.anomalyDays).toBe(1);
  });
  it("ignores days without data and gives z = 0 when σ = 0", () => {
    const b = anomalyBand(days, new Map([[days[0], 5], [days[1], 5]]));
    expect(b.n).toBe(2);
    expect(b.points[0].z).toBe(0);
    expect(b.points[5].value).toBeNull();
  });
});

describe("stats / dataQuality / findings", () => {
  it("stats", () => expect(stats([1, 3])).toEqual({ mean: 2, sd: 1, min: 1, max: 3, n: 2 }));
  it("data quality counts the 5 key fields", () => {
    expect(dataQuality([{ machineId: 1, departmentId: 1, buildingId: 1, unit: "kWh", resourceCode: "E" }, { machineId: null, departmentId: 1, buildingId: 1, unit: "kWh", resourceCode: "E" }])).toBe(90);
    expect(dataQuality([])).toBeNull();
  });
  it("findings follow the thresholds", () => {
    expect(findings({ label: "ไฟฟ้า", unit: "kWh", change: 12, anomalyDays: 0 })[0].level).toBe("watch");
    expect(findings({ label: "ไฟฟ้า", unit: "kWh", change: 30, anomalyDays: 0 })[0].level).toBe("attention");
    expect(findings({ label: "ไฟฟ้า", unit: "kWh", change: 5, topGroup: { name: "A", share: 80 }, anomalyDays: 2 }).map((f) => f.level)).toEqual(["attention", "attention"]);
    expect(findings({ label: "ไฟฟ้า", unit: "kWh", change: null, anomalyDays: 0 })).toEqual([]);
  });
});
