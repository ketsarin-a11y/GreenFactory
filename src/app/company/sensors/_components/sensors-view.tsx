"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Plus, Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { CONNECTION, RECORD_STATUS, Status, StatusBadge } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { SelectField, type Option } from "@/components/company/select-field";
import { PROTOCOLS, STATUS_OPTIONS } from "@/components/company/labels";
import { useAction } from "@/hooks/use-action";
import { fmtNum } from "@/lib/format";
import { fmtDateTime } from "@/lib/time";
import { deleteSensor, saveSensor } from "@/server/actions/company/sensors";

export type SensorRow = {
  id: number; machineId: number; sensorTypeId: number; sensorCode: string; sensorName: string; serialNumber: string | null; manufacturer: string | null;
  protocol: string | null; connectionAddress: string | null; dataTopic: string | null; samplingIntervalSeconds: number | null;
  installationDate: string | null; lastCalibrationDate: string | null; nextCalibrationDate: string | null; status: string; connection: string;
  typeName: string; machine: string; factory: string; lastConnectedAt: string | null;
  latest: { raw: number; processed: number | null; unit: string; quality: string; measuredAt: string } | null;
};

export function SensorsView({ rows, machines, types, hasMachines }: { rows: SensorRow[]; machines: (Option & { inactive?: boolean })[]; types: Option[]; hasMachines: boolean }) {
  const [editing, setEditing] = useState<SensorRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const del = useAction(deleteSensor, { success: (r) => r.message });
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button className="h-10" disabled={!hasMachines} title={hasMachines ? undefined : "ต้องมีเครื่องจักรที่เปิดใช้งานก่อน"} onClick={() => setEditing("new")}><Plus /> เพิ่มเซนเซอร์</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Radio} title="ไม่พบเซนเซอร์" description={hasMachines ? "ลองล้างตัวกรอง หรือเพิ่มเซนเซอร์ให้เครื่องจักร" : "เพิ่มเครื่องจักรก่อน แล้วจึงผูกเซนเซอร์กับเครื่อง"} />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เซนเซอร์</TableHead>
                <TableHead>เครื่องจักร</TableHead>
                <TableHead>การเชื่อมต่อ</TableHead>
                <TableHead className="text-right">ค่าล่าสุด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-10"><span className="sr-only">จัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.sensorName}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-mono">{s.sensorCode}</span> · {s.typeName} · {s.protocol ?? "—"}</p>
                  </TableCell>
                  <TableCell className="text-xs"><p>{s.machine}</p><p className="text-muted-foreground">{s.factory}</p></TableCell>
                  <TableCell>
                    <Status map={CONNECTION} value={s.connection} />
                    <p className="mt-1 text-xs text-muted-foreground">{s.lastConnectedAt ? `ล่าสุด ${fmtDateTime(new Date(s.lastConnectedAt))}` : "ยังไม่เคยเชื่อมต่อ"}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.latest ? (
                      <>
                        <p className="tabular font-medium">{fmtNum(s.latest.processed ?? s.latest.raw)} <span className="text-xs font-normal text-muted-foreground">{s.latest.unit}</span></p>
                        <p className="text-xs text-muted-foreground">
                          {s.latest.quality !== "VALID" && <StatusBadge tone="critical" className="mr-1">{s.latest.quality}</StatusBadge>}
                          {fmtDateTime(new Date(s.latest.measuredAt))}
                        </p>
                      </>
                    ) : <span className="text-xs text-muted-foreground">ยังไม่มีข้อมูล</span>}
                  </TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={s.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`จัดการ ${s.sensorCode}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(s)}><Pencil /> แก้ไข</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({
                          title: "ลบเซนเซอร์", description: `ลบ ${s.sensorCode} ถ้ามีข้อมูลที่เซนเซอร์ส่งมาแล้ว ระบบจะปิดใช้งานแทนการลบ`,
                          confirmLabel: "ลบ", destructive: true, run: () => del.run({ id: s.id }),
                        })}><Trash2 /> ลบ</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <SensorSheet key={editing === "new" ? "new" : editing?.id ?? "none"} editing={editing} machines={machines} types={types} onClose={() => setEditing(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={del.pending} />
    </>
  );
}

function SensorSheet({ editing, machines, types, onClose }: { editing: SensorRow | "new" | null; machines: (Option & { inactive?: boolean })[]; types: Option[]; onClose: () => void }) {
  const s = editing === "new" ? null : editing;
  const { run, pending, errors } = useAction(saveSensor, { success: s ? "บันทึกการแก้ไขแล้ว" : "เพิ่มเซนเซอร์แล้ว" });
  const text = (name: keyof SensorRow, label: string, opts: { required?: boolean; type?: string; placeholder?: string; hint?: string } = {}) => (
    <Field id={`s-${name}`} label={label} error={errors[name]} required={opts.required} hint={opts.hint}>
      <Input id={`s-${name}`} name={name} type={opts.type ?? "text"} min={opts.type === "number" ? 1 : undefined} placeholder={opts.placeholder}
        className="h-10" required={opts.required} defaultValue={s?.[name] === null || s?.[name] === undefined ? "" : String(s[name])} />
    </Field>
  );
  const machineOpts = machines.filter((m) => !m.inactive || m.value === String(s?.machineId));
  return (
    <FormSheet open={editing !== null} onOpenChange={(o) => !o && onClose()} title={s ? `แก้ไข ${s.sensorCode}` : "เพิ่มเซนเซอร์"} pending={pending}
      onSubmit={async (fd) => { if (s) fd.set("id", String(s.id)); return (await run(fd)).ok; }}>
      <Field id="s-machine" label="เครื่องจักร" error={errors.machineId} required>
        <SelectField id="s-machine" name="machineId" defaultValue={s ? String(s.machineId) : undefined} options={machineOpts} invalid={!!errors.machineId} />
      </Field>
      <Field id="s-type" label="ประเภทเซนเซอร์" error={errors.sensorTypeId} required>
        <SelectField id="s-type" name="sensorTypeId" defaultValue={s ? String(s.sensorTypeId) : undefined} options={types} invalid={!!errors.sensorTypeId} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {text("sensorCode", "รหัสเซนเซอร์", { required: true, placeholder: "SEN-0001" })}
        {text("sensorName", "ชื่อเซนเซอร์", { required: true })}
        {text("serialNumber", "หมายเลขเครื่อง (Serial)")}
        {text("manufacturer", "ผู้ผลิต")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="s-protocol" label="โปรโตคอล">
          <SelectField id="s-protocol" name="protocol" defaultValue={s?.protocol ?? "Modbus TCP"} options={PROTOCOLS.map((p) => ({ value: p, label: p }))} />
        </Field>
        {text("samplingIntervalSeconds", "รอบการอ่านค่า (วินาที)", { type: "number" })}
      </div>
      {text("connectionAddress", "ที่อยู่การเชื่อมต่อ", { placeholder: "192.168.1.100:502" })}
      {text("dataTopic", "Topic / Endpoint")}
      <div className="grid gap-4 sm:grid-cols-3">
        {text("installationDate", "วันที่ติดตั้ง", { type: "date" })}
        {text("lastCalibrationDate", "สอบเทียบล่าสุด", { type: "date" })}
        {text("nextCalibrationDate", "สอบเทียบครั้งถัดไป", { type: "date" })}
      </div>
      <Field id="s-status" label="สถานะ" hint="ปิดใช้งาน = แสดงเป็น “บำรุงรักษา”">
        <SelectField id="s-status" name="status" defaultValue={s?.status ?? "ACTIVE"} options={STATUS_OPTIONS} />
      </Field>
    </FormSheet>
  );
}
