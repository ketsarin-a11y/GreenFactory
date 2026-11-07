"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/server/db";
import { bkkDay } from "@/lib/time";

export type ContactState =
  | { ok?: boolean; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }
  | undefined;

const schema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(120, "ยาวเกิน 120 ตัวอักษร"),
  company: z.string().trim().min(1, "กรุณากรอกชื่อบริษัทหรือโรงงาน").max(120, "ยาวเกิน 120 ตัวอักษร"),
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง").max(200),
  phone: z.string().trim().max(30, "ยาวเกิน 30 ตัวอักษร").regex(/^[0-9+\-\s()]*$/, "เบอร์โทรใช้ได้เฉพาะตัวเลข"),
  factoryCount: z.enum(["1", "2-5", "6-20", "20+"], "กรุณาเลือกจำนวนโรงงาน"),
  message: z.string().trim().max(2000, "ยาวเกิน 2,000 ตัวอักษร"),
  website: z.string().max(0).optional(), // honeypot: real people leave it empty
});

// Shortcut: in-memory, per-process rate limit (5 requests / 10 min / IP).
// Resets on restart and isn't shared across instances; move to Redis/DB if this ever runs on more than one server.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return recent.length > LIMIT;
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData);
  // React resets the form after an action; send the input back so the user doesn't retype it.
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    if (fieldErrors.website) return { ok: true }; // bot: pretend success, store nothing
    return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors, values };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (limited(ip)) return { ok: false, message: "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", values };

  const d = parsed.data;
  try {
    await db.supportTicket.create({
      data: {
        ticketReference: `SALES-${bkkDay(new Date()).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`,
        reporterId: 0, // public lead, no user account
        companyId: null,
        category: "SALES",
        priority: "NORMAL",
        subject: `[Demo request] ${d.company}`.slice(0, 150),
        description: [
          `ชื่อ: ${d.name}`,
          `บริษัท/โรงงาน: ${d.company}`,
          `อีเมล: ${d.email}`,
          `โทรศัพท์: ${d.phone || "-"}`,
          `จำนวนโรงงาน: ${d.factoryCount}`,
          "",
          d.message || "(ไม่มีข้อความเพิ่มเติม)",
        ].join("\n"),
        pageUrl: "/contact",
      },
    });
  } catch (e) {
    console.error("[contact]", e);
    return { ok: false, message: "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่ หรือส่งอีเมลถึงเราโดยตรง", values };
  }
  return { ok: true };
}
