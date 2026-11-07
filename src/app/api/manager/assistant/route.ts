import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { db } from "@/server/db";
import { getRuntimeSettings } from "@/server/settings";
import { getCurrentUser } from "@/server/auth/current-user";
import { assistantContext, fallbackAnswer, loadConversations, type Conversation } from "@/server/queries/manager/assistant";
import type { Prisma } from "@/generated/prisma/client";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
// Models that accept server-side refusal fallbacks (`fallbacks: "default"`).
const FALLBACK_MODELS = ["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"];
const MAX_CONVERSATIONS = 30;
const HISTORY_TURNS = 20;

const SYSTEM = `คุณคือ G-FAY ผู้ช่วยวิเคราะห์ข้อมูลพลังงาน ทรัพยากร และคาร์บอนของโรงงาน สำหรับผู้จัดการโรงงานใน GreenFactory Insight
กฎ:
- ตอบเป็นภาษาไทย กระชับ ใช้ตัวเลขจาก CONTEXT เท่านั้น ห้ามแต่งตัวเลขหรือข้อมูลที่ไม่มีใน CONTEXT ถ้าไม่มีข้อมูลให้บอกตรง ๆ
- ห้ามรวมหรือเปรียบเทียบปริมาณที่ต่างหน่วยกัน (เช่น kWh กับ m³ หรือ m³ กับ L)
- ความผิดปกติทางสถิติไม่ใช่สาเหตุ ห้ามสรุปสาเหตุจาก anomaly หากไม่มีหลักฐานให้เขียนว่า "ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง"
- ค่าคาร์บอนเป็นค่าประมาณจาก Emission Factor ตัวอย่าง ไม่ผ่านการทวนสอบ
- ข้อมูลเป็นของโรงงานนี้เท่านั้น วันที่เป็นเวลาประเทศไทย
- จัดคำตอบเป็นหัวข้อที่เกี่ยวข้องจาก: สรุป / ข้อเท็จจริง / การคำนวณ / ความผิดปกติ / ข้อสันนิษฐาน / คำแนะนำ / ควรตรวจต่อ (ข้ามหัวข้อที่ไม่มีเนื้อหา) ใช้ Markdown แบบเรียบง่าย`;

const bodySchema = z.object({ message: z.string().trim().min(1).max(2000), conversationId: z.string().max(64).optional() });
const err = (status: number, message: string) => Response.json({ error: message }, { status });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return err(401, "กรุณาเข้าสู่ระบบ");
  if (user.role !== "MANAGER" || user.companyId === null) return err(403, "คุณไม่มีสิทธิ์ใช้ผู้ช่วยนี้");
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err(400, "กรุณาพิมพ์คำถาม (ไม่เกิน 2,000 ตัวอักษร)");
  const { message } = parsed.data;

  const conversations = await loadConversations(user);
  const now = new Date().toISOString();
  let conv = conversations.find((c) => c.id === parsed.data.conversationId);
  if (!conv) {
    conv = { id: crypto.randomUUID(), title: message.slice(0, 80), updatedAt: now, messages: [] };
    conversations.unshift(conv);
  }
  const history = conv.messages.slice(-HISTORY_TURNS);
  conv.messages.push({ role: "user", content: message, at: now });

  const ctx = await assistantContext(user);
  const save = async (answer: string) => {
    conv.messages.push({ role: "assistant", content: answer, at: new Date().toISOString() });
    conv.updatedAt = new Date().toISOString();
    const list = [conv, ...conversations.filter((c) => c.id !== conv.id)].slice(0, MAX_CONVERSATIONS) as Conversation[];
    const transcript = { conversations: list } as unknown as Prisma.InputJsonValue;
    await db.managerChatHistory.upsert({
      where: { userId_companyId: { userId: user.id, companyId: user.companyId! } },
      create: { userId: user.id, companyId: user.companyId!, transcript },
      update: { transcript },
    });
  };
  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Conversation-Id": conv.id };

  // Factory data only leaves for the LLM when the platform admin enabled AI and a key exists.
  if (!process.env.ANTHROPIC_API_KEY || !(await getRuntimeSettings(db)).aiRecommendationsEnabled) {
    const answer = fallbackAnswer(ctx, message);
    await save(answer);
    return new Response(answer, { headers });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let answer = "";
      const emit = (t: string) => { answer += t; controller.enqueue(encoder.encode(t)); };
      try {
        const s = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          output_config: { effort: "medium" },
          ...(FALLBACK_MODELS.includes(MODEL) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
          system: [
            { type: "text", text: SYSTEM },
            { type: "text", text: `CONTEXT (JSON):\n${JSON.stringify(ctx)}`, cache_control: { type: "ephemeral" } },
          ],
          messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user" as const, content: message }],
        });
        for await (const ev of s) if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") emit(ev.delta.text);
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") emit("\n\nขออภัย ไม่สามารถตอบคำถามนี้ได้ ลองถามเกี่ยวกับข้อมูลการใช้ทรัพยากรของโรงงาน");
        else if (final.stop_reason === "max_tokens") emit("\n\n(คำตอบถูกตัดเนื่องจากยาวเกินไป)");
      } catch (e) {
        console.error("[g-fay]", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
        if (!answer) emit(fallbackAnswer(ctx, message).replace(/ยังไม่ได้เปิดใช้ AI \([^)]*\)/, "เชื่อมต่อ AI ไม่สำเร็จ"));
        else emit("\n\n(การเชื่อมต่อขาดระหว่างตอบ)");
      }
      try { await save(answer); } catch (e) { console.error("[g-fay] save", e); }
      controller.close();
    },
  });
  return new Response(stream, { headers });
}
