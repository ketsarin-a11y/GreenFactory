"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import type { ActionResult } from "@/server/actions/_action";

/** A button that asks before running a server action (suspend, delete…). */
export function ConfirmAction<I, T>({
  action,
  input,
  title,
  description,
  confirmLabel,
  success,
  destructive,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: {
  action: (input: I) => Promise<ActionResult<T>>;
  input: I;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  success: string;
  destructive?: boolean;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  onSuccess?: () => void;
}) {
  const [own, setOwn] = useState(false);
  const open = controlledOpen ?? own;
  const setOpen = onOpenChange ?? setOwn;
  const { run, pending } = useAction(action, { success });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            ยกเลิก
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={async () => {
              const r = await run(input);
              if (r.ok) {
                setOpen(false);
                onSuccess?.();
              }
            }}
          >
            {pending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
