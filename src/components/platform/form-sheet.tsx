"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/** Right-hand sheet with a scrollable form body and a pinned footer (create/edit pattern for platform pages). */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  pending,
  submitLabel = "บันทึก",
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (fd: FormData) => void | Promise<void>;
  pending: boolean;
  submitLabel?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={wide ? "w-full sm:max-w-xl" : "w-full sm:max-w-md"}>
        <form action={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)} disabled={pending}>
              ยกเลิก
            </Button>
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

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
