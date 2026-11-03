import "server-only";
import type { CurrentUser } from "@/server/auth/current-user";
import { pctChange, previousRange, sumByResourceUnit } from "@/server/domain/analytics";
import { loadUsageRows, sortGroups, type Range, loadPreviousRows } from "./common";

/** |Δ| below this is "คงที่". */
export const STABLE_PCT = 2;

export async function getCompare(user: CurrentUser, range: Range) {
  const prev = previousRange(range.from, range.to);
  const [cur, old] = await Promise.all([loadUsageRows(user, range.from, range.to), loadPreviousRows(user, prev)]);
  const c = new Map(sumByResourceUnit(cur).map((g) => [g.key, g]));
  const p = new Map(sumByResourceUnit(old).map((g) => [g.key, g]));
  const keys = [...new Set([...c.keys(), ...p.keys()])];
  const rows = sortGroups(keys.map((key) => {
    const g = c.get(key) ?? p.get(key)!;
    const current = c.get(key)?.total ?? 0, previous = p.get(key)?.total ?? 0;
    const change = pctChange(current, previous);
    const signal = change === null ? "new" : Math.abs(change) < STABLE_PCT ? "stable" : change > 0 ? "up" : "down";
    return { key, resourceCode: g.resourceCode, resourceName: g.resourceName, unit: g.unit, current, previous, change, signal };
  }));
  const withChange = rows.filter((r) => r.change !== null);
  return {
    prev,
    rows,
    counts: { down: rows.filter((r) => r.signal === "down").length, up: rows.filter((r) => r.signal === "up").length, stable: rows.filter((r) => r.signal === "stable").length },
    biggest: withChange.sort((a, b) => Math.abs(b.change!) - Math.abs(a.change!))[0] ?? null,
  };
}
