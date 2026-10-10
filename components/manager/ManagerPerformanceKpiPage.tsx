"use client";



import { useRouter } from "next/navigation";



import { useMemo, useState, type ReactNode } from "react";



import {



  Activity,



  ArrowRight,

  Calculator,



  CalendarDays,



  CheckCircle2,

  CircleHelp,



  Droplets,



  Flame,



  Gauge,

  Info,



  Minus,



  RefreshCw,

  Target,



  TrendingDown,



  TrendingUp,



  Wind,

  XCircle,



  Zap,



} from "lucide-react";



import type {



  ManagerAnalyticsFilterOptions,



  ResourceDetailData,



  ResourceMetricFilters,



} from "@/lib/manager queries";



import type { ManagerKpiDashboardData } from "@/lib/manager-kpi-queries";



type Metrics = {



  energy: ResourceDetailData;



  water: ResourceDetailData;



  gas: ResourceDetailData;



  nitrogen: ResourceDetailData;



};



type ResourceRow = {



  name: string;



  description: string;



  metric: ResourceDetailData;



  icon: ReactNode;



  iconClassName: string;



};



type ComparisonStatus = "down" | "stable" | "up" | "unavailable";



export default function ManagerPerformanceKpiPage({



  metrics,



  kpiDashboard,



  filterOptions,



  selectedFilters,



  dateFrom,



  dateTo,



}: {



  metrics: Metrics;



  kpiDashboard: ManagerKpiDashboardData;



  filterOptions: ManagerAnalyticsFilterOptions;



  selectedFilters: ResourceMetricFilters;



  dateFrom: string;



  dateTo: string;



}) {



  const router = useRouter();



  const [from, setFrom] = useState(dateFrom);



  const [to, setTo] = useState(dateTo);



  const [building, setBuilding] = useState(



    selectedFilters.buildingId ? String(selectedFilters.buildingId) : "",



  );



  const [department, setDepartment] = useState(



    selectedFilters.departmentId ? String(selectedFilters.departmentId) : "",



  );



  const [line, setLine] = useState(



    selectedFilters.productionLineId



      ? String(selectedFilters.productionLineId)



      : "",



  );



  const [machine, setMachine] = useState(



    selectedFilters.machineId ? String(selectedFilters.machineId) : "",



  );





  const [showKpiGuide, setShowKpiGuide] = useState(false);

  const [showSimulator, setShowSimulator] = useState(false);

  const [simActual, setSimActual] = useState("4621.74");

  const [simTarget, setSimTarget] = useState("4506");

  const [simOperator, setSimOperator] = useState<"<=" | ">=">("<=");



  const simulation = useMemo(() => {

    const actual = Number(simActual);

    const target = Number(simTarget);



    if (

      !Number.isFinite(actual) ||

      !Number.isFinite(target) ||

      actual < 0 ||

      target < 0

    ) {

      return null;

    }



    const passed = simOperator === "<=" ? actual <= target : actual >= target;

    const variance = actual - target;

    const rawAchievement =

      simOperator === "<="

        ? actual === 0

          ? 100

          : (target / actual) * 100

        : target === 0

          ? 100

          : (actual / target) * 100;



    return {

      passed,

      variance,

      achievement: passed ? 100 : Math.max(0, Math.min(100, rawAchievement)),

    };

  }, [simActual, simOperator, simTarget]);



  const departments = useMemo(



    () =>



      filterOptions.departments.filter(



        (item) => !building || String(item.buildingId) === building,



      ),



    [building, filterOptions.departments],



  );



  const productionLines = useMemo(



    () =>



      filterOptions.productionLines.filter(



        (item) =>



          (!building || String(item.buildingId) === building) &&



          (!department || String(item.departmentId) === department),



      ),



    [building, department, filterOptions.productionLines],



  );



  const machines = useMemo(



    () =>



      filterOptions.machines.filter(



        (item) =>



          (!building || String(item.buildingId) === building) &&



          (!department || String(item.departmentId) === department) &&



          (!line || String(item.lineId) === line),



      ),



    [building, department, line, filterOptions.machines],



  );



  const rows: ResourceRow[] = [



    {



      name: "Electricity",



      description: "พลังงานไฟฟ้า",



      metric: metrics.energy,



      icon: <Zap className="h-5 w-5" />,



      iconClassName: "bg-amber-50 text-amber-700 ring-amber-100",



    },



    {



      name: "Water",



      description: "การใช้น้ำ",



      metric: metrics.water,



      icon: <Droplets className="h-5 w-5" />,



      iconClassName: "bg-sky-50 text-sky-700 ring-sky-100",



    },



    {



      name: "Compressed Air",



      description: "การใช้ลมอัด",



      metric: metrics.gas,



      icon: <Flame className="h-5 w-5" />,



      iconClassName: "bg-orange-50 text-orange-700 ring-orange-100",



    },



    {



      name: "Nitrogen",



      description: "การใช้ไนโตรเจน",



      metric: metrics.nitrogen,



      icon: <Wind className="h-5 w-5" />,



      iconClassName: "bg-violet-50 text-violet-700 ring-violet-100",



    },



  ];



  const decreasedCount = rows.filter(



    (row) => row.metric.changePct !== null && row.metric.changePct < 0,



  ).length;



  const stableCount = rows.filter(



    (row) => row.metric.changePct !== null && row.metric.changePct === 0,



  ).length;



  const increasedCount = rows.filter(



    (row) => row.metric.changePct !== null && row.metric.changePct > 0,



  ).length;



  const highestIncrease = [...rows]
    .filter((row) => row.metric.changePct !== null && row.metric.changePct > 0)
    .sort((a, b) => (b.metric.changePct ?? 0) - (a.metric.changePct ?? 0))[0];



  const invalidDateRange = !from || !to || from > to;



  function applyFilters() {



    if (invalidDateRange) {



      return;



    }



    const query = new URLSearchParams({



      from,



      to,



    });



    if (building) {



      query.set("building", building);



    }



    if (department) {



      query.set("department", department);



    }



    if (line) {



      query.set("line", line);



    }



    if (machine) {



      query.set("machine", machine);



    }



    router.push(`/manager/overview/oee?${query.toString()}`);



  }



  function resetLocationFilters() {



    setBuilding("");



    setDepartment("");



    setLine("");



    setMachine("");



  }



  return (



    <main className="min-h-screen bg-slate-50/70">



      <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">



        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-7">



          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />



          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">



            <div className="max-w-3xl">



              <div className="flex flex-wrap items-center gap-2">



                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white">



                  <Gauge className="h-3.5 w-3.5" />



                  Resource Performance



                </span>



                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">



                  <CheckCircle2 className="h-3.5 w-3.5" />



                  Database Analytics



                </span>



              </div>



              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">



                Operational Resource Performance



              </h1>



              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">



                ติดตามปริมาณการใช้ทรัพยากรจากข้อมูลจริง



                และเปรียบเทียบแนวโน้มกับช่วงเวลาก่อนหน้า



                โดยควรวิเคราะห์ร่วมกับบริบทการผลิตก่อนสรุปด้านประสิทธิภาพ



              </p>



            </div>



            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">



              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">



                <CalendarDays className="h-4 w-4" />



              </span>



              <div>



                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">



                  Selected period



                </p>



                <p className="mt-0.5 text-xs font-bold text-slate-800">



                  {dateFrom} → {dateTo}



                </p>



              </div>



            </div>



          </div>



        </section>



        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">



          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">



            <div>



              <p className="text-sm font-black text-slate-950">



                Analysis Scope



              </p>



              <p className="mt-0.5 text-[11px] text-slate-400">



                เลือกช่วงเวลา อาคาร แผนก สายการผลิต หรือเครื่องจักร



              </p>



            </div>



            <button



              type="button"



              onClick={resetLocationFilters}



              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"



            >



              <RefreshCw className="h-3.5 w-3.5" />



              ล้างตัวกรองพื้นที่



            </button>



          </div>



          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">



            <Field label="FROM">



              <input



                className={inputClassName}



                type="date"



                value={from}



                onChange={(event) => setFrom(event.target.value)}



              />



            </Field>



            <Field label="TO">



              <input



                className={inputClassName}



                type="date"



                value={to}



                onChange={(event) => setTo(event.target.value)}



              />



            </Field>



            <Field label="BUILDING">



              <select



                className={inputClassName}



                value={building}



                onChange={(event) => {



                  setBuilding(event.target.value);



                  setDepartment("");



                  setLine("");



                  setMachine("");



                }}



              >



                <option value="">ทั้งหมด</option>



                {filterOptions.buildings.map((item) => (



                  <option key={item.id} value={item.id}>



                    {item.name}



                  </option>



                ))}



              </select>



            </Field>



            <Field label="DEPARTMENT">



              <select



                className={inputClassName}



                value={department}



                onChange={(event) => {



                  setDepartment(event.target.value);



                  setLine("");



                  setMachine("");



                }}



              >



                <option value="">ทั้งหมด</option>



                {departments.map((item) => (



                  <option key={item.id} value={item.id}>



                    {item.name}



                  </option>



                ))}



              </select>



            </Field>



            <Field label="LINE">



              <select



                className={inputClassName}



                value={line}



                onChange={(event) => {



                  setLine(event.target.value);



                  setMachine("");



                }}



              >



                <option value="">ทั้งหมด</option>



                {productionLines.map((item) => (



                  <option key={item.id} value={item.id}>



                    {item.name}



                  </option>



                ))}



              </select>



            </Field>



            <Field label="MACHINE">



              <select



                className={inputClassName}



                value={machine}



                onChange={(event) => setMachine(event.target.value)}



              >



                <option value="">ทั้งหมด</option>



                {machines.map((item) => (



                  <option key={item.id} value={item.id}>



                    {item.code} · {item.name}



                  </option>



                ))}



              </select>



            </Field>



          </div>



          {invalidDateRange && (



            <p className="mt-3 text-xs font-semibold text-rose-600">



              วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด



            </p>



          )}



          <div className="mt-4 flex justify-end">



            <button



              type="button"



              onClick={applyFilters}



              disabled={invalidDateRange}



              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"



            >



              Apply Analysis



              <ArrowRight className="h-3.5 w-3.5" />



            </button>



          </div>



        </section>





        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">

                  <Target className="h-3.5 w-3.5" />

                  KPI PERFORMANCE

                </span>

                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">

                  ข้อมูล KPI จากฐานข้อมูล

                </span>

              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">

                ภาพรวมผลการดำเนินงานเทียบเป้าหมาย

              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">

                ติดตามค่าการใช้ทรัพยากรจริง เปรียบเทียบกับเป้าหมาย และดูสถานะผลการดำเนินงานในช่วงเวลาที่เลือก

              </p>

            </div>



            <div className="flex flex-wrap gap-2">

              <button

                type="button"

                onClick={() => setShowKpiGuide((value) => !value)}

                className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800 transition hover:bg-emerald-100"

              >

                <CircleHelp className="h-4 w-4" />

                คำอธิบายตัวชี้วัด

              </button>

              <button

                type="button"

                onClick={() => setShowSimulator((value) => !value)}

                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"

              >

                <Calculator className="h-4 w-4" />

                ทดลองประเมิน KPI

              </button>

            </div>

          </div>



          {showKpiGuide && (

            <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                <KpiGuideItem title="Actual" text="ค่าที่เกิดขึ้นจริงในช่วง KPI เช่น ปริมาณไฟฟ้าที่ใช้จริงต่อวัน" />

                <KpiGuideItem title="Target" text="ค่าเป้าหมายที่กำหนดไว้ในตาราง KPI ไม่ได้สร้างขึ้นจากหน้าเว็บ" />

                <KpiGuideItem title="Variance" text="Actual − Target ค่าบวกหมายถึง Actual สูงกว่า Target" />

                <KpiGuideItem title="Achievement" text="เปอร์เซ็นต์ความสำเร็จที่บันทึกอยู่ใน KPIResult" />

              </div>

              <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-slate-500">

                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                สำหรับ KPI แบบ ≤ ค่า Actual ต้องไม่เกิน Target จึงจะ PASS เช่น Electricity ≤ 4,506 kWh

              </p>

            </div>

          )}



          {showSimulator && (

            <div className="border-b border-slate-100 bg-amber-50/60 px-5 py-5">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-end">

                <div className="grid flex-1 gap-3 sm:grid-cols-3">

                  <Field label="ACTUAL">

                    <input className={inputClassName} inputMode="decimal" value={simActual} onChange={(event) => setSimActual(event.target.value)} />

                  </Field>

                  <Field label="OPERATOR">

                    <select className={inputClassName} value={simOperator} onChange={(event) => setSimOperator(event.target.value as "<=" | ">=")}>

                      <option value="<=">≤ ต้องไม่เกิน</option>

                      <option value=">=">≥ ต้องไม่น้อยกว่า</option>

                    </select>

                  </Field>

                  <Field label="TARGET">

                    <input className={inputClassName} inputMode="decimal" value={simTarget} onChange={(event) => setSimTarget(event.target.value)} />

                  </Field>

                </div>



                <div className="min-w-[250px] rounded-2xl border border-amber-200 bg-white px-4 py-3">

                  {simulation ? (

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Simulation result</p>

                        <div className="mt-1 flex items-center gap-2">

                          {simulation.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}

                          <span className={`text-sm font-black ${simulation.passed ? "text-emerald-700" : "text-rose-700"}`}>

                            {simulation.passed ? "PASS" : "FAIL"}

                          </span>

                        </div>

                        <p className="mt-1 text-[10px] text-slate-500">

                          Variance {formatSignedNumber(simulation.variance)}

                        </p>

                      </div>

                      <MiniGauge value={simulation.achievement} />

                    </div>

                  ) : (

                    <p className="text-xs font-bold text-rose-600">กรุณาใส่ตัวเลขตั้งแต่ 0 ขึ้นไป</p>

                  )}

                </div>

              </div>

              <p className="mt-3 text-[10px] font-semibold text-amber-800">

                โหมดทดลองเท่านั้น — ไม่บันทึก ไม่แก้ KPI และไม่แก้ KPIResult ในฐานข้อมูล

              </p>

            </div>

          )}



          {kpiDashboard.definitions.length === 0 ? (

            <div className="px-5 py-8 text-center">

              <Target className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-black text-slate-800">ยังไม่ได้กำหนด KPI</p>

              <p className="mt-1 text-xs text-slate-400">เมื่อมี KPI ที่ Active ระบบจะแสดง Target และผลจริงตรงนี้</p>

            </div>

          ) : (

            <>

              <div className="grid gap-3 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">

                <KpiSummaryCell label="ผลประเมินทั้งหมด" value={String(kpiDashboard.totalResults)} detail="จำนวนผล KPI ในช่วงเวลาที่เลือก" />

                <KpiSummaryCell label="PASS" value={String(kpiDashboard.passed)} detail="ผ่านเป้าหมาย" tone="emerald" />

                <KpiSummaryCell label="FAIL" value={String(kpiDashboard.failed)} detail="ไม่ผ่านเป้าหมาย" tone="rose" />

                <KpiSummaryCell

                  label="อัตราการผ่านเป้าหมาย"

                  value={kpiDashboard.passRate === null ? "—" : `${formatNumber(kpiDashboard.passRate)}%`}

                  detail="สัดส่วนผลที่ผ่านต่อผลที่ประเมินทั้งหมด"

                />

              </div>



              <div className="grid gap-4 p-5 lg:grid-cols-2 xl:grid-cols-4">

                {kpiDashboard.definitions.map((kpi) => (

                  <KpiGaugeCard key={kpi.kpiId} kpi={kpi} />

                ))}

              </div>



              <div className="border-t border-slate-100 px-5 py-4">

                <div className="mb-3 flex items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-black text-slate-900">Daily ผลประเมินทั้งหมด</p>

                    <p className="mt-0.5 text-[10px] text-slate-400">รายละเอียดผล KPI ที่บันทึกไว้ในแต่ละวัน</p>

                  </div>

                  <span className="text-[10px] font-bold text-slate-400">{dateFrom} → {dateTo}</span>

                </div>



                <div className="overflow-x-auto rounded-2xl border border-slate-200">

                  <table className="min-w-full text-left text-xs">

                    <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">

                      <tr>

                        <th className="px-4 py-3">Date</th>

                        <th className="px-4 py-3">KPI</th>

                        <th className="px-4 py-3 text-right">Actual</th>

                        <th className="px-4 py-3 text-right">Target</th>

                        <th className="px-4 py-3 text-right">Variance</th>

                        <th className="px-4 py-3 text-right">Achievement</th>

                        <th className="px-4 py-3 text-center">Status</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">

                      {kpiDashboard.dailyResults.slice(0, 40).map((result) => (

                        <tr key={result.resultId} className="text-slate-600">

                          <td className="whitespace-nowrap px-4 py-3 font-semibold">{result.periodStart}</td>

                          <td className="min-w-[210px] px-4 py-3">

                            <p className="font-black text-slate-800">{result.kpiName}</p>

                            <p className="mt-0.5 text-[9px] text-slate-400">{result.kpiCode}</p>

                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">

                            {formatNumber(result.actualValue)} {result.unit}

                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right">

                            {displayOperator(result.targetOperator)} {formatNumber(result.targetValue)}

                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right">{formatSignedNumber(result.varianceValue)}</td>

                          <td className="whitespace-nowrap px-4 py-3 text-right font-bold">{formatNumber(result.achievementPercent)}%</td>

                          <td className="px-4 py-3 text-center"><KpiStatusBadge status={result.resultStatus} /></td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </>

          )}

        </section>



        <section className="grid gap-4 md:grid-cols-3">



          <SummaryCard



            icon={<TrendingDown className="h-5 w-5" />}



            label="ลดลงจากช่วงก่อน"



            value={`${decreasedCount}/${rows.length}`}



            detail="จำนวนทรัพยากรที่ใช้ลดลง"



            tone="emerald"



          />



          <SummaryCard



            icon={<Minus className="h-5 w-5" />}



            label="คงที่"



            value={`${stableCount}/${rows.length}`}



            detail="จำนวนทรัพยากรที่ไม่เปลี่ยนแปลง"



            tone="slate"



          />



          <SummaryCard



            icon={<TrendingUp className="h-5 w-5" />}



            label="เพิ่มขึ้นจากช่วงก่อน"



            value={`${increasedCount}/${rows.length}`}



            detail="จำนวนทรัพยากรที่ควรตรวจสอบ"



            tone="rose"



          />



        </section>



        {highestIncrease && (



          <section className="flex flex-col gap-4 rounded-[24px] border border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-white p-5 sm:flex-row sm:items-center sm:justify-between">



            <div>



              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-600">



                Attention Point



              </p>



              <p className="mt-1 text-sm font-black text-slate-950">



                {highestIncrease.name} เพิ่มขึ้นสูงสุดในช่วงที่เลือก



              </p>



              <p className="mt-1 text-xs leading-5 text-slate-500">



                ควรตรวจสอบหน่วยงาน เครื่องจักร



                หรือบริบทการผลิตที่อาจทำให้การใช้ทรัพยากรเพิ่มขึ้น



              </p>



            </div>



            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-700">



              <TrendingUp className="h-3.5 w-3.5" />



              {formatChange(highestIncrease.metric.changePct)}



            </span>



          </section>



        )}



        <section>



          <div className="mb-3">



            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">



              Resource Comparison



            </p>



            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">



              ภาพรวมการใช้ทรัพยากร



            </h2>



          </div>



          <div className="grid gap-4 lg:grid-cols-2">



            {rows.map((row) => (



              <ResourceCard key={row.name} row={row} />



            ))}



          </div>



        </section>



        <section className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5">



          <div className="flex gap-3">



            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-200">



              <Activity className="h-4 w-4" />



            </span>



            <div>



              <p className="text-sm font-black text-amber-950">



                Resource Performance ไม่ใช่ OEE มาตรฐาน



              </p>



              <p className="mt-2 text-xs leading-5 text-amber-900/80">



                หน้านี้แสดงปริมาณและแนวโน้มการใช้ทรัพยากร



                การใช้ลดลงไม่ได้หมายความว่าประสิทธิภาพการผลิตดีขึ้นเสมอไป



                เพราะควรวิเคราะห์ร่วมกับปริมาณผลผลิตและข้อมูลการเดินเครื่อง



                หากต้องการคำนวณ OEE จะต้องมี Planned Time, Run Time,



                Ideal Cycle Time และ Good/Reject Count ครบ



              </p>



            </div>



          </div>



        </section>



      </div>



    </main>



  );



}





function KpiGaugeCard({ kpi }: { kpi: ManagerKpiDashboardData["definitions"][number] }) {

  const result = kpi.latestResult;



  return (

    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{kpi.kpiCode}</p>

          <p className="mt-1.5 text-base font-black leading-5 text-slate-900">{kpi.kpiName}</p>

          <p className="mt-1 text-[10px] text-slate-400">

            เป้าหมาย {displayOperator(kpi.targetOperator)} {formatNumber(kpi.targetValue)} {kpi.unit}

          </p>

        </div>

        {result ? (

          <MiniGauge value={result.achievementPercent} />

        ) : (

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-8 border-slate-100 text-[10px] font-black text-slate-400">N/A</div>

        )}

      </div>



      {result ? (

        <>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Actual</p>

              <p className="mt-1 text-base font-black text-slate-900">

                {formatNumber(result.actualValue)}

                <span className="ml-1 text-[10px] text-slate-400">{kpi.unit}</span>

              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">Variance</p>

              <p className="mt-1 text-base font-black text-slate-900">{formatSignedNumber(result.varianceValue)}</p>

            </div>

          </div>

          <div className="mt-3 flex items-center justify-between gap-3">

            <KpiStatusBadge status={result.resultStatus} />

            <span className="text-[10px] font-semibold text-slate-400">ข้อมูลล่าสุด {result.periodStart}</span>

          </div>

        </>

      ) : (

        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-center text-[11px] font-semibold text-slate-400">

          ยังไม่มี KPIResult ในช่วงที่เลือก

        </div>

      )}

    </article>

  );

}



function MiniGauge({ value }: { value: number }) {

  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  const degrees = safeValue * 3.6;



  return (

    <div

      className="relative h-16 w-16 shrink-0 rounded-full"

      style={{ background: `conic-gradient(rgb(15 23 42) ${degrees}deg, rgb(226 232 240) ${degrees}deg)` }}

      aria-label={`Achievement ${safeValue.toFixed(1)} percent`}

    >

      <div className="absolute inset-[7px] flex items-center justify-center rounded-full bg-white">

        <span className="text-[10px] font-black text-slate-800">{formatNumber(safeValue)}%</span>

      </div>

    </div>

  );

}



function KpiStatusBadge({ status }: { status: string }) {

  const pass = status.toUpperCase() === "PASS";



  return (

    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black ring-1 ${

      pass

        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"

        : "bg-rose-50 text-rose-700 ring-rose-100"

    }`}>

      {pass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}

      {status}

    </span>

  );

}



function KpiSummaryCell({

  label,

  value,

  detail,

  tone = "slate",

}: {

  label: string;

  value: string;

  detail: string;

  tone?: "slate" | "emerald" | "rose";

}) {

  const valueClass =

    tone === "emerald"

      ? "text-emerald-700"

      : tone === "rose"

        ? "text-rose-700"

        : "text-slate-950";



  return (

    <div className="bg-white px-5 py-4">

      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>

      <p className={`mt-1 text-2xl font-black tracking-tight ${valueClass}`}>{value}</p>

      <p className="mt-0.5 text-[10px] text-slate-400">{detail}</p>

    </div>

  );

}



function KpiGuideItem({ title, text }: { title: string; text: string }) {

  return (

    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">

      <p className="text-xs font-black text-slate-900">{title}</p>

      <p className="mt-1 text-[10px] leading-5 text-slate-500">{text}</p>

    </div>

  );

}



function displayOperator(value: string) {

  if (value === "<=") return "≤";

  if (value === ">=") return "≥";

  return value;

}



function formatSignedNumber(value: number) {

  const prefix = value > 0 ? "+" : "";

  return `${prefix}${Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 3 })}`;

}



function ResourceCard({ row }: { row: ResourceRow }) {



  const metric = row.metric;



  const status = getComparisonStatus(metric.changePct);



  const statusStyles: Record<ComparisonStatus, string> = {



    down: "bg-emerald-50 text-emerald-700 ring-emerald-100",



    stable: "bg-slate-100 text-slate-700 ring-slate-200",



    up: "bg-rose-50 text-rose-700 ring-rose-100",

    unavailable: "bg-slate-50 text-slate-500 ring-slate-200",

  };



  const statusLabels: Record<ComparisonStatus, string> = {



    down: "ลดลง",



    stable: "คงที่",



    up: "เพิ่มขึ้น",

    unavailable: "ไม่มีข้อมูลเปรียบเทียบ",

  };



  const description =



    status === "down"



      ? "ใช้ทรัพยากรลดลงจากช่วงก่อนหน้า"



      : status === "up"



        ? "ใช้ทรัพยากรเพิ่มขึ้นจากช่วงก่อนหน้า — ควรตรวจสอบสาเหตุ"



        : "การใช้ทรัพยากรไม่เปลี่ยนแปลงจากช่วงก่อนหน้า";



  return (



    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">



      <div className="p-5">



        <div className="flex items-start justify-between gap-4">



          <div className="flex items-center gap-3">



            <span



              className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${row.iconClassName}`}



            >



              {row.icon}



            </span>



            <div>



              <p className="text-sm font-black text-slate-950">{row.name}</p>



              <p className="mt-0.5 text-[10px] text-slate-400">



                {row.description}



              </p>



            </div>



          </div>



          <span



            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${statusStyles[status]}`}



          >



            {status === "down" && <TrendingDown className="h-3 w-3" />}



            {status === "stable" && <Minus className="h-3 w-3" />}



            {status === "up" && <TrendingUp className="h-3 w-3" />}



            {statusLabels[status]}



          </span>



        </div>



        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">



          <div>



            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">



              Current Usage



            </p>



            <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950">



              {formatNumber(metric.total)}



              <span className="ml-2 text-xs font-bold tracking-normal text-slate-400">



                {metric.unit}



              </span>



            </p>



          </div>



          <div className="text-right">



            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">



              Change



            </p>



            <p



              className={`mt-1 text-xl font-black ${



                status === "down"



                  ? "text-emerald-700"



                  : status === "up"



                    ? "text-rose-700"



                    : "text-slate-700"



              }`}



            >



              {formatChange(metric.changePct)}



            </p>



          </div>



        </div>



      </div>



      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">



        <p className="text-[11px] leading-5 text-slate-500">{description}</p>



      </div>



    </article>



  );



}



function SummaryCard({



  icon,



  label,



  value,



  detail,



  tone,



}: {



  icon: ReactNode;



  label: string;



  value: string;



  detail: string;



  tone: "emerald" | "slate" | "rose";



}) {



  const toneStyles = {



    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",



    slate: "bg-slate-100 text-slate-700 ring-slate-200",



    rose: "bg-rose-50 text-rose-700 ring-rose-100",



  };



  return (



    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">



      <span



        className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${toneStyles[tone]}`}



      >



        {icon}



      </span>



      <p className="mt-4 text-xs font-semibold text-slate-500">{label}</p>



      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">



        {value}



      </p>



      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>



    </div>



  );



}



function Field({



  label,



  children,



}: {



  label: string;



  children: ReactNode;



}) {



  return (



    <label>



      <span className="mb-1.5 block text-[9px] font-black tracking-[0.1em] text-slate-400">



        {label}



      </span>



      {children}



    </label>



  );



}



function getComparisonStatus(changePct: number | null): ComparisonStatus {
  if (changePct === null) return "unavailable";



  if (changePct < 0) {



    return "down";



  }



  if (changePct > 0) {



    return "up";



  }



  return "stable";



}



function formatNumber(value: number) {



  return Number(value || 0).toLocaleString("th-TH", {



    maximumFractionDigits: 2,



  });



}



function formatChange(value: number | null) {
  if (value === null) return "—";



  const prefix = value > 0 ? "+" : "";



  return `${prefix}${Number(value || 0).toLocaleString("th-TH", {



    maximumFractionDigits: 1,



  })}%`;



}



const inputClassName =



  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";
