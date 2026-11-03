import { pctChange } from "./analytics";

export type ForecastPoint = { step: number; predicted: number; lower: number; upper: number };
export type Forecast = {
  points: ForecastPoint[];
  next7Total: number;
  baseline7Total: number;
  change: number | null;
  confidence: number;
  slope: number;
  n: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * 7-day OLS forecast on the last ≤14 daily totals (needs ≥3).
 * predicted(step) = max(0, a + b·(n−1+step)); band ± 1.96·σres·√(1 + step/n);
 * confidence = round(clamp(95 − min(1, σres/ȳ)·55, 55, 95)).
 */
export function forecast(series: number[], horizon = 7): Forecast | null {
  const y = series.slice(-14);
  const n = y.length;
  if (n < 3) return null;
  const xm = (n - 1) / 2;
  const ym = y.reduce((a, v) => a + v, 0) / n;
  let sxy = 0, sxx = 0;
  y.forEach((v, i) => { sxy += (i - xm) * (v - ym); sxx += (i - xm) ** 2; });
  const b = sxx === 0 ? 0 : sxy / sxx;
  const a = ym - b * xm;
  const sse = y.reduce((acc, v, i) => acc + (v - (a + b * i)) ** 2, 0);
  const sres = Math.sqrt(sse / Math.max(1, n - 2));

  const points = Array.from({ length: horizon }, (_, k) => {
    const step = k + 1;
    const predicted = Math.max(0, a + b * (n - 1 + step));
    const half = 1.96 * sres * Math.sqrt(1 + step / n);
    return { step, predicted, lower: Math.max(0, predicted - half), upper: predicted + half };
  });
  const last7 = y.slice(-7);
  const baseline7Total = (last7.reduce((s, v) => s + v, 0) / last7.length) * 7;
  const next7Total = points.slice(0, 7).reduce((s, p) => s + p.predicted, 0);
  const ratio = ym > 0 ? Math.min(1, sres / ym) : 1;
  return {
    points,
    next7Total,
    baseline7Total,
    change: pctChange(next7Total, baseline7Total),
    confidence: Math.round(clamp(95 - ratio * 55, 55, 95)),
    slope: b,
    n,
  };
}
