"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { th } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Values stay "YYYY-MM-DD" strings (Bangkok business days); the calendar works on local midnight dates.
const toDate = (day: string) => new Date(`${day}T00:00:00`);
const toDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const label = (day: string, year = true) =>
  toDate(day).toLocaleDateString("th-TH", { day: "numeric", month: "short", ...(year && { year: "numeric" }) });

// Thai month names with Buddhist-era years, matching every other date in the app.
const formatters = {
  formatCaption: (d: Date) => d.toLocaleDateString("th-TH", { month: "long", year: "numeric" }),
};

const disabledOutside = (min?: string, max?: string) => [
  ...(min ? [{ before: toDate(min) }] : []),
  ...(max ? [{ after: toDate(max) }] : []),
];

export function DateField({ id, value, onChange, min, max, className, "aria-label": ariaLabel }: {
  id?: string; value: string; onChange: (day: string) => void; min?: string; max?: string; className?: string; "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" aria-label={ariaLabel} className={cn("h-9 justify-start gap-2 border-input bg-transparent font-normal tabular-nums", !value && "text-muted-foreground", className)}>
          <CalendarDays className="text-muted-foreground" aria-hidden />
          {value ? label(value) : "เลือกวันที่"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" locale={th} formatters={formatters} selected={value ? toDate(value) : undefined}
          defaultMonth={value ? toDate(value) : undefined} disabled={disabledOutside(min, max)}
          onSelect={(d) => { if (d) { onChange(toDay(d)); setOpen(false); } }} />
      </PopoverContent>
    </Popover>
  );
}

/** One button for a from–to range; commits only when both ends are picked. */
export function DateRangeField({ from, to, onChange, max, className }: {
  from: string; to: string; onChange: (from: string, to: string) => void; max?: string; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); setDraft(undefined); }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-label="เลือกช่วงวันที่" className={cn("h-9 justify-start gap-2 font-normal tabular-nums", className)}>
          <CalendarDays className="text-muted-foreground" aria-hidden />
          {label(from, !sameYear)} – {label(to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar mode="range" locale={th} formatters={formatters} numberOfMonths={2}
          defaultMonth={toDate(from)} selected={draft ?? { from: toDate(from), to: toDate(to) }}
          disabled={disabledOutside(undefined, max)}
          onSelect={(r, picked) => {
            // Start a fresh range on the first click instead of extending the current one.
            const next = draft ? r : { from: picked, to: undefined };
            if (next?.from && next.to) { onChange(toDay(next.from), toDay(next.to)); setOpen(false); setDraft(undefined); }
            else setDraft(next);
          }} />
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
          {draft?.from ? `เริ่ม ${label(toDay(draft.from))} เลือกวันสิ้นสุด` : "เลือกวันเริ่มต้น แล้วเลือกวันสิ้นสุด"}
        </p>
      </PopoverContent>
    </Popover>
  );
}
