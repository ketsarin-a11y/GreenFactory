"use client";

import { useEffect, useState } from "react";
import { Copy, Eye, KeyRound, MoreHorizontal, Pencil, Plus, Radio, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status, StatusBadge } from "@/components/data/status-badge";
import { TrendChart } from "@/components/data/trend-chart";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { ConnectionBadge } from "@/components/company/connection-badge";
import { SelectField, type Option } from "@/components/company/select-field";
import { PROTOCOLS, STATUS_OPTIONS } from "@/components/company/labels";
import { useAction } from "@/hooks/use-action";
import { fmtNum } from "@/lib/format";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/time";
import { deleteSensor, issueSensorToken, saveSensor } from "@/server/actions/company/sensors";
import type { SensorReadings } from "@/server/queries/company/sensors";

export type SensorRow = {
  id: number; machineId: number; sensorTypeId: number; sensorCode: string; sensorName: string; serialNumber: string | null; manufacturer: string | null;
  protocol: string | null; connectionAddress: string | null; dataTopic: string | null; samplingIntervalSeconds: number | null;
  installationDate: string | null; lastCalibrationDate: string | null; nextCalibrationDate: string | null; status: string; connection: string;
  typeName: string; machineCode: string; machineName: string; factory: string; lastConnectedAt: string | null; hasToken: boolean;
  latest: { raw: number; processed: number | null; unit: string; quality: string; measuredAt: string } | null;
};

const QUALITY: Record<string, string> = { SUSPECT: "ค่าน่าสงสัย", ERROR: "ค่าผิดพลาด" };

export function SensorsView({ rows, machines, types, hasMachines, appUrl }: {
  rows: SensorRow[]; machines: (Option & { inactive?: boolean })[]; types: Option[]; hasMachines: boolean; appUrl: string | null;
}) {
  const [editing, setEditing] = useState<SensorRow | "new" | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [issued, setIssued] = useState<{ sensor: SensorRow; token: string } | null>(null);
  const del = useAction(deleteSensor, { success: (r) => r.message });
  const issue = useAction(issueSensorToken);
  const detail = rows.find((r) => r.id === detailId) ?? null;

  const askToken = (s: SensorRow) => {
    const run = async () => {
      const r = await issue.run({ id: s.id });
      if (r.ok) setIssued({ sensor: s, token: r.data.token });
    };
    if (!s.hasToken) return void run();
    setConfirm({
      title: "สร้าง token ใหม่",
      description: `${s.sensorName} มี token อยู่แล้ว token ใหม่จะใช้แทนทันที อุปกรณ์ที่ยังใช้ token เดิมจะส่งข้อมูลไม่ได้จนกว่าจะตั้งค่า token ใหม่`,
      confirmLabel: "สร้าง token ใหม่", destructive: true, run,
    });
  };

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button className="h-10" disabled={!hasMachines} title={hasMachines ? undefined : "ต้องมีเครื่องจักรที่เปิดใช้งานก่อน"} onClick={() => setEditing("new")}><Plus /> เพิ่มเซนเซอร์</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Radio} title="ไม่พบเซนเซอร์" description={hasMachines ? "ลองล้างตัวกรอง หรือเพิ่มเซนเซอร์ให้เครื่องจักร" : "เพิ่มเครื่องจักรก่อน แล้วจึงผูกเซนเซอร์กับเครื่อง"} />
      ) : (
        <div className="overflow-x-auto rounded-[10px] border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เซนเซอร์</TableHead>
                <TableHead>เครื่องจักร</TableHead>
                <TableHead>การเชื่อมต่อ</TableHead>
                <TableHead className="text-right">ค่าล่าสุด</TableHead>
                <TableHead>Token อุปกรณ์</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="w-10"><span className="sr-only">จัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <button type="button" className="text-left font-medium underline-offset-4 hover:text-primary hover:underline" onClick={() => setDetailId(s.id)}>{s.sensorName}</button>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><Nameplate>{s.sensorCode}</Nameplate>{s.typeName}</p>
                    <ConnectionBadge value={s.connection} className="mt-1.5 md:hidden" />
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="flex items-center gap-2"><Nameplate>{s.machineCode}</Nameplate><span className="text-foreground">{s.machineName}</span></p>
                    <p className="mt-0.5 text-muted-foreground">{s.factory}</p>
                  </TableCell>
                  <TableCell>
                    <ConnectionBadge value={s.connection} />
                    <p className="mt-1 text-xs text-muted-foreground">{s.lastConnectedAt ? `ล่าสุด ${fmtDateTime(new Date(s.lastConnectedAt))}` : "ยังไม่เคยเชื่อมต่อ"}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.latest ? (
                      <>
                        <p className="tabular font-medium">{fmtNum(s.latest.processed ?? s.latest.raw)} <span className="text-xs font-normal text-muted-foreground">{s.latest.unit}</span></p>
                        {s.latest.quality !== "VALID" && <StatusBadge tone="critical" className="mt-1">{QUALITY[s.latest.quality] ?? s.latest.quality}</StatusBadge>}
                      </>
                    ) : <span className="text-xs text-muted-foreground">ยังไม่มีข้อมูล</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.hasToken
                      ? <span className="inline-flex items-center gap-1.5"><KeyRound className="size-3.5 text-primary" aria-hidden />ตั้งค่าแล้ว</span>
                      : <span className="text-muted-foreground">ยังไม่มี</span>}
                  </TableCell>
                  <TableCell><Status map={RECORD_STATUS} value={s.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`จัดการ ${s.sensorCode}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setDetailId(s.id)}><Eye /> ดูรายละเอียดและกราฟ</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditing(s)}><Pencil /> แก้ไข</DropdownMenuItem>
                        <DropdownMenuItem disabled={s.status !== "ACTIVE"} onSelect={() => askToken(s)}><KeyRound /> สร้าง token สำหรับอุปกรณ์</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({
                          title: "ลบเซนเซอร์", description: `ลบ ${s.sensorName} (${s.sensorCode}) ถ้ามีข้อมูลที่เซนเซอร์ส่งมาแล้ว ระบบจะปิดใช้งานแทนการลบ`,
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
      <SensorDetail sensor={detail} onClose={() => setDetailId(null)} onEdit={(s) => { setDetailId(null); setEditing(s); }} onToken={askToken} pending={issue.pending} />
      <SensorSheet key={editing === "new" ? "new" : editing?.id ?? "none"} editing={editing} machines={machines} types={types} onClose={() => setEditing(null)} />
      <TokenDialog issued={issued} appUrl={appUrl} onClose={() => setIssued(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={del.pending || issue.pending} />
    </>
  );
}

function SensorDetail({ sensor: s, onClose, onEdit, onToken, pending }: {
  sensor: SensorRow | null; onClose: () => void; onEdit: (s: SensorRow) => void; onToken: (s: SensorRow) => void; pending: boolean;
}) {
  const [data, setData] = useState<{ id: number; r: SensorReadings | null } | null>(null);
  const id = s?.id;
  const latestAt = s?.latest?.measuredAt;
  useEffect(() => {
    if (!id) return;
    let live = true;
    fetch(`/api/company/sensors/${id}/readings`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((r: SensorReadings | null) => live && setData({ id, r }))
      .catch(() => live && setData({ id, r: null }));
    return () => { live = false; };
  }, [id, latestAt]);
  const r = data && data.id === id ? data.r : undefined;
  const latest = r?.latest ?? (s?.latest ? { value: s.latest.processed ?? s.latest.raw, unit: s.latest.unit, quality: s.latest.quality, measuredAt: s.latest.measuredAt } : null);
  const chart = r?.points.map((p) => ({ label: fmtTime(new Date(p.at)), v: p.value })) ?? [];
  const info: [string, string][] = s ? [
    ["เครื่องจักร", `${s.machineName} (${s.machineCode})`],
    ["โรงงาน", s.factory],
    ["ประเภท", s.typeName],
    ["โปรโตคอล", s.protocol ?? "—"],
    ["รอบการอ่านค่า", s.samplingIntervalSeconds ? `${fmtNum(s.samplingIntervalSeconds)} วินาที` : "ไม่ได้ตั้ง"],
    ["ที่อยู่การเชื่อมต่อ", s.connectionAddress ?? "—"],
    ["Topic / Endpoint", s.dataTopic ?? "—"],
    ["หมายเลขเครื่อง", s.serialNumber ?? "—"],
    ["ผู้ผลิต", s.manufacturer ?? "—"],
    ["สอบเทียบล่าสุด", s.lastCalibrationDate ? fmtDate(new Date(`${s.lastCalibrationDate}T00:00:00+07:00`)) : "—"],
    ["สอบเทียบครั้งถัดไป", s.nextCalibrationDate ? fmtDate(new Date(`${s.nextCalibrationDate}T00:00:00+07:00`)) : "—"],
  ] : [];

  return (
    <Sheet open={s !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-xl">
        {s && (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="pr-8">{s.sensorName}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2"><Nameplate>{s.sensorCode}</Nameplate><ConnectionBadge value={s.connection} /></div>
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              <section aria-label="ค่าล่าสุด">
                <p className="text-sm text-muted-foreground">ค่าล่าสุด</p>
                {latest ? (
                  <>
                    <p className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-display text-4xl font-semibold tracking-tight tabular">{fmtNum(latest.value)}</span>
                      <span className="text-sm text-muted-foreground">{latest.unit}</span>
                      {latest.quality !== "VALID" && <StatusBadge tone="critical" className="ml-2">{QUALITY[latest.quality] ?? latest.quality}</StatusBadge>}
                    </p>
                    <p className="text-xs text-muted-foreground">วัดเมื่อ {fmtDateTime(new Date(latest.measuredAt))}</p>
                  </>
                ) : <p className="mt-1 text-sm">ยังไม่มีข้อมูลจากเซนเซอร์นี้</p>}
              </section>

              <section aria-labelledby="s24">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 id="s24" className="text-sm font-semibold">24 ชั่วโมงล่าสุด</h3>
                  {r && r.min !== null && <p className="text-xs text-muted-foreground tabular">ต่ำสุด {fmtNum(r.min)} สูงสุด {fmtNum(r.max)} {r.unit}</p>}
                </div>
                {r === undefined ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : !r || r.min === null ? (
                  <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">ไม่มีค่าที่ใช้ได้ใน 24 ชั่วโมงที่ผ่านมา ตรวจไฟเลี้ยง เครือข่าย และ token ของอุปกรณ์</p>
                ) : (
                  <TrendChart data={chart} series={[{ key: "v", label: s.sensorName, color: "var(--chart-1)" }]} unit={r.unit ?? undefined} height={200} />
                )}
              </section>

              <section aria-labelledby="stoken" className="rounded-lg border p-4">
                <h3 id="stoken" className="text-sm font-semibold">Token สำหรับอุปกรณ์</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.hasToken ? "ตั้งค่าแล้ว ระบบเก็บเฉพาะค่าแฮช จึงดู token เดิมซ้ำไม่ได้ ถ้าหายให้สร้างใหม่" : "ยังไม่มี token อุปกรณ์ต้องใช้ token เพื่อส่งค่าเข้าระบบผ่าน API"}
                </p>
                <Button variant="outline" className="mt-3 h-10" disabled={pending || s.status !== "ACTIVE"} onClick={() => onToken(s)}>
                  <KeyRound /> {s.hasToken ? "สร้าง token ใหม่" : "สร้าง token สำหรับอุปกรณ์"}
                </Button>
                {s.status !== "ACTIVE" && <p className="mt-2 text-xs text-muted-foreground">เปิดใช้งานเซนเซอร์ก่อนจึงจะสร้าง token ได้</p>}
              </section>

              <dl className="divide-y border-y text-sm">
                {info.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2"><dt className="shrink-0 text-muted-foreground">{k}</dt><dd className="min-w-0 text-right break-words">{v}</dd></div>
                ))}
              </dl>
            </div>
            <SheetFooter className="flex-row justify-end border-t">
              <Button variant="outline" className="h-10" onClick={onClose}>ปิด</Button>
              <Button className="h-10" onClick={() => onEdit(s)}><Pencil /> แก้ไขเซนเซอร์</Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <Button type="button" variant="outline" size="icon-lg" aria-label={label} title={label}
      onClick={async () => { try { await navigator.clipboard.writeText(text); toast.success("คัดลอกแล้ว"); } catch { toast.error("คัดลอกไม่สำเร็จ เลือกข้อความแล้วคัดลอกเอง"); } }}>
      <Copy />
    </Button>
  );
}

function TokenDialog({ issued, appUrl, onClose }: { issued: { sensor: SensorRow; token: string } | null; appUrl: string | null; onClose: () => void }) {
  const base = appUrl ?? (typeof window === "undefined" ? "" : window.location.origin);
  const unit = issued?.sensor.latest?.unit.toUpperCase().replace(/[^A-Z0-9_]/g, "") || "KW";
  const curl = issued
    ? `curl -X POST ${base}/api/ingest/readings -H "Authorization: Bearer ${issued.token}" -H "Content-Type: application/json" -d '{"value": 42.1, "unit": "${unit}"}'`
    : "";
  return (
    <Dialog open={issued !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {issued && (
          <>
            <DialogHeader>
              <DialogTitle>Token ของ {issued.sensor.sensorName}</DialogTitle>
              <DialogDescription>ใส่ token นี้ในอุปกรณ์หรือเกตเวย์ แล้วส่งค่าเข้า API ตามตัวอย่างด้านล่าง</DialogDescription>
            </DialogHeader>
            <p className="flex gap-2 rounded-lg border border-status-warning/50 bg-status-warning/10 p-3 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#8a5a00] dark:text-status-warning" aria-hidden />
              <span>แสดงครั้งเดียวเท่านั้น คัดลอกเก็บไว้ก่อนปิดหน้าต่างนี้ token นี้ใช้แทน token เดิมของเซนเซอร์ทันที</span>
            </p>
            <Field id="tok" label="Token">
              <div className="flex gap-2">
                <Input id="tok" readOnly value={issued.token} className="h-10 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                <CopyButton text={issued.token} label="คัดลอก token" />
              </div>
            </Field>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">ตัวอย่างคำสั่งส่งค่า</p>
              <div className="flex items-start gap-2">
                <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">{curl}</pre>
                <CopyButton text={curl} label="คัดลอกคำสั่ง curl" />
              </div>
              <p className="text-xs text-muted-foreground">ส่งหลายค่าพร้อมกันได้ด้วย {"{\"readings\": [...]}"} ระบบตอบ 202 เมื่อรับข้อมูลแล้ว</p>
            </div>
            <DialogFooter>
              <Button className="h-10" onClick={onClose}>คัดลอกแล้ว ปิดหน้าต่าง</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
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
    <FormSheet open={editing !== null} onOpenChange={(o) => !o && onClose()} title={s ? `แก้ไข ${s.sensorName}` : "เพิ่มเซนเซอร์"} pending={pending}
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
      <Field id="s-status" label="สถานะ" hint="ปิดใช้งานแล้วจะแสดงเป็น “บำรุงรักษา”">
        <SelectField id="s-status" name="status" defaultValue={s?.status ?? "ACTIVE"} options={STATUS_OPTIONS} />
      </Field>
    </FormSheet>
  );
}
