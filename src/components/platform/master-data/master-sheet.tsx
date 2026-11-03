"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/account/field";
import { FormSheet } from "@/components/platform/form-sheet";
import { SelectField } from "@/components/platform/select-field";
import { useAction } from "@/hooks/use-action";
import { saveMasterItem } from "@/server/actions/platform/master-data";
import { MASTER, type FieldDef, type MasterKind } from "./config";

export type Option = { value: string; label: string };
type Val = string | number | boolean | null;

const initial = (fields: FieldDef[], values?: Record<string, Val>, kind?: MasterKind) =>
  Object.fromEntries(
    fields.map((f) => {
      const v = values?.[f.name];
      if (f.type === "switch") return [f.name, v === true];
      if (v === null || v === undefined) return [f.name, kind === "emission-factors" && f.name === "region" ? "TH" : ""];
      return [f.name, String(v)];
    }),
  ) as Record<string, string | boolean>;

/** One create/edit sheet for every master-data table, driven by MASTER[kind].fields. */
export function MasterSheet({ kind, open, onOpenChange, options, row }: {
  kind: MasterKind;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  options: Record<string, Option[]>;
  row?: { id: number; values: Record<string, Val> };
}) {
  const cfg = MASTER[kind];
  const [vals, setVals] = useState(() => initial(cfg.fields, row?.values, kind));
  const { run, pending, errors } = useAction(saveMasterItem, {
    success: (d) => (d.reactivated ? "พบรหัสนี้ที่ปิดใช้งานอยู่ — เปิดใช้งานอีกครั้งพร้อมข้อมูลใหม่แล้ว" : row ? "บันทึกแล้ว" : "เพิ่มแล้ว"),
  });
  const set = (name: string, v: string | boolean) => setVals((s) => ({ ...s, [name]: v }));

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={row ? `แก้ไข${cfg.noun}` : `เพิ่ม${cfg.noun}`}
      description={cfg.description}
      pending={pending}
      onSubmit={async () => {
        // The discriminated union on the server picks the right schema from `kind`.
        const r = await run({ kind, ...(row ? { id: row.id } : {}), ...vals } as Parameters<typeof saveMasterItem>[0]);
        if (r.ok) onOpenChange(false);
      }}
    >
      {cfg.fields.map((f) => {
        const id = `${kind}-${f.name}`;
        const err = errors[f.name];
        const locked = !!row && f.lockOnEdit;
        const v = vals[f.name];
        let control;
        if (f.type === "switch")
          control = (
            <div className="flex h-10 items-center">
              <Switch id={id} checked={v === true} onCheckedChange={(c) => set(f.name, c)} />
            </div>
          );
        else if (f.type === "textarea")
          control = <Textarea id={id} value={String(v)} maxLength={f.max} rows={3} onChange={(e) => set(f.name, e.target.value)} aria-invalid={!!err} />;
        else if (f.type === "select") {
          const opts = f.options ?? options[f.name] ?? [];
          control = (
            <SelectField
              id={id}
              name={f.name}
              value={String(v) || undefined}
              options={opts}
              invalid={!!err}
              placeholder={opts.length ? "เลือก" : "ยังไม่มีตัวเลือกที่ใช้งานได้"}
              onValueChange={(nv) => {
                set(f.name, nv);
                const fill = f.autofill && options[`${f.name}:autofill`]?.find((o) => o.value === nv);
                if (f.autofill && fill) set(f.autofill, fill.label);
              }}
            />
          );
        } else
          control = (
            <Input
              id={id}
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              step={f.type === "number" ? "any" : undefined}
              min={f.type === "number" ? 0 : undefined}
              value={String(v)}
              maxLength={f.max}
              readOnly={locked}
              required={f.required}
              aria-invalid={!!err}
              onChange={(e) => set(f.name, f.mono && f.name === "code" ? e.target.value.toUpperCase() : e.target.value)}
              className={f.mono ? "h-10 font-mono" : "h-10"}
            />
          );
        return (
          <Field key={f.name} id={id} label={f.label} required={f.required} error={err} hint={locked ? "รหัสแก้ไขไม่ได้" : f.hint}>
            {control}
          </Field>
        );
      })}
    </FormSheet>
  );
}
