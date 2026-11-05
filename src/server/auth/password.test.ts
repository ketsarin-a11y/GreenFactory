import { describe, expect, it } from "vitest";
import { hashPassword, passwordProblem, verifyPassword } from "./password";

describe("password", () => {
  it("hashes and verifies", async () => {
    const h = await hashPassword("abc12345");
    expect(await verifyPassword("abc12345", h)).toBe(true);
    expect(await verifyPassword("abc12346", h)).toBe(false);
  });

  it("enforces length and mix", () => {
    expect(passwordProblem("a1")).toMatch(/8/);
    expect(passwordProblem("abcdefgh")).toMatch(/ตัวเลข/);
    expect(passwordProblem("12345678")).toMatch(/ตัวอักษร/);
    expect(passwordProblem("abcd1234")).toBeNull();
  });
});
