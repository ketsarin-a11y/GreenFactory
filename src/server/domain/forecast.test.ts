import { describe, expect, it } from "vitest";
import { forecast } from "./forecast";

describe("forecast", () => {
  it("needs at least 3 points", () => expect(forecast([1, 2])).toBeNull());

  it("extends a perfect line with full confidence", () => {
    const f = forecast([10, 20, 30, 40])!;
    expect(f.points[0].predicted).toBeCloseTo(50);
    expect(f.points[6].predicted).toBeCloseTo(110);
    expect(f.points[0].upper).toBeCloseTo(50);
    expect(f.confidence).toBe(95);
    // baseline = mean(last ≤7) × 7 = 25 × 7
    expect(f.baseline7Total).toBeCloseTo(175);
    expect(f.next7Total).toBeCloseTo(560);
    expect(f.change).toBe(220);
  });

  it("uses only the last 14 points and never predicts below 0", () => {
    const f = forecast([...Array(20).fill(1000), 100, 80, 60, 40, 20, 10, 5, 4, 3, 2, 1, 1, 1, 0])!;
    expect(f.n).toBe(14);
    expect(f.points.every((p) => p.predicted >= 0 && p.lower >= 0)).toBe(true);
  });

  it("widens the band with the horizon and lowers confidence for noisy data", () => {
    const f = forecast([100, 140, 90, 150, 80, 160, 95])!;
    expect(f.points[6].upper - f.points[6].lower).toBeGreaterThan(f.points[0].upper - f.points[0].lower);
    expect(f.confidence).toBeLessThan(95);
    expect(f.confidence).toBeGreaterThanOrEqual(55);
  });
});
