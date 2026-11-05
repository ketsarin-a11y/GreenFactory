import { describe, expect, it } from "vitest";
import { ingestBody, measuredAtProblem } from "./ingest";

describe("ingest body", () => {
  it("accepts a single reading or a batch", () => {
    expect(ingestBody.parse({ value: 4.2 }).readings).toHaveLength(1);
    expect(ingestBody.parse({ readings: [{ value: 1, unit: "kw" }] }).readings[0].unit).toBe("KW");
  });
  it("rejects non-numbers and empty batches", () => {
    expect(ingestBody.safeParse({ value: "4.2" }).success).toBe(false);
    expect(ingestBody.safeParse({ readings: [] }).success).toBe(false);
  });
  it("bounds measuredAt", () => {
    const now = new Date("2026-11-04T00:00:00Z");
    expect(measuredAtProblem(new Date("2026-11-04T00:04:00Z"), now)).toBeNull();
    expect(measuredAtProblem(new Date("2026-11-04T00:10:00Z"), now)).toMatch(/future/);
    expect(measuredAtProblem(new Date("2026-10-20T00:00:00Z"), now)).toMatch(/older/);
  });
});
