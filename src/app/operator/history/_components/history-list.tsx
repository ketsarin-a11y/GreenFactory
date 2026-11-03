"use client";

import { useState } from "react";
import { FileText, Loader2, QrCode, Trash2 } from "lucide-react";
import { PROCESSING, Status } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/use-action";
import { deleteUsage } from "@/server/actions/operator";
import type { HistoryRow } from "@/server/queries/operator";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";

const SOURCE: Record<string, string> = { QR: "สแกน QR", MANUAL: "เลือกเอง" };
const when = (iso: string) => fmtDateTime(new Date(iso));

function Evidence({ row }: { row: HistoryRow }) {
  if (!row.hasEvidence) return <span className="text-muted-foreground">—</span>;
  return (
    <a href={`/api/files/evidence/${row.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline" onClick={(e) => e.stopPropagation()}>
      <FileText className="size-4" aria-hidden /> ดูไฟล์
    </a>
  );
}

export function HistoryList({ rows }: { rows: HistoryRow[] }) {
  const [open, setOpen] = useState<HistoryRow | null>(null);
  const [confirm, setConfirm] = useState(false);
  const { run, pending } = useAction(deleteUsage, { success: "ลบรายการแล้ว" });

  return (
    <>
      {/* Phones: one card per reading. */}
      <ul className="space-y-2 md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => setOpen(r)} className="w-full rounded-xl border bg-card p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate font-medium">{r.target}</p>
                <p className="tabular shrink-0 font-medium">{fmtNum(r.quantity)} <span className="font-normal text-muted-foreground">{r.unit}</span></p>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{r.resource} • <span className="tabular">{when(r.usageAt)}</span></p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Status map={PROCESSING} value={r.processing} />
                <span>{SOURCE[r.source] ?? r.source}</span>
                <span>• {r.recorder}{r.mine && " (คุณ)"}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow>
              <TableHead>วันที่และเวลา</TableHead>
              <TableHead>เครื่องจักร / จุดตรวจ</TableHead>
              <TableHead>ทรัพยากร</TableHead>
              <TableHead className="text-right">ปริมาณ</TableHead>
              <TableHead>ผู้บันทึก</TableHead>
              <TableHead>ที่มา</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>หลักฐาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpen(r)}>
                <TableCell className="tabular whitespace-nowrap">{when(r.usageAt)}</TableCell>
                <TableCell>
                  <button type="button" className="text-left font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50" onClick={(e) => { e.stopPropagation(); setOpen(r); }}>
                    {r.target}
                  </button>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </TableCell>
                <TableCell>{r.resource}</TableCell>
                <TableCell className="tabular text-right whitespace-nowrap">{fmtNum(r.quantity)} <span className="text-muted-foreground">{r.unit}</span></TableCell>
                <TableCell className="whitespace-nowrap">{r.recorder}{r.mine && <span className="text-muted-foreground"> (คุณ)</span>}</TableCell>
                <TableCell className="whitespace-nowrap">{r.source === "QR" && <QrCode className="mr-1 inline size-3.5" aria-hidden />}{SOURCE[r.source] ?? r.source}</TableCell>
                <TableCell><Status map={PROCESSING} value={r.processing} /></TableCell>
                <TableCell><Evidence row={r} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.target}</SheetTitle>
                <SheetDescription className="font-mono">{open.reference}</SheetDescription>
              </SheetHeader>
              <dl className="divide-y px-4 text-sm">
                {([
                  ["วันที่และเวลา", when(open.usageAt)],
                  [open.scope === "CHECKPOINT" ? "จุดตรวจ" : "เครื่องจักร", `${open.target} (${open.targetCode})`],
                  ["ตำแหน่ง", open.location],
                  ["ทรัพยากร", open.resource],
                  ["ปริมาณ", `${fmtNum(open.quantity, 6)} ${open.unit}`],
                  ["ผู้บันทึก", open.recorder + (open.mine ? " (คุณ)" : "")],
                  ["ที่มา", SOURCE[open.source] ?? open.source],
                  ["บันทึกเมื่อ", when(open.createdAt)],
                  ["หมายเหตุ", open.remark || "—"],
                ] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="shrink-0 text-muted-foreground">{k}</dt>
                    <dd className="min-w-0 text-right break-words">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">การประมวลผล</dt><dd><Status map={PROCESSING} value={open.processing} /></dd></div>
                <div className="flex justify-between gap-4 py-2.5"><dt className="text-muted-foreground">หลักฐาน</dt><dd><Evidence row={open} /></dd></div>
              </dl>
              {open.canDelete && (
                <div className="mt-auto border-t p-4">
                  <Button variant="destructive" size="lg" className="h-11 w-full" onClick={() => setConfirm(true)}><Trash2 /> ลบรายการนี้</Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบรายการบันทึกนี้?</DialogTitle>
            <DialogDescription>รายการจะไม่ถูกนับในรายงาน ผลคาร์บอนและการแจ้งเตือนที่เกิดจากรายการนี้จะถูกยกเลิก</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="lg" className="h-11">ยกเลิก</Button></DialogClose>
            <Button
              variant="destructive"
              size="lg"
              className="h-11"
              disabled={pending}
              onClick={async () => {
                if (!open) return;
                const r = await run({ usageId: open.id });
                if (r.ok) { setConfirm(false); setOpen(null); }
              }}
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />} ลบรายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
