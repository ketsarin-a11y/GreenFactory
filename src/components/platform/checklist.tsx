import { CheckCircle2, Circle } from "lucide-react";

export function Checklist({ items }: { items: { label: string; done: boolean }[] }) {
  const done = items.filter((i) => i.done).length;
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground tabular">
        เสร็จแล้ว {done} / {items.length}
      </p>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-2">
            {i.done ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0a7d0a] dark:text-status-good" aria-hidden />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={i.done ? "" : "text-muted-foreground"}>
              {i.label}
              <span className="sr-only">{i.done ? " (เสร็จแล้ว)" : " (ยังไม่เสร็จ)"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Label / value rows for info cards. */
export function InfoList({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="mt-0.5 break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
