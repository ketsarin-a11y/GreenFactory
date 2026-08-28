import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Database,
  Factory,
  RadioTower,
} from "lucide-react";

import DashboardMockup from "@/components/common/DashboardMockup";

const dataSources = [
  {
    label: "Sensor",
    icon: RadioTower,
  },
  {
    label: "Machine",
    icon: Factory,
  },
  {
    label: "Department",
    icon: Building2,
  },
  {
    label: "Central Data",
    icon: Database,
  },
];

export default function FeaturesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f8f4] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 lg:px-12 lg:pb-32 lg:pt-40 xl:px-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,#fbfcf9_0%,#f7f8f4_65%,#f1f4ef_100%)]" />

      <div className="pointer-events-none absolute -left-44 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#dbe9dd]/80 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-220px] top-0 -z-10 h-[620px] w-[620px] rounded-full bg-[#dbe6df]/75 blur-[150px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="mx-auto max-w-[1480px]">
        {/* Intro */}
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-end lg:gap-14">
          <div className="max-w-[650px]">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#4d775a]">
              <span className="h-px w-9 bg-[#4d775a]" />
              Solutions
            </div>

            <h1 className="mt-7 text-[clamp(3.1rem,6vw,6.6rem)] font-medium leading-[0.98] tracking-[-0.06em] text-[#19271e]">
              ทุกข้อมูลสำคัญ
              <span className="block">ของโรงงาน</span>
              <span className="block text-[#497458]">
                ในแพลตฟอร์มเดียว
              </span>
            </h1>
          </div>

          <div className="max-w-[580px] lg:justify-self-end lg:pb-2">
            <p className="text-[15px] font-light leading-8 text-[#66736b] sm:text-[16px] sm:leading-9">
              ติดตามพลังงาน คาร์บอน ทรัพยากร และข้อมูลจากกระบวนการผลิต
              เพื่อให้ผู้ปฏิบัติงานและผู้บริหารมองเห็นข้อมูลชุดเดียวกัน
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#solutions"
                className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#386849] px-7 py-3.5 text-[13px] font-medium text-white shadow-[0_16px_35px_rgba(43,91,59,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f5b3f]"
              >
                สำรวจแพลตฟอร์ม

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#263d2d]/15 bg-white/65 px-7 py-3.5 text-[13px] font-medium text-[#2d3d32] backdrop-blur-xl transition duration-300 hover:border-[#477257]/35 hover:bg-white hover:text-[#386849]"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>

        {/* Data flow */}
        <div className="mt-12 border-y border-[#273d2e]/10 py-5 sm:mt-14">
          <div className="flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dataSources.map((source, index) => {
              const Icon = source.icon;

              return (
                <div
                  key={source.label}
                  className="flex shrink-0 items-center gap-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4b7759]/15 bg-white/70 text-[#4c775a]">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>

                  <span className="text-[11px] font-medium tracking-[0.03em] text-[#627068]">
                    {source.label}
                  </span>

                  {index !== dataSources.length - 1 && (
                    <ArrowRight
                      className="ml-4 h-3.5 w-3.5 text-[#9ba59e]"
                      strokeWidth={1.4}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard */}
        <div className="relative mt-12 sm:mt-16">
          <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[65%] w-[72%] -translate-x-1/2 rounded-full bg-[#86ac90]/15 blur-[90px]" />

          <DashboardMockup variant="overview" />
        </div>

        {/* Bottom summary */}
        <div className="mt-10 grid gap-5 border-t border-[#283e2f]/10 pt-7 sm:grid-cols-3 lg:mt-14">
          <div>
            <p className="text-[25px] font-medium tracking-[-0.045em] text-[#26382d]">
              01
            </p>

            <p className="mt-2 text-[12px] font-medium text-[#435248]">
              รวบรวมข้อมูล
            </p>

            <p className="mt-2 max-w-[300px] text-[11px] font-light leading-5 text-[#7c8780]">
              จากบุคลากร เครื่องจักร เซนเซอร์ และกระบวนการภายในองค์กร
            </p>
          </div>

          <div>
            <p className="text-[25px] font-medium tracking-[-0.045em] text-[#26382d]">
              02
            </p>

            <p className="mt-2 text-[12px] font-medium text-[#435248]">
              วิเคราะห์ข้อมูล
            </p>

            <p className="mt-2 max-w-[300px] text-[11px] font-light leading-5 text-[#7c8780]">
              เปรียบเทียบแนวโน้ม ตรวจจับความผิดปกติ และประเมินผลลัพธ์
            </p>
          </div>

          <div>
            <p className="text-[25px] font-medium tracking-[-0.045em] text-[#26382d]">
              03
            </p>

            <p className="mt-2 text-[12px] font-medium text-[#435248]">
              สนับสนุนการตัดสินใจ
            </p>

            <p className="mt-2 max-w-[300px] text-[11px] font-light leading-5 text-[#7c8780]">
              สรุปข้อมูลที่เหมาะสมสำหรับผู้ปฏิบัติงาน ผู้จัดการ และผู้บริหาร
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}