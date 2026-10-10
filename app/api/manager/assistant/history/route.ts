import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
const modes = ["general", "energy", "machine", "report"];
type Message = {
  id: string; role: "user" | "assistant"; text: string; timestamp: string;
  followUpQuestions?: string[]; isError?: boolean; notice?: string;
};
function reply(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
async function owner() {
  const session = await getSession();
  if (!session) return { error: reply({ message: "กรุณาเข้าสู่ระบบ" }, 401) };
  if (session.roleName !== "MANAGER") return { error: reply({ message: "ไม่มีสิทธิ์เข้าถึง" }, 403) };
  // Fail closed if the existing session does not supply a verified user ID.
  const identity = session as unknown as Record<string, unknown>;
  const userId = identity.userId;
  const companyId = session.companyId;
  if (typeof userId !== "number" || !Number.isSafeInteger(userId) || userId <= 0 ||
      typeof companyId !== "number" || !Number.isSafeInteger(companyId) || companyId <= 0) {
    return { error: reply({ message: "Session ต้องมี userId และ companyId ที่ถูกต้อง" }, 403) };
  }
  const user = await prisma.user.findFirst({ where: { userId, companyId, status: "ACTIVE" }, select: { userId: true } });
  if (!user) return { error: reply({ message: "ไม่มีสิทธิ์เข้าถึงประวัติ" }, 403) };
  return { key: { userId, companyId } };
}
function parseMessages(value: unknown): Message[] | null {
  if (!Array.isArray(value) || value.length > 1000) return null;
  const result: Message[] = [];
  const ids = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    if (typeof item.id !== "string" || !item.id || item.id.length > 100 || ids.has(item.id) ||
        (item.role !== "user" && item.role !== "assistant") ||
        typeof item.text !== "string" || item.text.length > 50000 ||
        typeof item.timestamp !== "string" || item.timestamp.length > 100) return null;
    ids.add(item.id);
    const message: Message = { id: item.id, role: item.role, text: item.text, timestamp: item.timestamp };
    if (typeof item.notice === "string") message.notice = item.notice.slice(0, 2000);
    if (item.isError === true) message.isError = true;
    if (Array.isArray(item.followUpQuestions)) message.followUpQuestions = item.followUpQuestions
      .filter((q): q is string => typeof q === "string" && q.length <= 220).slice(0, 3);
    result.push(message);
  }
  return result;
}
type Conversation = { id: string; title: string; updatedAt: string; mode: string; messages: Message[] };
type Archive = { version: number; activeId: string; conversations: Conversation[] };
function archive(value: unknown, mode: string, updatedAt: Date): Archive {
  if (Array.isArray(value)) {
    const messages = parseMessages(value) ?? [];
    const id = "legacy";
    return { version: 2, activeId: id, conversations: messages.length ? [{ id, title: messages.find((m) => m.role === "user")?.text.slice(0, 80) || "บทสนทนาเดิม", updatedAt: updatedAt.toISOString(), mode, messages }] : [] };
  }
  const data = value as Archive | null;
  if (data?.version === 2 && Array.isArray(data.conversations)) return data;
  return { version: 2, activeId: "", conversations: [] };
}
function summaries(data: Archive) {
  return [...data.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ id, title, updatedAt, messages }) => ({ id, title, updatedAt, count: messages.length }));
}
export async function GET(request: Request) {
  try {
    const auth = await owner(); if (auth.error) return auth.error;
    const row = await prisma.managerChatHistory.findUnique({ where: { userId_companyId: auth.key! } });
    const data = archive(row?.transcript, row?.mode ?? "general", row?.updatedAt ?? new Date());
    const requested = new URL(request.url).searchParams.get("id");
    const selected = data.conversations.find((item) => item.id === (requested || data.activeId));
    if (requested && !selected) return reply({ message: "ไม่พบบทสนทนานี้" }, 404);
    return reply({ messages: selected?.messages ?? [], mode: selected?.mode ?? row?.mode ?? "general", conversationId: selected?.id ?? data.activeId, conversations: summaries(data) });
  } catch (error) {
    console.error("Chat history read failed", error);
    return reply({ message: "โหลดประวัติไม่สำเร็จ กรุณารีเฟรชเพื่อลองใหม่" }, 500);
  }
}
export async function PUT(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ message: "Forbidden origin" }, 403);
    const auth = await owner(); if (auth.error) return auth.error;
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 2_000_000) return reply({ message: "บทสนทนายาวเกินขนาดที่รองรับ กรุณาเริ่มแชทใหม่" }, 413);
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw); } catch { return reply({ message: "รูปแบบข้อมูลไม่ถูกต้อง" }, 400); }
    if (!body || typeof body !== "object") return reply({ message: "รูปแบบข้อมูลไม่ถูกต้อง" }, 400);
    const messages = parseMessages(body.messages);
    const id = body.conversationId;
    const mode = body.mode;
    if (!messages || typeof mode !== "string" || !modes.includes(mode) || typeof id !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) return reply({ message: "ประวัติไม่ถูกต้อง" }, 400);
    // Ensure a row exists before locking; the unique owner key prevents duplicates.
    await prisma.managerChatHistory.upsert({ where: { userId_companyId: auth.key! }, create: { ...auth.key!, mode, transcript: { version: 2, activeId: "", conversations: [] } }, update: {} });
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM manager_chat_history WHERE user_id = ${auth.key!.userId} AND company_id = ${auth.key!.companyId} FOR UPDATE`;
      const row = await tx.managerChatHistory.findUniqueOrThrow({ where: { userId_companyId: auth.key! } });
      const data = archive(row.transcript, row.mode, row.updatedAt);
      const old = data.conversations.find((item) => item.id === id);
      if (messages.length) {
        const next = { id, mode, messages, title: messages.find((m) => m.role === "user")?.text.slice(0, 80) || "บทสนทนา", updatedAt: JSON.stringify(old?.messages) === JSON.stringify(messages) ? old!.updatedAt : new Date().toISOString() };
        data.conversations = [...data.conversations.filter((item) => item.id !== id), next];
      }
      // An empty new chat never erases any archived conversation.
      data.activeId = id;
      await tx.managerChatHistory.update({ where: { userId_companyId: auth.key! }, data: { transcript: data, mode } });
      return summaries(data);
    });
    return reply({ saved: true, conversations: result });
  } catch (error) {
    console.error("Chat history save failed", error);
    return reply({ message: "บันทึกประวัติไม่สำเร็จ กรุณาลองใหม่" }, 500);
  }
}
