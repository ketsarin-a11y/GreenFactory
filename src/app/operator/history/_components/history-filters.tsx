"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { UrlFilters, type FilterField } from "@/components/data/url-filters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * Full filter row from 640px up. On phones: search stays inline, the rest moves into a
 * "ตัวกรอง" bottom sheet. Both write the same URL params, so they never disagree.
 */
export function HistoryFilters({ fields }: { fields: FilterField[] }) {
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const search = fields.filter((f) => f.type === "search");
  const rest = fields.filter((f) => f.type !== "search");
  const active = rest.filter((f) => sp.get(f.name)).length;
  return (
    <>
      <div className="hidden sm:block">
        <UrlFilters fields={fields} />
      </div>
      <div className="flex items-start gap-2 sm:hidden">
        <div className="min-w-0 flex-1 [&>div]:mb-0">
          <UrlFilters fields={search} />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-9 shrink-0">
              <SlidersHorizontal /> ตัวกรอง{active > 0 && <span className="tabular">({active})</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-[14px] pb-6">
            <SheetHeader>
              <SheetTitle>ตัวกรอง</SheetTitle>
              <SheetDescription>ผลลัพธ์จะเปลี่ยนทันทีเมื่อเลือก</SheetDescription>
            </SheetHeader>
            <div className="px-4 [&>div]:flex-col [&>div]:items-stretch [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:w-full [&_input]:h-11 [&_input]:w-full">
              <UrlFilters fields={rest} />
            </div>
            <div className="px-4">
              <Button size="lg" className="h-11 w-full" onClick={() => setOpen(false)}>ดูผลลัพธ์</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mb-4 sm:hidden" />
    </>
  );
}
