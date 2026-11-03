"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, Copy, Download, Eye, Loader2, MoreHorizontal, PauseCircle, Pencil, PlayCircle, Plus, Printer, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { QR_STATUS, Status } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { Cascade, type HNode } from "@/components/company/cascade";
import { SelectField } from "@/components/company/select-field";
import { QrImage, downloadQrPng, scanUrl } from "@/components/company/qr-image";
import { useAction } from "@/hooks/use-action";
import { fmtDate } from "@/lib/time";
import { createQr, rotateQrToken, setQrStatus, updateQrCode } from "@/server/actions/company/qr";
import type { QrRow } from "@/server/queries/company/qr";

const fileName = (q: QrRow) => `QR_${q.qrCode}_${q.targetCode}.png`;
const printHref = (ids: string[]) => `/company/qr-codes/print?ids=${ids.join(",")}`;

export function QrView({ rows, tree }: { rows: QrRow[]; tree: HNode[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<QrRow | null>(null);
  const [sheet, setSheet] = useState<QrRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const status = useAction(setQrStatus, { success: "เปลี่ยนสถานะ QR แล้ว" });
  const rotate = useAction(rotateQrToken, { success: "ออกโทเค็นใหม่แล้ว กรุณาพิมพ์ป้ายใหม่" });
  const printable = rows.filter((r) => r.status !== "REVOKED");
  const allOn = printable.length > 0 && printable.every((r) => selected.has(r.id));
  const [downloading, setDownloading] = useState<number | null>(null);
  // No zip library: download the chosen PNGs one after another with a short pause,
  // so the browser does not drop them (it may ask once to allow multiple downloads).
  const downloadSelected = async () => {
    const list = rows.filter((r) => selected.has(r.id));
    for (const [i, q] of list.entries()) {
      setDownloading(i + 1);
      await downloadQrPng(q.token, fileName(q));
      await new Promise((res) => setTimeout(res, 400));
    }
    setDownloading(null);
    toast.success(`ดาวน์โหลด ${list.length} ไฟล์แล้ว`);
  };
  const toggle = (id: string, on: boolean) => setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });

  const ask = (q: QrRow, kind: "suspend" | "activate" | "revoke" | "rotate") => {
    const c: Record<typeof kind, Confirm> = {
      suspend: { title: "ระงับ QR ชั่วคราว", description: `สแกน ${q.qrCode} จะใช้ไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง ป้ายเดิมยังใช้ต่อได้เมื่อเปิดใช้งาน`, confirmLabel: "ระงับ", run: () => status.run({ id: q.id, status: "SUSPENDED" }) },
      activate: { title: "เปิดใช้งาน QR", description: `${q.qrCode} จะสแกนได้ตามปกติ`, confirmLabel: "เปิดใช้งาน", run: () => status.run({ id: q.id, status: "ACTIVE" }) },
      revoke: { title: "ยกเลิก QR ถาวร", description: `${q.qrCode} จะสแกนไม่ได้อีกและเปลี่ยนกลับไม่ได้ ถ้าต้องการใช้ต่อ ให้สร้าง QR ใหม่`, confirmLabel: "ยกเลิกถาวร", destructive: true, run: () => status.run({ id: q.id, status: "REVOKED" }) },
      rotate: { title: "ออกโทเค็นใหม่", description: `ป้าย ${q.qrCode} ที่พิมพ์ไว้ทั้งหมดจะสแกนไม่ได้ทันที ต้องพิมพ์และติดป้ายใหม่แทน`, confirmLabel: "ออกโทเค็นใหม่", destructive: true, run: () => rotate.run({ id: q.id }) },
    };
    setConfirm(c[kind]);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{selected.size > 0 ? `เลือก ${selected.size} รายการ` : "เลือกหลายรายการเพื่อพิมพ์ป้ายบนกระดาษ A4 (6 ป้ายต่อหน้า)"}</p>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <>
              <Button variant="outline" className="h-10" disabled={downloading !== null} onClick={downloadSelected}>
                {downloading !== null ? <Loader2 className="animate-spin" /> : <Download />}
                {downloading !== null ? `กำลังดาวน์โหลด ${downloading}/${selected.size}` : "ดาวน์โหลด PNG ทั้งหมดที่เลือก"}
              </Button>
              <Button variant="outline" className="h-10" asChild>
                <Link href={printHref([...selected])} target="_blank"><Printer /> พิมพ์ที่เลือก</Link>
              </Button>
            </>
          )}
          <Button className="h-10" onClick={() => setSheet("new")}><Plus /> สร้าง QR Code</Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={QrCode} title="ไม่พบ QR Code" description="ลองล้างตัวกรอง หรือสร้าง QR ให้เครื่องจักร/จุดตรวจวัด" />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allOn} onCheckedChange={(v) => setSelected(v ? new Set(printable.map((r) => r.id)) : new Set())} aria-label="เลือกทั้งหมดในหน้านี้" />
                </TableHead>
                <TableHead>QR</TableHead>
                <TableHead>เป้าหมาย</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>ออกเมื่อ</TableHead>
                <TableHead className="w-10"><span className="sr-only">จัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Checkbox checked={selected.has(q.id)} disabled={q.status === "REVOKED"} onCheckedChange={(v) => toggle(q.id, !!v)} aria-label={`เลือก ${q.qrCode}`} />
                  </TableCell>
                  <TableCell>
                    <button type="button" className="flex items-center gap-3 text-left" onClick={() => setPreview(q)}>
                      <QrImage token={q.token} size={40} alt="" className="rounded border" />
                      <Nameplate className="text-xs">{q.qrCode}</Nameplate>
                    </button>
                  </TableCell>
                  <TableCell>
                    <p>{q.targetName}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><Nameplate>{q.targetCode}</Nameplate>{q.targetType === "MACHINE" ? "เครื่องจักร" : "จุดตรวจวัด"}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{q.building} › {q.department} › {q.line}</TableCell>
                  <TableCell><Status map={QR_STATUS} value={q.status} /></TableCell>
                  <TableCell className="tabular text-xs">{fmtDate(new Date(q.generatedAt))}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`จัดการ ${q.qrCode}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setPreview(q)}><Eye /> ดูและดาวน์โหลด</DropdownMenuItem>
                        {q.status !== "REVOKED" && (
                          <>
                            <DropdownMenuItem asChild><Link href={printHref([q.id])} target="_blank"><Printer /> พิมพ์ป้าย</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSheet(q)}><Pencil /> แก้ไขรหัส</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {q.status === "ACTIVE"
                              ? <DropdownMenuItem onSelect={() => ask(q, "suspend")}><PauseCircle /> ระงับชั่วคราว</DropdownMenuItem>
                              : <DropdownMenuItem onSelect={() => ask(q, "activate")}><PlayCircle /> เปิดใช้งาน</DropdownMenuItem>}
                            <DropdownMenuItem onSelect={() => ask(q, "rotate")}><RefreshCw /> ออกโทเค็นใหม่</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onSelect={() => ask(q, "revoke")}><Ban /> ยกเลิกถาวร</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={preview !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-sm">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">{preview.targetName}<Nameplate>{preview.qrCode}</Nameplate></DialogTitle>
                <DialogDescription>{preview.building} › {preview.department} › {preview.line}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center"><QrImage token={preview.token} size={220} alt={`QR Code ${preview.qrCode}`} className="rounded-lg border" /></div>
              <div className="flex items-center justify-center gap-2"><Status map={QR_STATUS} value={preview.status} /></div>
              <div className="flex gap-2">
                <Input readOnly value={scanUrl(preview.token)} aria-label="ลิงก์สแกน" className="font-mono text-xs" />
                <Button variant="outline" size="icon-lg" aria-label="คัดลอกลิงก์" onClick={async () => { await navigator.clipboard.writeText(scanUrl(preview.token)); toast.success("คัดลอกลิงก์แล้ว"); }}><Copy /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-10" onClick={() => downloadQrPng(preview.token, fileName(preview))}><Download /> ดาวน์โหลด PNG</Button>
                {preview.status !== "REVOKED" && <Button className="h-10" asChild><Link href={printHref([preview.id])} target="_blank"><Printer /> พิมพ์ป้าย</Link></Button>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {sheet === "new" ? <CreateSheet key="new" tree={tree} onClose={() => setSheet(null)} /> : <EditCodeSheet key={`edit-${sheet?.id ?? "none"}`} qr={sheet} onClose={() => setSheet(null)} />}
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={status.pending || rotate.pending} />
    </>
  );
}

function CreateSheet({ tree, onClose }: { tree: HNode[]; onClose: () => void }) {
  const { run, pending, errors } = useAction(createQr, { success: "สร้าง QR Code แล้ว" });
  return (
    <FormSheet open onOpenChange={(o) => !o && onClose()} title="สร้าง QR Code" description="เลือกเครื่องจักรหรือจุดตรวจวัดที่เปิดใช้งาน" pending={pending}
      onSubmit={async (fd) => {
        const [type, id] = String(fd.get("target") ?? "").split(":");
        return (await run({ targetType: type === "C" ? "CHECKPOINT" : "MACHINE", targetId: id, qrCode: fd.get("qrCode"), qrStatus: fd.get("qrStatus") })).ok;
      }}>
      <Cascade tree={tree} errors={{ ...errors, target: errors.targetId ?? errors.targetType }} idPrefix="q"
        levels={[{ name: "factoryId", label: "โรงงาน" }, { name: "buildingId", label: "อาคาร" }, { name: "departmentId", label: "แผนก" }, { name: "lineId", label: "สายการผลิต" }, { name: "target", label: "เป้าหมาย", required: true }]} />
      <Field id="q-code" label="รหัส QR" error={errors.qrCode} hint="ไม่ซ้ำในบริษัท เช่น QR-RF-01" required>
        <Input id="q-code" name="qrCode" className="h-10" required />
      </Field>
      <Field id="q-status" label="สถานะเริ่มต้น">
        <SelectField id="q-status" name="qrStatus" defaultValue="ACTIVE" options={[{ value: "ACTIVE", label: "ใช้งานอยู่" }, { value: "SUSPENDED", label: "ระงับชั่วคราว" }]} />
      </Field>
    </FormSheet>
  );
}

function EditCodeSheet({ qr, onClose }: { qr: QrRow | null; onClose: () => void }) {
  const { run, pending, errors } = useAction(updateQrCode, { success: "แก้ไขรหัส QR แล้ว" });
  return (
    <FormSheet open={qr !== null} onOpenChange={(o) => !o && onClose()} title="แก้ไขรหัส QR" description="เปลี่ยนเฉพาะรหัสที่แสดงบนป้าย โทเค็นสแกนเดิมยังใช้ได้" pending={pending}
      onSubmit={async (fd) => (await run({ id: qr!.id, qrCode: fd.get("qrCode") })).ok}>
      <Field id="qe-code" label="รหัส QR" error={errors.qrCode} required>
        <Input id="qe-code" name="qrCode" defaultValue={qr?.qrCode} className="h-10" required />
      </Field>
    </FormSheet>
  );
}
