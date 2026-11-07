"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { deleteConversation } from "@/server/actions/manager";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type ConvItem = { id: string; title: string; updatedAt: string };

const SUGGESTED = ["สรุปสถานการณ์โรงงาน 7 วันล่าสุด", "มีอะไรผิดปกติในการใช้ไฟฟ้า?", "เครื่องไหนมีสัดส่วนการใช้ไฟสูงสุด?", "สรุป Carbon Footprint ล่าสุด"];
const chipCls = "rounded-full border px-3 py-1.5 text-left text-sm hover:border-primary hover:bg-accent disabled:opacity-50";

/** **bold** and "- " lists; everything else is plain text (no HTML injection). */
function Rich({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i): ReactNode => (p.startsWith("**") && p.endsWith("**") && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : p));
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {text.split("\n").map((l, i) =>
        /^\s*([-*]|\d+\.)\s/.test(l) ? <p key={i} className="pl-4 -indent-3">• {inline(l.replace(/^\s*([-*]|\d+\.)\s/, ""))}</p> : l.trim() ? <p key={i}>{inline(l.replace(/^#+\s*/, ""))}</p> : <div key={i} className="h-1" />,
      )}
    </div>
  );
}

export function Chat({ conversations, activeId, initial, prefill, followUps = [] }: { conversations: ConvItem[]; activeId: string | null; initial: Msg[]; prefill?: string; followUps?: string[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState(prefill ?? "");
  const [busy, setBusy] = useState(false);
  const convId = useRef<string | null>(activeId);
  const end = useRef<HTMLDivElement>(null);
  const del = useAction(deleteConversation, { success: "ลบบทสนทนาแล้ว" });

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [messages]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/manager/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, conversationId: convId.current ?? undefined }) });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => null))?.error ?? "ส่งคำถามไม่สำเร็จ");
      const isNew = !convId.current;
      convId.current = res.headers.get("X-Conversation-Id");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: m[m.length - 1].content + chunk }]);
      }
      if (isNew && convId.current) router.replace(`/manager/assistant?c=${convId.current}`, { scroll: false });
      else router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ส่งคำถามไม่สำเร็จ");
      setMessages((m) => m.slice(0, -2));
      setInput(q);
    } finally {
      setBusy(false);
    }
  };

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const next = followUps.filter((q) => !asked.has(q)).slice(0, 3);
  const starters = [SUGGESTED[0], ...followUps.slice(0, 3), ...SUGGESTED.slice(1)].slice(0, 4);
  const lastIsAnswer = !busy && messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="order-2 rounded-[10px] border bg-card p-4 lg:order-1">
        <Button asChild variant="outline" className="mb-3 w-full"><Link href="/manager/assistant"><MessageSquarePlus /> บทสนทนาใหม่</Link></Button>
        <h2 className="mb-2 text-sm font-semibold">บทสนทนาก่อนหน้า</h2>
        {conversations.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีบทสนทนา</p> : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id} className={cn("group flex items-center gap-1 rounded-md", c.id === activeId && "bg-muted")}>
                <Link href={`/manager/assistant?c=${c.id}`} className="min-w-0 flex-1 truncate px-2 py-1.5 text-sm">{c.title}</Link>
                <button type="button" aria-label={`ลบ ${c.title}`} disabled={del.pending}
                  onClick={async () => { const r = await del.run({ id: c.id }); if (r.ok && c.id === activeId) router.replace("/manager/assistant"); }}
                  className="rounded p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-status-critical focus-visible:opacity-100">
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="order-1 flex min-h-[560px] flex-col rounded-[10px] border bg-card lg:order-2">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <Image src="/images/g-fay.gif" alt="G-FAY ผู้ช่วย AI" width={120} height={120} unoptimized className="size-28" />
              <p className="mt-3 font-semibold">สวัสดี ฉันคือ G-FAY</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">ถามเรื่องการใช้ไฟฟ้า น้ำ ทรัพยากร คาร์บอน หรือการแจ้งเตือนของโรงงาน ฉันตอบจากข้อมูล 30 วันล่าสุดของโรงงานนี้เท่านั้น</p>
              <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {starters.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-lg border px-3 py-2.5 text-left text-sm hover:border-primary hover:bg-accent">{s}</button>)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
              {m.role === "assistant" && <Image src="/images/g-fay.gif" alt="" width={32} height={32} unoptimized className="size-8 shrink-0 rounded-full" />}
              <div className={cn("max-w-[85%] rounded-[10px] px-4 py-3", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60")}>
                {m.role === "assistant" && !m.content ? <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="กำลังตอบ" /> : m.role === "user" ? <p className="text-sm whitespace-pre-wrap">{m.content}</p> : <Rich text={m.content} />}
              </div>
            </div>
          ))}
          {lastIsAnswer && next.length > 0 && (
            <div className="pl-11">
              <p className="mb-2 text-xs text-muted-foreground">ถามต่อ</p>
              <div className="flex flex-wrap gap-2">
                {next.map((q) => <button key={q} type="button" onClick={() => send(q)} className={chipCls}>{q}</button>)}
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
        <form className="flex items-end gap-2 border-t p-4" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="พิมพ์คำถามเกี่ยวกับข้อมูลโรงงาน" aria-label="คำถาม" rows={2} maxLength={2000} className="min-h-10 resize-none"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }} />
          <Button type="submit" size="icon" className="size-10" disabled={busy || !input.trim()} aria-label="ส่งคำถาม">{busy ? <Loader2 className="animate-spin" /> : <Send />}</Button>
        </form>
      </section>
    </div>
  );
}
