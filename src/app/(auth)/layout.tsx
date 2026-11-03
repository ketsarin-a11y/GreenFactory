import Link from "next/link";
import { Logo } from "@/components/app/logo";
import { Nameplate } from "@/components/data/nameplate";

/** Meter dial, QR tag and dashboard bars from plain shapes: the product in one line. */
function Flow() {
  const stroke = "rgb(255 255 255 / 0.55)";
  return (
    <figure className="mt-10">
      <svg viewBox="0 0 420 96" className="w-full max-w-[420px]" role="img" aria-label="อ่านมิเตอร์ สแกน QR แล้วข้อมูลขึ้นแดชบอร์ด">
        {/* meter dial */}
        <circle cx="44" cy="44" r="34" fill="none" stroke={stroke} strokeWidth="2" />
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI * (0.85 + (i / 6) * 1.3);
          return <line key={i} x1={44 + Math.cos(a) * 27} y1={44 + Math.sin(a) * 27} x2={44 + Math.cos(a) * 31} y2={44 + Math.sin(a) * 31} stroke={stroke} strokeWidth="2" />;
        })}
        <line x1="44" y1="44" x2="64" y2="28" stroke="#9ccb12" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="44" r="4" fill="#9ccb12" />
        <line x1="90" y1="44" x2="160" y2="44" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 5" />
        {/* QR tag */}
        <rect x="170" y="12" width="64" height="64" rx="8" fill="none" stroke={stroke} strokeWidth="2" />
        {[[180, 22], [208, 22], [180, 50]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="16" height="16" rx="2" fill="none" stroke="white" strokeWidth="3" />
        ))}
        {[[210, 52], [220, 52], [210, 62], [222, 64], [200, 44]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="white" />
        ))}
        <line x1="244" y1="44" x2="314" y2="44" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 5" />
        {/* dashboard bars */}
        <line x1="324" y1="76" x2="412" y2="76" stroke={stroke} strokeWidth="2" />
        {[34, 48, 28, 56, 40].map((h, i) => (
          <rect key={i} x={330 + i * 16} y={74 - h} width="10" height={h} rx="2" fill={i === 3 ? "#9ccb12" : "rgb(255 255 255 / 0.8)"} />
        ))}
      </svg>
      <figcaption className="mt-3 grid max-w-[420px] grid-cols-3 text-sm text-white/70">
        <span>อ่านมิเตอร์</span>
        <span className="text-center">สแกน QR ที่เครื่อง</span>
        <span className="text-right">เห็นทั้งโรงงาน</span>
      </figcaption>
    </figure>
  );
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden bg-[#062e22] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="inline-flex w-fit rounded-lg bg-white px-4 py-3">
          <Logo className="w-[180px]" />
        </Link>

        <div className="max-w-[460px]">
          <h2 className="font-display text-[2rem] leading-tight font-semibold">จากหน้าปัดมิเตอร์ ถึงตัวเลขคาร์บอนของโรงงาน</h2>

          {/* Readout plate: one illustrative reading and what the system turns it into. */}
          <div className="mt-8 rounded-[14px] border border-white/15 bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-sm">
              <span className="flex items-center gap-2 text-white/80">
                เตาอบรีโฟลว์ SMT 1
                <Nameplate className="border-white/25 bg-transparent text-white/80">RF-01</Nameplate>
              </span>
              <span className="rounded-full border border-white/25 px-2 py-px text-xs text-white/70">ตัวอย่าง</span>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-white/10">
              <div className="px-5 py-5">
                <dt className="text-sm text-white/60">ค่าที่อ่านได้</dt>
                <dd className="mt-2">
                  <span className="font-display text-5xl leading-none font-semibold tracking-tight tabular">571.7</span>
                  <span className="ml-1.5 text-sm text-white/60">kWh</span>
                </dd>
              </div>
              <div className="px-5 py-5">
                <dt className="text-sm text-white/60">คาร์บอนที่คำนวณได้</dt>
                <dd className="mt-2">
                  <span className="font-display text-5xl leading-none font-semibold tracking-tight text-white tabular">0.286</span>
                  <span className="ml-1.5 text-sm text-white/60">tCO₂e</span>
                </dd>
              </div>
            </dl>
          </div>

          <Flow />
        </div>

        <p className="text-sm text-white/50">ตัวอย่างคำนวณด้วยค่า Emission Factor ไฟฟ้า 0.4999 kgCO₂e ต่อ kWh</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex lg:hidden dark:rounded-lg dark:bg-white dark:px-3 dark:py-2">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
