"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Confirm = { title: string; description: ReactNode; confirmLabel: string; destructive?: boolean; run: () => Promise<unknown> };

/** One confirm dialog per page, driven by a `Confirm | null` state. */
export function ConfirmDialog({ confirm, onClose, pending }: { confirm: Confirm | null; onClose: () => void; pending: boolean }) {
  return (
    <Dialog open={confirm !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{confirm?.title}</DialogTitle>
          <DialogDescription>{confirm?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <Button
            variant={confirm?.destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={async () => {
              await confirm?.run();
              onClose();
            }}
          >
            {pending && <Loader2 className="animate-spin" />}
            {confirm?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
