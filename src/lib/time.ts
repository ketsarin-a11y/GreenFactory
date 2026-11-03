// All business dates are Bangkok calendar days (UTC+7, no DST).
export const TZ = "Asia/Bangkok";
const OFFSET_MS = 7 * 60 * 60 * 1000;

/** "YYYY-MM-DD" of the Bangkok calendar day containing `d`. */
export const bkkDay = (d: Date) => new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);

/** First instant of a Bangkok day. */
export const startOfBkkDay = (day: string) => new Date(`${day}T00:00:00+07:00`);
/** Exclusive end: first instant of the next Bangkok day. */
export const endOfBkkDayExclusive = (day: string) => new Date(startOfBkkDay(day).getTime() + 86_400_000);

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;

/** A real calendar day "YYYY-MM-DD" (rejects 2026-02-31, which Date would roll into March). */
export const isDay = (s: unknown): s is string => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

const dateFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("th-TH", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const fmtDate = (d: Date) => dateFmt.format(d);
export const fmtDateTime = (d: Date) => dateTimeFmt.format(d);

/** Saturday or Sunday on the Bangkok calendar. */
export const isBkkWeekend = (d: Date) => {
  const dow = new Date(`${bkkDay(d)}T00:00:00Z`).getUTCDay();
  return dow === 0 || dow === 6;
};
