const nf = (max: number) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: max });
const n0 = nf(0), n1 = nf(1), n2 = nf(2);

/** Thai-locale number; fewer decimals for bigger values so tables stay readable. */
export function fmtNum(v: number | null | undefined, digits?: number) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  if (digits !== undefined) return nf(digits).format(v);
  const a = Math.abs(v);
  return (a >= 1000 ? n0 : a >= 10 ? n1 : n2).format(v);
}

export const fmtPct = (v: number | null | undefined, digits = 1) =>
  v === null || v === undefined || !Number.isFinite(v) ? "—" : `${v > 0 ? "+" : ""}${nf(digits).format(v)}%`;

/** kgCO2e below 1 t, tCO2e above. */
export function fmtCarbon(kg: number) {
  return Math.abs(kg) >= 1000 ? { value: fmtNum(kg / 1000, 2), unit: "tCO₂e" } : { value: fmtNum(kg), unit: "kgCO₂e" };
}

/** Prisma Decimal/BigInt → number for display. */
export const num = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
