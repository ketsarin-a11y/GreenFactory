import { describe, expect, it } from "vitest";
import { denseDays, hourMatrix, shortDay } from "./series";

describe("platform series helpers", () => {
  it("fills missing days with 0 and keeps day order", () => {
    expect(denseDays([{ day: "2026-11-03", n: 4 }, { day: "2026-11-01", n: 2 }], "2026-11-01", "2026-11-04")).toEqual([2, 0, 4, 0]);
  });

  it("ignores rows outside the range", () => {
    expect(denseDays([{ day: "2026-10-01", n: 9 }], "2026-11-01", "2026-11-02")).toEqual([0, 0]);
  });

  it("builds a days × 24 matrix and drops unknown days/hours", () => {
    const m = hourMatrix(
      [
        { day: "2026-11-02", hour: 8, n: 3 },
        { day: "2026-11-02", hour: 8, n: 1 },
        { day: "2026-11-01", hour: 23, n: 1 },
        { day: "2026-10-01", hour: 1, n: 5 },
        { day: "2026-11-01", hour: 24, n: 5 },
      ],
      ["2026-11-01", "2026-11-02"],
    );
    expect(m).toHaveLength(2);
    expect(m[0]).toHaveLength(24);
    expect(m[1][8]).toBe(4);
    expect(m[0][23]).toBe(1);
    expect(m.flat().reduce((a, b) => a + b, 0)).toBe(5);
  });

  it("formats a Bangkok day without shifting it", () => {
    expect(shortDay("2026-11-04")).toBe("4 พ.ย.");
  });
});
