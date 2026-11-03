import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Section({ id, className, children, tone = "canvas", wide }: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "canvas" | "surface";
  wide?: boolean;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-24", tone === "surface" && "border-y bg-card", className)}>
      <div className={cn("mx-auto px-4 sm:px-6", wide ? "max-w-7xl" : "max-w-6xl")}>{children}</div>
    </section>
  );
}

export function SectionHeading({ title, body, className, id }: {
  title: ReactNode;
  body?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 id={id} className="font-display text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-[32px]">{title}</h2>
      {body && <p className="mt-4 leading-relaxed text-muted-foreground sm:text-[17px]">{body}</p>}
    </div>
  );
}

/** Page intro for inner pages (one h1 per page). */
export function PageIntro({ title, body, children }: {
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="max-w-3xl text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
        {children}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "ลองกับข้อมูลโรงงานของคุณ",
  body = "บอกเราว่ามีกี่โรงงาน ตอนนี้จดมิเตอร์อย่างไร และอยากเห็นตัวเลขไหน ทีมงานจะติดต่อกลับเพื่อนัดสาธิตกับโครงสร้างโรงงานของคุณ",
}: { title?: string; body?: string }) {
  return (
    <section className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl leading-tight font-semibold tracking-tight sm:text-[32px]">{title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 px-6 text-[15px]">
            <Link href="/contact">ขอเดโม</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6 text-[15px]">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
