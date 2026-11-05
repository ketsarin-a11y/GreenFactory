import "server-only";
import { Prisma } from "@/generated/prisma/client";

/** The app runs on MySQL (local, CI, legacy) or Postgres (Vercel/Neon); pick SQL by DATABASE_URL. */
export const isPostgres = () => /^postgres(ql)?:/.test(process.env.DATABASE_URL ?? "");

// Timestamps are stored as UTC; Bangkok is a fixed +7h (no DST).
/** "YYYY-MM-DD" Bangkok day of a timestamp column. */
export const bkkDaySql = (col: string) =>
  Prisma.raw(isPostgres() ? `to_char(${col} + interval '7 hours', 'YYYY-MM-DD')` : `DATE_FORMAT(${col} + INTERVAL 7 HOUR, '%Y-%m-%d')`);
/** Bangkok hour 0–23 of a timestamp column. */
export const bkkHourSql = (col: string) =>
  Prisma.raw(isPostgres() ? `CAST(EXTRACT(HOUR FROM ${col} + interval '7 hours') AS INTEGER)` : `HOUR(${col} + INTERVAL 7 HOUR)`);
/** Unix seconds of a timestamp column. */
export const epochSql = (col: string) =>
  Prisma.raw(isPostgres() ? `EXTRACT(EPOCH FROM ${col})` : `UNIX_TIMESTAMP(${col})`);
