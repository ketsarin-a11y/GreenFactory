import { PageHeader } from "@/components/app/page-header";
import { requireTenantUser } from "@/server/auth/current-user";
import { loadConversations } from "@/server/queries/manager/assistant";
import { Chat } from "./_components/chat";

export default async function Page({ searchParams }: PageProps<"/manager/assistant">) {
  const user = await requireTenantUser("MANAGER");
  const sp = await searchParams;
  const conversations = await loadConversations(user);
  const active = conversations.find((c) => c.id === sp.c) ?? null;
  const ai = !!process.env.ANTHROPIC_API_KEY;
  return (
    <>
      <PageHeader title="ผู้ช่วย G-FAY" description={ai ? "ตอบจากข้อมูลจริงของโรงงาน ไม่สรุปสาเหตุเกินหลักฐาน ตรวจสอบตัวเลขสำคัญก่อนนำไปใช้" : "ยังไม่ได้ตั้งค่า AI — G-FAY จะสรุปจากข้อมูลในระบบโดยตรง"} />
      <Chat
        key={active?.id ?? "new"}
        conversations={conversations.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))}
        activeId={active?.id ?? null}
        initial={active?.messages.map((m) => ({ role: m.role, content: m.content })) ?? []}
        prefill={typeof sp.q === "string" ? sp.q.slice(0, 500) : undefined}
      />
    </>
  );
}
