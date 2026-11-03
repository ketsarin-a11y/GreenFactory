"use client";

import { useState } from "react";
import { ExternalLink, Factory, MapPin, MoreHorizontal, Pencil, Plus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/account/field";
import { EmptyState } from "@/components/data/empty-state";
import { Nameplate } from "@/components/data/nameplate";
import { RECORD_STATUS, Status } from "@/components/data/status-badge";
import { FormSheet } from "@/components/company/form-sheet";
import { ConfirmDialog, type Confirm } from "@/components/company/confirm-dialog";
import { Readiness } from "@/components/company/readiness";
import { useAction } from "@/hooks/use-action";
import { saveFactory, setFactoryStatus } from "@/server/actions/company/factories";

export type FactoryRow = {
  id: number; factoryCode: string; factoryName: string; address: string | null; province: string | null; postalCode: string | null;
  country: string | null; latitude: number | null; longitude: number | null; googleMapUrl: string | null; phone: string | null;
  email: string | null; timezone: string | null; status: string;
  counts: { buildings: number; departments: number; lines: number; users: number; machines: number; sensors: number };
  readiness: number; missing: string[];
};

export function FactoriesView({ rows }: { rows: FactoryRow[] }) {
  const [editing, setEditing] = useState<FactoryRow | "new" | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const status = useAction(setFactoryStatus, { success: "เปลี่ยนสถานะโรงงานแล้ว" });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button className="h-10" onClick={() => setEditing("new")}><Plus /> เพิ่มโรงงาน</Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Factory} title="ยังไม่มีโรงงาน" description="เพิ่มโรงงานแรกของบริษัท แล้วจึงสร้างอาคาร แผนก และสายการผลิต" />
      ) : (
        <ul className="divide-y rounded-[10px] border bg-card">
          {rows.map((f) => (
            <li key={f.id} className="grid gap-x-8 gap-y-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h2 className="flex flex-wrap items-center gap-2 font-semibold">
                  {f.factoryName}<Nameplate>{f.factoryCode}</Nameplate>
                  {f.status !== "ACTIVE" && <Status map={RECORD_STATUS} value={f.status} />}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {[f.province, f.country].filter(Boolean).join(", ") || "ยังไม่ระบุพื้นที่"}
                  {(f.latitude !== null || f.googleMapUrl) && (
                    <a className="ml-1 inline-flex items-center gap-0.5 text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer"
                      href={f.googleMapUrl ?? `https://www.google.com/maps?q=${f.latitude},${f.longitude}`}>แผนที่<ExternalLink className="size-3" aria-hidden /></a>
                  )}
                </p>
                {f.address && <p className="mt-0.5 truncate text-xs text-muted-foreground" title={f.address}>{f.address}</p>}
              </div>
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm sm:grid-cols-6 lg:grid-cols-3">
                {([["อาคาร", f.counts.buildings], ["แผนก", f.counts.departments], ["สายการผลิต", f.counts.lines], ["เครื่องจักร", f.counts.machines], ["มีเซนเซอร์", f.counts.sensors], ["ผู้ใช้", f.counts.users]] as const).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs whitespace-nowrap text-muted-foreground">{k}</dt>
                    <dd className="font-display text-lg font-semibold tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">ข้อมูลครบ {9 - f.missing.length} จาก 9 รายการ</p>
                <Readiness score={f.readiness} />
                {f.missing.length > 0 && <p className="mt-1 text-xs text-muted-foreground">ยังขาด {f.missing.join(", ")}</p>}
              </div>
              <div className="flex items-start gap-1 lg:justify-end">
                <Button variant="outline" className="h-9" onClick={() => setEditing(f)}><Pencil /> แก้ไข</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`เมนูเพิ่มเติม ${f.factoryName}`}><MoreHorizontal /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        const next = f.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                        setConfirm({
                          title: next === "ACTIVE" ? "เปิดใช้งานโรงงาน" : "ปิดใช้งานโรงงาน",
                          description: next === "ACTIVE" ? `${f.factoryName} จะกลับมาใช้งานได้` : `${f.factoryName} จะไม่ถูกนับในแดชบอร์ดและเลือกไม่ได้ในฟอร์มใหม่ ข้อมูลเดิมยังอยู่ครบ`,
                          confirmLabel: next === "ACTIVE" ? "เปิดใช้งาน" : "ปิดใช้งาน",
                          destructive: next === "INACTIVE",
                          run: () => status.run({ id: f.id, status: next }),
                        });
                      }}
                    >
                      <Power /> {f.status === "ACTIVE" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}
      <FactorySheet key={editing === "new" ? "new" : editing?.id ?? "none"} editing={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} pending={status.pending} />
    </>
  );
}

function FactorySheet({ editing, onClose }: { editing: FactoryRow | "new" | null; onClose: () => void }) {
  const f = editing === "new" ? null : editing;
  const { run, pending, errors } = useAction(saveFactory, { success: f ? "บันทึกการแก้ไขแล้ว" : "เพิ่มโรงงานแล้ว" });
  const text = (name: keyof FactoryRow, label: string, opts: { required?: boolean; type?: string; hint?: string; step?: string } = {}) => (
    <Field id={`f-${name}`} label={label} error={errors[name]} hint={opts.hint} required={opts.required}>
      <Input id={`f-${name}`} name={name} type={opts.type ?? "text"} step={opts.step} className="h-10" required={opts.required}
        defaultValue={f?.[name] === null || f?.[name] === undefined ? (name === "country" ? "Thailand" : name === "timezone" ? "Asia/Bangkok" : "") : String(f[name])} />
    </Field>
  );
  return (
    <FormSheet
      open={editing !== null}
      onOpenChange={(o) => !o && onClose()}
      title={f ? `แก้ไข ${f.factoryName}` : "เพิ่มโรงงาน"}
      pending={pending}
      onSubmit={async (fd) => {
        if (f) fd.set("id", String(f.id));
        return (await run(fd)).ok;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {text("factoryCode", "รหัสโรงงาน", { required: true, hint: "A-Z, 0-9, - และ _" })}
        {text("factoryName", "ชื่อโรงงาน", { required: true })}
      </div>
      {text("address", "ที่อยู่")}
      <div className="grid gap-4 sm:grid-cols-3">
        {text("province", "จังหวัด")}
        {text("postalCode", "รหัสไปรษณีย์")}
        {text("country", "ประเทศ")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {text("latitude", "ละติจูด", { type: "number", step: "any", hint: "-90 ถึง 90" })}
        {text("longitude", "ลองจิจูด", { type: "number", step: "any", hint: "-180 ถึง 180" })}
      </div>
      {text("googleMapUrl", "ลิงก์ Google Maps", { type: "url" })}
      <div className="grid gap-4 sm:grid-cols-2">
        {text("phone", "โทรศัพท์", { type: "tel" })}
        {text("email", "อีเมล", { type: "email" })}
      </div>
      {text("timezone", "เขตเวลา")}
    </FormSheet>
  );
}
