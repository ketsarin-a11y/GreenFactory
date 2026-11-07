import { describe, expect, it } from "vitest";
import { machineWhere, ownedWhere, qrWhere } from "./scope";

describe("tenant scope", () => {
  it("limits managers and operators to their factory", () => {
    expect(ownedWhere({ role: "MANAGER", companyId: 1, factoryId: 7 })).toEqual({ companyId: 1, factoryId: 7 });
    expect(machineWhere({ role: "OPERATOR", companyId: 1, factoryId: 7 })).toEqual({
      productionLine: { department: { building: { factory: { companyId: 1, factoryId: 7 } } } },
    });
  });

  it("gives company admins the whole company", () => {
    expect(ownedWhere({ role: "COMPANY_ADMIN", companyId: 1, factoryId: 7 })).toEqual({ companyId: 1 });
  });

  it("covers both QR targets", () => {
    expect(qrWhere({ role: "COMPANY_ADMIN", companyId: 2, factoryId: null }).OR).toHaveLength(2);
  });

  it("refuses to scope a user without a company", () => {
    expect(() => ownedWhere({ role: "PLATFORM_ADMIN", companyId: null, factoryId: null })).toThrow();
  });
});
