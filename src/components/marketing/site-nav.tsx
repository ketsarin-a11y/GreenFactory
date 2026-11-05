"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV } from "./site";

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function DesktopNav() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูหลัก" className="hidden items-center gap-1 lg:flex">
      {NAV.map(({ href, label }) => {
        const active = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "text-foreground after:absolute after:inset-x-3 after:-bottom-[15px] after:h-0.5 after:bg-brand-lime",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="เปิดเมนู">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(90%,360px)]">
        <SheetHeader>
          <SheetTitle>เมนู</SheetTitle>
        </SheetHeader>
        <nav aria-label="เมนูมือถือ" className="flex flex-col px-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={isActive(path, href) ? "page" : undefined}
              className="flex h-12 items-center border-b text-base font-medium aria-[current=page]:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 p-4">
          <Button asChild variant="outline" className="h-11">
            <Link href="/login" onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>
          </Button>
          <Button asChild className="h-11">
            <Link href="/contact" onClick={() => setOpen(false)}>ขอเดโม</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
