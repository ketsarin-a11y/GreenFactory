"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FilterField =
  | { type: "search"; name: string; placeholder: string }
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { type: "date"; name: string; label: string };

const ALL = "__all";

/** Filters live in the URL so results are shareable and the server does the filtering. */
export function UrlFilters({ fields }: { fields: FilterField[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const searchField = fields.find((f) => f.type === "search");
  const [q, setQ] = useState(searchField ? sp.get(searchField.name) ?? "" : "");

  const set = (name: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete("page");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  useEffect(() => {
    if (!searchField) return;
    const current = sp.get(searchField.name) ?? "";
    if (q === current) return;
    const t = setTimeout(() => set(searchField.name, q.trim() || null), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = fields.some((f) => sp.get(f.name));
  return (
    <div className="mb-4 flex flex-wrap items-end gap-2">
      {fields.map((f) =>
        f.type === "search" ? (
          <div key={f.name} className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={f.placeholder} aria-label={f.placeholder} className="h-9 pl-8" />
          </div>
        ) : f.type === "select" ? (
          <Select key={f.name} value={sp.get(f.name) ?? ALL} onValueChange={(v) => set(f.name, v === ALL ? null : v)}>
            <SelectTrigger className="h-9 min-w-[150px]" aria-label={f.label}>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{f.label}: ทั้งหมด</SelectItem>
              {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <label key={f.name} className="flex flex-col gap-1 text-xs text-muted-foreground">
            {f.label}
            <Input type="date" className="h-9 w-[150px]" value={sp.get(f.name) ?? ""} onChange={(e) => set(f.name, e.target.value || null)} />
          </label>
        ),
      )}
      {active && (
        <Button variant="ghost" size="sm" className="h-9" onClick={() => { setQ(""); start(() => router.replace(pathname, { scroll: false })); }}>
          <X /> ล้างตัวกรอง
        </Button>
      )}
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="กำลังโหลด" />}
    </div>
  );
}
