"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Create/edit form in a right-side sheet. `onSubmit` returns true to close. */
export function FormSheet({ open, onOpenChange, title, description, pending, onSubmit, submitLabel = "บันทึก", children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  pending: boolean;
  onSubmit: (fd: FormData) => Promise<boolean>;
  submitLabel?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          action={async (fd) => {
            if (await onSubmit(fd)) onOpenChange(false);
          }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
            <Button type="submit" className="h-10" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
