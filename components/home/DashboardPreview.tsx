import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Database,
  Factory,
  Gauge,
  Leaf,
  RadioTower,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

const dataSources = [
  {
    icon: RadioTower,
    title: "Sensor",
    detail: "ข้อมูลหน้างาน",
    color: "text-[#48d98a]",
    background: "bg-[#48d98a]/10",
  },
  {
    icon: Factory,
    title: "Machine",
    detail: "เครื่องจักร",
    color: "text-[#68a9ff]",
    background: "bg-[#68a9ff]/10",
  },
  {
    icon: Users,
    title: "User",
    detail: "ผู้ใช้งาน",
    color: "text-[#a98cff]",
    background: "bg-[#a98cff]/10",
  },
];

const platformOutputs = [
  {
    icon: Zap,
    label: "Energy",
    color: "text-[#d99a20]",
    background: "bg-[#fff1c9]",
  },
  {
    icon: Leaf,
    label: "Carbon",
    color: "text-[#248159]",
    background: "bg-[#dff5e8]",
  },
  {
    icon: Bot,
    label: "AI Insight",
    color: "text-[#694eb3]",
    background: "bg-[#ede7ff]",
  },
  {
    icon: BarChart3,
    label: "Reports",
    color: "text-[#267fa1]",
    background: "bg-[#dff2fa]",
  },
];

const chartPoints = [
  "0,112",
  "48,102",
  "96,106",
  "144,84",
  "192,90",
  "240,64",
  "288,70",
  "336,43",
  "384,50",
  "432,25",
  "480,34",
  "528,12",
].join(" ");

export default function DashboardPreview() {
  return (
    <section
      id="overview"
      className="relative overflow-hidden bg-[#f5f7f3] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[430px] w-[430px] rounded-full bg-[#ccebd6]/45 blur-[130px]" />

      <div className="pointer-events-none absolute -right-48 bottom-0 h-[520px] w-[520px] rounded-full bg-[#cee1ef]/40 blur-[150px]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#173524_1px,transparent_1px),linear-gradient(90deg,#173524_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative mx-auto max-w-[1380px]">
        {/* Section header */}
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#214532]/10 bg-white/70 px-4 py-2 backdrop-blur-xl">
              <Sparkles
                className="h-3.5 w-3.5 text-[#39805a]"
                strokeWidth={1.7}
              />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#587064]">
                Connected platform
              </span>
            </div>

            <h2 className="mt-6 max-w-[600px] text-[clamp(2.4rem,4vw,4.7rem)] font-medium leading-[1.06] tracking-[-0.055em] text-[#17271e]">
              ข้อมูลจากทุกส่วน
              <span className="block bg-[linear-gradient(90deg,#357650,#45a477_55%,#4d8fc9)] bg-clip-text text-transparent">
                ทำงานร่วมกันในระบบเดียว
              </span>
            </h2>
          </div>

          <div className="max-w-[610px] lg:justify-self-end">
            <p className="text-[14px] font-light leading-8 text-[#68766d] sm:text-[15px]">
              GreenFactory Insight เชื่อมโยงข้อมูลจากเครื่องจักร เซนเซอร์
              และผู้ใช้งาน ก่อนนำมาประมวลผลเป็นข้อมูลด้านพลังงาน คาร์บอน
              และการดำเนินงานที่พร้อมนำไปใช้
            </p>

            <Link
              href="/features"
              className="group mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-[#33714e]"
            >
              สำรวจความสามารถของแพลตฟอร์ม

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Platform flow */}
        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_auto_1.1fr_auto_1.25fr] lg:items-center">
          {/* Data sources */}
          <div className="rounded-[26px] border border-[#1b3b28]/[0.08] bg-white/75 p-5 shadow-[0_18px_50px_rgba(24,58,36,0.07)] backdrop-blur-xl sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#89958e]">
              Data sources
            </p>

            <div className="mt-5 space-y-3">
              {dataSources.map((source) => {
                const Icon = source.icon;

                return (
                  <div
                    key={source.title}
                    className="flex items-center gap-3 rounded-[17px] border border-[#1c3c29]/[0.06] bg-[#f8faf7] p-3.5"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${source.background} ${source.color}`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                    </span>

                    <div>
                      <p className="text-[13px] font-medium text-[#26382e]">
                        {source.title}
                      </p>

                      <p className="mt-1 text-[10px] font-light text-[#849087]">
                        {source.detail}
                      </p>
                    </div>

                    <span className="ml-auto h-2 w-2 rounded-full bg-[#52c67b] shadow-[0_0_12px_rgba(82,198,123,0.48)]" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden items-center justify-center lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a6141]/10 bg-white text-[#40805a] shadow-sm">
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </span>
          </div>

          {/* Central platform */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#0c1813] p-6 text-white shadow-[0_28px_75px_rgba(10,31,19,0.2)] sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(69,226,137,0.24),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(76,145,255,0.17),transparent_42%)]" />

            <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/[0.06]" />
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/[0.06]" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/10 bg-white/[0.07] text-[#6fe89e]">
                  <Database className="h-5 w-5" strokeWidth={1.6} />
                </span>

                <span className="rounded-full border border-[#5ce492]/20 bg-[#5ce492]/10 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.17em] text-[#87edac]">
                  Multi-tenant
                </span>
              </div>

              <p className="mt-7 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#68d995]">
                GreenFactory Insight
              </p>

              <h3 className="mt-3 text-[25px] font-medium leading-[1.25] tracking-[-0.04em]">
                แพลตฟอร์มส่วนกลาง
                <span className="block text-[#84dda5]">
                  ที่แยกข้อมูลของแต่ละองค์กร
                </span>
              </h3>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-[17px] border border-white/[0.08] bg-white/[0.055] p-4">
                  <Building2
                    className="h-4 w-4 text-[#78e2a1]"
                    strokeWidth={1.6}
                  />

                  <p className="mt-4 text-[11px] font-medium text-white/88">
                    Tenant workspace
                  </p>

                  <p className="mt-1.5 text-[9px] font-light leading-5 text-white/38">
                    พื้นที่ทำงานแยกตามองค์กร
                  </p>
                </div>

                <div className="rounded-[17px] border border-white/[0.08] bg-white/[0.055] p-4">
                  <ShieldCheck
                    className="h-4 w-4 text-[#77b7ff]"
                    strokeWidth={1.6}
                  />

                  <p className="mt-4 text-[11px] font-medium text-white/88">
                    Access control
                  </p>

                  <p className="mt-1.5 text-[9px] font-light leading-5 text-white/38">
                    กำหนดสิทธิ์ตามบทบาท
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden items-center justify-center lg:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a6141]/10 bg-white text-[#40805a] shadow-sm">
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </span>
          </div>

          {/* Platform outputs */}
          <div className="rounded-[26px] border border-[#1b3b28]/[0.08] bg-white/75 p-5 shadow-[0_18px_50px_rgba(24,58,36,0.07)] backdrop-blur-xl sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#89958e]">
              Platform outputs
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {platformOutputs.map((output) => {
                const Icon = output.icon;

                return (
                  <div
                    key={output.label}
                    className="rounded-[17px] border border-[#1c3c29]/[0.06] bg-[#f8faf7] p-4"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${output.background} ${output.color}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>

                    <p className="mt-4 text-[11px] font-medium text-[#2d4035]">
                      {output.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mt-16 sm:mt-20">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#76bd8b]/15 blur-[100px]" />

          <div className="relative overflow-hidden rounded-[28px] border border-[#183a26]/10 bg-white shadow-[0_35px_100px_rgba(20,54,32,0.14)] sm:rounded-[34px]">
            {/* Browser top */}
            <div className="flex h-12 items-center justify-between border-b border-[#1d3a29]/[0.07] bg-[#fafbf8] px-4 sm:px-6">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#c9d0ca]" />
                <span className="h-2 w-2 rounded-full bg-[#d9ded9]" />
                <span className="h-2 w-2 rounded-full bg-[#e4e8e4]" />
              </div>

              <div className="hidden h-6 w-[240px] items-center justify-center rounded-full border border-[#1c3b28]/[0.06] bg-white text-[8px] text-[#9aa39d] sm:flex">
                app.greenfactory-insight.com
              </div>

              <div className="h-6 w-12 rounded-full bg-[#edf1ed]" />
            </div>

            <div className="flex min-h-[510px]">
              {/* Sidebar */}
              <aside className="hidden w-[82px] shrink-0 flex-col bg-[#14271d] py-5 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center self-center rounded-[13px] bg-white/10 text-[#72e69d]">
                  <Database className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </div>

                <div className="mt-9 flex flex-1 flex-col items-center gap-2">
                  {[Activity, BarChart3, Factory, Users, Bell].map(
                    (Icon, index) => (
                      <span
                        key={index}
                        className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${
                          index === 0
                            ? "bg-white text-[#285d3d]"
                            : "text-white/38"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    ),
                  )}
                </div>

                <Settings
                  className="mx-auto h-4 w-4 text-white/35"
                  strokeWidth={1.5}
                />
              </aside>

              {/* Main dashboard */}
              <div className="min-w-0 flex-1 bg-[#f4f6f2]">
                <header className="flex min-h-[72px] items-center justify-between border-b border-[#1c3b28]/[0.06] bg-white px-4 sm:px-6">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#72907c]">
                      Executive overview
                    </p>

                    <p className="mt-1.5 text-[14px] font-medium text-[#27382e]">
                      ภาพรวมการดำเนินงาน
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden rounded-full border border-[#1d3b29]/10 bg-white px-3 py-2 text-[8px] text-[#738078] sm:block">
                      เดือนปัจจุบัน
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcebdd] text-[9px] font-semibold text-[#3d684b]">
                      GF
                    </span>
                  </div>
                </header>

                <div className="p-3 sm:p-5">
                  {/* KPI row */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="การใช้พลังงาน"
                      value="128,420"
                      unit="kWh"
                      icon={Zap}
                      change="-12.6%"
                    />

                    <MetricCard
                      label="การปล่อยคาร์บอน"
                      value="1,256"
                      unit="tCO₂e"
                      icon={Leaf}
                      change="-6.8%"
                    />

                    <MetricCard
                      label="เครื่องจักรออนไลน์"
                      value="96.8"
                      unit="%"
                      icon={Gauge}
                      change="สถานะปกติ"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[1.5fr_0.7fr]">
                    {/* Chart */}
                    <div className="rounded-[20px] border border-[#1c3b28]/[0.07] bg-white p-4 sm:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-medium text-[#2b3d32]">
                            แนวโน้มการใช้พลังงาน
                          </p>

                          <p className="mt-1 text-[8px] text-[#919b94]">
                            ข้อมูลย้อนหลัง 12 เดือน
                          </p>
                        </div>

                        <span className="flex items-center gap-1.5 text-[8px] text-[#758078]">
                          <span className="h-2 w-2 rounded-full bg-[#4f9568]" />
                          ปีปัจจุบัน
                        </span>
                      </div>

                      <div className="mt-7 h-[175px]">
                        <svg
                          viewBox="0 0 528 128"
                          className="h-full w-full overflow-visible"
                          preserveAspectRatio="none"
                        >
                          {[24, 56, 88, 120].map((y) => (
                            <line
                              key={y}
                              x1="0"
                              y1={y}
                              x2="528"
                              y2={y}
                              stroke="rgba(28,59,40,0.08)"
                              strokeWidth="1"
                            />
                          ))}

                          <defs>
                            <linearGradient
                              id="chartArea"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#4f9568"
                                stopOpacity="0.28"
                              />
                              <stop
                                offset="100%"
                                stopColor="#4f9568"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          <polygon
                            points={`0,128 ${chartPoints} 528,128`}
                            fill="url(#chartArea)"
                          />

                          <polyline
                            points={chartPoints}
                            fill="none"
                            stroke="#4f9568"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="528"
                            cy="12"
                            r="5"
                            fill="#ffffff"
                            stroke="#4f9568"
                            strokeWidth="3"
                          />
                        </svg>
                      </div>

                      <div className="mt-2 flex justify-between text-[7px] text-[#9ca59f]">
                        <span>ม.ค.</span>
                        <span>มี.ค.</span>
                        <span>พ.ค.</span>
                        <span>ก.ค.</span>
                        <span>ก.ย.</span>
                        <span>ธ.ค.</span>
                      </div>
                    </div>

                    {/* AI summary */}
                    <div className="relative overflow-hidden rounded-[20px] bg-[#173126] p-5 text-white">
                      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#61e397]/15 blur-xl" />

                      <span className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-white/10 text-[#80e9a8]">
                        <Bot className="h-[18px] w-[18px]" strokeWidth={1.6} />
                      </span>

                      <p className="relative mt-7 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80dca1]">
                        AI insight
                      </p>

                      <h3 className="relative mt-3 text-[17px] font-medium leading-6">
                        พบโอกาสลดการใช้พลังงาน
                      </h3>

                      <p className="relative mt-3 text-[10px] font-light leading-5 text-white/45">
                        สายการผลิตที่ 2 ใช้พลังงานสูงกว่าค่าเฉลี่ย
                        ในช่วงกะกลางคืน
                      </p>

                      <div className="relative mt-6 border-t border-white/10 pt-5">
                        <p className="text-[22px] font-medium tracking-[-0.04em] text-[#8fe7ad]">
                          128K
                        </p>

                        <p className="mt-1 text-[8px] text-white/38">
                          บาทต่อปีโดยประมาณ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[9px] font-light leading-5 text-[#8b958f]">
            ตัวเลขและข้อมูลบนหน้าจอเป็นตัวอย่างสำหรับแสดงรูปแบบการทำงานของแพลตฟอร์ม
          </p>
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  unit: string;
  change: string;
  icon: typeof Zap;
};

function MetricCard({
  label,
  value,
  unit,
  change,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-[18px] border border-[#1c3b28]/[0.07] bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5efe5] text-[#417653]">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>

        <span className="rounded-full bg-[#e3f2e6] px-2.5 py-1 text-[8px] font-medium text-[#39724d]">
          {change}
        </span>
      </div>

      <p className="mt-5 text-[9px] text-[#849087]">{label}</p>

      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[20px] font-medium tracking-[-0.04em] text-[#293b30]">
          {value}
        </span>

        <span className="text-[8px] text-[#929c95]">{unit}</span>
      </div>
    </div>
  );
}