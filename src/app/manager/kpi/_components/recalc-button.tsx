"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { recalculateKpis } from "@/server/actions/manager";

export function RecalcButton({ from, to }: { from: string; to: string }) {
  const { run, pending } = useAction(recalculateKpis, { success: (d) => `คำนวณใหม่แล้ว ${d.results} ผลจาก ${d.kpis} KPI` });
  return (
    <Button onClick={() => run({ from, to })} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />} คำนวณผล KPI ใหม่
    </Button>
  );
}
