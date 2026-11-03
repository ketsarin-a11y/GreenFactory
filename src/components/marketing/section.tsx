import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Section({ id, className, children, tone = "canvas" }: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "canvas" | "surface";
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-20", tone === "surface" && "border-y bg-card", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{children}</p>;
}

export function SectionHeading({ eyebrow, title, body, className }: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-2 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {body && <p className="mt-4 leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

/** Page intro for inner pages (one h1 per page). */
export function PageIntro({ eyebrow, title, body, children }: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
        {children}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "อยากเห็นข้อมูลโรงงานของคุณในระบบเดียว",
  body = "บอกเราเกี่ยวกับโรงงาน ข้อมูลที่มีอยู่ และเป้าหมายที่ต้องการ ทีมงานจะติดต่อกลับเพื่อนัดสาธิตระบบ",
}: { title?: string; body?: string }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
          <p className="mt-3 text-white/80">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 bg-white px-5 text-primary hover:bg-white/90">
            <Link href="/contact">ขอเดโม</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 border-white/40 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
