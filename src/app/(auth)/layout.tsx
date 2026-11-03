import Image from "next/image";
import { Logo } from "@/components/app/logo";
import Link from "next/link";
import { BarChart3, Leaf, ScanLine } from "lucide-react";

const POINTS = [
  { icon: ScanLine, text: "บันทึกมิเตอร์หน้างานด้วย QR Code ในไม่กี่วินาที" },
  { icon: BarChart3, text: "เห็นการใช้ไฟฟ้า น้ำ และเชื้อเพลิงรายวันทั้งโรงงาน" },
  { icon: Leaf, text: "คำนวณคาร์บอนอัตโนมัติจากค่า Emission Factor" },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#062e22] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src="/images/hero-factory.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062e22] via-[#062e22]/70 to-transparent" aria-hidden />
        <Link href="/" className="relative inline-flex w-fit rounded-lg bg-white px-4 py-3">
          <Logo className="w-[180px]" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-semibold">ข้อมูลโรงงานที่ดูง่าย และใช้ตัดสินใจได้จริง</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-white/85">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <Icon className="size-4 text-brand-lime" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs tracking-[0.2em] text-white/50 uppercase">Data drives better decisions</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 inline-flex lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
