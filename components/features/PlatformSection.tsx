import {
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  Factory,
  Leaf,
  RadioTower,
} from "lucide-react";

const flow = [
  {
    icon: RadioTower,
    title: "เซนเซอร์",
    description: "รับข้อมูลจากหน้างาน",
  },
  {
    icon: Factory,
    title: "เครื่องจักร",
    description: "เชื่อมโยงสายการผลิต",
  },
  {
    icon: Database,
    title: "ข้อมูลทรัพยากร",
    description: "พลังงาน น้ำ และของเสีย",
  },
  {
    icon: Leaf,
    title: "การคำนวณคาร์บอน",
    description: "ประมวลผลโดยอัตโนมัติ",
  },
  {
    icon: Bot,
    title: "การวิเคราะห์",
    description: "ค้นหาโอกาสในการปรับปรุง",
  },
  {
    icon: BarChart3,
    title: "แดชบอร์ด",
    description: "สรุปข้อมูลเพื่อการตัดสินใจ",
  },
];

const platformStats = [
  {
    value: "128",
    label: "เซนเซอร์",
  },
  {
    value: "42",
    label: "เครื่องจักร",
  },
  {
    value: "18",
    label: "หน่วยงาน",
  },
  {
    value: "24/7",
    label: "การติดตามข้อมูล",
  },
];

export default function PlatformSection() {
  return (
    <section
      id="platform"
      className="relative scroll-mt-[148px] overflow-hidden bg-[#13231a] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(70,120,82,0.22),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[460px] w-[460px] rounded-full bg-[#497a58]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8ec49a] sm:text-[11px]">
            One connected platform
          </p>

          <h2 className="mt-5 text-[clamp(2.6rem,5vw,5.4rem)] font-medium leading-[1.04] tracking-[-0.055em] text-white">
            จากข้อมูลหน้างาน
            <span className="block text-[#91c79d]">
              สู่ภาพรวมของทั้งองค์กร
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-[620px] text-[14px] font-light leading-8 text-white/60 sm:text-[15px]">
            GreenFactory Insight เชื่อมต่อข้อมูลจากเซนเซอร์ เครื่องจักร
            และผู้ปฏิบัติงาน ก่อนนำมาประมวลผลเป็นข้อมูลที่พร้อมใช้งาน
            สำหรับการติดตาม วิเคราะห์ และตัดสินใจ
          </p>
        </div>

        {/* Flow */}
        <div className="mt-14 sm:mt-16 lg:mt-20">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-6 lg:gap-3">
            {flow.map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="relative">
                  <article className="group flex min-h-[180px] flex-col rounded-[22px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition duration-300 hover:border-[#8fc89e]/30 hover:bg-white/[0.075] sm:min-h-[200px] sm:p-6 lg:min-h-[230px]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.06] bg-[#1f3d2c] text-[#9ed4aa]">
                        <Icon
                          className="h-5 w-5"
                          strokeWidth={1.5}
                        />
                      </span>

                      <span className="text-[9px] font-medium tracking-[0.14em] text-white/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-auto pt-8">
                      <h3 className="text-[16px] font-medium leading-6 text-white sm:text-[17px]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-[11px] font-light leading-5 text-white/45">
                        {item.description}
                      </p>
                    </div>
                  </article>

                  {index !== flow.length - 1 && (
                    <div className="pointer-events-none absolute left-full top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#183021] text-[#83b990]">
                        <ArrowRight
                          className="h-3.5 w-3.5"
                          strokeWidth={1.5}
                        />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform summary */}
        <div className="mt-16 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl sm:mt-20 sm:rounded-[32px] lg:mt-24">
          <div className="grid lg:grid-cols-[1fr_420px]">
            {/* Content */}
            <div className="border-b border-white/10 px-6 py-10 sm:px-9 sm:py-12 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#8ec49a]">
                Enterprise platform
              </p>

              <h3 className="mt-5 max-w-[680px] text-[clamp(2.2rem,3.8vw,4.2rem)] font-medium leading-[1.07] tracking-[-0.05em] text-white">
                ข้อมูลชุดเดียว
                <span className="block text-[#8fc89e]">
                  สำหรับทุกระดับขององค์กร
                </span>
              </h3>

              <p className="mt-6 max-w-[640px] text-[13px] font-light leading-7 text-white/55 sm:text-[14px] sm:leading-8">
                ผู้ปฏิบัติงานสามารถบันทึกและตรวจสอบข้อมูล
                ผู้จัดการสามารถติดตามผลการดำเนินงาน
                และผู้บริหารสามารถเห็นภาพรวมจากข้อมูลชุดเดียวกัน
                ช่วยลดความซ้ำซ้อนและความคลาดเคลื่อนระหว่างหน่วยงาน
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "ข้อมูลจากหน้างาน",
                  "การอนุมัติ",
                  "การแจ้งเตือน",
                  "รายงานสำหรับผู้บริหาร",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 text-[10px] font-light text-white/45"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#83b58f]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 bg-black/[0.04]">
              {platformStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex min-h-[150px] flex-col justify-between p-6 sm:min-h-[170px] sm:p-7 ${
                    index % 2 === 0 ? "border-r border-white/10" : ""
                  } ${index < 2 ? "border-b border-white/10" : ""}`}
                >
                  <p className="text-[30px] font-medium tracking-[-0.045em] text-white sm:text-[34px]">
                    {stat.value}
                  </p>

                  <p className="text-[10px] font-light leading-5 text-white/42">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[620px] text-[11px] font-light leading-6 text-white/40">
            ตัวเลขบนหน้านี้เป็นข้อมูลตัวอย่างสำหรับแสดงรูปแบบการทำงานของระบบ
            และสามารถเปลี่ยนแปลงได้ตามข้อมูลจริงของแต่ละองค์กร
          </p>

          <a
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-medium text-[#9acda4]"
          >
            พูดคุยเกี่ยวกับองค์กรของคุณ

            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}