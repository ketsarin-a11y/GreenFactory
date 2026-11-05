import type { ReactNode } from "react";

/** Plain long-form text page (privacy, terms). */
export function ProsePage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">ปรับปรุงล่าสุด {updated}</p>
      <div className="mt-10 space-y-8 leading-relaxed text-foreground/90 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
