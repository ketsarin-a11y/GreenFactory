import "server-only";
import type { CurrentUser } from "@/server/auth/current-user";
import { dayList, pctChange, previousRange } from "@/server/domain/analytics";
import { loadUsageRows, sortGroups, type Range, loadPreviousRows } from "./common";

export async function getCarbon(user: CurrentUser, range: Range) {
  const prev = previousRange(range.from, range.to);
  const [rows, prevRows] = await Promise.all([loadUsageRows(user, range.from, range.to), loadPreviousRows(user, prev)]);
  const withC = rows.filter((r) => r.carbon);
  const total = withC.reduce((a, r) => a + r.carbon!.kg, 0);
  const prevTotal = prevRows.reduce((a, r) => a + (r.carbon?.kg ?? 0), 0);

  type Res = { key: string; resourceCode: string; resourceName: string; unit: string; activity: number; kg: number; factors: Set<string>; factorUnit: Set<string>; sources: Set<string>; scopes: Set<string>; count: number };
  const res = new Map<string, Res>();
  for (const r of withC) {
    const key = `${r.resourceCode}|${r.unit}`;
    const g = res.get(key) ?? { key, resourceCode: r.resourceCode, resourceName: r.resourceName, unit: r.unit, activity: 0, kg: 0, factors: new Set(), factorUnit: new Set(), sources: new Set(), scopes: new Set(), count: 0 };
    g.activity += r.quantity;
    g.kg += r.carbon!.kg;
    g.factors.add(String(r.carbon!.factor));
    g.factorUnit.add(r.carbon!.factorUnit);
    if (r.carbon!.source) g.sources.add(r.carbon!.source);
    g.scopes.add(r.carbon!.scope);
    g.count++;
    res.set(key, g);
  }
  const byResource = sortGroups([...res.values()]).map((g) => ({
    key: g.key, resourceCode: g.resourceCode, resourceName: g.resourceName, unit: g.unit, activity: g.activity, kg: g.kg, count: g.count,
    factor: g.factors.size === 1 ? Number([...g.factors][0]) : null,
    factorUnit: [...g.factorUnit].join(", "),
    source: [...g.sources].join(", ") || "ไม่ระบุแหล่งที่มา",
    scope: [...g.scopes].join(", "),
  }));

  const scopes = new Map<string, number>();
  for (const r of withC) scopes.set(r.carbon!.scope, (scopes.get(r.carbon!.scope) ?? 0) + r.carbon!.kg);
  const hot = new Map<string, number>();
  for (const r of withC) hot.set(r.target, (hot.get(r.target) ?? 0) + r.carbon!.kg);

  const codes = byResource.map((r) => r.resourceCode).filter((c, i, a) => a.indexOf(c) === i);
  const daily = dayList(range.from, range.to).map((day) => {
    const row: Record<string, number | string> = { day };
    for (const r of withC.filter((x) => x.day === day)) row[r.resourceCode] = ((row[r.resourceCode] as number) ?? 0) + r.carbon!.kg;
    return row;
  });
  const top = [...byResource].sort((a, b) => b.kg - a.kg)[0] ?? null;

  return {
    total,
    prevTotal,
    change: pctChange(total, prevTotal),
    top,
    byResource,
    scopes: [...scopes.entries()].map(([scope, kg]) => ({ scope, kg })).sort((a, b) => a.scope.localeCompare(b.scope)),
    hotspots: [...hot.entries()].map(([name, kg]) => ({ name, kg })).sort((a, b) => b.kg - a.kg),
    codes,
    daily,
    withoutCarbon: rows.length - withC.length,
  };
}
