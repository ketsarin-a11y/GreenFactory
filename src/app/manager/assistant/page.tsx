import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { assistantContext, followUps, loadConversations } from "@/server/queries/manager/assistant";
import { Meta } from "@/components/manager/panel";
import { Chat } from "./_components/chat";

export default async function Page({ searchParams }: PageProps<"/manager/assistant">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const [conversations, ctx] = await Promise.all([loadConversations(user), assistantContext(user)]);
  const active = conversations.find((c) => c.id === sp.c) ?? null;
  const ai = !!process.env.ANTHROPIC_API_KEY;
  return (
    <>
      <PageHeader title="ผู้ช่วย G-FAY" description={<Meta factory={ctx.factory}><span>{ai ? "ตอบจากข้อมูลจริงของโรงงาน ตรวจสอบตัวเลขสำคัญก่อนนำไปใช้" : "ยังไม่ได้เปิดใช้ AI คำตอบจึงสรุปจากข้อมูลในระบบโดยตรง"}</span></Meta>} />
      <Chat
        key={active?.id ?? "new"}
        conversations={conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))}
        activeId={active?.id ?? null}
        initial={active?.messages.map((m) => ({ role: m.role, content: m.content })) ?? []}
        prefill={typeof sp.q === "string" ? sp.q.slice(0, 500) : undefined}
        followUps={followUps(ctx)}
      />
    </>
  );
}
