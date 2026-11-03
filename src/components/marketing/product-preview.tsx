import { AlertTriangle, ArrowDownRight, ArrowUpRight, Droplets, Factory, Leaf, Zap } from "lucide-react";

// Illustrative values only. The figure is captioned as a sample screen, never presented as customer data.
const TILES = [
  { icon: Zap, label: "ไฟฟ้า", value: "48,210", unit: "kWh", delta: "-3.1%", down: true },
  { icon: Droplets, label: "น้ำ", value: "1,846", unit: "m³", delta: "+1.4%", down: false },
  { icon: Leaf, label: "คาร์บอน", value: "24.1", unit: "tCO₂e", delta: "-2.7%", down: true },
];
const BARS = [62, 58, 66, 71, 64, 40, 36, 60, 63, 92, 65, 61, 38, 35];
const ALERTS = [
  { where: "เครื่องอัดอากาศ CP-02", what: "ไฟฟ้าสูงกว่าค่าเฉลี่ย 34%", level: "เฝ้าระวัง" },
  { where: "จุดวัดน้ำ อาคาร B", what: "ยังไม่มีการบันทึกวันนี้", level: "ติดตาม" },
];

export function ProductPreview() {
  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-xl border bg-card" aria-hidden>
        <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#cdd6d0]" />
            <span className="size-2.5 rounded-full bg-[#cdd6d0]" />
            <span className="size-2.5 rounded-full bg-[#cdd6d0]" />
          </div>
          <div className="flex-1 truncate rounded-md border bg-card px-3 py-1 text-[11px] text-muted-foreground">
            greenfactory / manager / ภาพรวม
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr]">
          <div className="hidden w-36 flex-col gap-1 bg-[#062e22] p-3 text-[11px] text-white/70 sm:flex">
            <span className="mb-2 flex items-center gap-1.5 font-semibold text-white">
              <Factory className="size-3.5 text-brand-lime" /> โรงงาน 1
            </span>
            {["ภาพรวม", "ทรัพยากร", "คาร์บอน", "การแจ้งเตือน", "รายงาน", "G-FAY"].map((x, i) => (
              <span key={x} className={i === 0 ? "rounded bg-white/10 px-2 py-1 text-white" : "px-2 py-1"}>{x}</span>
            ))}
          </div>
          <div className="min-w-0 space-y-3 p-3 sm:p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">ภาพรวมเดือนนี้</p>
              <p className="text-[11px] text-muted-foreground">1–14 พ.ย.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TILES.map(({ icon: Icon, label, value, unit, delta, down }) => (
                <div key={label} className="rounded-lg border p-2.5">
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Icon className="size-3" /> {label}
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums sm:text-lg">
                    {value} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
                  </p>
                  <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums">
                    {down ? <ArrowDownRight className="size-3 text-status-good" /> : <ArrowUpRight className="size-3 text-status-serious" />}
                    {delta}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[11px] font-medium">ไฟฟ้ารายวัน (kWh)</p>
              <div className="mt-3 flex h-24 items-end gap-1 border-b">
                {BARS.map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-[3px] bg-[#2a78d6]" style={{ height: `${h}%`, opacity: i === 9 ? 1 : 0.75 }} />
                ))}
              </div>
            </div>
            <ul className="divide-y rounded-lg border text-[11px]">
              {ALERTS.map((a) => (
                <li key={a.where} className="flex items-center gap-2 px-3 py-2">
                  <AlertTriangle className="size-3.5 shrink-0 text-status-warning" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{a.where}</span> · <span className="text-muted-foreground">{a.what}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#fff4dc] px-2 py-0.5 text-[10px] font-medium text-[#7a5200]">{a.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">
        ตัวอย่างหน้าจอ · ตัวเลขเป็นข้อมูลสมมติเพื่อแสดงรูปแบบการทำงาน
      </figcaption>
    </figure>
  );
}
