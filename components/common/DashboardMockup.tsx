import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  CircleAlert,
  Droplets,
  Factory,
  FileBarChart,
  Gauge,
  Leaf,
  Search,
  Settings,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";

type DashboardVariant =
  | "overview"
  | "energy"
  | "carbon"
  | "water"
  | "ai";

type DashboardMockupProps = {
  variant?: DashboardVariant;
  className?: string;
};

type DashboardContent = {
  eyebrow: string;
  title: string;
  period: string;
  primaryMetric: {
    label: string;
    value: string;
    unit: string;
    change: string;
    positive: boolean;
  };
  secondaryMetrics: Array<{
    label: string;
    value: string;
    unit?: string;
    icon: LucideIcon;
  }>;
  chartLabel: string;
  chartValue: string;
  chartUnit: string;
  bars: number[];
  target: number;
  targetLabel: string;
  targetValue: string;
  insightTitle: string;
  insightDescription: string;
  insightValue: string;
  insightUnit: string;
  insightIcon: LucideIcon;
};

const dashboardData: Record<DashboardVariant, DashboardContent> = {
  overview: {
    eyebrow: "Executive overview",
    title: "ภาพรวมการดำเนินงาน",
    period: "เดือนปัจจุบัน",
    primaryMetric: {
      label: "การใช้พลังงานรวม",
      value: "352,120",
      unit: "kWh",
      change: "ลดลง 8.4%",
      positive: true,
    },
    secondaryMetrics: [
      {
        label: "คาร์บอน",
        value: "1,256",
        unit: "tCO₂e",
        icon: Leaf,
      },
      {
        label: "การใช้น้ำ",
        value: "12,560",
        unit: "m³",
        icon: Droplets,
      },
      {
        label: "เครื่องจักร",
        value: "96.8",
        unit: "%",
        icon: Factory,
      },
    ],
    chartLabel: "แนวโน้มการใช้พลังงาน",
    chartValue: "352,120",
    chartUnit: "kWh",
    bars: [46, 54, 50, 63, 58, 70, 67, 77, 72, 84, 79, 91],
    target: 76,
    targetLabel: "ประสิทธิภาพเทียบเป้าหมาย",
    targetValue: "76%",
    insightTitle: "โอกาสลดการใช้พลังงาน",
    insightDescription:
      "สายการผลิตที่ 2 ใช้พลังงานสูงกว่าค่าเฉลี่ยในช่วงกะกลางคืน",
    insightValue: "128,000",
    insightUnit: "บาท/ปี",
    insightIcon: Bot,
  },

  energy: {
    eyebrow: "Energy management",
    title: "การจัดการพลังงาน",
    period: "ข้อมูลวันนี้",
    primaryMetric: {
      label: "การใช้พลังงาน",
      value: "128,420",
      unit: "kWh",
      change: "ลดลง 12.6%",
      positive: true,
    },
    secondaryMetrics: [
      {
        label: "โหลดสูงสุด",
        value: "842",
        unit: "kW",
        icon: Gauge,
      },
      {
        label: "ค่าใช้จ่าย",
        value: "418K",
        unit: "บาท",
        icon: BarChart3,
      },
      {
        label: "สถานะ",
        value: "ปกติ",
        icon: Activity,
      },
    ],
    chartLabel: "พลังงานแยกตามช่วงเวลา",
    chartValue: "128,420",
    chartUnit: "kWh",
    bars: [35, 48, 42, 59, 55, 74, 69, 83, 76, 88, 81, 94],
    target: 82,
    targetLabel: "ประสิทธิภาพการใช้พลังงาน",
    targetValue: "82%",
    insightTitle: "การใช้พลังงานผิดปกติ",
    insightDescription:
      "เครื่องจักร SMT-04 มีการใช้พลังงานสูงกว่าค่าเฉลี่ย 14%",
    insightValue: "14",
    insightUnit: "% สูงกว่าค่าเฉลี่ย",
    insightIcon: Zap,
  },

  carbon: {
    eyebrow: "Carbon management",
    title: "การจัดการคาร์บอน",
    period: "ปีปัจจุบัน",
    primaryMetric: {
      label: "การปล่อยคาร์บอนรวม",
      value: "1,256",
      unit: "tCO₂e",
      change: "ลดลง 6.8%",
      positive: true,
    },
    secondaryMetrics: [
      {
        label: "Scope 1",
        value: "286",
        unit: "tCO₂e",
        icon: Factory,
      },
      {
        label: "Scope 2",
        value: "815",
        unit: "tCO₂e",
        icon: Zap,
      },
      {
        label: "Scope 3",
        value: "155",
        unit: "tCO₂e",
        icon: Leaf,
      },
    ],
    chartLabel: "แนวโน้มการปล่อยคาร์บอน",
    chartValue: "1,256",
    chartUnit: "tCO₂e",
    bars: [89, 84, 82, 78, 76, 72, 69, 66, 62, 59, 55, 51],
    target: 68,
    targetLabel: "ความคืบหน้าเป้าหมาย",
    targetValue: "68%",
    insightTitle: "แหล่งการปล่อยหลัก",
    insightDescription:
      "ไฟฟ้าที่ใช้ในสายการผลิตคิดเป็น 64% ของการปล่อยทั้งหมด",
    insightValue: "64",
    insightUnit: "% จากไฟฟ้า",
    insightIcon: Leaf,
  },

  water: {
    eyebrow: "Resource management",
    title: "การจัดการน้ำและทรัพยากร",
    period: "เดือนปัจจุบัน",
    primaryMetric: {
      label: "ปริมาณการใช้น้ำ",
      value: "12,560",
      unit: "m³",
      change: "ลดลง 4.2%",
      positive: true,
    },
    secondaryMetrics: [
      {
        label: "น้ำต่อหน่วยผลิต",
        value: "1.42",
        unit: "m³",
        icon: Droplets,
      },
      {
        label: "น้ำกลับมาใช้ซ้ำ",
        value: "38",
        unit: "%",
        icon: Activity,
      },
      {
        label: "ของเสีย",
        value: "8.4",
        unit: "ตัน",
        icon: Factory,
      },
    ],
    chartLabel: "แนวโน้มการใช้น้ำ",
    chartValue: "12,560",
    chartUnit: "m³",
    bars: [72, 66, 69, 61, 58, 56, 52, 49, 46, 43, 40, 38],
    target: 74,
    targetLabel: "ประสิทธิภาพการใช้ทรัพยากร",
    targetValue: "74%",
    insightTitle: "จุดที่ควรตรวจสอบ",
    insightDescription:
      "พื้นที่ล้างชิ้นงานมีการใช้น้ำสูงขึ้นต่อเนื่องเป็นเวลา 3 วัน",
    insightValue: "18",
    insightUnit: "% เพิ่มขึ้น",
    insightIcon: Droplets,
  },

  ai: {
    eyebrow: "AI recommendations",
    title: "การวิเคราะห์และคำแนะนำ",
    period: "อัปเดตล่าสุด",
    primaryMetric: {
      label: "คำแนะนำทั้งหมด",
      value: "24",
      unit: "รายการ",
      change: "ดำเนินการแล้ว 18",
      positive: true,
    },
    secondaryMetrics: [
      {
        label: "ความสำคัญสูง",
        value: "5",
        unit: "รายการ",
        icon: CircleAlert,
      },
      {
        label: "ประหยัดต้นทุน",
        value: "145K",
        unit: "บาท",
        icon: TrendingDown,
      },
      {
        label: "ลดคาร์บอน",
        value: "38.6",
        unit: "tCO₂e",
        icon: Leaf,
      },
    ],
    chartLabel: "ผลลัพธ์จากคำแนะนำ",
    chartValue: "18",
    chartUnit: "ดำเนินการแล้ว",
    bars: [22, 31, 27, 43, 38, 52, 47, 64, 59, 72, 68, 81],
    target: 75,
    targetLabel: "อัตราการดำเนินการ",
    targetValue: "75%",
    insightTitle: "คำแนะนำลำดับแรก",
    insightDescription:
      "ปรับตารางการทำงานของเครื่อง Chiller ให้สอดคล้องกับช่วงโหลดสูงสุด",
    insightValue: "72,000",
    insightUnit: "บาท/ปี",
    insightIcon: Bot,
  },
};

const sidebarItems = [
  {
    icon: Activity,
    label: "ภาพรวม",
  },
  {
    icon: Zap,
    label: "พลังงาน",
  },
  {
    icon: Leaf,
    label: "คาร์บอน",
  },
  {
    icon: Factory,
    label: "โรงงาน",
  },
  {
    icon: FileBarChart,
    label: "รายงาน",
  },
];

const monthLabels = ["ม.ค.", "มี.ค.", "พ.ค.", "ก.ค.", "ก.ย.", "ธ.ค."];

export default function DashboardMockup({
  variant = "overview",
  className = "",
}: DashboardMockupProps) {
  const content = dashboardData[variant];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[48px] bg-[#83ab8d]/15 blur-[55px]" />

      {/* Browser frame */}
      <div className="overflow-hidden rounded-[22px] border border-[#1f3828]/10 bg-white shadow-[0_30px_90px_rgba(21,45,29,0.16)] sm:rounded-[28px]">
        {/* Browser toolbar */}
        <div className="flex h-11 items-center justify-between border-b border-[#253a2b]/[0.07] bg-[#fafbf8] px-4 sm:h-12 sm:px-5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#c7cec8]" />
            <span className="h-2 w-2 rounded-full bg-[#d6dcd7]" />
            <span className="h-2 w-2 rounded-full bg-[#e2e6e2]" />
          </div>

          <div className="hidden h-6 min-w-[220px] items-center justify-center rounded-full border border-[#243a2b]/[0.06] bg-white px-5 text-[8px] tracking-[0.08em] text-[#99a29b] sm:flex">
            app.greenfactory-insight.com
          </div>

          <div className="h-6 w-12 rounded-full bg-[#edf2ec]" />
        </div>

        <div className="flex min-h-[580px] sm:min-h-[620px]">
          {/* Desktop sidebar */}
          <aside className="hidden w-[84px] shrink-0 flex-col bg-[#1c3325] px-3 py-5 sm:flex lg:w-[92px]">
            <div className="flex h-11 w-11 self-center items-center justify-center rounded-[15px] border border-white/10 bg-white/10 text-white">
              <Leaf className="h-5 w-5" strokeWidth={1.5} />
            </div>

            <nav className="mt-10 flex flex-1 flex-col items-center gap-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={item.label}
                    className={`group flex h-11 w-11 items-center justify-center rounded-[14px] transition duration-300 ${
                      index === 0
                        ? "bg-white text-[#315d40] shadow-sm"
                        : "text-white/48 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.45} />
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              aria-label="ตั้งค่า"
              className="flex h-11 w-11 self-center items-center justify-center rounded-[14px] text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.45} />
            </button>
          </aside>

          {/* Main dashboard */}
          <div className="min-w-0 flex-1 bg-[#f5f7f3]">
            {/* Dashboard header */}
            <header className="flex min-h-[72px] items-center justify-between border-b border-[#263c2d]/[0.06] bg-white px-4 sm:min-h-[78px] sm:px-6 lg:px-7">
              <div className="min-w-0">
                <p className="truncate text-[8px] font-semibold uppercase tracking-[0.2em] text-[#6e8975] sm:text-[9px]">
                  {content.eyebrow}
                </p>

                <h3 className="mt-1.5 truncate text-[14px] font-medium tracking-[-0.02em] text-[#26372d] sm:text-[16px]">
                  {content.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="เลือกช่วงเวลา"
                  className="hidden h-9 items-center gap-2 rounded-full border border-[#263d2d]/10 bg-white px-3 text-[9px] text-[#68756c] sm:flex"
                >
                  {content.period}
                  <ChevronDown className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  aria-label="ค้นหา"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#263d2d]/10 bg-white text-[#65736a]"
                >
                  <Search className="h-4 w-4" strokeWidth={1.45} />
                </button>

                <button
                  type="button"
                  aria-label="การแจ้งเตือน"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-[#263d2d]/10 bg-white text-[#65736a] xs:flex"
                >
                  <Bell className="h-4 w-4" strokeWidth={1.45} />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#c96e59]" />
                </button>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce9dd] text-[9px] font-semibold text-[#3d684b]">
                  GF
                </span>
              </div>
            </header>

            <div className="p-3 sm:p-5 lg:p-6">
              {/* Main KPI strip */}
              <div className="grid gap-3 lg:grid-cols-[1.25fr_1fr]">
                <section className="relative overflow-hidden rounded-[20px] border border-[#263d2d]/[0.07] bg-[#23422e] p-5 text-white sm:p-6">
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
                  <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/10" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-white/52">
                          {content.primaryMetric.label}
                        </p>

                        <p className="mt-5 text-[30px] font-medium leading-none tracking-[-0.055em] sm:text-[38px]">
                          {content.primaryMetric.value}
                        </p>

                        <p className="mt-2 text-[10px] text-white/48">
                          {content.primaryMetric.unit}
                        </p>
                      </div>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10">
                        {variant === "water" ? (
                          <Droplets className="h-[18px] w-[18px]" strokeWidth={1.45} />
                        ) : variant === "ai" ? (
                          <Bot className="h-[18px] w-[18px]" strokeWidth={1.45} />
                        ) : variant === "carbon" ? (
                          <Leaf className="h-[18px] w-[18px]" strokeWidth={1.45} />
                        ) : (
                          <Zap className="h-[18px] w-[18px]" strokeWidth={1.45} />
                        )}
                      </span>
                    </div>

                    <div className="mt-7 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] ${
                          content.primaryMetric.positive
                            ? "bg-[#b9ddb9]/15 text-[#cce8ce]"
                            : "bg-[#e5a498]/15 text-[#f2c2ba]"
                        }`}
                      >
                        <TrendingDown className="h-3 w-3" strokeWidth={1.7} />
                        {content.primaryMetric.change}
                      </span>

                      <span className="text-[9px] text-white/42">
                        เทียบช่วงก่อนหน้า
                      </span>
                    </div>
                  </div>
                </section>

                {/* Secondary metrics */}
                <section className="grid grid-cols-3 overflow-hidden rounded-[20px] border border-[#263d2d]/[0.07] bg-white">
                  {content.secondaryMetrics.map((metric, index) => {
                    const Icon = metric.icon;

                    return (
                      <div
                        key={metric.label}
                        className={`min-w-0 p-3 sm:p-4 ${
                          index !== content.secondaryMetrics.length - 1
                            ? "border-r border-[#263d2d]/[0.07]"
                            : ""
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf3ec] text-[#4b7759]">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </span>

                        <p className="mt-5 truncate text-[8px] text-[#879188] sm:text-[9px]">
                          {metric.label}
                        </p>

                        <p className="mt-1 truncate text-[15px] font-medium tracking-[-0.035em] text-[#28382e] sm:text-[18px]">
                          {metric.value}
                        </p>

                        {metric.unit && (
                          <p className="mt-1 truncate text-[8px] text-[#9aa39d]">
                            {metric.unit}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </section>
              </div>

              {/* Main analytics */}
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.45fr_0.75fr]">
                {/* Chart */}
                <section className="rounded-[20px] border border-[#263d2d]/[0.07] bg-white p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium text-[#2c3c32]">
                        {content.chartLabel}
                      </p>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-[20px] font-medium tracking-[-0.045em] text-[#26372d] sm:text-[24px]">
                          {content.chartValue}
                        </span>

                        <span className="text-[8px] text-[#929c95]">
                          {content.chartUnit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[8px] text-[#77847b]">
                      <span className="h-2 w-2 rounded-full bg-[#5e8f6c]" />
                      ปีปัจจุบัน
                    </div>
                  </div>

                  <div className="relative mt-7 h-[150px] sm:h-[175px]">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3].map((line) => (
                        <span
                          key={line}
                          className="block h-px w-full bg-[#263d2d]/[0.055]"
                        />
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
                      {content.bars.map((height, index) => (
                        <div
                          key={`${variant}-${index}`}
                          className="group flex h-full flex-1 items-end"
                        >
                          <div
                            className={`w-full rounded-t-[4px] transition duration-300 group-hover:opacity-100 ${
                              index === content.bars.length - 1
                                ? "bg-[#4d7d5c]"
                                : "bg-[#9bbda3]/62"
                            }`}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-[7px] text-[#9ba59e]">
                    {monthLabels.map((month) => (
                      <span key={month}>{month}</span>
                    ))}
                  </div>
                </section>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {/* Progress */}
                  <section className="rounded-[20px] border border-[#263d2d]/[0.07] bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] text-[#89938c]">
                          {content.targetLabel}
                        </p>

                        <p className="mt-2 text-[22px] font-medium tracking-[-0.04em] text-[#293a30]">
                          {content.targetValue}
                        </p>
                      </div>

                      <Gauge className="h-4 w-4 text-[#64866e]" strokeWidth={1.45} />
                    </div>

                    <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#e9eeea]">
                      <div
                        className="h-full rounded-full bg-[#527f60]"
                        style={{
                          width: `${content.target}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-[7px] text-[#9ba49e]">
                      <span>0%</span>
                      <span>เป้าหมาย 100%</span>
                    </div>
                  </section>

                  {/* Status */}
                  <section className="rounded-[20px] border border-[#263d2d]/[0.07] bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-[#89938c]">
                        สถานะระบบ
                      </p>

                      <span className="flex items-center gap-1.5 text-[8px] text-[#467456]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#5b956c]" />
                        ปกติ
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        {
                          label: "Sensor",
                          value: "128",
                        },
                        {
                          label: "Machine",
                          value: "42",
                        },
                        {
                          label: "Production line",
                          value: "8",
                        },
                      ].map((status) => (
                        <div
                          key={status.label}
                          className="flex items-center justify-between border-b border-[#263d2d]/[0.055] pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-[8px] text-[#7f8a82]">
                            {status.label}
                          </span>

                          <span className="text-[9px] font-medium text-[#34463a]">
                            {status.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Bottom row */}
              <div className="mt-3 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                {/* AI insight */}
                <section className="relative overflow-hidden rounded-[20px] border border-[#35533e]/10 bg-[#eaf1e9] p-4 sm:p-5">
                  <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#769b7f]/12 blur-2xl" />

                  <div className="relative flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#4d795b] shadow-sm">
                      <content.insightIcon
                        className="h-[17px] w-[17px]"
                        strokeWidth={1.5}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] font-medium text-[#2b3e31]">
                          {content.insightTitle}
                        </p>

                        <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-[#557661]">
                          AI Insight
                        </span>
                      </div>

                      <p className="mt-3 text-[9px] leading-5 text-[#68786d]">
                        {content.insightDescription}
                      </p>

                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="text-[18px] font-medium tracking-[-0.035em] text-[#31513b]">
                          {content.insightValue}
                        </span>

                        <span className="text-[8px] text-[#78877d]">
                          {content.insightUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Users */}
                <section className="rounded-[20px] border border-[#263d2d]/[0.07] bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-[#89938c]">
                        ผู้ใช้งานในระบบ
                      </p>

                      <p className="mt-2 text-[20px] font-medium tracking-[-0.04em] text-[#293a30]">
                        128
                      </p>
                    </div>

                    <Users className="h-4 w-4 text-[#64866e]" strokeWidth={1.45} />
                  </div>

                  <div className="mt-5 flex -space-x-2">
                    {["EX", "MG", "OP", "AD"].map((user, index) => (
                      <span
                        key={user}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[6px] font-semibold ${
                          index === 0
                            ? "bg-[#dce9dd] text-[#42674d]"
                            : index === 1
                              ? "bg-[#e8ece4] text-[#667268]"
                              : index === 2
                                ? "bg-[#dfe7e8] text-[#5a6c6e]"
                                : "bg-[#ebe5dc] text-[#746958]"
                        }`}
                      >
                        {user}
                      </span>
                    ))}

                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#263b2d] text-[6px] font-medium text-white">
                      +24
                    </span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-4 flex items-center justify-between px-2">
        <p className="text-[8px] uppercase tracking-[0.18em] text-[#8c978f]">
          GreenFactory Insight
        </p>

        <p className="text-[8px] text-[#9ca59f]">
          Enterprise sustainability platform
        </p>
      </div>
    </div>
  );
}