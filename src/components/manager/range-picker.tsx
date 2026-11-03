"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** from/to in the URL (Bangkok days) with 7/30/90-day presets ending at `to`. */
export function RangePicker({ from, to, presets = [7, 30, 90] }: { from: string; to: string; presets?: number[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const go = (f: string, t: string) => {
    const next = new URLSearchParams(sp.toString());
    next.set("from", f);
    next.set("to", t);
    next.delete("page");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="ช่วงเวลาสำเร็จรูป">
        {presets.map((n) => (
          <button key={n} type="button" onClick={() => go(addDays(to, -(n - 1)), to)} aria-pressed={days === n}
            className={cn("rounded px-2.5 py-1 text-sm text-muted-foreground", days === n && "bg-muted font-medium text-foreground")}>
            {n} วัน
          </button>
        ))}
      </div>
      <Input type="date" aria-label="ตั้งแต่วันที่" className="h-9 w-[150px]" value={from} max={to} onChange={(e) => e.target.value && go(e.target.value, to)} />
      <span className="text-sm text-muted-foreground">ถึง</span>
      <Input type="date" aria-label="ถึงวันที่" className="h-9 w-[150px]" value={to} min={from} onChange={(e) => e.target.value && go(from, e.target.value)} />
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="กำลังโหลด" />}
    </div>
  );
}
