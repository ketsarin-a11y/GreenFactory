"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/platform/select-field";
import { useAction } from "@/hooks/use-action";
import { updateSystemSettings } from "@/server/actions/platform/settings";

export type Settings = {
  maintenanceMode: boolean;
  forceMfa: boolean;
  ipProtection: boolean;
  anomalyDetection: boolean;
  autoBlock: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  auditRetentionDays: number;
  loginRetentionDays: number;
  backupFrequency: string;
  carbonAnalyticsEnabled: boolean;
  sensorMonitoringEnabled: boolean;
  aiRecommendationsEnabled: boolean;
  machineQrEnabled: boolean;
  reportBuilderEnabled: boolean;
};
type Key = keyof Settings;
type Item =
  | { key: Key; type: "switch"; label: string; hint: string }
  | { key: Key; type: "number"; label: string; hint: string; min: number; max: number; unit: string }
  | { key: Key; type: "select"; label: string; hint: string; options: { value: string; label: string }[] };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "การทำงานของระบบ",
    items: [
      { key: "maintenanceMode", type: "switch", label: "โหมดปิดปรับปรุง", hint: "ผู้ใช้ทั่วไปเข้าใช้งานไม่ได้ชั่วคราว" },
      { key: "anomalyDetection", type: "switch", label: "ตรวจจับความผิดปกติ", hint: "สร้างการแจ้งเตือนเมื่อการใช้ทรัพยากรผิดปกติ" },
    ],
  },
  {
    title: "ความปลอดภัย",
    items: [
      { key: "maxLoginAttempts", type: "number", label: "จำนวนครั้งที่ใส่รหัสผิดได้", hint: "เกินแล้วล็อกบัญชีชั่วคราว", min: 3, max: 20, unit: "ครั้ง" },
      { key: "autoBlock", type: "switch", label: "ล็อกบัญชีอัตโนมัติ", hint: "ล็อกเมื่อใส่รหัสผิดเกินกำหนด" },
      { key: "sessionTimeoutMinutes", type: "number", label: "หมดเวลาเซสชัน", hint: "ออกจากระบบเมื่อไม่ได้ใช้งาน", min: 5, max: 1440, unit: "นาที" },
      { key: "forceMfa", type: "switch", label: "บังคับยืนยันตัวตนสองขั้น", hint: "ต้องมีระบบ MFA ก่อนจึงจะมีผล" },
      { key: "ipProtection", type: "switch", label: "ป้องกันตาม IP", hint: "จำกัดการเข้าถึงจาก IP ที่ผิดปกติ" },
    ],
  },
  {
    title: "การเก็บข้อมูล",
    items: [
      { key: "auditRetentionDays", type: "number", label: "เก็บ Audit Log", hint: "30–3650 วัน", min: 30, max: 3650, unit: "วัน" },
      { key: "loginRetentionDays", type: "number", label: "เก็บ Login Log", hint: "30–3650 วัน", min: 30, max: 3650, unit: "วัน" },
      {
        key: "backupFrequency",
        type: "select",
        label: "ความถี่สำรองข้อมูล",
        hint: "ยังไม่มีตัวตั้งเวลาอัตโนมัติ ใช้เป็นนโยบายอ้างอิง",
        options: [
          { value: "DAILY", label: "ทุกวัน" },
          { value: "WEEKLY", label: "ทุกสัปดาห์" },
          { value: "MONTHLY", label: "ทุกเดือน" },
        ],
      },
    ],
  },
  {
    title: "ฟีเจอร์",
    items: [
      { key: "carbonAnalyticsEnabled", type: "switch", label: "วิเคราะห์คาร์บอน", hint: "หน้าคาร์บอนของผู้จัดการ" },
      { key: "sensorMonitoringEnabled", type: "switch", label: "ติดตามเซนเซอร์", hint: "สถานะการเชื่อมต่อเซนเซอร์" },
      { key: "aiRecommendationsEnabled", type: "switch", label: "คำแนะนำจาก AI", hint: "ผู้ช่วย G-FAY และคำแนะนำอัตโนมัติ" },
      { key: "machineQrEnabled", type: "switch", label: "QR Code เครื่องจักร", hint: "สแกน QR เพื่อบันทึกข้อมูล" },
      { key: "reportBuilderEnabled", type: "switch", label: "ตัวสร้างรายงาน", hint: "สร้างรายงานแบบกำหนดเอง" },
    ],
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const [saved, setSaved] = useState(initial);
  const [v, setV] = useState(initial);
  const { run, pending, errors } = useAction(updateSystemSettings, { success: (d) => (d.changed ? `บันทึกแล้ว ${d.changed} ค่า` : "ไม่มีค่าที่เปลี่ยน") });
  const set = <K extends Key>(k: K, val: Settings[K]) => setV((s) => ({ ...s, [k]: val }));
  const dirty = (Object.keys(v) as Key[]).filter((k) => v[k] !== saved[k]).length;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await run(v as Parameters<typeof updateSystemSettings>[0]);
        if (r.ok) setSaved(v);
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">{s.title}</h2>
            <div className="divide-y">
              {s.items.map((it) => {
                const id = `set-${it.key}`;
                const err = errors[it.key];
                return (
                  <div key={it.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Label htmlFor={id}>{it.label}</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">{it.hint}</p>
                      {err && <p role="alert" className="mt-0.5 text-xs text-status-critical">{err}</p>}
                    </div>
                    {it.type === "switch" ? (
                      <Switch id={id} checked={v[it.key] as boolean} onCheckedChange={(c) => set(it.key, c as never)} />
                    ) : it.type === "number" ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <Input
                          id={id}
                          type="number"
                          min={it.min}
                          max={it.max}
                          value={v[it.key] as number}
                          onChange={(e) => set(it.key, (e.target.value === "" ? "" : Number(e.target.value)) as never)}
                          className="h-10 w-24 text-right tabular"
                          aria-invalid={!!err}
                        />
                        <span className="w-8 text-sm text-muted-foreground">{it.unit}</span>
                      </div>
                    ) : (
                      <div className="w-40 shrink-0">
                        <SelectField id={id} name={it.key} value={v[it.key] as string} onValueChange={(x) => set(it.key, x as never)} options={it.options} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className="sticky bottom-0 mt-4 flex items-center justify-end gap-2 border-t bg-background/95 py-3">
        {dirty > 0 && <span className="text-sm text-muted-foreground tabular">ยังไม่บันทึก {dirty} ค่า</span>}
        <Button type="button" variant="outline" className="h-10" disabled={!dirty || pending} onClick={() => setV(saved)}>
          <RotateCcw /> ย้อนกลับ
        </Button>
        <Button type="submit" className="h-10" disabled={!dirty || pending}>
          {pending && <Loader2 className="animate-spin" />}บันทึกการตั้งค่า
        </Button>
      </div>
    </form>
  );
}
