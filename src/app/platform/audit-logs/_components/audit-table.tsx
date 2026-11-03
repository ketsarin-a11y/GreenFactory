"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InfoList } from "@/components/platform/checklist";
import { AUDIT_ACTION_LABEL, moduleLabel } from "@/components/platform/labels";
import { fmtDateTime } from "@/lib/time";
import { ROLE_LABEL, isRole } from "@/server/auth/roles";
import { parseUserAgent } from "@/server/domain/user-agent";

export type AuditRow = {
  id: string;
  tableName: string;
  recordId: string;
  action: string;
  oldData: string | null;
  newData: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  role: string | null;
};

const roleLabel = (r: string | null) => (r ? (isRole(r) ? ROLE_LABEL[r] : r) : "—");

function Json({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">{title}</h3>
      {value ? (
        <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">{value}</pre>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">ไม่มีข้อมูล</p>
      )}
    </div>
  );
}

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const [open, setOpen] = useState<AuditRow | null>(null);
  const ua = open ? parseUserAgent(open.userAgent) : null;
  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เวลา</TableHead>
              <TableHead>ผู้ใช้</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>การกระทำ</TableHead>
              <TableHead>โมดูล</TableHead>
              <TableHead>อ้างอิง</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="w-10"><span className="sr-only">รายละเอียด</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => setOpen(a)}>
                <TableCell className="tabular whitespace-nowrap">{fmtDateTime(a.createdAt)}</TableCell>
                <TableCell className="max-w-56">
                  <span className="block truncate">{a.userName ?? "ระบบ"}</span>
                  {a.userEmail && <span className="block truncate text-xs text-muted-foreground">{a.userEmail}</span>}
                </TableCell>
                <TableCell>{roleLabel(a.role)}</TableCell>
                <TableCell>{AUDIT_ACTION_LABEL[a.action] ?? a.action}</TableCell>
                <TableCell>{moduleLabel(a.tableName)}</TableCell>
                <TableCell className="font-mono text-xs">{a.tableName}#{a.recordId}</TableCell>
                <TableCell className="font-mono text-xs">{a.ipAddress ?? "—"}</TableCell>
                <TableCell>
                  <button type="button" className="rounded p-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="ดูรายละเอียด" onClick={(e) => { e.stopPropagation(); setOpen(a); }}>
                    <ChevronRight className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {open && ua && (
            <>
              <SheetHeader>
                <SheetTitle>{AUDIT_ACTION_LABEL[open.action] ?? open.action} {moduleLabel(open.tableName)}</SheetTitle>
                <SheetDescription className="font-mono">{open.tableName}#{open.recordId} · log #{open.id}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                <InfoList
                  items={[
                    ["เวลา", fmtDateTime(open.createdAt)],
                    ["ผู้ใช้", open.userName ? `${open.userName} (${open.userEmail})` : "ระบบ"],
                    ["บทบาท", roleLabel(open.role)],
                    ["IP", open.ipAddress],
                    ["อุปกรณ์", `${ua.browser} · ${ua.os}`],
                    ["User agent", <span key="ua" className="font-mono text-xs">{open.userAgent}</span>],
                  ]}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Json title="ข้อมูลเดิม" value={open.oldData} />
                  <Json title="ข้อมูลใหม่" value={open.newData} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
