import { cn } from "@/lib/utils";

/** Resource types in the seeded master data, with the unit each is recorded in. */
const METERS = [
  ["ไฟฟ้า", "kWh"], ["ไฟฟ้าโซลาร์", "kWh"], ["น้ำประปา", "m³"], ["น้ำ DI", "m³"], ["ลมอัด", "m³"],
  ["ไอน้ำ", "kg"], ["ก๊าซ LPG", "kg"], ["ก๊าซธรรมชาติ", "m³"], ["น้ำมันดีเซล", "L"], ["ไนโตรเจน", "m³"],
] as const;

export function MeterList({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="ประเภทมิเตอร์ที่บันทึกได้">
      {METERS.map(([name, unit]) => (
        <li key={name} className="inline-flex h-9 items-center gap-2 rounded-md border bg-background pr-1 pl-3 text-sm">
          {name}
          <span className="rounded-[5px] border bg-card px-1.5 font-display text-xs leading-5 text-muted-foreground">{unit}</span>
        </li>
      ))}
      <li className="inline-flex h-9 items-center px-1 text-sm text-muted-foreground">และประเภทอื่นที่ตั้งเพิ่มได้</li>
    </ul>
  );
}

export function Points({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[15px] leading-relaxed">
          <span className="mt-[9px] size-1.5 shrink-0 rounded-[1px] bg-primary" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Same request the company sensors page shows after issuing a token (token and host are placeholders). */
export const INGEST_CURL = `curl -X POST \\
  https://<โดเมนของคุณ>/api/ingest/readings \\
  -H "Authorization: Bearer <token ของเซนเซอร์>" \\
  -H "Content-Type: application/json" \\
  -d '{"value": 42.1, "unit": "KW"}'`;

export function CodeBlock({ code, label, className }: { code: string; label: string; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-[10px] bg-[#0d1512] text-[#dfe9e3] ring-1 ring-border", className)}>
      <figcaption className="border-b border-white/10 px-4 py-2 text-xs text-white/60">{label}</figcaption>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <p className="border-t border-white/10 px-4 py-2 text-xs text-white/60">ระบบตอบ 202 เมื่อรับค่าแล้ว ส่งหลายค่าพร้อมกันได้ด้วย {`{"readings": [...]}`}</p>
    </figure>
  );
}
