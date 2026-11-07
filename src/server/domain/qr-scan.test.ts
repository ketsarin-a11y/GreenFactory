import { describe, expect, it } from "vitest";
import { bkkLocalInput, parseBkkLocal, scanProblem, usageReference, usageTimeProblem, type ScanFacts } from "./qr-scan";

const now = new Date("2026-11-03T05:00:00Z");
const scan = (p: Partial<ScanFacts> = {}): ScanFacts => ({
  userId: 7, scanResult: "SUCCESS", scannedAt: new Date(now.getTime() - 60_000), machineId: 3, checkpointId: null, usedByUsage: false, ...p,
});
const machine3 = { kind: "MACHINE" as const, id: 3 };

describe("scanProblem", () => {
  it("accepts a fresh, unused scan of the same target by the same user", () => {
    expect(scanProblem(scan(), 7, machine3, now)).toBeNull();
    expect(scanProblem(scan({ machineId: null, checkpointId: 1 }), 7, { kind: "CHECKPOINT", id: 1 }, now)).toBeNull();
  });
  it("rejects missing, foreign-user and failed scans", () => {
    expect(scanProblem(null, 7, machine3, now)).toMatch(/ไม่พบ/);
    expect(scanProblem(scan({ userId: 8 }), 7, machine3, now)).toMatch(/ไม่พบ/);
    expect(scanProblem(scan({ scanResult: "FAILED" }), 7, machine3, now)).toMatch(/ไม่พบ/);
  });
  it("rejects a scan of another target (machine id vs checkpoint id never mix)", () => {
    expect(scanProblem(scan(), 7, { kind: "MACHINE", id: 4 }, now)).toMatch(/ไม่ตรง/);
    expect(scanProblem(scan(), 7, { kind: "CHECKPOINT", id: 3 }, now)).toMatch(/ไม่ตรง/);
  });
  it("expires after 30 minutes", () => {
    expect(scanProblem(scan({ scannedAt: new Date(now.getTime() - 30 * 60_000) }), 7, machine3, now)).toBeNull();
    expect(scanProblem(scan({ scannedAt: new Date(now.getTime() - 30 * 60_000 - 1) }), 7, machine3, now)).toMatch(/หมดอายุ/);
  });
  it("can be used once", () => {
    expect(scanProblem(scan({ usedByUsage: true }), 7, machine3, now)).toMatch(/ถูกใช้/);
  });
});

describe("usageTimeProblem", () => {
  it("allows now, 5 min clock slack and up to 31 days back", () => {
    expect(usageTimeProblem(now, now)).toBeNull();
    expect(usageTimeProblem(new Date(now.getTime() + 5 * 60_000), now)).toBeNull();
    expect(usageTimeProblem(new Date(now.getTime() - 31 * 86_400_000), now)).toBeNull();
  });
  it("rejects the future and older than 31 days", () => {
    expect(usageTimeProblem(new Date(now.getTime() + 5 * 60_000 + 1), now)).toMatch(/อนาคต/);
    expect(usageTimeProblem(new Date(now.getTime() - 32 * 86_400_000), now)).toMatch(/31/);
  });
});

describe("Bangkok datetime-local", () => {
  it("formats and parses on the Bangkok clock (not UTC)", () => {
    expect(bkkLocalInput(new Date("2026-11-02T17:30:00Z"))).toBe("2026-11-03T00:30");
    expect(parseBkkLocal("2026-11-03T00:30")?.toISOString()).toBe("2026-11-02T17:30:00.000Z");
    expect(parseBkkLocal("2026-11-03")).toBeNull();
  });
});

it("usageReference is USG-<ms>-<10 upper hex>", () => {
  expect(usageReference(now)).toMatch(new RegExp(`^USG-${now.getTime()}-[0-9A-F]{10}$`));
});
