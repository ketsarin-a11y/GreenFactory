// Shared by server and client components.
const dayFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "UTC", day: "numeric", month: "short" });
const dayLongFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });

/** "2026-11-03" → "3 พ.ย." (the string is already a Bangkok day). */
export const fmtDay = (day: string) => dayFmt.format(new Date(`${day}T00:00:00Z`));
export const fmtDayLong = (day: string) => dayLongFmt.format(new Date(`${day}T00:00:00Z`));
export const fmtRange = (from: string, to: string) => (from === to ? fmtDayLong(from) : `${fmtDay(from)} – ${fmtDayLong(to)}`);

export const SOURCE_LABEL: Record<string, string> = { QR: "สแกน QR", MANUAL: "กรอกเอง", SENSOR: "เซนเซอร์", IMPORT: "นำเข้า" };
