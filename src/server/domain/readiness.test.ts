import { describe, expect, it } from "vitest";
import { companyReadiness, factoryProfile, factoryReadiness, machineProfile, pct, sensorConnection, structureScore } from "./readiness";

describe("pct / structureScore", () => {
  it("rounds and guards zero totals", () => {
    expect(pct(1, 3)).toBe(33);
    expect(pct(5, 0)).toBe(0);
  });
  it("scores structure 100 / 60 / 20", () => {
    expect(structureScore({ buildings: 1, departments: 1, lines: 1 })).toBe(100);
    expect(structureScore({ buildings: 2, departments: 0, lines: 0 })).toBe(60);
    expect(structureScore({ buildings: 0, departments: 0, lines: 0 })).toBe(20);
  });
});

describe("factoryReadiness", () => {
  it("weights structure 35 / sensor 35 / qr 30", () => {
    expect(factoryReadiness({ buildings: 1, departments: 1, lines: 1, machines: 4, machinesWithSensor: 2, machinesWithQr: 4 })).toBe(Math.round(35 + 17.5 + 30));
    expect(factoryReadiness({ buildings: 0, departments: 0, lines: 0, machines: 0, machinesWithSensor: 0, machinesWithQr: 0 })).toBe(7);
  });
});

describe("companyReadiness", () => {
  const full = { factories: 1, buildings: 1, departments: 1, lines: 1, users: 10, activeUsers: 10, machines: 10, activeMachines: 10, machinesWithSensor: 10, machinesWithQr: 10 };
  it("is 100 when everything is set up", () => expect(companyReadiness(full).score).toBe(100));
  it("uses org 65 when only factories exist and explains each part", () => {
    const r = companyReadiness({ ...full, buildings: 0, departments: 0, lines: 0, activeUsers: 5, machinesWithSensor: 0, machinesWithQr: 0 });
    // 65*.25 + 50*.2 + 100*.2 + 0 + 0 = 46.25
    expect(r.score).toBe(46);
    expect(r.parts.map((p) => p.score)).toEqual([65, 50, 100, 0, 0]);
  });
  it("empty company scores only the org floor", () => {
    expect(companyReadiness({ factories: 0, buildings: 0, departments: 0, lines: 0, users: 0, activeUsers: 0, machines: 0, activeMachines: 0, machinesWithSensor: 0, machinesWithQr: 0 }).score).toBe(5);
  });
});

describe("profiles", () => {
  it("factory: 9 checks, phone OR email, coords OR map url", () => {
    const r = factoryProfile({ code: "F1", name: "x", address: null, province: "ชลบุรี", phone: null, email: "a@b.c", latitude: null, longitude: null, googleMapUrl: "https://maps", buildings: 1, departments: 0, lines: 0 });
    expect(r.checks).toHaveLength(9);
    expect(r.score).toBe(pct(6, 9));
  });
  it("machine: 11 checks", () => {
    const r = machineProfile({ code: "M", name: "n", typeId: 1, lineId: 1, manufacturer: " ", model: null, serialNumber: null, installationDate: null, locationNote: null, sensors: 1, qrCodes: 0 });
    expect(r.checks).toHaveLength(11);
    expect(r.score).toBe(pct(5, 11));
  });
});

describe("sensorConnection", () => {
  const now = new Date("2026-11-03T10:00:00Z");
  const ago = (s: number) => new Date(now.getTime() - s * 1000);
  const base = { status: "ACTIVE", samplingIntervalSeconds: 60, lastConnectedAt: ago(10), latestQuality: "VALID" };
  it("INACTIVE is maintenance even if fresh", () => expect(sensorConnection({ ...base, status: "INACTIVE" }, now)).toBe("MAINTENANCE"));
  it("non-VALID latest reading is a fault", () => expect(sensorConnection({ ...base, latestQuality: "OUT_OF_RANGE" }, now)).toBe("FAULT"));
  it("uses max(interval×3, 300s)", () => {
    expect(sensorConnection({ ...base, lastConnectedAt: ago(299) }, now)).toBe("ONLINE");
    expect(sensorConnection({ ...base, lastConnectedAt: ago(301) }, now)).toBe("OFFLINE");
    expect(sensorConnection({ ...base, samplingIntervalSeconds: 200, lastConnectedAt: ago(590) }, now)).toBe("ONLINE");
  });
  it("uses 900s without an interval and OFFLINE when never connected", () => {
    expect(sensorConnection({ ...base, samplingIntervalSeconds: null, lastConnectedAt: ago(899) }, now)).toBe("ONLINE");
    expect(sensorConnection({ ...base, samplingIntervalSeconds: null, lastConnectedAt: ago(901) }, now)).toBe("OFFLINE");
    expect(sensorConnection({ ...base, lastConnectedAt: null, latestQuality: null }, now)).toBe("OFFLINE");
  });
});
