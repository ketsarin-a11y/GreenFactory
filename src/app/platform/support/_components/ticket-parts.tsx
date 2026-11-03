"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Status } from "@/components/data/status-badge";
import { InfoList } from "@/components/platform/checklist";
import { PRIORITY_LABEL, TICKET_STATUS } from "@/components/platform/labels";
import { useAction } from "@/hooks/use-action";
import { fmtDateTime } from "@/lib/time";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { setTicketStatus } from "@/server/actions/platform/support";

export type Ticket = {
  id: number;
  reference: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  pageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reporter: { name: string; email: string; role: string } | null;
  company: string;
};

function StatusSelect({ t }: { t: Ticket }) {
  const { run, pending } = useAction(setTicketStatus, { success: "เปลี่ยนสถานะคำร้องแล้ว" });
  return (
    <Select value={t.status} disabled={pending} onValueChange={(v) => run({ ticketId: t.id, status: v as "OPEN" })}>
      <SelectTrigger className="h-8 w-40" aria-label={`สถานะของ ${t.reference}`} onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TICKET_STATUS).map(([k, [, label]]) => (
          <SelectItem key={k} value={k}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TicketTable({ rows }: { rows: Ticket[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = rows.find((r) => r.id === openId) ?? null;
  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่</TableHead>
              <TableHead>หัวข้อ</TableHead>
              <TableHead>ผู้แจ้ง</TableHead>
              <TableHead>ความสำคัญ</TableHead>
              <TableHead>แจ้งเมื่อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-10"><span className="sr-only">รายละเอียด</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs whitespace-nowrap">{t.reference}</TableCell>
                <TableCell className="max-w-72">
                  <span className="block truncate font-medium">{t.subject}</span>
                  <span className="block text-xs text-muted-foreground">{t.category}</span>
                </TableCell>
                <TableCell className="max-w-56">
                  <span className="block truncate">{t.reporter?.name ?? "ไม่พบผู้ใช้"}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.company}</span>
                </TableCell>
                <TableCell>{PRIORITY_LABEL[t.priority] ?? t.priority}</TableCell>
                <TableCell className="tabular whitespace-nowrap">{fmtDateTime(t.createdAt)}</TableCell>
                <TableCell><StatusSelect t={t} /></TableCell>
                <TableCell>
                  <button type="button" className="rounded p-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label={`ดูรายละเอียด ${t.reference}`} onClick={() => setOpenId(t.id)}>
                    <ChevronRight className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.subject}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <span className="font-mono">{open.reference}</span>
                  <Status map={TICKET_STATUS} value={open.status} />
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <InfoList
                  items={[
                    ["ผู้แจ้ง", open.reporter ? `${open.reporter.name} (${open.reporter.email})` : "ไม่พบผู้ใช้"],
                    ["บทบาท", open.reporter ? (isRole(open.reporter.role) ? ROLE_LABEL[open.reporter.role] : open.reporter.role) : null],
                    ["บริษัท", open.company],
                    ["หน้าที่แจ้ง", open.pageUrl && <span key="u" className="font-mono text-xs">{open.pageUrl}</span>],
                    ["หมวด", open.category],
                    ["ความสำคัญ", PRIORITY_LABEL[open.priority] ?? open.priority],
                    ["แจ้งเมื่อ", fmtDateTime(open.createdAt)],
                    ["อัปเดตล่าสุด", fmtDateTime(open.updatedAt)],
                  ]}
                />
                <div>
                  <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">รายละเอียด</h3>
                  <p className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">{open.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">เปลี่ยนสถานะ</span>
                  <StatusSelect t={open} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
