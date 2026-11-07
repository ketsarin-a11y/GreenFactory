export const HISTORY_LIMIT = 30;
const MIN_HISTORY = 3;

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM";
export type Anomaly = {
  direction: "SPIKE" | "DROP";
  severity: Severity;
  mean: number;
  deviationPct: number;
  zScore: number | null;
};

/** Compares a reading with the same target's previous readings (newest first, up to 30). */
export function detectAnomaly(history: number[], current: number): Anomaly | null {
  if (history.length < MIN_HISTORY) return null;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  if (mean <= 0) return null;

  const sd = Math.sqrt(history.reduce((a, v) => a + (v - mean) ** 2, 0) / history.length);
  const dev = ((current - mean) / mean) * 100;
  const z = sd === 0 ? null : (current - mean) / sd;
  const absDev = Math.abs(dev);
  const absZ = z === null ? Infinity : Math.abs(z); // flat history: any big jump counts

  const isAnomaly = history.length < 5 ? absDev >= 60 : absDev >= 30 && absZ >= 2;
  if (!isAnomaly) return null;

  const severity: Severity =
    absDev >= 100 || (z !== null && absZ >= 4) ? "CRITICAL" : absDev >= 50 || (z !== null && absZ >= 3) ? "HIGH" : "MEDIUM";

  return { direction: dev >= 0 ? "SPIKE" : "DROP", severity, mean, deviationPct: dev, zScore: z };
}
