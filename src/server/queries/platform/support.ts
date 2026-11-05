import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { PAGE_SIZE, intParam, oneOf, paging, str, type SP } from "./common";

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export async function listTickets(sp: SP, page: number) {
  const q = str(sp, "q");
  const status = oneOf(sp, "status", TICKET_STATUSES);
  const companyId = intParam(sp, "company");
  const where: Prisma.SupportTicketWhereInput = {
    ...(status ? { status } : {}),
    ...(companyId ? { companyId } : {}),
    ...(q ? { OR: [{ ticketReference: { contains: q } }, { subject: { contains: q } }, { category: { contains: q } }, { priority: { contains: q } }] } : {}),
  };
  const [total, rows, byStatus, companies] = await Promise.all([
    db.supportTicket.count({ where }),
    db.supportTicket.findMany({ where, orderBy: { createdAt: "desc" }, ...paging(page) }),
    db.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
    db.company.findMany({ orderBy: { companyName: "asc" }, select: { companyId: true, companyName: true } }),
  ]);
  // SupportTicket has plain ids (no relations), so resolve names in two batched lookups.
  const [reporters, ticketCompanies] = await Promise.all([
    db.user.findMany({
      where: { userId: { in: [...new Set(rows.map((r) => r.reporterId))] } },
      select: { userId: true, firstName: true, lastName: true, email: true, role: { select: { roleName: true } } },
    }),
    db.company.findMany({ where: { companyId: { in: rows.flatMap((r) => (r.companyId ? [r.companyId] : [])) } }, select: { companyId: true, companyName: true } }),
  ]);
  const rep = new Map(reporters.map((u) => [u.userId, u]));
  const comp = new Map(ticketCompanies.map((c) => [c.companyId, c.companyName]));
  return {
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    counts: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Record<string, number>,
    companies: companies.map((c) => ({ value: String(c.companyId), label: c.companyName })),
    rows: rows.map((t) => {
      const r = rep.get(t.reporterId);
      return {
        id: t.ticketId,
        reference: t.ticketReference,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        description: t.description,
        pageUrl: t.pageUrl,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        reporter: r ? { name: `${r.firstName} ${r.lastName}`, email: r.email, role: r.role.roleName } : null,
        company: t.companyId ? (comp.get(t.companyId) ?? "—") : "แพลตฟอร์มส่วนกลาง",
      };
    }),
  };
}
