import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Droplets,
  Leaf,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    eyebrow: "Energy",
    title: "เห็นการใช้พลังงานชัดขึ้น",
    description:
      "ติดตามการใช้พลังงานตามองค์กร หน่วยงาน สายการผลิต และเครื่องจักร",
    value: "128K",
    unit: "kWh",
    accent: "from-[#f7b84b] to-[#f28f38]",
    iconBackground: "bg-[#fff1d3]",
    iconColor: "text-[#c97812]",
    glow: "bg-[#f5b640]/20",
    href: "/features#energy",
  },
  {
    icon: Leaf,
    eyebrow: "Carbon",
    title: "คำนวณคาร์บอนอย่างเป็นระบบ",
    description:
      "เชื่อมโยงข้อมูลทรัพยากรกับค่าการปล่อย พร้อมตรวจสอบย้อนหลังได้",
    value: "1,256",
    unit: "tCO₂e",
    accent: "from-[#48c47a] to-[#26995d]",
    iconBackground: "bg-[#dcf5e5]",
    iconColor: "text-[#238052]",
    glow: "bg-[#4bc77e]/20",
    href: "/features#carbon",
  },
  {
    icon: Droplets,
    eyebrow: "Resources",
    title: "บริหารน้ำและทรัพยากร",
    description:
      "มองเห็นปริมาณการใช้น้ำ วัตถุดิบ ของเสีย และข้อมูลจากกระบวนการผลิต",
    value: "12.5K",
    unit: "m³",
    accent: "from-[#4fb9db] to-[#308ac1]",
    iconBackground: "bg-[#def3fa]",
    iconColor: "text-[#247fa4]",
    glow: "bg-[#55b9da]/20",
    href: "/features#water",
  },
  {
    icon: Bot,
    eyebrow: "AI Insight",
    title: "เปลี่ยนข้อมูลให้เป็นสิ่งที่ควรทำ",
    description:
      "ค้นหาแนวโน้ม ความผิดปกติ และโอกาสในการลดต้นทุนจากข้อมูลจริง",
    value: "24",
    unit: "คำแนะนำ",
    accent: "from-[#9a7cff] to-[#6f56c6]",
    iconBackground: "bg-[#eee8ff]",
    iconColor: "text-[#6e52b8]",
    glow: "bg-[#8d70e8]/20",
    href: "/features#ai",
  },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-[#08120d] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(71,221,135,0.13),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(77,145,255,0.12),transparent_42%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto max-w-[1380px]">
        {/* Header */}
        <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#69df99]">
              Core capabilities
            </p>

            <h2 className="mt-5 max-w-[620px] text-[clamp(2.5rem,4.3vw,4.8rem)] font-medium leading-[1.06] tracking-[-0.055em] text-white">
              ทุกข้อมูลสำคัญ
              <span className="block bg-[linear-gradient(90deg,#69e69b,#58d4a7_50%,#6daeff)] bg-clip-text text-transparent">
                พร้อมใช้งานในที่เดียว
              </span>
            </h2>
          </div>

          <div className="max-w-[590px] lg:justify-self-end">
            <p className="text-[14px] font-light leading-8 text-white/52 sm:text-[15px]">
              ติดตามพลังงาน คาร์บอน ทรัพยากร และผลการดำเนินงาน
              โดยแต่ละองค์กรมีพื้นที่ข้อมูล ผู้ใช้งาน และสิทธิ์ของตนเอง
            </p>

            <Link
              href="/features"
              className="group mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-[#86e7aa]"
            >
              ดูโซลูชันทั้งหมด

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.065] sm:p-8 ${
                  index === 0 ? "md:row-span-2 md:min-h-[740px]" : ""
                }`}
              >
                {/* Glow */}
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full ${feature.glow} blur-[90px] transition duration-500 group-hover:scale-110`}
                />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-5">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${feature.iconBackground} ${feature.iconColor}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition duration-300 group-hover:bg-white/10 group-hover:text-white">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <div className={index === 0 ? "mt-auto pt-16" : "mt-12"}>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/38">
                      {feature.eyebrow}
                    </p>

                    <h3
                      className={`mt-4 font-medium leading-[1.18] tracking-[-0.04em] text-white ${
                        index === 0
                          ? "text-[clamp(2rem,3.2vw,3.5rem)]"
                          : "text-[25px] sm:text-[28px]"
                      }`}
                    >
                      {feature.title}
                    </h3>

                    <p className="mt-4 max-w-[480px] text-[12px] font-light leading-6 text-white/44 sm:text-[13px] sm:leading-7">
                      {feature.description}
                    </p>

                    <div className="mt-8 border-t border-white/10 pt-6">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`bg-gradient-to-r ${feature.accent} bg-clip-text text-[34px] font-medium tracking-[-0.055em] text-transparent sm:text-[40px]`}
                        >
                          {feature.value}
                        </span>

                        <span className="text-[9px] text-white/36">
                          {feature.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[600px] text-[10px] font-light leading-5 text-white/30">
            ตัวเลขที่แสดงเป็นข้อมูลตัวอย่างสำหรับสื่อสารรูปแบบการทำงานของแพลตฟอร์ม
          </p>

          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/28">
            <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Real-time data visibility
          </div>
        </div>
      </div>
    </section>
  );
}