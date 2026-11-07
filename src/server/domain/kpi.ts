import { addDays, bkkDay } from "@/lib/time";

export type Operator = "<=" | ">=" | "<" | ">" | "=";
const ALIASES: Record<string, Operator> = {
  "<=": "<=", LTE: "<=", LESS_THAN_OR_EQUAL: "<=",
  ">=": ">=", GTE: ">=", GREATER_THAN_OR_EQUAL: ">=",
  "<": "<", LT: "<",
  ">": ">", GT: ">",
  "=": "=", "==": "=", EQ: "=", EQUAL: "=",
};
export const normalizeOperator = (op: string): Operator => {
  const o = ALIASES[op.trim().toUpperCase()];
  if (!o) throw new Error(`Unknown KPI operator: ${op}`);
  return o;
};

/** Achievement is capped at 100 (the old engine let it exceed 100, which read oddly on gauges). */
export function evaluateKpi(actual: number, target: number, operator: string) {
  const op = normalizeOperator(operator);
  const pass =
    op === "<=" ? actual <= target : op === ">=" ? actual >= target : op === "<" ? actual < target : op === ">" ? actual > target : actual === target;

  let achievement: number;
  if (op === "<=" || op === "<") achievement = actual === 0 ? 100 : (target / actual) * 100;
  else if (op === ">=" || op === ">") achievement = target === 0 ? 100 : (actual / target) * 100;
  else achievement = target === 0 ? (actual === 0 ? 100 : 0) : Math.max(0, (1 - Math.abs(actual - target) / Math.abs(target)) * 100);

  return { pass, variance: actual - target, achievement: Math.min(100, Math.round(achievement * 100) / 100) };
}

export type PeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

/** Calendar period (Bangkok) containing `at`, as inclusive YYYY-MM-DD bounds. */
export function periodBounds(type: string, at: Date): { start: string; end: string } {
  const day = bkkDay(at);
  const [y, m] = day.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastOfMonth = (yy: number, mm: number) => new Date(Date.UTC(yy, mm, 0)).getUTCDate();

  switch (type) {
    case "WEEKLY": {
      const dow = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
      const start = addDays(day, -dow);
      return { start, end: addDays(start, 6) };
    }
    case "MONTHLY":
      return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(lastOfMonth(y, m))}` };
    case "QUARTERLY": {
      const qs = Math.floor((m - 1) / 3) * 3 + 1;
      return { start: `${y}-${pad(qs)}-01`, end: `${y}-${pad(qs + 2)}-${pad(lastOfMonth(y, qs + 2))}` };
    }
    case "YEARLY":
    case "ANNUAL":
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    default:
      return { start: day, end: day };
  }
}
