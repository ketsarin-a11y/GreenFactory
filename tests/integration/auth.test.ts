import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth/current-user";
import { DEMO, signInAs, signOut } from "./helpers";

afterEach(signOut);

describe("getCurrentUser", () => {
  it("returns the signed-in user with role and tenant", async () => {
    await signInAs(DEMO.manager);
    const u = await getCurrentUser();
    expect(u).toMatchObject({ role: "MANAGER", companyCode: "VOLTERA" });
    expect(u?.factoryId).not.toBeNull();
  });

  it("drops the session as soon as the user is suspended (cookie still valid)", async () => {
    const u = await signInAs(DEMO.operator);
    await db.user.update({ where: { userId: u.userId }, data: { status: "LOCKED" } });
    try {
      expect(await getCurrentUser()).toBeNull();
    } finally {
      await db.user.update({ where: { userId: u.userId }, data: { status: "ACTIVE" } });
    }
  });

  it("drops old cookies after the session version changes (password change)", async () => {
    const u = await signInAs(DEMO.operator);
    await db.user.update({ where: { userId: u.userId }, data: { sessionVersion: { increment: 1 } } });
    expect(await getCurrentUser()).toBeNull();
  });
});

import { login } from "@/server/auth/login";
import { hashPassword } from "@/server/auth/password";

// Other test files may change demo passwords; give the accounts used here a known one.
const PW = "Known-pass-123";
const prepare = async (email: string) =>
  db.user.update({ where: { email }, data: { passwordHash: await hashPassword(PW), status: "ACTIVE", failedLogin: 0, lockedUntil: null } });

describe("login", () => {
  it("does not reveal a suspended account to someone without its password", async () => {
    const u = await prepare(DEMO.operator);
    await db.user.update({ where: { userId: u.userId }, data: { status: "LOCKED" } });
    try {
      const wrong = await login({ organizationCode: "VOLTERA", email: DEMO.operator, password: "nope-1234", remember: false });
      const unknown = await login({ organizationCode: "VOLTERA", email: "nobody@voltera.example", password: "nope-1234", remember: false });
      expect(wrong).toEqual(unknown);
      const right = await login({ organizationCode: "VOLTERA", email: DEMO.operator, password: PW, remember: false });
      expect(right).toMatchObject({ ok: false, message: expect.stringContaining("ระงับ") });
    } finally {
      await db.user.update({ where: { userId: u.userId }, data: { status: "ACTIVE", failedLogin: 0, lockedUntil: null } });
    }
  });

  it("blocks users of a suspended factory, including existing sessions", async () => {
    await prepare(DEMO.manager);
    const u = await signInAs(DEMO.manager);
    await db.factory.update({ where: { factoryId: u.factoryId! }, data: { status: "SUSPENDED" } });
    try {
      expect(await getCurrentUser()).toBeNull();
      expect((await login({ organizationCode: "VOLTERA", email: DEMO.manager, password: PW, remember: false })).ok).toBe(false);
    } finally {
      await db.factory.update({ where: { factoryId: u.factoryId! }, data: { status: "ACTIVE" } });
    }
  });
});
