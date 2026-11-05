import { describe, expect, it } from "vitest";
import { MAX_FAILED_LOGINS, LOCK_MINUTES, registerFailure, isLocked } from "./lockout";

const now = new Date("2026-11-03T10:00:00Z");

describe("login lockout", () => {
  it("counts failures below the limit", () => {
    expect(registerFailure(0, now)).toEqual({ failedLogin: 1, lockedUntil: null });
  });

  it("locks for 15 minutes on the 5th failure and resets the counter", () => {
    const r = registerFailure(MAX_FAILED_LOGINS - 1, now);
    expect(r.failedLogin).toBe(0);
    expect(r.lockedUntil?.getTime()).toBe(now.getTime() + LOCK_MINUTES * 60_000);
  });

  it("reports locked only while lockedUntil is in the future", () => {
    expect(isLocked(new Date(now.getTime() + 1000), now)).toBe(true);
    expect(isLocked(new Date(now.getTime() - 1000), now)).toBe(false);
    expect(isLocked(null, now)).toBe(false);
  });
});

describe("lockout settings", () => {
  it("respects a custom attempt limit and auto-block off", () => {
    expect(registerFailure(2, now, 3).lockedUntil).not.toBeNull();
    expect(registerFailure(9, now, 3, false)).toEqual({ failedLogin: 10, lockedUntil: null });
  });
});
