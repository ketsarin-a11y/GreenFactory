"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data/status-badge";
import { fmtDayLong } from "@/components/manager/format";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";

type Point = { day: string; value: number | null; z: number | null; anomaly: boolean };
type Contributor = { name: string; total: number; count: number; share: number };

/** Day list (anomalies first) → "รายละเอียดวัน" sheet with top contributors. */
export function DayDetail({ points, detail, mean, sd, unit, label }: {
  points: Point[];
  detail: Record<string, Contributor[]>;
  mean: number;
  sd: number;
  unit: string;
  label: string;
}) {
  const [day, setDay] = useState<string | null>(null);
  const p = points.find((x) => x.day === day);
  const withData = points.filter((x) => x.value !== null);
  const list = [...withData].sort((a, b) => Number(b.anomaly) - Number(a.anomaly) || Math.abs(b.z ?? 0) - Math.abs(a.z ?? 0)).slice(0, 8);
  return (
    <>
      <ul className="divide-y text-sm">
        {list.map((x) => (
          <li key={x.day}>
            <button type="button" onClick={() => setDay(x.day)} className="flex w-full items-center gap-3 py-2.5 text-left hover:text-primary">
              <span className="flex-1">{fmtDayLong(x.day)}</span>
              <span className="tabular">{fmtNum(x.value)} <span className="text-muted-foreground">{unit}</span></span>
              <span className={cn("w-16 text-right tabular text-xs", x.anomaly ? "font-medium text-status-critical" : "text-muted-foreground")}>z {fmtNum(x.z, 2)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Sheet open={!!day} onOpenChange={(o) => !o && setDay(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {p && (
            <>
              <SheetHeader>
                <SheetTitle>รายละเอียดวัน {fmtDayLong(p.day)}</SheetTitle>
                <SheetDescription>{label} ({unit})</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6">
                {p.anomaly && <StatusBadge tone="critical">อยู่นอกช่วงปกติ</StatusBadge>}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y py-4 text-sm">
                  {[["ค่าที่วัดได้", `${fmtNum(p.value)} ${unit}`], ["ค่าเฉลี่ย (μ)", `${fmtNum(mean)} ${unit}`], ["ส่วนเบี่ยงเบน (σ)", fmtNum(sd)], ["z-score", fmtNum(p.z, 2)]].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 font-display text-base font-semibold tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">แหล่งที่ใช้มากที่สุดในวันนี้</h3>
                  <ul className="divide-y text-sm">
                    {(detail[p.day] ?? []).map((c) => (
                      <li key={c.name} className="flex items-center gap-3 py-2">
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        <span className="tabular">{fmtNum(c.total)}</span>
                        <span className="w-14 text-right tabular text-xs text-muted-foreground">{fmtNum(c.share, 1)}%</span>
                        <span className="w-14 text-right text-xs text-muted-foreground">{c.count} รายการ</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.anomaly
                    ? "ค่ารวมของวันนี้ห่างจากค่าเฉลี่ยมากกว่า 2 เท่าของส่วนเบี่ยงเบน ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง ควรตรวจสอบแหล่งที่ใช้มากที่สุดข้างต้นกับแผนการผลิต"
                    : "ค่ารวมของวันนี้อยู่ในช่วงปกติของช่วงเวลาที่เลือก"}
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/manager/assistant?q=${encodeURIComponent(`วันที่ ${fmtDayLong(p.day)} ${label}ผิดปกติหรือไม่ และควรตรวจอะไรต่อ?`)}`}><Bot /> ถาม G-FAY</Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {withData.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</p>}
    </>
  );
}
