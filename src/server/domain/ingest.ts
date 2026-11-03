import { z } from "zod";

export const MAX_BATCH = 500;
const reading = z.object({
  value: z.number().finite(),
  measuredAt: z.string().datetime({ offset: true }).optional(),
  unit: z.string().trim().toUpperCase().max(30).optional(),
  quality: z.enum(["VALID", "SUSPECT", "ERROR"]).default("VALID"),
});
/** Accepts one reading or `{ readings: [...] }`. */
export const ingestBody = z.union([
  z.object({ readings: z.array(reading).min(1).max(MAX_BATCH) }),
  reading.transform((r) => ({ readings: [r] })),
]);

/** Device clocks drift; accept up to 5 min in the future and 7 days back. */
export function measuredAtProblem(at: Date, now: Date) {
  if (at.getTime() > now.getTime() + 5 * 60_000) return "measuredAt is in the future";
  if (at.getTime() < now.getTime() - 7 * 86_400_000) return "measuredAt is older than 7 days";
  return null;
}
