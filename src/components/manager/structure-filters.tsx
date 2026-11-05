"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Opt = { value: string; label: string; parent?: string };
export type StructureOptions = { buildings: Opt[]; departments: Opt[]; lines: Opt[]; machines: Opt[] };
const ALL = "__all";
const LEVELS = [
  { name: "building", label: "อาคาร", key: "buildings" },
  { name: "department", label: "แผนก", key: "departments" },
  { name: "line", label: "ไลน์ผลิต", key: "lines" },
  { name: "machine", label: "เครื่องจักร", key: "machines" },
] as const;

/** building → department → line → machine cascade in the URL; changing a level clears the ones below. */
export function StructureFilters({ options, depth = 4, extra }: {
  options: StructureOptions;
  depth?: number;
  extra?: { name: string; label: string; options: Opt[]; allowAll?: boolean; value?: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const levels = LEVELS.slice(0, depth);

  const set = (name: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    const i = levels.findIndex((l) => l.name === name);
    if (i >= 0) for (const l of levels.slice(i + 1)) next.delete(l.name);
    next.delete("page");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {extra?.map((e) => (
        <Select key={e.name} value={e.value ?? sp.get(e.name) ?? ALL} onValueChange={(v) => set(e.name, v === ALL ? null : v)}>
          <SelectTrigger className="h-9 min-w-[170px]" aria-label={e.label}><SelectValue placeholder={e.label} /></SelectTrigger>
          <SelectContent>
            {e.allowAll !== false && <SelectItem value={ALL}>{e.label}: ทั้งหมด</SelectItem>}
            {e.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ))}
      {levels.map((l, i) => {
        const parentValue = i > 0 ? sp.get(levels[i - 1].name) : null;
        const opts = options[l.key].filter((o) => !parentValue || o.parent === parentValue);
        return (
          <Select key={l.name} value={sp.get(l.name) ?? ALL} onValueChange={(v) => set(l.name, v === ALL ? null : v)}>
            <SelectTrigger className="h-9 min-w-[140px]" aria-label={l.label}><SelectValue placeholder={l.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{l.label}: ทั้งหมด</SelectItem>
              {opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      })}
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="กำลังโหลด" />}
    </div>
  );
}
