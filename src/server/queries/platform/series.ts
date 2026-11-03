// Pure helpers that turn grouped SQL rows into dense day/hour series (no server imports; unit-tested).
import { dayList } from "@/server/domain/analytics";

export type DayCount = { day: string; n: number };

/** One value per day from..to, 0 where SQL returned no row. */
export function denseDays(rows: DayCount[], from: string, to: string): number[] {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.day, (m.get(r.day) ?? 0) + r.n);
  return dayList(from, to).map((d) => m.get(d) ?? 0);
}

/** rows (day, hour 0–23, n) → days × 24 matrix; every cell a number (no logins = 0, which is real). */
export function hourMatrix(rows: { day: string; hour: number; n: number }[], days: string[]): number[][] {
  const idx = new Map(days.map((d, i) => [d, i]));
  const out = days.map(() => Array.from({ length: 24 }, () => 0));
  for (const r of rows) {
    const i = idx.get(r.day);
    if (i !== undefined && r.hour >= 0 && r.hour < 24) out[i][r.hour] += r.n;
  }
  return out;
}

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** "4 พ.ย." for a YYYY-MM-DD Bangkok day. */
const shortFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "UTC", day: "numeric", month: "short" });
export const shortDay = (day: string) => shortFmt.format(new Date(`${day}T00:00:00Z`));
