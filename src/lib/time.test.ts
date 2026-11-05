import { describe, expect, it } from "vitest";
import { addDays, bkkDay, daysBetween, endOfBkkDayExclusive, startOfBkkDay } from "./time";

describe("Bangkok time helpers", () => {
  it("uses the Bangkok calendar day, not UTC", () => {
    expect(bkkDay(new Date("2026-11-03T18:30:00Z"))).toBe("2026-11-04"); // 01:30 next day in BKK
    expect(bkkDay(new Date("2026-11-03T16:59:59Z"))).toBe("2026-11-03");
  });

  it("builds day bounds at +07:00", () => {
    expect(startOfBkkDay("2026-11-03").toISOString()).toBe("2026-11-02T17:00:00.000Z");
    expect(endOfBkkDayExclusive("2026-11-03").toISOString()).toBe("2026-11-03T17:00:00.000Z");
  });

  it("adds days across month ends and counts inclusive ranges", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(daysBetween("2026-11-01", "2026-11-07")).toBe(7);
  });
});

import { isBkkWeekend } from "./time";
describe("isBkkWeekend", () => {
  it("uses the Bangkok day", () => {
    expect(isBkkWeekend(new Date("2026-11-06T18:00:00Z"))).toBe(true); // Sat 01:00 BKK
    expect(isBkkWeekend(new Date("2026-11-06T16:00:00Z"))).toBe(false); // Fri 23:00 BKK
  });
});

import { isDay } from "./time";
describe("isDay", () => {
  it("rejects impossible dates", () => {
    expect(isDay("2026-02-28")).toBe(true);
    expect(isDay("2026-02-31")).toBe(false);
    expect(isDay("2026-13-01")).toBe(false);
  });
});
