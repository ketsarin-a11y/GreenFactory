import { describe, expect, it } from "vitest";
import { detectAnomaly } from "./anomaly";

describe("detectAnomaly", () => {
  it("needs at least 3 history points and a positive mean", () => {
    expect(detectAnomaly([10, 10], 100)).toBeNull();
    expect(detectAnomaly([0, 0, 0], 100)).toBeNull();
  });

  it("uses a 60% rule when history is short (< 5)", () => {
    expect(detectAnomaly([100, 100, 100], 159)).toBeNull();
    const r = detectAnomaly([100, 100, 100], 160);
    expect(r).toMatchObject({ direction: "SPIKE", severity: "HIGH" });
  });

  it("needs both |dev| >= 30% and |z| >= 2 with longer history", () => {
    const hist = [80, 120, 85, 115, 100, 100]; // sd ≈ 14.4
    expect(detectAnomaly(hist, 125)).toBeNull(); // 25%
    expect(detectAnomaly(hist, 135)).toMatchObject({ direction: "SPIKE", severity: "MEDIUM" });
  });

  it("grades severity and detects drops", () => {
    const hist = [100, 100, 100, 100, 100];
    expect(detectAnomaly(hist, 210)?.severity).toBe("CRITICAL");
    expect(detectAnomaly(hist, 155)?.severity).toBe("HIGH");
    expect(detectAnomaly(hist, 40)).toMatchObject({ direction: "DROP", severity: "HIGH" });
  });
});
