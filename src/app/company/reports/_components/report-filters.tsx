"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all";

/** Month + factory pickers for the report; both live in the URL. */
export function ReportFilters({ month, months, factory, factories }: {
  month: string; months: { value: string; label: string }[]; factory: string | null; factories: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const set = (name: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(name, value); else next.delete(name);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Select value={month} onValueChange={(v) => set("month", v)}>
        <SelectTrigger className="h-10 min-w-[200px]" aria-label="เดือน"><SelectValue /></SelectTrigger>
        <SelectContent>{months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={factory ?? ALL} onValueChange={(v) => set("factory", v === ALL ? null : v)}>
        <SelectTrigger className="h-10 min-w-[200px]" aria-label="โรงงาน"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>ทุกโรงงาน</SelectItem>
          {factories.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="กำลังโหลด" />}
    </div>
  );
}
