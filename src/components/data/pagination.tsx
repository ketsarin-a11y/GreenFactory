import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-rendered pager that keeps the other query params. */
export function Pagination({ page, totalPages, total, params, pathname }: {
  page: number;
  totalPages: number;
  total: number;
  params: Record<string, string | string[] | undefined>;
  pathname: string;
}) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const q = sp.toString();
    return q ? `${pathname}?${q}` : pathname;
  };
  const btn = "inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-sm whitespace-nowrap";
  return (
    <nav className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground" aria-label="เลขหน้า">
      <p className="tabular max-sm:hidden">ทั้งหมด {total.toLocaleString("th-TH")} รายการ</p>
      <div className="flex items-center gap-2">
        {page > 1 ? <Link className={btn} href={href(page - 1)}><ChevronLeft className="size-4" />ก่อนหน้า</Link> : <span className={cn(btn, "opacity-40")}><ChevronLeft className="size-4" />ก่อนหน้า</span>}
        <span className="tabular">หน้า {page} / {Math.max(1, totalPages)}</span>
        {page < totalPages ? <Link className={btn} href={href(page + 1)}>ถัดไป<ChevronRight className="size-4" /></Link> : <span className={cn(btn, "opacity-40")}>ถัดไป<ChevronRight className="size-4" /></span>}
      </div>
    </nav>
  );
}

/** Parses ?page= safely. */
export const pageParam = (v: unknown) => Math.min(10_000, Math.max(1, Number.parseInt(typeof v === "string" ? v : "1", 10) || 1));
