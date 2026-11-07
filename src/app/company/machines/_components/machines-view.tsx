"use client";

import { useState } from "react";
import { Cpu, MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { MACHINE_STATUS, RECORD_STATUS, Status } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { Cascade, type HNode } from "@/components/company/cascade";
import { SelectField, type Option } from "@/components/company/select-field";
import { Readiness } from "@/components/company/readiness";
import { OPERATIONAL, OPERATIONAL_LABEL, STATUS_OPTIONS } from "@/components/company/labels";
import { useAction } from "@/hooks/use-action";
import { deleteMachine, saveMachine, setMachineStatus } from "@/server/actions/company/machines";
import type { MachineRow } from "@/server/queries/company/machines";

export function MachinesView({ rows, tree, types }: { rows: MachineRow[]; tree: HNode[]; types: Option[] }) {
  const [editing, setEditing] = useState<MachineRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const status = useAction(setMachineStatus, { success: "เปลี่ยนสถานะแล้ว" });
  const del = useAction(deleteMachine, { success: (r) => r.message });

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button className="h-10" onClick={() => setEditing("new")}><Plus /> เพิ่มเครื่องจักร</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Cpu} title="ไม่พบเครื่องจักร" description="ลองล้างตัวกรอง หรือเพิ่มเครื่องจักรใหม่" />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เครื่องจักร</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>สภาพ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">เซนเซอร์ / QR</TableHead>
                <TableHead>ความพร้อม</TableHead>
                <TableHead className="w-10"><span className="sr-only">จัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium">{m.machineName}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><Nameplate>{m.machineCode}</Nameplate>{m.typeName}</p>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground" title={m.location}>{m.location}</TableCell>
                  <TableCell><Status map={MACHINE_STATUS} value={m.operationalStatus} /></TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={m.status} /></TableCell>
                  <TableCell className="tabular text-right">{m.sensors} / {m.qrCodes}</TableCell>
                  <TableCell title={m.missing.length ? `ยังขาด: ${m.missing.join(", ")}` : "ข้อมูลครบ"}><Readiness score={m.readiness} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`จัดการ ${m.machineCode}`}><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(m)}><Pencil /> แก้ไข</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => status.run({ id: m.id, status: m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}>
                          <Power /> {m.status === "ACTIVE" ? "ปิดใช้งาน" : "เปิดใช้งานอีกครั้ง"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({
                          title: "ลบเครื่องจักร",
                          description: `ลบ ${m.machineName} (${m.machineCode}) ถ้ามีเซนเซอร์ QR หรือข้อมูลการใช้ทรัพยากรเชื่อมอยู่ ระบบจะปิดใช้งานแทนการลบ`,
                          confirmLabel: "ลบ", destructive: true, run: () => del.run({ id: m.id }),
                        })}>
                          <Trash2 /> ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <MachineSheet key={editing === "new" ? "new" : editing?.id ?? "none"} editing={editing} tree={tree} types={types} onClose={() => setEditing(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={del.pending} />
    </>
  );
}

function MachineSheet({ editing, tree, types, onClose }: { editing: MachineRow | "new" | null; tree: HNode[]; types: Option[]; onClose: () => void }) {
  const m = editing === "new" ? null : editing;
  const { run, pending, errors } = useAction(saveMachine, { success: m ? "บันทึกการแก้ไขแล้ว" : "เพิ่มเครื่องจักรแล้ว" });
  const text = (name: keyof MachineRow, label: string, opts: { required?: boolean; type?: string } = {}) => (
    <Field id={`m-${name}`} label={label} error={errors[name]} required={opts.required}>
      <Input id={`m-${name}`} name={name} type={opts.type ?? "text"} className="h-10" required={opts.required} defaultValue={(m?.[name] as string | null) ?? ""} />
    </Field>
  );
  return (
    <FormSheet open={editing !== null} onOpenChange={(o) => !o && onClose()} title={m ? `แก้ไข ${m.machineName}` : "เพิ่มเครื่องจักร"}
      description="เลือกได้เฉพาะโครงสร้างที่เปิดใช้งาน" pending={pending}
      onSubmit={async (fd) => { if (m) fd.set("id", String(m.id)); return (await run(fd)).ok; }}>
      <Cascade tree={tree} defaultPath={m?.path} errors={errors} idPrefix="m"
        levels={[{ name: "factoryId", label: "โรงงาน" }, { name: "buildingId", label: "อาคาร" }, { name: "departmentId", label: "แผนก" }, { name: "lineId", label: "สายการผลิต", required: true }]} />
      <div className="grid gap-4 sm:grid-cols-2">
        {text("machineCode", "รหัสเครื่อง", { required: true })}
        {text("machineName", "ชื่อเครื่อง", { required: true })}
      </div>
      <Field id="m-type" label="ประเภทเครื่อง" error={errors.machineTypeId} required>
        <SelectField id="m-type" name="machineTypeId" defaultValue={m ? String(m.machineTypeId) : undefined} options={types} invalid={!!errors.machineTypeId} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {text("manufacturer", "ผู้ผลิต")}
        {text("model", "รุ่น")}
        {text("serialNumber", "หมายเลขเครื่อง (Serial)")}
        {text("installationDate", "วันที่ติดตั้ง", { type: "date" })}
      </div>
      {text("locationNote", "ตำแหน่งติดตั้ง")}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="m-op" label="สภาพเครื่อง">
          <SelectField id="m-op" name="operationalStatus" defaultValue={m?.operationalStatus ?? "NORMAL"} options={OPERATIONAL.map((o) => ({ value: o, label: OPERATIONAL_LABEL[o] }))} />
        </Field>
        <Field id="m-status" label="สถานะ">
          <SelectField id="m-status" name="status" defaultValue={m?.status ?? "ACTIVE"} options={STATUS_OPTIONS} />
        </Field>
      </div>
    </FormSheet>
  );
}
