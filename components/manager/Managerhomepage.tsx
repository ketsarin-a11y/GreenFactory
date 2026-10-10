"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GFayMascot from "@/components/manager/GFayMascot";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  ChevronRight,
  Clock3,
  Cpu,
  Database,
  Droplets,
  Flame,
  Gauge,
  Leaf,
  ListChecks,
  QrCode,
  Radio,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import type {
  CarbonFootprintData,
  ManagerResourceDashboard,
} from "@/lib/manager queries";
interface AnalysisContext {
  latestDataAt: string | null;
  rangeStart: string;
  rangeEnd: string;
  dataAgeDays: number;
  isUsingLatestAvailable: boolean;
}
interface ManagerHomePageProps {
  resourceDashboard: ManagerResourceDashboard;
  carbon: CarbonFootprintData;
  currentUserName: string;
  analysisContext: AnalysisContext;
}
const RESOURCE_ICON_MAP: Record<string, typeof Zap> = {
  ELECTRICITY: Zap,
  WATER: Droplets,
  TAP_WATER: Droplets,
  PROCESS_WATER: Droplets,
  CHILLED_WATER: Droplets,
  COMPRESSED_AIR: Wind,
  NATURAL_GAS: Flame,
  LPG: Flame,
  NITROGEN: Waves,
  DIESEL: Gauge,
};
const RESOURCE_TONE_MAP: Record<string, string> = {
  ELECTRICITY: "bg-amber-50/90 text-amber-600 ring-1 ring-amber-200/60 shadow-xs",
  WATER: "bg-sky-50/90 text-sky-600 ring-1 ring-sky-200/60 shadow-xs",
  TAP_WATER: "bg-sky-50/90 text-sky-600 ring-1 ring-sky-200/60 shadow-xs",
  PROCESS_WATER: "bg-sky-50/90 text-sky-600 ring-1 ring-sky-200/60 shadow-xs",
  CHILLED_WATER: "bg-teal-50/90 text-teal-600 ring-1 ring-teal-200/60 shadow-xs",
  COMPRESSED_AIR: "bg-emerald-50/90 text-emerald-600 ring-1 ring-emerald-200/60 shadow-xs",
  NATURAL_GAS: "bg-orange-50/90 text-orange-600 ring-1 ring-orange-200/60 shadow-xs",
  LPG: "bg-orange-50/90 text-orange-600 ring-1 ring-orange-200/60 shadow-xs",
  NITROGEN: "bg-green-50/90 text-green-600 ring-1 ring-green-200/60 shadow-xs",
  DIESEL: "bg-rose-50/90 text-rose-600 ring-1 ring-rose-200/60 shadow-xs",
};
const DASHBOARD_REFRESH_INTERVAL_MS = 10_000;
export default function ManagerHomePage({
  resourceDashboard,
  carbon,
  currentUserName,
  analysisContext,
}: ManagerHomePageProps) {
  const router = useRouter();
  useEffect(() => {
    const refreshDashboard = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refreshDashboard, DASHBOARD_REFRESH_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);
  const {
    totalRecords,
    totalMachines,
    resourceTypeCount,
    qrCount,
    manualCount,
    qrSharePct,
    dataQualityScore,
    resources,
    recentRecords,
    lastUpdatedAt,
    intelligence,
  } = resourceDashboard;
  const userLabel = currentUserName?.trim() || "";
  const anomalyCount = intelligence.anomalyCount ?? 0;
  function askAi(prompt: string, context: Record<string, unknown> = {}) {
    const payload = {
      prompt,
      pageContext: {
        page: "Manager Command Center",
        pathname: "/manager",
        from: analysisContext.rangeStart,
        to: analysisContext.rangeEnd,
        ...context,
      },
    };
    sessionStorage.setItem("greenfactory-ai-context", JSON.stringify(payload));
    window.location.href = "/manager/ai";
  }
  const liveResources = useMemo(() => {
    const priority = [
      "ELECTRICITY",
      "WATER",
      "COMPRESSED_AIR",
      "NATURAL_GAS",
      "NITROGEN",
      "DIESEL",
    ];
    return [...resources]
      .sort((a, b) => {
        const ai = priority.indexOf(a.resourceCode);
        const bi = priority.indexOf(b.resourceCode);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .slice(0, 6);
  }, [resources]);
  return (
    <div className="gf-dashboard">
      <div className="gf-welcome-grid">
        <section className="gf-welcome-hero" aria-label="ต้อนรับผู้ใช้">
          {/* พื้นหลังลายจุด */}
          <div className="gf-hero-bg-pattern" />
          {/* ตัวอักษร GREEN FACTORY ด้านหลัง ปรับสีให้เข้มคมชัดขึ้น */}
          <div className="gf-hero-typography-bg" aria-hidden="true">
            GREEN FACTORY
          </div>
          {/* ข้อความทักทาย (เอาไอคอนดาวออกเรียบร้อย) */}
          <div className="gf-welcome-copy">
            <h2>
              {userLabel ? (
                <>
                  สวัสดีค่ะ คุณ{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                    {userLabel}
                  </span>
                </>
              ) : (
                <>สวัสดีค่ะ</>
              )}
            </h2>
            <div className="gf-hero-actions">
              <button
                className="gf-ai-btn group"
                type="button"
                onClick={() =>
                  askAi("ช่วยสรุปสถานการณ์โรงงานในช่วงนี้ พร้อมประเด็นที่ควรตรวจสอบก่อน", {
                    metric: "overview",
                  })
                }
              >
                <Sparkles size={16} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
                คุยกับ G-FAY สรุปภาพรวม
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <span className="gf-welcome-update">
              <Clock3 size={13} className="text-emerald-600" />
              {formatLastUpdated(lastUpdatedAt)}
            </span>
          </div>
          {/* ตัวการ์ตูนมาสคอตฝั่งขวา */}
          <div className="gf-welcome-art" aria-hidden="true">
            <div
              className="gf-mascot-wrapper"
              onClick={() => askAi("ช่วยสรุปภาพรวมโรงงานด่วนให้หน่อยค่ะ")}
              title="คลิกเพื่อคุยกับ G-FAY"
            >
              <GFayMascot state="idle" size="hero" className="gf-home-mascot" />
            </div>
          </div>
        </section>
      </div>
      <section className="gf-controls" aria-label="ช่วงข้อมูลโรงงาน">
        <div className="gf-overview-title">
          <h1 className="flex items-center gap-2">
            ภาพรวมโรงงาน
            <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-300/60">
              Near real-time
            </span>
          </h1>
          <p>
            ข้อมูลที่แสดง {formatRangeDate(analysisContext.rangeStart)} –{" "}
            {formatRangeDate(analysisContext.rangeEnd)}
          </p>
        </div>
        <div className="gf-time-box hover:shadow-md transition-all duration-300">
          <span className="gf-box-label">
            <Clock3 size={14} className="text-emerald-600 animate-pulse" /> เวลาปัจจุบัน
          </span>
          <BangkokClock />
        </div>
        <DateRangeFilter
          rangeStart={analysisContext.rangeStart}
          rangeEnd={analysisContext.rangeEnd}
        />
      </section>
      {analysisContext.isUsingLatestAvailable && (
        <p className="gf-range-notice animate-fade-in shadow-2xs">
          แสดง 7 วันล่าสุดที่มีข้อมูล · ข้อมูลล่าสุด{" "}
          {analysisContext.latestDataAt
            ? formatRangeDate(analysisContext.latestDataAt)
            : "ยังไม่มีข้อมูล"}
        </p>
      )}
      <section className="gf-kpi-grid">
        <ExecutiveKpi
          icon={Zap}
          label="พลังงานไฟฟ้า"
          value={formatNumber(intelligence.energyTotal)}
          unit="kWh"
          change={intelligence.energyChangePct ?? undefined}
          note="ภาพรวมช่วงปัจจุบัน"
          tone="amber"
          onAskAi={() =>
            askAi("ทำไมการใช้พลังงานไฟฟ้าช่วงนี้เป็นแบบนี้ วิเคราะห์ให้หน่อย", {
              metric: "electricity",
              value: intelligence.energyTotal,
              unit: "kWh",
              changePct: intelligence.energyChangePct,
            })
          }
        />
        <ExecutiveKpi
          icon={Leaf}
          label="คาร์บอนฟุตพริ้นท์"
          value={formatCompactCarbon(carbon.totalKgCO2e)}
          unit={carbon.totalKgCO2e >= 1000 ? "tCO₂e" : "kgCO₂e"}
          change={carbon.changePct ?? undefined}
          note="สรุปจาก Activity Data"
          tone="emerald"
          onAskAi={() =>
            askAi("ช่วยวิเคราะห์ Carbon Footprint ค่านี้ ว่าเปลี่ยนแปลงอย่างไรและควรดูอะไรต่อ", {
              metric: "carbon",
              value: carbon.totalKgCO2e,
              unit: "kgCO2e",
              changePct: carbon.changePct,
            })
          }
        />
        <ExecutiveKpi
          icon={Cpu}
          label="เครื่องจักร"
          value={formatNumber(totalMachines)}
          unit="เครื่อง"
          note={`${resourceTypeCount.toLocaleString("th-TH")} ประเภททรัพยากร`}
          tone="sky"
          onAskAi={() =>
            askAi("ช่วยอธิบายข้อมูลเครื่องจักรในภาพรวม และบอกว่าควรตรวจเครื่องไหนต่อ", {
              metric: "machines",
              value: totalMachines,
              resourceTypeCount,
            })
          }
        />
        <ExecutiveKpi
          icon={BellRing}
          label="สัญญาณผิดปกติ"
          value={formatNumber(anomalyCount)}
          unit="รายการ"
          note={anomalyCount > 0 ? "ควรเปิด Analytics เพื่อตรวจต่อ" : "ยังไม่พบสัญญาณผิดปกติ"}
          tone={anomalyCount > 0 ? "rose" : "emerald"}
          onAskAi={() =>
            askAi("ช่วยวิเคราะห์สถานะที่ต้องดูและความผิดปกติในช่วงนี้ พร้อมจัดลำดับสิ่งที่ควรตรวจ", {
              metric: "anomaly",
              value: anomalyCount,
              energyMaxAbsZScore: intelligence.maxAbsZScore,
            })
          }
        />
      </section>
      <div className="gf-section-label">
        <h2 className="flex items-center gap-2">
          <Radio size={18} className="text-emerald-600 animate-pulse" /> ติดตามการดำเนินงาน
        </h2>
        <Link
          href="/manager/overview"
          className="group hover:bg-emerald-100/70 px-3.5 py-1.5 rounded-full transition-all duration-200 text-emerald-800 font-semibold text-xs tracking-wide border border-emerald-200/60"
        >
          เปิด Analytics{" "}
          <ChevronRight size={14} className="inline-block group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="gf-detail-grid">
        <Panel
          title="การใช้ทรัพยากร"
          subtitle="ยอดรวมในช่วงที่แสดง แยกตามหน่วยของทรัพยากร"
          icon={<Radio size={20} className="text-emerald-600" />}
          actionHref="/manager/overview"
          actionLabel="ดูรายละเอียด"
        >
          {!liveResources.length ? (
            <EmptyState text="ยังไม่มีข้อมูลทรัพยากรในช่วงนี้" />
          ) : (
            <div className="gf-resource-cards">
              {liveResources.map((resource) => {
                const Icon = RESOURCE_ICON_MAP[resource.resourceCode] ?? Gauge;
                return (
                  <article
                    className="gf-resource-card group"
                    key={`${resource.resourceCode}-${resource.unit}`}
                  >
                    <div className="gf-resource-card-heading">
                      <span
                        className={`gf-table-icon group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                          RESOURCE_TONE_MAP[resource.resourceCode] ?? "bg-slate-50 text-slate-600"
                        }`}
                      >
                        <Icon size={20} />
                      </span>
                      <h3 className="group-hover:text-emerald-700 transition-colors">
                        {resource.resourceName}
                      </h3>
                    </div>
                    <div className="gf-resource-card-value">
                      <strong>{formatNumber(resource.total)}</strong>
                      <span>{resource.unit}</span>
                    </div>
                    <p>{formatNumber(resource.recordCount)} รายการบันทึก</p>
                  </article>
                );
              })}
            </div>
          )}
          <div className="gf-data-summary" aria-label="สรุปข้อมูลการบันทึก">
            <span className="hover:scale-105 transition-transform cursor-default">
              <Database size={14} className="text-teal-600" /> คุณภาพข้อมูล{" "}
              <strong>{formatNumber(dataQualityScore)}%</strong>
            </span>
            <span className="hover:scale-105 transition-transform cursor-default">
              รายการทั้งหมด <strong>{formatNumber(totalRecords)}</strong>
            </span>
            <span className="hover:scale-105 transition-transform cursor-default">
              ประเภททรัพยากร <strong>{formatNumber(resourceTypeCount)}</strong>
            </span>
            <span className="hover:scale-105 transition-transform cursor-default">
              <QrCode size={14} className="text-emerald-600" /> QR{" "}
              <strong>{formatNumber(qrCount)}</strong> ({formatNumber(qrSharePct)}%)
            </span>
            <span className="hover:scale-105 transition-transform cursor-default">
              <ListChecks size={14} className="text-sky-600" /> Manual{" "}
              <strong>{formatNumber(manualCount)}</strong>
            </span>
          </div>
        </Panel>
        <Panel
          title="รายการบันทึกล่าสุด"
          subtitle="ข้อมูลที่บันทึกเข้าระบบจาก Operator"
          icon={<ListChecks size={20} className="text-teal-600" />}
          actionHref="/manager/history"
          actionLabel="ดูทั้งหมด"
        >
          {!recentRecords.length ? (
            <EmptyState text="ยังไม่มีรายการบันทึก" />
          ) : (
            <div className="gf-activity-list">
              {recentRecords.slice(0, 5).map((record) => (
                <div className="gf-activity group cursor-default" key={record.id}>
                  <span className="gf-activity-icon group-hover:scale-110 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all duration-300">
                    {record.sourceType === "QR" ? <QrCode size={18} /> : <ListChecks size={18} />}
                  </span>
                  <div className="gf-activity-body">
                    <strong className="group-hover:text-emerald-700 transition-colors">
                      {record.machineName}
                    </strong>
                    <p>
                      {record.resourceName} · {record.departmentName} · {record.buildingName}
                    </p>
                    <span>
                      {record.dateLabel} · {record.timeLabel}
                    </span>
                  </div>
                  <div className="gf-activity-value">
                    <strong className="group-hover:text-slate-800 transition-colors">
                      {formatNumber(record.quantity)}
                    </strong>
                    <span>{record.unit}</span>
                    <SourcePill source={record.sourceType} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <style jsx global>{`
        @keyframes float3D {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .gf-dashboard { max-width: 1440px; margin: auto; color: #1e293b; padding: 12px 0 32px; }
        .gf-dashboard * { box-sizing: border-box; }
        /* Welcome Banner Layout */
        .gf-welcome-grid { margin-bottom: 24px; padding-top: 10px; }
        .gf-welcome-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 36px;
          min-height: 180px;
          overflow: hidden;
          border-radius: 28px;
          background: linear-gradient(135deg, #e6f7f0 0%, #f0fdf4 50%, #e0f2fe 100%);
          border: 1.5px solid #a7f3d0;
          box-shadow: 0 10px 28px -10px rgba(16, 185, 129, 0.12);
        }
        /* พื้นหลังลายจุด */
        .gf-hero-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#10b981 0.75px, transparent 0.75px);
          background-size: 18px 18px;
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
        }
        /* ตัวอักษร GREEN FACTORY ด้านหลัง - ปรับให้สีเข้ม คมชัดขึ้นตามคำขอ */
        .gf-hero-typography-bg {
          position: absolute;
          left: 52%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 90px;
          font-weight: 900;
          color: rgba(16, 185, 129, 0.18); /* เพิ่มความเข้มคมชัด */
          letter-spacing: 5px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1;
          font-family: system-ui, -apple-system, sans-serif;
        }
        /* โซนข้อความทักทาย */
        .gf-welcome-copy {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .gf-welcome-copy h2 {
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
          color: #064e3b;
        }
        .gf-hero-actions { display: flex; align-items: center; }
        .gf-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
        }
        .gf-ai-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
        }
        .gf-welcome-update {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }
        /* โซนตัวการ์ตูน G-FAY ด้านขวา */
        .gf-welcome-art {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .gf-mascot-wrapper {
          cursor: pointer;
          animation: float3D 4s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .gf-mascot-wrapper:hover {
          transform: scale(1.05);
        }
        .gf-home-mascot {
          width: 200px !important;
          height: auto;
          display: block;
          filter: drop-shadow(0 10px 18px rgba(16, 185, 129, 0.2));
        }
        /* Controls & Section Styles */
        .gf-controls { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 0 0 24px; padding: 0 2px; }
        .gf-overview-title h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.4px; color: #0f172a; }
        .gf-overview-title p { font-size: 13.5px; color: #64748b; margin: 0; }
        .gf-filter { display: flex; align-items: end; flex-wrap: wrap; gap: 10px; }
        .gf-filter-title { display: none; }
        .gf-filter label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; font-weight: 600; color: #64748b; }
        .gf-filter input { border: 1px solid #cbd5e1; border-radius: 10px; background: white; padding: 8px 12px; font-size: 13.5px; color: #1e293b; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
        .gf-filter input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); outline: none; }
        .gf-filter button { padding: 9px 16px; font-size: 13.5px; border-radius: 10px; background: #059669; color: white; font-weight: 600; transition: all 0.2s; border: none; cursor: pointer; }
        .gf-filter button:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); }
        .gf-range-notice { font-size: 13px; font-weight: 500; color: #92400e; background: #fffbeb; border: 1px solid #fef3c7; padding: 10px 14px; border-radius: 10px; margin: 0 0 18px; display: inline-block; }
        .gf-kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 26px; }
        .gf-section-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .gf-section-label h2 { font-size: 18px; font-weight: 800; letter-spacing: -0.3px; color: #0f172a; }
        .gf-detail-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .gf-resource-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .gf-resource-card { padding: 18px; border: 1px solid #f1f5f9; border-radius: 18px; background: #ffffff; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: default; }
        .gf-resource-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.06); border-color: #a7f3d0; }
        .gf-resource-card-heading { display: flex; align-items: center; gap: 10px; }
        .gf-resource-card h3 { margin: 0; font-size: 14px; font-weight: 700; line-height: 1.4; color: #334155; }
        .gf-resource-card-value { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin: 14px 0 6px; }
        .gf-resource-card-value strong { font-size: 24px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; color: #0f172a; }
        .gf-resource-card-value span { font-size: 12.5px; color: #64748b; font-weight: 500; }
        .gf-resource-card p { margin: 0; color: #94a3b8; font-size: 12px; font-weight: 500; }
        .gf-activity { display: flex; align-items: start; gap: 12px; padding: 12px; border-radius: 14px; border: 1px solid transparent; transition: all 0.2s ease; margin-bottom: 4px; }
        .gf-activity:hover { background: #f8fafc; border-color: #f1f5f9; transform: translateX(4px); }
        .gf-activity-icon { display: grid; place-items: center; flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; color: #64748b; }
        .gf-activity-body { flex: 1; min-width: 0; }
        .gf-activity-body strong { font-size: 14px; overflow-wrap: anywhere; color: #1e293b; font-weight: 700; }
        .gf-activity-body p { font-size: 12.5px; color: #64748b; line-height: 1.5; margin: 2px 0 4px; }
        .gf-activity-body > span { font-size: 11.5px; color: #94a3b8; font-weight: 500; }
        .gf-activity-value { display: flex; flex-direction: column; align-items: end; gap: 4px; flex-shrink: 0; }
        .gf-activity-value strong { font-size: 16px; font-variant-numeric: tabular-nums; font-weight: 700; color: #334155; }
        .gf-activity-value > span { font-size: 12px; color: #64748b; font-weight: 500; }
        .gf-table-icon { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; }
        .gf-dashboard .gf-controls { display: grid; grid-template-columns: minmax(180px, 1fr) auto auto; align-items: center; gap: 16px; padding: 16px 20px; background: white; border: 1px solid #f1f5f9; border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .gf-dashboard .gf-time-box { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: 12px; border: 1px solid #d1fae5; background: #ecfdf5; }
        .gf-dashboard .gf-box-label { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #047857; font-weight: 700; }
        .gf-dashboard .gf-clock { text-align: left; font-size: 12.5px; color: #475569; }
        .gf-dashboard .gf-clock strong { font-size: 15px; font-weight: 800; display: block; color: #0f172a; }
        .gf-dashboard .gf-clock small { font-size: 11px; font-weight: 500; color: #94a3b8; }
        .gf-dashboard .gf-data-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; padding-top: 16px; border-top: 1px dashed #e2e8f0; }
        .gf-dashboard .gf-data-summary > span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; padding: 6px 10px; background: #f8fafc; border-radius: 8px; font-weight: 600; border: 1px solid #f1f5f9; }
        @media(max-width: 1024px) {
          .gf-welcome-hero { flex-direction: column; text-align: center; justify-content: center; }
          .gf-welcome-art { justify-content: center; }
          .gf-hero-typography-bg { display: none; }
          .gf-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gf-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
// Subcomponents
function ExecutiveKpi({
  icon: Icon,
  label,
  value,
  unit,
  change,
  note,
  tone,
  onAskAi,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  change?: number;
  note: string;
  tone: "amber" | "emerald" | "sky" | "violet" | "rose";
  onAskAi?: () => void;
}) {
  const tones = {
    amber: { icon: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/60", line: "from-amber-400 to-orange-400", hover: "hover:border-amber-200 hover:shadow-amber-500/10" },
    emerald: { icon: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60", line: "from-emerald-400 to-teal-400", hover: "hover:border-emerald-200 hover:shadow-emerald-500/10" },
    sky: { icon: "bg-sky-50 text-sky-600 ring-1 ring-sky-200/60", line: "from-sky-400 to-cyan-400", hover: "hover:border-sky-200 hover:shadow-sky-500/10" },
    violet: { icon: "bg-violet-50 text-violet-600 ring-1 ring-violet-200/60", line: "from-violet-400 to-fuchsia-400", hover: "hover:border-violet-200 hover:shadow-violet-500/10" },
    rose: { icon: "bg-rose-50 text-rose-600 ring-1 ring-rose-200/60", line: "from-rose-400 to-orange-400", hover: "hover:border-rose-200 hover:shadow-rose-500/10" },
  };
  const current = tones[tone];
  return (
    <div className={`group overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${current.hover}`}>
      <div className={`h-1.5 bg-gradient-to-r ${current.line} opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12.5px] font-bold text-slate-500">{label}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-slate-900 transition-transform group-hover:scale-[1.02] origin-left">
                {value}
              </span>
              <span className="text-xs font-semibold text-slate-400">{unit}</span>
            </div>
          </div>
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 flex min-h-6 items-center gap-2">
          {typeof change === "number" && (
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold",
                change > 0
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60"
                  : change < 0
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                    : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {change > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : change < 0 ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <Activity className="h-3 w-3" />
              )}
              {signedNumber(change)}%
            </span>
          )}
          <span className="truncate text-xs font-medium text-slate-400">{note}</span>
        </div>
        {onAskAi && (
          <button
            type="button"
            onClick={onAskAi}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-[12.5px] font-bold text-slate-700 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            วิเคราะห์ด้วย AI
          </button>
        )}
      </div>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  icon,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-shadow duration-300">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="group inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-slate-200/60 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
          >
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
function SourcePill({ source }: { source: string }) {
  const isQr = source === "QR";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
        isQr ? "bg-emerald-100/80 text-emerald-800" : "bg-sky-100/80 text-sky-800",
      ].join(" ")}
    >
      {isQr ? <QrCode className="h-3 w-3" /> : <ListChecks className="h-3 w-3" />}
      {isQr ? "QR" : "Manual"}
    </span>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs font-medium text-slate-500">
      {text}
    </div>
  );
}
function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });
}
function formatCompactCarbon(value: number) {
  const amount = Number(value ?? 0);
  return amount >= 1000 ? formatNumber(amount / 1000) : formatNumber(amount);
}
function signedNumber(value: number) {
  const rounded = Math.round((value ?? 0) * 10) / 10;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
function formatClock(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}
function formatLastUpdated(value: string | null) {
  if (!value) return "ยังไม่มีข้อมูล";
  return `อัปเดตล่าสุด ${new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value))}`;
}
function formatRangeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      }).format(date);
}
function DateRangeFilter({ rangeStart, rangeEnd }: { rangeStart: string; rangeEnd: string }) {
  const [from, setFrom] = useState(() => toBangkokDateInput(rangeStart));
  const [to, setTo] = useState(() => toBangkokDateInput(rangeEnd));
  useEffect(() => {
    setFrom(toBangkokDateInput(rangeStart));
    setTo(toBangkokDateInput(rangeEnd));
  }, [rangeStart, rangeEnd]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!from || !to || from > to) return;
    const url = new URL(window.location.href);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    window.location.assign(url.toString());
  }
  return (
    <form className="gf-filter" onSubmit={submit}>
      <div className="gf-filter-title">
        <strong>เลือกช่วงข้อมูล</strong>
        <span>วันเริ่มต้นและวันสิ้นสุดตามเวลาประเทศไทย</span>
      </div>
      <label>
        ตั้งแต่วันที่
        <input
          aria-label="วันเริ่มต้น"
          type="date"
          required
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
        />
      </label>
      <label>
        ถึงวันที่
        <input
          aria-label="วันสิ้นสุด"
          type="date"
          required
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
        />
      </label>
      <button type="submit">แสดงข้อมูล</button>
    </form>
  );
}
function BangkokClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="gf-clock" aria-label="วันที่และเวลาปัจจุบันกรุงเทพ">
      <span>
        {now
          ? new Intl.DateTimeFormat("th-TH", {
              timeZone: "Asia/Bangkok",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(now)
          : "กำลังโหลดวันที่"}
      </span>
      <strong>
        {now ? formatClock(now) : "--:--:--"}{" "}
        <small className="font-normal text-slate-400">กรุงเทพฯ (UTC+7)</small>
      </strong>
    </div>
  );
}
function toBangkokDateInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (name: string) => parts.find((item) => item.type === name)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
