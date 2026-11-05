import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "./session";

describe("session token", () => {
  it("round-trips the user id and session version", async () => {
    const token = await signSession({ uid: 42, ver: 3 }, 60);
    expect(await verifySession(token)).toEqual({ uid: 42, ver: 3 });
  });

  it("rejects a tampered token", async () => {
    const token = await signSession({ uid: 42, ver: 0 }, 60);
    expect(await verifySession(token.slice(0, -2) + "xx")).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSession({ uid: 1, ver: 0 }, -1);
    expect(await verifySession(token)).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await verifySession("not-a-jwt")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});
