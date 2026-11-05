"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** shadcn Select that also submits with a <form> (Radix renders a hidden native select for `name`). */
export function SelectField({
  id,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "เลือก",
  disabled,
  invalid,
}: {
  id: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-10 w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
