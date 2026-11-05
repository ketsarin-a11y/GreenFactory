"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Option = { value: string; label: string };

/**
 * shadcn Select that also submits with its form (`name`). Pass `value`/`onChange` for
 * cascades, or `defaultValue` for a plain field.
 */
export function SelectField({ id, name, options, placeholder = "เลือก", value, defaultValue, onChange, disabled, invalid }: {
  id: string;
  name: string;
  options: Option[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-10 w-full" aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
