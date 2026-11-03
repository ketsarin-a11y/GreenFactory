import { describe, expect, it } from "vitest";
import { homeFor, safeReturnTo } from "./roles";

describe("roles", () => {
  it("maps each role to its home", () => {
    expect(homeFor("PLATFORM_ADMIN")).toBe("/platform");
    expect(homeFor("COMPANY_ADMIN")).toBe("/company");
    expect(homeFor("MANAGER")).toBe("/manager");
    expect(homeFor("OPERATOR")).toBe("/operator");
  });

  it("only allows same-site relative returnTo paths", () => {
    expect(safeReturnTo("/scan/abc")).toBe("/scan/abc");
    expect(safeReturnTo("//evil.com")).toBeNull();
    expect(safeReturnTo("https://evil.com")).toBeNull();
    expect(safeReturnTo("/\\evil.com")).toBeNull();
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo("/\t/evil.com")).toBeNull();
    expect(safeReturnTo("/%09/evil.com")).toBe("/%09/evil.com"); // stays a path on this site
    expect(safeReturnTo("/\n/evil.com")).toBeNull();
  });
});
