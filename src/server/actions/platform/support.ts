"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { action, fail, zId } from "../_action";

export const setTicketStatus = action(
  ["PLATFORM_ADMIN"],
  z.object({ ticketId: zId, status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]) }),
  async ({ ticketId, status }, user) => {
    const before = await db.supportTicket.findUnique({ where: { ticketId }, select: { status: true } });
    if (!before) fail("ไม่พบข้อมูล");
    if (before!.status === status) return;
    await db.supportTicket.update({ where: { ticketId }, data: { status } });
    await audit(user.id, "support_tickets", ticketId, "STATUS", before, { status });
    revalidatePath("/platform/support");
  },
);
