import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";
import { Sparkline } from "./sparkline";

export type Reading = {
  label: string;
  value: string;
  unit?: string;
  /** % vs previous period; null = not comparable. */
  change?: number | null;
  goodWhen?: "down" | "up" | "neutral";
  spark?: number[];
  note?: string;
  href?: string;
};

/**
 * The one bold element of a dashboard (DESIGN.md "instrument band"): the readings that matter,
 * on the control-room green, divided by hairlines. Keep it to 3–4 readings.
 */
export function InstrumentBand({ readings, live, className }: { readings: Reading[]; live?: string; className?: string }) {
  return (
    <section aria-label="ค่าหลัก" className={cn("relative mb-8 overflow-hidden rounded-[14px] bg-control-room text-white", className)}>
      {live && (
        <p className="flex items-center gap-2 border-b border-white/10 px-5 py-2.5 text-xs text-white/70">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-lime opacity-60 motion-reduce:hidden" /><span className="relative inline-flex size-2 rounded-full bg-brand-lime" /></span>
          {live}
        </p>
      )}
      <dl className="grid grid-cols-2 lg:grid-cols-4 [&>div]:border-white/10 max-lg:[&>div:nth-child(n+3)]:border-t lg:[&>div+div]:border-l max-lg:[&>div:nth-child(even)]:border-l">
        {readings.map((r) => <ReadingCell key={r.label} r={r} />)}
      </dl>
    </section>
  );
}

function ReadingCell({ r }: { r: Reading }) {
  const dir = r.change == null || r.change === 0 ? 0 : r.change > 0 ? 1 : -1;
  const good = r.goodWhen === "neutral" || dir === 0 ? null : ((r.goodWhen ?? "down") === "down") === dir < 0;
  const Arrow = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  const body = (
    <>
      <dt className="text-sm text-white/70">{r.label}</dt>
      <dd className="mt-2">
        <span className="font-display text-[1.75rem] leading-none font-semibold tracking-tight tabular sm:text-[2.5rem]">{r.value}</span>
        {r.unit && <span className="ml-1.5 text-sm text-white/60">{r.unit}</span>}
      </dd>
      {r.spark && r.spark.length > 1 && <Sparkline values={r.spark} color="rgb(255 255 255 / 0.85)" className="mt-4 h-8" label={`แนวโน้ม${r.label}`} />}
      <dd className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-white/60">
        {r.change !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 font-medium tabular", good === true && "text-[#b9e66b]", good === false && "text-[#ffb4a8]")}>
            <Arrow className="size-3.5" aria-hidden />
            {r.change === null ? "ไม่มีข้อมูลเทียบ" : fmtPct(r.change)}
          </span>
        )}
        {r.note && <span>{r.note}</span>}
      </dd>
    </>
  );
  return r.href ? (
    <div className="p-4 transition-colors hover:bg-white/5 sm:p-5"><Link href={r.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-white/60">{body}</Link></div>
  ) : (
    <div className="p-4 sm:p-5">{body}</div>
  );
}
