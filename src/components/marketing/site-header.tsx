import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { DesktopNav, MobileNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="GreenFactory Insight หน้าแรก" className="shrink-0">
          <Logo className="w-[150px] sm:w-[168px]" />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden h-9 px-3 sm:inline-flex">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button asChild className="hidden h-9 px-3 lg:inline-flex">
            <Link href="/contact">ขอเดโม</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
