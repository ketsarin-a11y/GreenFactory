// Pure rules for QR scans and manual readings (no DB, unit tested).
import { randomBytes } from "node:crypto";

export const SCAN_TTL_MS = 30 * 60 * 1000;
export const MAX_FUTURE_MS = 5 * 60 * 1000;
export const MAX_AGE_DAYS = 31;

export type Target = { kind: "MACHINE" | "CHECKPOINT"; id: number };

export type ScanFacts = {
  userId: number;
  scanResult: string;
  scannedAt: Date;
  machineId: number | null;
  checkpointId: number | null;
  usedByUsage: boolean;
};

/** Why a scan id cannot back this reading, or null if it can (Review Focus #5). */
export function scanProblem(scan: ScanFacts | null, userId: number, target: Target, now: Date): string | null {
  if (!scan || scan.userId !== userId || scan.scanResult !== "SUCCESS") return "ไม่พบข้อมูลการสแกน QR Code กรุณาสแกนใหม่";
  const scanned = target.kind === "MACHINE" ? scan.machineId : scan.checkpointId;
  if (scanned !== target.id) return "QR Code ที่สแกนไม่ตรงกับเครื่องจักร/จุดตรวจที่เลือก";
  if (now.getTime() - scan.scannedAt.getTime() > SCAN_TTL_MS) return "การสแกนหมดอายุแล้ว (เกิน 30 นาที) กรุณาสแกน QR Code ใหม่";
  if (scan.usedByUsage) return "การสแกนนี้ถูกใช้บันทึกไปแล้ว กรุณาสแกน QR Code ใหม่";
  return null;
}

/** A reading may not be in the future (5 min clock slack) nor older than 31 days. */
export function usageTimeProblem(usageAt: Date, now: Date): string | null {
  if (usageAt.getTime() > now.getTime() + MAX_FUTURE_MS) return "วันที่และเวลาต้องไม่เป็นเวลาในอนาคต";
  if (now.getTime() - usageAt.getTime() > MAX_AGE_DAYS * 86_400_000) return `บันทึกย้อนหลังได้ไม่เกิน ${MAX_AGE_DAYS} วัน`;
  return null;
}

/** "YYYY-MM-DDTHH:mm" (datetime-local) of `d` on the Bangkok clock. */
export const bkkLocalInput = (d: Date) => new Date(d.getTime() + 7 * 3_600_000).toISOString().slice(0, 16);

/** Parses a datetime-local value as Bangkok time. */
export function parseBkkLocal(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
  const d = new Date(`${s}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const usageReference = (now = new Date()) => `USG-${now.getTime()}-${randomBytes(5).toString("hex").toUpperCase()}`;
