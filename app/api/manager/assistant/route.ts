import { NextResponse } from "next/server";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import { prisma } from "@/lib/prisma";

import { getSession } from "@/lib/session";

import {

  getCarbonFootprint,

  getManagerResourceDashboard,

} from "@/lib/manager queries";

export const dynamic = "force-dynamic";

type ChatMessage = {

  role: "user" | "assistant";

  content: string;

};

type AssistantImage = {

  data: string;

  mimeType: "image/jpeg" | "image/png" | "image/webp";

  name?: string;

};

type PageContext = {

  page?: string;

  pathname?: string;

  from?: string;

  to?: string;

  resource?: string;

  building?: string;

  department?: string;

  productionLine?: string;

  machine?: string;

  machineId?: number;

  metric?: string;

  value?: number | string;

  unit?: string;

  changePct?: number | string;

  label?: string;

  source?: string;

};

type CopilotIntent =

  | "OVERVIEW"

  | "ENERGY"

  | "ANOMALY"

  | "MACHINE"

  | "CARBON"

  | "ALERT"

  | "REPORT"

  | "COMPARE"

  | "FORMULA"

  | "NAVIGATION"

  | "GENERAL";

type FactoryContext = Awaited<ReturnType<typeof buildFactoryContext>>;

const SYSTEM_MAP = {

  home: {

    path: "/manager",

    purpose:

      "ภาพรวมโรงงานสำหรับ Manager: KPI หลัก, Resource Snapshot, Watch status และ recent activity",

  },

  analytics: {

    path: "/manager/overview",

    purpose:

      "วิเคราะห์ ResourceUsage, trend, current/previous period, anomaly และเจาะตาม hierarchy",

  },

  carbon: {

    path: "/manager/overview/carbon",

    purpose:

      "วิเคราะห์ Carbon Footprint, scope และ emission contribution",

  },

  performance: {

    path: "/manager/overview/oee",

    purpose:

      "Operational Performance / Performance & KPI; ไม่เรียก OEE จริงถ้ายังไม่มี Availability × Performance × Quality ครบ",

  },

  compare: {

    path: "/manager/overview/compare",

    purpose:

      "เปรียบเทียบช่วงเวลาที่มีระยะเท่ากัน",

  },

  equipment: {

    path: "/manager/overview/equipment",

    purpose:

      "ดูเครื่องจักรและรายละเอียดระดับ asset",

  },

  alerts: {

    path: "/manager/alerts",

    purpose:

      "ดู Alert, severity, acknowledgement และ resolution",

  },

  reports: {

    path: "/manager/reports",

    purpose:

      "สร้างและดาวน์โหลด PDF/XLSX/CSV/JSON report",

  },

} as const;

function toNumber(value: unknown): number {

  if (typeof value === "number") return value;

  if (

    value &&

    typeof value === "object" &&

    "toNumber" in value &&

    typeof (value as { toNumber?: unknown }).toNumber === "function"

  ) {

    return (value as { toNumber: () => number }).toNumber();

  }

  return Number(value ?? 0);

}

function round2(value: number) {

  return Math.round((Number(value) || 0) * 100) / 100;

}

function startOfDaysAgo(daysAgo: number) {

  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  date.setHours(0, 0, 0, 0);

  return date;

}

function endOfToday() {

  const date = new Date();

  date.setHours(23, 59, 59, 999);

  return date;

}

function formatDate(value: string | Date | null | undefined) {

  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("th-TH", {

    day: "numeric",

    month: "short",

    year: "numeric",

    timeZone: "Asia/Bangkok",

  }).format(date);

}

function classifyIntent(question: string, page?: PageContext): CopilotIntent {

  const q = question.toLowerCase();

  if (

    /(สูตร|คำนวณ|calculation|formula|z-score|z score|standard deviation|mean|ค่าเฉลี่ย|เปอร์เซ็นต์)/i.test(

      question,

    )

  ) {

    return "FORMULA";

  }

  if (

    /(ไปหน้า|อยู่หน้าไหน|เมนูไหน|หา.*ที่ไหน|เปิดหน้า|navigation|navigate)/i.test(

      question,

    )

  ) {

    return "NAVIGATION";

  }

  if (/(report|รายงาน|pdf|excel|xlsx|csv|export|ดาวน์โหลด)/i.test(question)) {

    return "REPORT";

  }

  if (/(alert|แจ้งเตือน|critical|warning|high|threshold|รับทราบ|resolved)/i.test(question)) {

    return "ALERT";

  }

  if (/(carbon|co2|co₂|คาร์บอน|scope|emission)/i.test(question)) {

    return "CARBON";

  }

  if (/(compare|เทียบ|ช่วงก่อน|previous|เพิ่มขึ้น|ลดลง)/i.test(question)) {

    return "COMPARE";

  }

  if (/(ผิดปกติ|anomal|z-score|z score|เบี่ยงเบน|สูงผิดปกติ)/i.test(question)) {

    return "ANOMALY";

  }

  if (/(เครื่อง|machine|equipment|asset|จักร)/i.test(question)) {

    return "MACHINE";

  }

  if (/(ไฟ|electric|energy|kwh|พลังงาน)/i.test(question)) {

    return "ENERGY";

  }

  if (

    /(ภาพรวม|โรงงานเป็นยังไง|สรุปวันนี้|วันนี้เป็นยังไง|overview|summary|ต้องดูอะไร)/i.test(

      question,

    )

  ) {

    return "OVERVIEW";

  }

  // ถ้าคำถามกำกวม ให้ใช้หน้าปัจจุบันช่วยตีความ

  const currentPage = `${page?.page ?? ""} ${page?.pathname ?? ""}`.toLowerCase();

  if (currentPage.includes("carbon")) return "CARBON";

  if (currentPage.includes("alert")) return "ALERT";

  if (currentPage.includes("report")) return "REPORT";

  if (currentPage.includes("compare")) return "COMPARE";

  if (currentPage.includes("equipment") || currentPage.includes("machine")) {

    return "MACHINE";

  }

  if (currentPage.includes("overview") || currentPage.includes("analytics")) {

    return "ENERGY";

  }

  return "GENERAL";

}

async function buildFactoryContext(companyId: number) {

  const startDate = startOfDaysAgo(6);

  const endDate = endOfToday();

  const [dashboard, carbon, alerts, recommendations] = await Promise.all([

    getManagerResourceDashboard(companyId, startDate, endDate),

    getCarbonFootprint(companyId, startDate, endDate),

    prisma.alert.findMany({

      where: {

        companyId,

        status: { in: ["OPEN", "ACKNOWLEDGED"] },

      },

      orderBy: { triggeredAt: "desc" },

      take: 15,

      select: {

        alertId: true,

        alertCode: true,

        alertType: true,

        severity: true,

        title: true,

        message: true,

        status: true,

        thresholdValue: true,

        actualValue: true,

        triggeredAt: true,

        acknowledgedAt: true,

        resolvedAt: true,

        machine: {

          select: {

            machineId: true,

            machineCode: true,

            machineName: true,

          },

        },

        building: {

          select: {

            buildingName: true,

          },

        },

        department: {

          select: {

            departmentName: true,

          },

        },

      },

    }),

    prisma.aIRecommendation.findMany({

      where: { companyId, status: "ACTIVE" },

      orderBy: { createdAt: "desc" },

      take: 8,

      select: {

        title: true,

        description: true,

        priority: true,

        confidenceScore: true,

        createdAt: true,

      },

    }),

  ]);

  return {

    period: {

      label: "7 days",

      from: startDate.toISOString(),

      to: endDate.toISOString(),

    },

    summary: {

      totalRecords: dashboard.totalRecords,

      previousRecords: dashboard.previousRecords,

      recordChangePct: dashboard.recordChangePct,

      totalMachines: dashboard.totalMachines,

      resourceTypeCount: dashboard.resourceTypeCount,

      pendingCount: dashboard.pendingCount,

      qrCount: dashboard.qrCount,

      manualCount: dashboard.manualCount,

      qrSharePct: dashboard.qrSharePct,

      dataQualityScore: dashboard.dataQualityScore,

      lastUpdatedAt: dashboard.lastUpdatedAt,

    },

    resources: dashboard.resources,

    energyIntelligence: {

      totalKwh: dashboard.intelligence.energyTotal,

      previousTotalKwh: dashboard.intelligence.previousEnergyTotal,

      changePct: dashboard.intelligence.energyChangePct,

      dailyMeanKwh: dashboard.intelligence.dailyMean,

      populationStdDev: dashboard.intelligence.standardDeviation,

      maxAbsZScore: dashboard.intelligence.maxAbsZScore,

      anomalyCount: dashboard.intelligence.anomalyCount,

      peakDate: dashboard.intelligence.peakLabel,

      peakValueKwh: dashboard.intelligence.peakValue,

      dailyEnergy: dashboard.intelligence.dailyEnergy,

      topContributors: dashboard.intelligence.topEnergyContributors,

    },

    methodology: {

      periodComparison:

        "Current period = 7 days including today; Previous period = immediately preceding 7 days",

      changePct: "Δ% = (Current - Previous) / Previous × 100",

      mean: "μ = Σx / n",

      populationStdDev: "σ = sqrt(Σ(x - μ)^2 / n)",

      zScore: "z = (x - μ) / σ",

      anomalyRule: "|z| >= 2",

      carbon: "CO₂e = Σ(Activity Data × Emission Factor)",

      dataQuality:

        "Completeness of Machine / Department / Building / Unit / ResourceType",

    },

    carbon: {

      totalKgCO2e: carbon.totalKgCO2e,

      changePct: carbon.changePct,

      breakdown: carbon.breakdown,

      scopeTotals: carbon.scopeTotals,

      lastUpdatedAt: carbon.lastUpdatedAt,

      factorStatus:

        "Carbon values come from the application CarbonResult workflow using stored emission-factor traceability. Do not describe them as externally audited or certified unless explicit audit evidence is supplied.",

    },

    recentRecords: dashboard.recentRecords.slice(0, 8),

    alerts: alerts.map((alert) => ({

      id: String(alert.alertId),

      alertCode: alert.alertCode,

      alertType: alert.alertType,

      severity: alert.severity,

      title: alert.title,

      message: alert.message,

      status: alert.status,

      thresholdValue:

        alert.thresholdValue === null ? null : toNumber(alert.thresholdValue),

      actualValue: alert.actualValue === null ? null : toNumber(alert.actualValue),

      machineId: alert.machine?.machineId ?? null,

      machineCode: alert.machine?.machineCode ?? null,

      machineName: alert.machine?.machineName ?? null,

      buildingName: alert.building?.buildingName ?? null,

      departmentName: alert.department?.departmentName ?? null,

      triggeredAt: alert.triggeredAt.toISOString(),

      acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,

      resolvedAt: alert.resolvedAt?.toISOString() ?? null,

    })),

    storedRecommendations: recommendations.map((item) => ({

      title: item.title,

      description: item.description,

      priority: item.priority,

      confidence:

        item.confidenceScore === null ? null : toNumber(item.confidenceScore),

      createdAt: item.createdAt.toISOString(),

    })),

  };

}

function buildCompactContext(

  intent: CopilotIntent,

  context: FactoryContext,

  pageContext?: PageContext,

) {

  const base = {

    period: context.period,

    pageContext: pageContext ?? null,

  };

  switch (intent) {

    case "OVERVIEW":

      return {

        ...base,

        summary: context.summary,

        resources: context.resources,

        energy: context.energyIntelligence,

        carbon: {

          totalKgCO2e: context.carbon.totalKgCO2e,

          changePct: context.carbon.changePct,

        },

        openAlerts: context.alerts.filter((item) => item.status === "OPEN").slice(0, 6),

        recentRecords: context.recentRecords.slice(0, 4),

      };

    case "ENERGY":

    case "ANOMALY":

      return {

        ...base,

        energy: context.energyIntelligence,

        methodology: {

          changePct: context.methodology.changePct,

          mean: context.methodology.mean,

          populationStdDev: context.methodology.populationStdDev,

          zScore: context.methodology.zScore,

          anomalyRule: context.methodology.anomalyRule,

        },

        recentElectricityRecords: context.recentRecords

          .filter((item) => /electric|ไฟ/i.test(`${item.resourceCode} ${item.resourceName}`))

          .slice(0, 6),

      };

    case "MACHINE":

      return {

        ...base,

        topEnergyContributors: context.energyIntelligence.topContributors,

        recentRecords: context.recentRecords.slice(0, 8),

        alerts: context.alerts.slice(0, 8),

        machineCountWithUsage: context.summary.totalMachines,

      };

    case "CARBON":

      return {

        ...base,

        carbon: context.carbon,

        methodology: {

          carbon: context.methodology.carbon,

          changePct: context.methodology.changePct,

        },

      };

    case "ALERT":

      return {

        ...base,

        alerts: context.alerts,

        openCount: context.alerts.filter((item) => item.status === "OPEN").length,

      };

    case "COMPARE":

      return {

        ...base,

        summary: {

          currentRecords: context.summary.totalRecords,

          previousRecords: context.summary.previousRecords,

          recordChangePct: context.summary.recordChangePct,

        },

        energy: {

          current: context.energyIntelligence.totalKwh,

          previous: context.energyIntelligence.previousTotalKwh,

          changePct: context.energyIntelligence.changePct,

        },

        carbon: {

          current: context.carbon.totalKgCO2e,

          changePct: context.carbon.changePct,

        },

        methodology: {

          periodComparison: context.methodology.periodComparison,

          changePct: context.methodology.changePct,

        },

      };

    case "FORMULA":

      return {

        ...base,

        methodology: context.methodology,

        actualCurrentMetrics: {

          energy: context.energyIntelligence,

          carbon: {

            totalKgCO2e: context.carbon.totalKgCO2e,

            changePct: context.carbon.changePct,

          },

          dataQualityScore: context.summary.dataQualityScore,

        },

      };

    case "REPORT":

      return {

        ...base,

        reportSystem: SYSTEM_MAP.reports,

        summary: context.summary,

        resources: context.resources,

        carbon: {

          totalKgCO2e: context.carbon.totalKgCO2e,

          changePct: context.carbon.changePct,

        },

      };

    case "NAVIGATION":

      return {

        ...base,

        pages: SYSTEM_MAP,

      };

    default:

      return {

        ...base,

        summary: context.summary,

        resources: context.resources,

        energy: context.energyIntelligence,

        carbon: context.carbon,

        alerts: context.alerts.slice(0, 8),

        pages: SYSTEM_MAP,

      };

  }

}

function fastDeterministicAnswer(

  question: string,

  intent: CopilotIntent,

  context: FactoryContext,

) {

  const energy = context.energyIntelligence;

  const openAlerts = context.alerts.filter((item) => item.status === "OPEN");

  if (intent === "NAVIGATION") {

    if (/carbon|คาร์บอน/i.test(question)) {

      return `ไปที่ Carbon Intelligence (${SYSTEM_MAP.carbon.path}) เพื่อดู Carbon Footprint, Scope และแหล่งการปล่อยค่ะ`;

    }

    if (/alert|แจ้งเตือน/i.test(question)) {

      return `ไปที่ Alerts (${SYSTEM_MAP.alerts.path}) เพื่อดู Severity, Threshold, Actual และสถานะการรับทราบ/แก้ไขค่ะ`;

    }

    if (/เครื่อง|machine|equipment/i.test(question)) {

      return `ไปที่ Machines (${SYSTEM_MAP.equipment.path}) เพื่อดูข้อมูลระดับเครื่องจักรค่ะ`;

    }

    if (/report|รายงาน|export/i.test(question)) {

      return `ไปที่ Reports (${SYSTEM_MAP.reports.path}) เพื่อสร้างและดาวน์โหลดรายงานค่ะ`;

    }

    if (/compare|เทียบ/i.test(question)) {

      return `ไปที่ Compare (${SYSTEM_MAP.compare.path}) เพื่อเปรียบเทียบช่วงเวลาที่มีระยะเท่ากันค่ะ`;

    }

  }

  if (intent === "FORMULA") {

    if (/ช่วงก่อน|previous|กี่วัน/i.test(question)) {

      return `ระบบเปรียบเทียบ 7 วันปัจจุบันกับ 7 วันก่อนหน้าที่อยู่ติดกันทันทีค่ะ ช่วงปัจจุบันคือ ${formatDate(

        context.period.from,

      )} ถึง ${formatDate(context.period.to)} และสูตรเปอร์เซ็นต์คือ Δ% = (Current - Previous) / Previous × 100`;

    }

    if (/z-score|z score|ผิดปกติ|anomal/i.test(question)) {

      return `ระบบใช้ z = (x - μ) / σ โดย μ คือค่าเฉลี่ยรายวัน และ σ คือ population standard deviation จากนั้นใช้เกณฑ์ |z| ≥ 2 เพื่อ Flag จุดที่ควรตรวจสอบ ไม่ได้หมายความว่าเครื่องเสียแน่นอนค่ะ`;

    }

    if (/carbon|co2|คาร์บอน/i.test(question)) {

      return `Carbon ใช้หลัก CO₂e = Σ(Activity Data × Emission Factor) ค่ะ โดย Activity Data คือปริมาณการใช้จริง และ Emission Factor คือค่าการปล่อยต่อหนึ่งหน่วย`;

    }

  }

  if (intent === "MACHINE" && /สูงสุด|มากสุด|ใช้ไฟ.*มาก|top/i.test(question)) {

    const top = energy.topContributors[0];

    if (!top) {

      return "ยังไม่มีข้อมูล Electricity ระดับเครื่องจักรเพียงพอในช่วง 7 วันล่าสุดค่ะ";

    }

    return `เครื่องที่มีสัดส่วนการใช้ไฟสูงสุดในช่วงนี้คือ ${top.machineName} รวม ${top.totalKwh.toLocaleString(

      "th-TH",

    )} kWh คิดเป็น ${top.percent.toLocaleString(

      "th-TH",

    )}% ของ Electricity ที่บันทึกในช่วงนี้ค่ะ`;

  }

  if (intent === "ALERT" && /(กี่|จำนวน|มีไหม|ตอนนี้)/i.test(question)) {

    if (openAlerts.length === 0) {

      return "ไม่พบ Alert สถานะ OPEN ในรายการแจ้งเตือนล่าสุดที่ดึงมา (สูงสุด 15 รายการ) กรุณาตรวจสอบหน้า Alerts เพื่อดูรายการทั้งหมดค่ะ";

    }

    const critical = openAlerts.filter(

      (item) => String(item.severity).toUpperCase() === "CRITICAL",

    ).length;

    return `ในรายการแจ้งเตือนล่าสุดที่ดึงมา (สูงสุด 15 รายการ) พบ Alert สถานะ OPEN ${openAlerts.length} รายการ โดยเป็น Critical ${critical} รายการ รายการล่าสุดคือ “${openAlerts[0].title}” ระดับ ${openAlerts[0].severity} ค่ะ`;

  }

  return null;

}

function fallbackAnswer(

  question: string,

  intent: CopilotIntent,

  context: FactoryContext,

) {

  const fast = fastDeterministicAnswer(question, intent, context);

  if (fast) return fast;

  const energy = context.energyIntelligence;

  if (context.summary.totalRecords === 0) {

    return `ไม่พบรายการ ResourceUsage ในช่วง 7 วันล่าสุดสำหรับบริษัทนี้ จึงยังสรุปปริมาณการใช้จริงหรือความผิดปกติไม่ได้ค่ะ ระบบมีเครื่องจักรทั้งหมด ${context.summary.totalMachines.toLocaleString("th-TH")} เครื่อง`;

  }

  if (intent === "ANOMALY") {

    if (energy.anomalyCount === 0) {

      return `ยังไม่พบความผิดปกติของไฟฟ้าตามเกณฑ์ |z| ≥ 2 ในช่วง 7 วันล่าสุด โดยค่า |z| สูงสุดคือ ${energy.maxAbsZScore.toLocaleString(

        "th-TH",

      )}`;

    }

    return `พบความผิดปกติทางสถิติ ${energy.anomalyCount} จุดในช่วง 7 วันล่าสุด จุดสูงสุดอยู่ที่ ${

      energy.peakDate ?? "วันที่มีค่าสูงสุด"

    } ใช้ไฟ ${energy.peakValueKwh.toLocaleString(

      "th-TH",

    )} kWh และมี |z| สูงสุด ${energy.maxAbsZScore.toLocaleString(

      "th-TH",

    )} ควรตรวจเครื่องที่มี contribution สูงในช่วงดังกล่าวค่ะ`;

  }

  if (intent === "CARBON") {
    const carbonChangeText =
      context.carbon.changePct === null
        ? "ยังไม่มีข้อมูลช่วงก่อนหน้าที่เพียงพอสำหรับการเปรียบเทียบ"
        : `เปลี่ยนแปลง ${context.carbon.changePct.toLocaleString("th-TH", {
            maximumFractionDigits: 1,
          })}% จากช่วงก่อนหน้า`;
    return `Carbon Footprint ในช่วง 7 วันล่าสุดคือ ${context.carbon.totalKgCO2e.toLocaleString(
      "th-TH",
    )} kgCO₂e ${carbonChangeText} โดยค่าดังกล่าวมาจาก CarbonResult ที่ระบบบันทึกไว้ และยังไม่ควรเรียกว่า externally audited หรือ certified หากไม่มีหลักฐานการตรวจรับรองค่ะ`;
  }

  return `ช่วง 7 วันล่าสุดมี ${context.summary.totalRecords.toLocaleString(

    "th-TH",

  )} ResourceUsage records โดยมีเครื่องจักรทั้งหมด ${context.summary.totalMachines.toLocaleString(

    "th-TH",

  )} เครื่อง, Electricity ${energy.totalKwh.toLocaleString(

    "th-TH",

  )} kWh, anomaly ${energy.anomalyCount.toLocaleString(

    "th-TH",

  )} จุด และ Data Quality ${context.summary.dataQualityScore.toLocaleString(

    "th-TH",

  )}% ค่ะ`;

}

function buildSystemInstruction() {

  return `

You are GreenFactory Copilot, the AI decision-support assistant for the entire Manager workspace.

PRIMARY GOAL

Help a factory manager answer both broad and highly specific questions about GreenFactory:

\\\\\\\\- factory overview

\\\\\\\\- resource usage and analytics

\\\\\\\\- period comparison

\\\\\\\\- machines

\\\\\\\\- carbon

\\\\\\\\- alerts

\\\\\\\\- reports

\\\\\\\\- formulas and methodology

\\\\\\\\- navigation and how to use the Manager system

LANGUAGE

\\\\\\\\- Answer in Thai unless the user explicitly asks for another language.

\\\\\\\\- Use natural, concise language suitable for a factory manager.

\\\\\\\\- Start with the answer, not a long introduction.

\\\\\\\\- Do not use decorative emoji.

CONTEXT AWARENESS

\\\\\\\\- PAGE_CONTEXT may describe the page, date range, resource, building, department, line, or machine the manager is currently viewing.

\\\\\\\\- Resolve ambiguous phrases such as "อันนี้", "ตัวนี้", "ทำไมสูง", "เครื่องนี้" using PAGE_CONTEXT when possible.

\\\\\\\\- If the reference still cannot be determined, ask ONE short clarification question.

STRICT DATA RULES

\\\\\\\\- FACTORY_CONTEXT is the only source of factory-specific facts.

\\\\\\\\- Never invent measurements, machine names, locations, dates, thresholds, percentages, emission factors, causes, forecasts, or savings.

\\\\\\\\- Never claim a machine is broken unless evidence directly proves it.

\\\\\\\\- Never turn a statistical anomaly into a confirmed root cause.

\\\\\\\\- Do not combine physical quantities that use different units.

\\\\\\\\- If evidence is insufficient, say exactly:

  "ข้อมูลปัจจุบันยังไม่เพียงพอที่จะยืนยันสาเหตุโดยตรง"

BACKEND VS AI

\\\\\\\\- Deterministic calculations are performed by the application/backend.

\\\\\\\\- Do not replace supplied KPI values with your own invented values.

\\\\\\\\- You may explain formulas and supplied values.

\\\\\\\\- Treat the backend values as authoritative for the current response.

ROOT-CAUSE STYLE

When asked "why", "what caused this", "what should I check", or similar:

1\\\\\\\\. State what is confirmed by the data.

2\\\\\\\\. Identify the strongest available contributor or statistical signal.

3\\\\\\\\. State what is only a possible explanation.

4\\\\\\\\. Give the next practical verification step.

5\\\\\\\\. Do NOT call a contributor a confirmed cause without evidence.

MANAGER REASONING

When useful, reason hierarchically:

Factory → Building → Department → Production Line → Machine → Resource records.

FORMULAS

Percentage change:

Δ% = (Current - Previous) / Previous × 100

Mean:

μ = Σx / n

Population standard deviation:

σ = sqrt(Σ(x - μ)^2 / n)

Z-score:

z = (x - μ) / σ

Anomaly rule:

|z| >= 2

Carbon:

CO₂e = Σ(Activity Data × Emission Factor)

ALERTS

Explain severity, Actual, Threshold, difference, asset/location, and workflow status when supplied.

Acknowledge = manager has seen/accepted the event.

Resolved = event has been closed after handling.

CARBON

Carbon values supplied in FACTORY_CONTEXT come from the application CarbonResult workflow and stored emission-factor traceability.

Never describe it as externally audited, certified, or official regulatory reporting unless the context explicitly provides that evidence.

SYSTEM KNOWLEDGE

Home = quick factory overview.

Resource Analytics = investigate resource trend, contributors and anomalies.

Compare = compare equal-duration periods.

Carbon = carbon footprint and scopes.

Performance & KPI = operational performance; do not call it true OEE unless Availability × Performance × Quality data is complete.

Machines = machine-level context.

Alerts = incident/alert workflow.

Reports = exports and management reports.

RESPONSE FORMAT

Use the minimum structure needed.

For analysis:

สรุป:

ข้อมูลยืนยัน (FACT):

การคำนวณ (CALCULATION):

สัญญาณผิดปกติ (ANOMALY):

ข้อสันนิษฐาน (INFERENCE):

คำแนะนำ (RECOMMENDATION):

ควรตรวจต่อ:

For a simple factual or navigation question, answer directly in 1-4 sentences.

Do not repeat the full context.

`.trim();

}

let geminiCooldownUntil = 0;

const GEMINI_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000;

const GEMINI_TRANSIENT_COOLDOWN_MS = 45 * 1000;

function errorStatus(error: unknown): number | undefined {

  if (!error || typeof error !== "object") return undefined;

  const value = error as { status?: number; statusCode?: number };

  return value.status ?? value.statusCode;

}

function isRateLimit(error: unknown): boolean {

  return errorStatus(error) === 429;

}

function isTransientGeminiError(error: unknown): boolean {

  const status = errorStatus(error);

  if (status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {

    return true;

  }

  const value = error as { code?: unknown; cause?: { code?: unknown; message?: unknown } } | undefined;

  const text = [

    error instanceof Error ? error.name : "",

    error instanceof Error ? error.message : "",

    value?.code,

    value?.cause?.code,

    value?.cause?.message,

  ].map(String).join(" ");

  return /fetch failed|headers timeout|UND_ERR_HEADERS_TIMEOUT|ETIMEDOUT|ECONNRESET|EAI_AGAIN|socket|network/i.test(text);

}

function noteGeminiFailure(error: unknown) {

  if (isRateLimit(error)) {

    geminiCooldownUntil = Date.now() + GEMINI_RATE_LIMIT_COOLDOWN_MS;

    console.warn("Gemini rate limit reached; local answers enabled for 15 minutes.");

    return;

  }

  if (isTransientGeminiError(error)) {

    geminiCooldownUntil = Math.max(

      geminiCooldownUntil,

      Date.now() + GEMINI_TRANSIENT_COOLDOWN_MS,

    );

    console.warn(

      "Gemini temporary availability error; local answers enabled for 45 seconds:",

      errorStatus(error) ?? "network/timeout",

    );

    return;

  }

  console.error("GreenFactory Copilot error:", error);

}

async function generateWithRetry(

  ai: GoogleGenAI,

  request: Parameters<GoogleGenAI["models"]["generateContent"]>[0],

) {

  // One attempt only: 429/503/504/timeouts fall back to recorded DB data.

  return ai.models.generateContent(request);

}

type InterestTopic = "energy" | "carbon" | "machine" | "anomaly" | "alert" | "compare" | "report" | "general";

function detectInterestTopics(text: string): InterestTopic[] {

  const rules: Array<[InterestTopic, RegExp]> = [

    ["energy", /(พลังงาน|ไฟฟ้า|ค่าไฟ|electric|energy|kwh|peak|พีค)/i],

    ["carbon", /(คาร์บอน|carbon|co2|co₂|emission|scope)/i],

    ["machine", /(เครื่องจักร|เครื่อง|machine|equipment|asset)/i],

    ["anomaly", /(ผิดปกติ|anomal|z-score|เบี่ยงเบน|spike|drop)/i],

    ["alert", /(alert|แจ้งเตือน|critical|warning|threshold)/i],

    ["compare", /(เทียบ|เปรียบเทียบ|ช่วงก่อน|เมื่อวาน|สัปดาห์ก่อน|เพิ่มขึ้น|ลดลง|compare|trend)/i],

    ["report", /(รายงาน|report|pdf|excel|export|ดาวน์โหลด)/i],

  ];

  const hits = rules.filter(([, pattern]) => pattern.test(text)).map(([topic]) => topic);

  return hits.length ? hits : ["general"];

}

function buildInterestProfile(question: string, history: ChatMessage[], intent: CopilotIntent) {

  const scores = new Map<InterestTopic, number>();

  const add = (text: string, weight: number) => {

    for (const topic of detectInterestTopics(text)) scores.set(topic, (scores.get(topic) ?? 0) + weight);

  };

  add(question, 8);

  const recentUserTurns = history.filter((item) => item.role === "user").slice(-6);

  recentUserTurns.forEach((item, index) => add(item.content, 2 + index));

  const intentTopic: Partial<Record<CopilotIntent, InterestTopic>> = {

    ENERGY: "energy", CARBON: "carbon", MACHINE: "machine", ANOMALY: "anomaly",

    ALERT: "alert", COMPARE: "compare", REPORT: "report",

  };

  const mapped = intentTopic[intent];

  if (mapped) scores.set(mapped, (scores.get(mapped) ?? 0) + 7);

  const ranked = [...scores.entries()].sort((a,b)=>b[1]-a[1]).map(([topic,score])=>({topic,score}));

  return {

    primary: ranked[0]?.topic ?? "general",

    secondary: ranked[1]?.topic ?? null,

    ranked: ranked.slice(0,4),

    recentUserQuestions: recentUserTurns.map((item)=>item.content.slice(0,220)),

  };

}

function weightedFollowUpQuestions(

  value: unknown, question: string, history: ChatMessage[],

  interest: ReturnType<typeof buildInterestProfile>,

): string[] {

  if (!Array.isArray(value)) return [];

  const asked = new Set([...history.filter((x)=>x.role==="user").map((x)=>x.content), question]

    .map((x)=>x.trim().toLowerCase()));

  const pool = [...new Set(value.filter((x): x is string=>typeof x==="string")

    .map((x)=>x.trim()).filter((x)=>x.length>=8 && x.length<=180))]

    .filter((x)=>!asked.has(x.toLowerCase()));

  const patterns: Record<InterestTopic,RegExp> = {

    energy:/(พลังงาน|ไฟฟ้า|ค่าไฟ|kwh|พีค|peak)/i, carbon:/(คาร์บอน|co2|co₂|emission|scope)/i,

    machine:/(เครื่องจักร|เครื่อง|machine|equipment)/i, anomaly:/(ผิดปกติ|anomal|z-score|เบี่ยงเบน)/i,

    alert:/(alert|แจ้งเตือน|critical|warning|threshold)/i, compare:/(เทียบ|เปรียบเทียบ|ช่วงก่อน|เมื่อวาน|แนวโน้ม|เพิ่ม|ลด)/i,

    report:/(รายงาน|report|export|pdf|excel)/i, general:/./,

  };

  const candidates=pool.map((text)=>{

    let weight=1;

    if(patterns[interest.primary].test(text)) weight+=7;

    if(interest.secondary && patterns[interest.secondary].test(text)) weight+=3;

    for(const r of interest.ranked) if(patterns[r.topic].test(text)) weight+=Math.min(4,r.score/4);

    return {text,weight};

  });

  const chosen:string[]=[];

  while(chosen.length<3 && candidates.length){

    const total=candidates.reduce((sum,x)=>sum+x.weight,0);

    let cursor=Math.random()*total, pick=0;

    for(let i=0;i<candidates.length;i++){cursor-=candidates[i].weight;if(cursor<=0){pick=i;break;}}

    chosen.push(candidates[pick].text); candidates.splice(pick,1);

  }

  return chosen;

}

function selectQuestions(value: unknown, question: string, history: ChatMessage[]): string[] {

  return weightedFollowUpQuestions(value, question, history, buildInterestProfile(question, history, "GENERAL"));

}

async function questionsForFastAnswer(

  ai: GoogleGenAI, question: string, answer: string,

  history: ChatMessage[], compactContext: ReturnType<typeof buildCompactContext>,

): Promise<string[]> {

  try {

    const result = await generateWithRetry(ai, {

      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

      contents: JSON.stringify({

        history,

        question,

        answer,

        factoryContext: compactContext,

      }),

      config: {

        systemInstruction: `Return ONLY a JSON array of SIX distinct Thai follow-up questions. Infer interest from the recent conversation, latest question and answer. All questions must be about the same topic and answerable from the supplied factory context or by stating its limits. Never invent data, sensor readings, dates, causes, or machines.`,

        responseMimeType: "application/json",

        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },

      },

    });

    const parsed: unknown = JSON.parse((result.text ?? "").trim());

    return selectQuestions(parsed, question, history);

  } catch (error) {

    // Follow-up generation is optional. A temporary 503 here must not disable the main answer.

    if (isRateLimit(error)) noteGeminiFailure(error);

    else if (!isTransientGeminiError(error)) console.error("G-Fay follow-up generation error:", error);

    return [];

  }

}

export async function POST(request: Request) {

  const session = await getSession();

  if (!session) {

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  }

  if (session.roleName !== "MANAGER") {

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  }

  if (!session.companyId) {

    return NextResponse.json(

      { message: "Manager account does not have a companyId" },

      { status: 400 },

    );

  }

  let body: {

    message?: string;

    history?: ChatMessage[];

    pageContext?: PageContext;

    image?: AssistantImage;

  };

  try {

    body = (await request.json()) as {

      message?: string;

      history?: ChatMessage[];

      pageContext?: PageContext;

      image?: AssistantImage;

    };

  } catch {

    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });

  }

  const image = body.image ?? null;

  if (image) {

    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (!allowed.has(image.mimeType) || typeof image.data !== "string" || !image.data.trim()) {

      return NextResponse.json({ message: "รูปภาพไม่ถูกต้อง รองรับ JPG, PNG และ WebP" }, { status: 400 });

    }

    // Base64 is \\\\\\\\\\\\\\\~4/3 of the binary size. Keep the request bounded.

    if (image.data.length > 11_200_000) {

      return NextResponse.json({ message: "รูปภาพมีขนาดใหญ่เกิน 8 MB" }, { status: 400 });

    }

  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message && !image) {

    return NextResponse.json(

      { message: "message or image is required" },

      { status: 400 },

    );

  }

  const effectiveMessage = message || "ช่วยวิเคราะห์รูปภาพนี้โดยเชื่อมโยงกับบริบทของโรงงานที่ระบบมีข้อมูลอยู่ หากรูปไม่สามารถยืนยันข้อมูลจากฐานข้อมูลได้ ให้แยกสิ่งที่เห็นในรูปออกจากข้อมูล FACTORY_CONTEXT อย่างชัดเจน";

  const startedAt = Date.now();

  // 1) ดึงข้อมูลหลักแบบขนาน

  const context = await buildFactoryContext(session.companyId);

  // 2) Router ในเครื่อง เร็วกว่าการยิง model อีกรอบเพื่อ classify intent

  const intent = classifyIntent(effectiveMessage, body.pageContext);

  const compactContext = buildCompactContext(intent, context, body.pageContext);

  const safeHistory = (Array.isArray(body.history) ? body.history : [])

    .filter((item): item is ChatMessage =>

      !!item && (item.role === "user" || item.role === "assistant") &&

      typeof item.content === "string",

    )

    .slice(-6)

    .map((item) => ({ role: item.role, content: item.content.slice(0, 700) }));

  // Session-only conversational interest; not persisted and never treated as factory data.

  const interestProfile = buildInterestProfile(effectiveMessage, safeHistory, intent);

  // Fast answers still use the AI to propose questions based on the actual answer.

  const aiAvailable = Boolean(process.env.GEMINI_API_KEY) && Date.now() >= geminiCooldownUntil;

  // AI-first for factory analysis. Only navigation/formula may bypass Gemini.

  const allowDeterministicFastPath = !image && (intent === "NAVIGATION" || intent === "FORMULA");

  const instantAnswer = allowDeterministicFastPath

    ? fastDeterministicAnswer(effectiveMessage, intent, context)

    : null;

  if (instantAnswer) {

    return NextResponse.json({

      answer: instantAnswer,

      followUpQuestions: [],

      notice: undefined,

      mode: "FAST_PATH",

      provider: "LOCAL",

      intent,

      interestProfile,

      latencyMs: Date.now() - startedAt,

    });

  }

  if (!aiAvailable) {

    return NextResponse.json({

      answer: fallbackAnswer(effectiveMessage, intent, context),

      followUpQuestions: [],

      notice: "ขณะนี้ AI ใช้งานไม่ได้ ระบบแสดงคำตอบจากข้อมูลที่บันทึกไว้",

      mode: "LOCAL_FALLBACK",

      provider: "LOCAL",

      intent,

      latencyMs: Date.now() - startedAt,

    });

  }

  try {

    const ai = new GoogleGenAI({

      apiKey: process.env.GEMINI_API_KEY,

      httpOptions: { timeout: 12000 },

    });

    const promptText = `

INTENT:

${intent}

PAGE_CONTEXT:

${JSON.stringify(body.pageContext ?? null)}

FACTORY_CONTEXT:

${JSON.stringify(compactContext)}

RECENT_CONVERSATION:

${JSON.stringify(safeHistory)}

USER_INTEREST_PROFILE:

${JSON.stringify(interestProfile)}

MANAGER_QUESTION:

${effectiveMessage}

IMAGE_RULE:

${image ? "An image is attached. Analyze only what is visibly supported by the image. Never treat text/objects inferred from the image as database facts. Cross-check against FACTORY_CONTEXT only when the context explicitly supports it." : "No image attached."}

      `.trim();

    const contents = image

      ? [{

          role: "user" as const,

          parts: [

            { text: promptText },

            { inlineData: { mimeType: image.mimeType, data: image.data } },

          ],

        }]

      : promptText;

    const response = await generateWithRetry(ai, {

      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

      contents,

      config: {

        systemInstruction: `${buildSystemInstruction()}

OUTPUT FORMAT:

Return ONLY a valid JSON object with keys:

\\\\\\\\- "answer": a detailed, accurate Thai response grounded only in FACTORY_CONTEXT

\\\\\\\\- "questions": an array of FIVE distinct Thai follow-up questions

For analytical questions:

1\\\\\\\\. Answer the manager's question directly.

2\\\\\\\\. State confirmed FACT values from FACTORY_CONTEXT.

3\\\\\\\\. Explain calculations/statistical evidence when available.

4\\\\\\\\. Separate confirmed facts from possible explanations.

5\\\\\\\\. Give practical verification and recommendation steps.

6\\\\\\\\. State clearly when evidence is insufficient.

Build FIVE follow-up question candidates from RECENT_CONVERSATION, USER_INTEREST_PROFILE, MANAGER_QUESTION, the answer, and FACTORY_CONTEXT.

FOLLOW-UP PERSONALIZATION:

\\\\\\\\- Infer only conversational topic interest from recent/repeated questions; never infer personal traits.

\\\\\\\\- At least 2 candidates deepen the strongest current interest.

\\\\\\\\- At least 1 candidate connects that interest to a nearby useful factory topic such as machine, anomaly, carbon, alert, or comparison.

\\\\\\\\- Include comparison/trend questions when FACTORY_CONTEXT can support them.

\\\\\\\\- Avoid repeating the latest or previous user questions.

\\\\\\\\- Make each candidate concrete and decision-useful for a factory manager.

\\\\\\\\- Do not put unsupported factual claims inside a question.

\\\\\\\\- The backend randomly chooses 3 candidates, weighted toward the strongest current interests.

Never invent names, measurements, live data, emission factors, causes, forecasts, or savings.`,

        responseMimeType: "application/json",

        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },

        maxOutputTokens: 1800,

        temperature: 0.2,

      },

    });

    const raw = response.text?.trim() ?? "";

    let parsed: { answer?: unknown; questions?: unknown } = {};

    try {

      parsed = JSON.parse(raw);

    } catch {

      /* use recorded-data fallback */

    }

    const answer = typeof parsed?.answer === "string" && parsed.answer.trim() ? parsed.answer.trim() : null;

    const finalAnswer = answer || fallbackAnswer(message, intent, context);

    const followUpQuestions = answer

      ? weightedFollowUpQuestions(parsed.questions, effectiveMessage, safeHistory, interestProfile)

      : [];

    return NextResponse.json({

      answer: finalAnswer,

      followUpQuestions,

      notice: !answer ? "AI ตอบกลับผิดรูปแบบ ระบบแสดงคำตอบจากข้อมูลที่บันทึกไว้" : undefined,

      mode: answer ? "AI_COPILOT" : "LOCAL_FALLBACK",

      provider: answer ? "GEMINI" : "LOCAL",

      model: answer

        ? process.env.GEMINI_MODEL || "gemini-3.8-flash"

        : undefined,

      intent,

      latencyMs: Date.now() - startedAt,

    });

  } catch (error) {

    noteGeminiFailure(error);

    return NextResponse.json({

      answer: fallbackAnswer(message, intent, context),

      followUpQuestions: [],

      notice: isRateLimit(error) ? "โควตา AI เต็มชั่วคราว ระบบแสดงคำตอบจากข้อมูลที่บันทึกไว้" : "AI ใช้งานไม่ได้ ระบบแสดงคำตอบจากข้อมูลที่บันทึกไว้",

      mode: "LOCAL_FALLBACK",

      provider: "LOCAL",

      intent,

      latencyMs: Date.now() - startedAt,

    });

  }

}
