"use client";

import { useState } from "react";
import { Database, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/data/empty-state";
import { StatusBadge } from "@/components/data/status-badge";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/utils";
import { deleteMasterItem, setMasterStatus } from "@/server/actions/platform/master-data";
import { MASTER, type MasterKind } from "./config";
import { MasterSheet, type Option } from "./master-sheet";

export type Row = {
  id: number;
  status: string;
  values: Record<string, string | number | boolean | null>;
  display: Record<string, string>;
  refs: { label: string; count: number }[];
};

export function MasterCreateButton({ kind, options }: { kind: MasterKind; options: Record<string, Option[]> }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  return (
    <>
      <Button
        className="h-10"
        onClick={() => {
          setKey((k) => k + 1);
          setOpen(true);
        }}
      >
        <Plus /> เพิ่ม{MASTER[kind].noun}
      </Button>
      <MasterSheet key={key} kind={kind} open={open} onOpenChange={setOpen} options={options} />
    </>
  );
}

function StatusToggle({ kind, row }: { kind: MasterKind; row: Row }) {
  const active = row.status === "ACTIVE";
  const { run, pending } = useAction(setMasterStatus, { success: active ? "ปิดใช้งานแล้ว" : "เปิดใช้งานแล้ว" });
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run({ kind, id: row.id, status: active ? "INACTIVE" : "ACTIVE" })}
      className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
      aria-label={`${active ? "ใช้งานอยู่" : "ปิดใช้งาน"} — คลิกเพื่อ${active ? "ปิดใช้งาน" : "เปิดใช้งาน"}`}
      title={active ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
    >
      <StatusBadge tone={active ? "good" : "neutral"} className="cursor-pointer hover:ring-1 hover:ring-border">
        {pending && <Loader2 className="size-3 animate-spin" />}
        {active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
      </StatusBadge>
    </button>
  );
}

function DeleteDialog({ kind, row, onClose }: { kind: MasterKind; row: Row; onClose: () => void }) {
  const total = row.refs.reduce((a, r) => a + r.count, 0);
  const del = useAction(deleteMasterItem, { success: "ลบแล้ว" });
  const off = useAction(setMasterStatus, { success: "ปิดใช้งานแล้ว" });
  const label = row.display.code ?? row.display.resource ?? `#${row.id}`;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{total ? `ลบ ${label} ไม่ได้` : `ลบ ${label}?`}</DialogTitle>
          <DialogDescription>
            {total
              ? `ยังมีข้อมูลที่อ้างอิงอยู่: ${row.refs.filter((r) => r.count).map((r) => `${r.label} ${r.count.toLocaleString("th-TH")}`).join(", ")} ให้ปิดใช้งานแทน เพื่อไม่ให้เลือกใช้ใหม่แต่ข้อมูลเดิมยังอยู่ครบ`
              : "ยังไม่มีข้อมูลใดอ้างอิงรายการนี้ ลบแล้วย้อนกลับไม่ได้"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          {total ? (
            row.status === "ACTIVE" && (
              <Button
                disabled={off.pending}
                onClick={async () => {
                  if ((await off.run({ kind, id: row.id, status: "INACTIVE" })).ok) onClose();
                }}
              >
                {off.pending && <Loader2 className="animate-spin" />}ปิดใช้งานแทน
              </Button>
            )
          ) : (
            <Button
              variant="destructive"
              disabled={del.pending}
              onClick={async () => {
                if ((await del.run({ kind, id: row.id })).ok) onClose();
              }}
            >
              {del.pending && <Loader2 className="animate-spin" />}ลบ
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The shared list for all six master-data tables. */
export function MasterTable({ kind, rows, options }: { kind: MasterKind; rows: Row[]; options: Record<string, Option[]> }) {
  const cfg = MASTER[kind];
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  if (!rows.length) return <EmptyState icon={Database} title={`ไม่พบ${cfg.noun}`} description={`ลองล้างตัวกรอง หรือกด “เพิ่ม${cfg.noun}”`} />;
  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {cfg.columns.map((c) => (
                <TableHead key={c.key} className={cn(c.numeric && "text-right")}>{c.label}</TableHead>
              ))}
              <TableHead className="text-right">การอ้างอิง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="w-10"><span className="sr-only">การจัดการ</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const total = r.refs.reduce((a, x) => a + x.count, 0);
              return (
                <TableRow key={r.id}>
                  {cfg.columns.map((c) => (
                    <TableCell key={c.key} className={cn(c.mono && "font-mono text-xs", c.numeric && "text-right tabular", c.key === "description" && "max-w-80 truncate text-muted-foreground")}>
                      {r.display[c.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular" title={r.refs.map((x) => `${x.label}: ${x.count.toLocaleString("th-TH")}`).join("\n")}>
                    {total ? total.toLocaleString("th-TH") : <span className="text-muted-foreground">0</span>}
                    {r.refs.length > 1 && total > 0 && <span className="sr-only"> ({r.refs.map((x) => `${x.label} ${x.count}`).join(", ")})</span>}
                  </TableCell>
                  <TableCell><StatusToggle kind={kind} row={r} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`การจัดการ ${r.display.code ?? r.display.resource}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(r)}><Pencil /> แก้ไข</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(r)}><Trash2 /> ลบ</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {editing && <MasterSheet key={editing.id} kind={kind} open onOpenChange={(o) => !o && setEditing(null)} options={options} row={editing} />}
      {deleting && <DeleteDialog kind={kind} row={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}
