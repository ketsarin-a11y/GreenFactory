import "server-only";
import { endOfBkkDayExclusive, isDay, startOfBkkDay } from "@/lib/time";

export const PAGE_SIZE = 20;

export type SP = Record<string, string | string[] | undefined>;

/** One trimmed string param or undefined. */
export const str = (sp: SP, k: string) => {
  const v = sp[k];
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, 200) : undefined;
};
export const intParam = (sp: SP, k: string) => {
  const n = Number.parseInt(str(sp, k) ?? "", 10);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};
export const oneOf = <T extends string>(sp: SP, k: string, allowed: readonly T[]) => {
  const v = str(sp, k);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
};

/** ?from=YYYY-MM-DD&to=YYYY-MM-DD → Prisma range on Bangkok days. */
export function dayRange(sp: SP) {
  const from = str(sp, "from");
  const to = str(sp, "to");
  if (!isDay(from) && !isDay(to)) return undefined;
  return {
    ...(isDay(from) ? { gte: startOfBkkDay(from) } : {}),
    ...(isDay(to) ? { lt: endOfBkkDayExclusive(to) } : {}),
  };
}

export const paging = (page: number, size = PAGE_SIZE) => ({ skip: (page - 1) * size, take: size });

/** RFC 4180 CSV with a BOM so Excel opens Thai text correctly. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Leading = + - @ would be run as a formula by Excel.
    const safe = typeof v === "string" && /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}

export const csvResponse = (body: string, filename: string) =>
  new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
