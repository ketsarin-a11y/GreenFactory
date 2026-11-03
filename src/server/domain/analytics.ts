import { addDays, daysBetween } from "@/lib/time";

/** Rounded to 1 decimal; null when there is nothing to compare against (previous = 0). */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Same number of days immediately before `from`. */
export function previousRange(from: string, to: string) {
  const n = daysBetween(from, to);
  return { from: addDays(from, -n), to: addDays(from, -1) };
}

/** Every Bangkok day from..to inclusive. */
export function dayList(from: string, to: string) {
  const n = Math.max(0, daysBetween(from, to));
  return Array.from({ length: n }, (_, i) => addDays(from, i));
}

export type UnitRow = { resourceCode: string; resourceName: string; unit: string; quantity: number };
export type UnitGroup = { key: string; resourceCode: string; resourceName: string; unit: string; total: number; count: number };

/** Σ per (resource, unit). Different units are never added together. */
export function sumByResourceUnit(rows: UnitRow[]): UnitGroup[] {
  const m = new Map<string, UnitGroup>();
  for (const r of rows) {
    const key = `${r.resourceCode}|${r.unit}`;
    const g = m.get(key) ?? { key, resourceCode: r.resourceCode, resourceName: r.resourceName, unit: r.unit, total: 0, count: 0 };
    g.total += r.quantity;
    g.count++;
    m.set(key, g);
  }
  return [...m.values()];
}

/** Daily totals for ONE unit. Rows of another unit throw: callers must filter first. */
export function dailyTotals(rows: { day: string; unit: string; quantity: number }[], unit: string) {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.unit !== unit) throw new Error(`dailyTotals: mixed units (${r.unit} ≠ ${unit})`);
    m.set(r.day, (m.get(r.day) ?? 0) + r.quantity);
  }
  return m;
}

export type Stats = { mean: number; sd: number; min: number; max: number; n: number };
/** Population statistics. */
export function stats(values: number[]): Stats {
  const n = values.length;
  if (!n) return { mean: 0, sd: 0, min: 0, max: 0, n: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / n);
  return { mean, sd, min: Math.min(...values), max: Math.max(...values), n };
}

export type BandPoint = { day: string; value: number | null; z: number | null; anomaly: boolean };

/**
 * μ ± 2σ band over the days that have data (population σ). lower is floored at 0.
 * z = (x − μ)/σ (σ = 0 → 0). Anomaly when |z| ≥ 2. Days without data stay null.
 */
export function anomalyBand(days: string[], totals: Map<string, number>) {
  const s = stats(days.filter((d) => totals.has(d)).map((d) => totals.get(d)!));
  const upper = s.mean + 2 * s.sd;
  const lower = Math.max(0, s.mean - 2 * s.sd);
  const points: BandPoint[] = days.map((day) => {
    const value = totals.has(day) ? totals.get(day)! : null;
    const z = value === null ? null : s.sd === 0 ? 0 : (value - s.mean) / s.sd;
    return { day, value, z, anomaly: z !== null && Math.abs(z) >= 2 };
  });
  return { ...s, upper, lower, points, anomalyDays: points.filter((p) => p.anomaly).length, maxAbsZ: Math.max(0, ...points.map((p) => Math.abs(p.z ?? 0))) };
}

/** % of the 5 key fields (machine, department, building, unit, resource) present. */
export function dataQuality(rows: { machineId: unknown; departmentId: unknown; buildingId: unknown; unit: unknown; resourceCode: unknown }[]) {
  if (!rows.length) return null;
  let ok = 0;
  for (const r of rows) for (const v of [r.machineId, r.departmentId, r.buildingId, r.unit, r.resourceCode]) if (v !== null && v !== undefined && v !== "") ok++;
  return Math.round((ok / (rows.length * 5)) * 100);
}

export type Finding = { level: "attention" | "watch"; text: string };

/** Smart findings for one metric. Max 4. */
export function findings(input: {
  label: string;
  unit: string;
  change: number | null;
  topGroup?: { name: string; share: number } | null;
  anomalyDays: number;
}): Finding[] {
  const out: Finding[] = [];
  const { label, change } = input;
  if (input.anomalyDays > 0)
    out.push({ level: "attention", text: `${label}มี ${input.anomalyDays} วันที่อยู่นอกช่วงปกติ (|z| ≥ 2) ควรตรวจสอบรายละเอียดวันดังกล่าว` });
  if (change !== null && Math.abs(change) >= 10)
    out.push({
      level: Math.abs(change) >= 25 ? "attention" : "watch",
      text: `${label}${change > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${Math.abs(change).toLocaleString("th-TH", { maximumFractionDigits: 1 })}% เทียบกับช่วงก่อนหน้า`,
    });
  if (input.topGroup && input.topGroup.share >= 60)
    out.push({
      level: input.topGroup.share >= 75 ? "attention" : "watch",
      text: `${input.topGroup.name} ใช้${label}คิดเป็น ${input.topGroup.share.toLocaleString("th-TH", { maximumFractionDigits: 0 })}% ของทั้งหมด`,
    });
  return out.slice(0, 4);
}
