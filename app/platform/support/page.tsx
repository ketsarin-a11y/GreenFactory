import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SupportTicketsPage from "@/components/platform/SupportTicketsPage";

export const dynamic = "force-dynamic";

export default async function PlatformSupportPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.roleName !== "PLATFORM_ADMIN") redirect("/");

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <SupportTicketsPage
      initialTickets={tickets.map((item) => ({
        ticketId: item.ticketId,
        ticketReference: item.ticketReference,
        reporterId: item.reporterId,
        companyId: item.companyId,
        subject: item.subject,
        category: item.category,
        priority: item.priority,
        description: item.description,
        pageUrl: item.pageUrl,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }))}
    />
  );
}
