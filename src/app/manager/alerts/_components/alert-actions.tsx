"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { CheckCheck, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAction } from "@/hooks/use-action";
import { acknowledgeAlert, acknowledgeAllAlerts, resolveAlert } from "@/server/actions/manager";

export function AckAllButton({ count }: { count: number }) {
  const { run, pending } = useAction(acknowledgeAllAlerts, { success: (d) => `รับทราบแล้ว ${d.count} รายการ` });
  return (
    <Button variant="outline" disabled={pending || count === 0} onClick={() => run({})}>
      {pending ? <Loader2 className="animate-spin" /> : <CheckCheck />} รับทราบทั้งหมด ({count})
    </Button>
  );
}

export function AlertButtons({ id, status }: { id: string; status: string }) {
  const ack = useAction(acknowledgeAlert, { success: "รับทราบการแจ้งเตือนแล้ว" });
  const res = useAction(resolveAlert, { success: "ปิดการแจ้งเตือนแล้ว" });
  if (status === "RESOLVED") return null;
  return (
    <div className="flex flex-wrap gap-2">
      {status === "OPEN" && (
        <Button variant="outline" className="flex-1" disabled={ack.pending || res.pending} onClick={() => ack.run({ alertId: id })}>
          {ack.pending ? <Loader2 className="animate-spin" /> : <Eye />} รับทราบ
        </Button>
      )}
      <Button className="flex-1" disabled={ack.pending || res.pending} onClick={() => res.run({ alertId: id })}>
        {res.pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} ปิดการแจ้งเตือน
      </Button>
    </div>
  );
}

/** Detail sheet driven by ?alert=<id>; closing removes the param. */
export function AlertSheet({ open, title, description, children }: { open: boolean; title: string; description?: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const close = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete("alert");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="space-y-5 px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
