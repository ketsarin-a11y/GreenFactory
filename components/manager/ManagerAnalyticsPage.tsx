
"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  CalendarDays,
  Database,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Droplets,
  Factory,
  Flame,
  Fuel,
  Gauge,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Wind,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type {
  ManagerAnalyticsFilterOptions,
  ResourceDetailData,
  ResourceMetricFilters,
} from "@/lib/manager queries";

type MetricKey =
  | "energy"
  | "water"
  | "compressedAir"
  | "gas"
  | "steam"
  | "nitrogen"
  | "diesel";

type ResourceMap = Record<MetricKey, ResourceDetailData>;

interface ManagerAnalyticsPageProps {
  resources: ResourceMap;
  filterOptions: ManagerAnalyticsFilterOptions;
  selectedFilters: ResourceMetricFilters;
  dateFrom: string;
  dateTo: string;
}

type PriorityLevel = "normal" | "watch" | "attention";

interface DailyPoint {
  dateKey: string;
  dateLabel: string;
  value: number;
  mean: number;
  upperBand: number;
  lowerBand: number;
  zScore: number;
  isAnomaly: boolean;
}

interface SmartFinding {
  id: string;
  level: PriorityLevel;
  title: string;
  description: string;
  metric: MetricKey;
}

interface ForecastPoint {
  dateKey: string;
  dateLabel: string;
  actual?: number;
  forecast?: number;
  confidenceRange?: [number, number];
  phase: "actual" | "forecast";
}

interface EvidenceContributor {
  machineId: number | null;
  machineCode: string;
  machineName: string;
  total: number;
  recordCount: number;
  percent: number;
}

interface EvidenceRecord {
  id: string;
  reference: string;
  quantity: number;
  unit: string;
  machineName: string;
  buildingName: string;
  departmentName: string;
  sourceType: string;
  processingStatus: string;
}

interface ResourceEvidence {
  date: string;
  observed: number;
  unit: string;
  statistics: {
    mean: number;
    standardDeviation: number;
    upperBand: number;
    lowerBand: number;
    zScore: number;
    threshold: number;
    isAnomaly: boolean;
    sampleDays: number;
  };
  conclusion: string;
  contributors: EvidenceContributor[];
  records: EvidenceRecord[];
  dataLineage: {
    source: string;
    resourceCodes: string[];
  };
}

const RESOURCE_META: Record<
  MetricKey,
  {
    label: string;
    totalLabel: string;
    icon: LucideIcon;
    line: string;
    fill: string;
    barClass: string;
    softClass: string;
    strongClass: string;
  }
> = {
  energy: {
    label: "ไฟฟ้า",
    totalLabel: "ไฟฟ้ารวม",
    icon: Zap,
    line: "#059669",
    fill: "#10b981",
    barClass: "bg-emerald-500",
    softClass: "bg-emerald-50 text-emerald-700",
    strongClass: "bg-emerald-600 text-white",
  },
  water: {
    label: "น้ำ",
    totalLabel: "น้ำรวม",
    icon: Droplets,
    line: "#0284c7",
    fill: "#38bdf8",
    barClass: "bg-sky-500",
    softClass: "bg-sky-50 text-sky-700",
    strongClass: "bg-sky-600 text-white",
  },
  compressedAir: {
    label: "ลมอัด",
    totalLabel: "ลมอัดรวม",
    icon: Wind,
    line: "#7c3aed",
    fill: "#8b5cf6",
    barClass: "bg-violet-500",
    softClass: "bg-violet-50 text-violet-700",
    strongClass: "bg-violet-600 text-white",
  },
  gas: {
    label: "ก๊าซ",
    totalLabel: "ก๊าซรวม",
    icon: Flame,
    line: "#d97706",
    fill: "#f59e0b",
    barClass: "bg-amber-500",
    softClass: "bg-amber-50 text-amber-700",
    strongClass: "bg-amber-500 text-white",
  },
  steam: {
    label: "ไอน้ำ",
    totalLabel: "ไอน้ำรวม",
    icon: Cloud,
    line: "#475569",
    fill: "#64748b",
    barClass: "bg-slate-600",
    softClass: "bg-slate-100 text-slate-700",
    strongClass: "bg-slate-700 text-white",
  },
  nitrogen: {
    label: "ไนโตรเจน",
    totalLabel: "ไนโตรเจนรวม",
    icon: Cloud,
    line: "#0891b2",
    fill: "#06b6d4",
    barClass: "bg-cyan-500",
    softClass: "bg-cyan-50 text-cyan-700",
    strongClass: "bg-cyan-600 text-white",
  },
  diesel: {
    label: "ดีเซล",
    totalLabel: "ดีเซลรวม",
    icon: Fuel,
    line: "#e11d48",
    fill: "#f43f5e",
    barClass: "bg-rose-500",
    softClass: "bg-rose-50 text-rose-700",
    strongClass: "bg-rose-600 text-white",
  },
};

const METRIC_ORDER: MetricKey[] = [
  "energy",
  "water",
  "compressedAir",
  "gas",
  "steam",
  "nitrogen",
  "diesel",
];

const RESOURCE_CODES: Record<MetricKey, string[]> = {
  energy: ["ELECTRICITY"],
  water: ["WATER", "DI_WATER", "CHILLED_WATER"],
  compressedAir: ["COMPRESSED_AIR"],
  gas: ["GAS"],
  steam: ["STEAM"],
  nitrogen: ["NITROGEN"],
  diesel: ["DIESEL"],
};

export default function ManagerAnalyticsPage({
  resources,
  filterOptions,
  selectedFilters,
  dateFrom,
  dateTo,
}: ManagerAnalyticsPageProps) {
  const router = useRouter();

  const [metric, setMetric] = useState<MetricKey>("energy");
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);

  const [buildingId, setBuildingId] = useState(
    selectedFilters.buildingId ? String(selectedFilters.buildingId) : "",
  );
  const [departmentId, setDepartmentId] = useState(
    selectedFilters.departmentId ? String(selectedFilters.departmentId) : "",
  );
  const [lineId, setLineId] = useState(
    selectedFilters.productionLineId
      ? String(selectedFilters.productionLineId)
      : "",
  );
  const [machineId, setMachineId] = useState(
    selectedFilters.machineId ? String(selectedFilters.machineId) : "",
  );
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<ResourceEvidence | null>(null);

  const active = resources[metric];
  const metricMeta = RESOURCE_META[metric];
  const MetricIcon = metricMeta.icon;

  const availableDepartments = useMemo(() => {
    const building = numberOrUndefined(buildingId);

    return filterOptions.departments.filter((item) => {
      return !building || item.buildingId === building;
    });
  }, [buildingId, filterOptions.departments]);

  const availableLines = useMemo(() => {
    const building = numberOrUndefined(buildingId);
    const department = numberOrUndefined(departmentId);

    return filterOptions.productionLines.filter((item) => {
      if (building && item.buildingId !== building) return false;
      if (department && item.departmentId !== department) return false;
      return true;
    });
  }, [buildingId, departmentId, filterOptions.productionLines]);

  const availableMachines = useMemo(() => {
    const building = numberOrUndefined(buildingId);
    const department = numberOrUndefined(departmentId);
    const line = numberOrUndefined(lineId);

    return filterOptions.machines.filter((item) => {
      if (building && item.buildingId !== building) return false;
      if (department && item.departmentId !== department) return false;
      if (line && item.lineId !== line) return false;
      return true;
    });
  }, [
    buildingId,
    departmentId,
    lineId,
    filterOptions.machines,
  ]);

  const selectedBuildingName =
    filterOptions.buildings.find((item) => String(item.id) === buildingId)
      ?.name ?? null;

  const selectedDepartmentName =
    filterOptions.departments.find((item) => String(item.id) === departmentId)
      ?.name ?? null;

  const selectedLineName =
    filterOptions.productionLines.find((item) => String(item.id) === lineId)
      ?.name ?? null;

  const selectedMachine =
    filterOptions.machines.find((item) => String(item.id) === machineId) ?? null;

  const contextLabel = [
    selectedBuildingName,
    selectedDepartmentName,
    selectedLineName,
    selectedMachine
      ? `${selectedMachine.code} · ${selectedMachine.name}`
      : null,
  ]
    .filter(Boolean)
    .join(" → ");

  const chartData = useMemo<DailyPoint[]>(() => {
    const base = active.trend.map((point) => {
      const value = Object.entries(point)
        .filter(([key]) => key !== "dateLabel" && key !== "dateKey")
        .reduce((sum, [, current]) => sum + (Number(current) || 0), 0);

      return {
        dateKey: point.dateKey,
        dateLabel: point.dateLabel,
        value,
      };
    });

    if (base.length === 0) return [];

    const values = base.map((item) => item.value);
    const average = mean(values);
    const std = populationStdDev(values, average);
    const upperBand = average + 2 * std;
    const lowerBand = Math.max(0, average - 2 * std);

    return base.map((item) => {
      const zScore = std > 0 ? (item.value - average) / std : 0;

      return {
        ...item,
        mean: average,
        upperBand,
        lowerBand,
        zScore,
        isAnomaly: Math.abs(zScore) >= 2,
      };
    });
  }, [active.trend]);

  const forecast = useMemo(() => {
    const history = chartData.slice(-14);
    const values = history.map((item) => item.value);

    if (history.length < 3) {
      return {
        points: [] as ForecastPoint[],
        next7Total: 0,
        changePct: 0,
        lowerTotal: 0,
        upperTotal: 0,
        confidence: 0,
        enoughData: false,
      };
    }

    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = mean(values);

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i += 1) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += (i - xMean) ** 2;
    }

    const slope = denominator > 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    const fitted = values.map((_, i) => intercept + slope * i);
    const residuals = values.map((value, i) => value - fitted[i]);
    const residualStd = populationStdDev(residuals, mean(residuals));

    const last = history[history.length - 1];
    const lastDate = new Date(`${last.dateKey}T00:00:00`);

    const actualPoints: ForecastPoint[] = history.map((item) => ({
      dateKey: item.dateKey,
      dateLabel: item.dateLabel,
      actual: item.value,
      phase: "actual",
    }));

    actualPoints[actualPoints.length - 1] = {
      dateKey: last.dateKey,
      dateLabel: last.dateLabel,
      actual: last.value,
      forecast: last.value,
      confidenceRange: [last.value, last.value],
      phase: "actual",
    };

    const futurePoints: ForecastPoint[] = [];
    const futureValues: number[] = [];
    const lowerValues: number[] = [];
    const upperValues: number[] = [];

    for (let step = 1; step <= 7; step += 1) {
      const predicted = Math.max(0, intercept + slope * (n - 1 + step));
      const uncertainty =
        1.96 * residualStd * Math.sqrt(1 + step / Math.max(n, 1));
      const lower = Math.max(0, predicted - uncertainty);
      const upper = Math.max(lower, predicted + uncertainty);

      const date = new Date(lastDate);
      date.setDate(date.getDate() + step);
      const dateKey = localDateKey(date);

      futureValues.push(predicted);
      lowerValues.push(lower);
      upperValues.push(upper);
      futurePoints.push({
        dateKey,
        dateLabel: formatThaiDate(dateKey),
        forecast: predicted,
        confidenceRange: [lower, upper],
        phase: "forecast",
      });
    }

    const next7Total = futureValues.reduce((sum, value) => sum + value, 0);
    const recent = values.slice(-7);
    const recentTotal = recent.reduce((sum, value) => sum + value, 0);
    const normalizedRecent =
      recent.length > 0 ? (recentTotal / recent.length) * 7 : 0;
    const changePct =
      normalizedRecent > 0
        ? ((next7Total - normalizedRecent) / normalizedRecent) * 100
        : 0;

    const variability = yMean > 0 ? Math.min(1, residualStd / yMean) : 1;

    return {
      points: [...actualPoints, ...futurePoints],
      next7Total,
      changePct,
      lowerTotal: lowerValues.reduce((sum, value) => sum + value, 0),
      upperTotal: upperValues.reduce((sum, value) => sum + value, 0),
      confidence: Math.round(
        Math.max(55, Math.min(95, 95 - variability * 55)),
      ),
      enoughData: true,
    };
  }, [chartData]);

  const statistics = useMemo(() => {
    const values = chartData.map((item) => item.value);

    if (values.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        anomalyCount: 0,
        maxAbsZ: 0,
      };
    }

    const average = mean(values);
    const stdDev = populationStdDev(values, average);

    return {
      average,
      min: Math.min(...values),
      max: Math.max(...values),
      stdDev,
      anomalyCount: chartData.filter((item) => item.isAnomaly).length,
      maxAbsZ: Math.max(...chartData.map((item) => Math.abs(item.zScore))),
    };
  }, [chartData]);

  const sortedBreakdown = useMemo(
    () => [...active.breakdown].sort((a, b) => b.value - a.value),
    [active.breakdown],
  );

  const maxDepartmentValue = sortedBreakdown[0]?.value ?? 0;

  const smartFindings = useMemo<SmartFinding[]>(() => {
    const findings: SmartFinding[] = [];

    for (const key of METRIC_ORDER) {
      const item = resources[key];
      const meta = RESOURCE_META[key];

      if (item.total <= 0) continue;
if (item.changePct === null) continue;

if (item.changePct >= 25) {
        findings.push({
          id: `${key}-change-high`,
          level: "attention",
          title: `${meta.label}เพิ่มขึ้น ${formatNumber(item.changePct)}%`,
          description:
            item.breakdown[0]
              ? `${item.breakdown[0].department} มีสัดส่วนสูงสุด ${formatNumber(
                  item.breakdown[0].percent,
                )}% ของการใช้${meta.label}`
              : `สูงกว่าช่วงก่อนหน้าอย่างชัดเจน ควรตรวจดูรายละเอียด`,
          metric: key,
        });
      } else if (item.changePct >= 10) {
        findings.push({
          id: `${key}-change-watch`,
          level: "watch",
          title: `${meta.label}เพิ่มขึ้น ${formatNumber(item.changePct)}%`,
          description:
            item.breakdown[0]
              ? `สัดส่วนตามแผนกคือ ${item.breakdown[0].department} ที่ ${formatNumber(
                  item.breakdown[0].percent,
                )}%`
              : `ระบบแนะนำให้ติดตามแนวโน้มต่อเนื่อง`,
          metric: key,
        });
      }

      if (item.breakdown[0]?.percent >= 60) {
        findings.push({
          id: `${key}-concentration`,
          level: item.breakdown[0].percent >= 75 ? "attention" : "watch",
          title: `${meta.label}กระจุกตัวที่ ${item.breakdown[0].department}`,
          description: `${item.breakdown[0].department} คิดเป็น ${formatNumber(
            item.breakdown[0].percent,
          )}% ของการใช้${meta.label}ทั้งหมดในช่วงที่เลือก`,
          metric: key,
        });
      }
    }

    if (statistics.anomalyCount > 0) {
      findings.unshift({
        id: `${metric}-anomaly`,
        level: "attention",
        title: `พบ ${statistics.anomalyCount} วันที่ผิดปกติใน${metricMeta.label}`,
        description: `ระบบตรวจด้วย Z-score และพบค่าสูงสุด |z| = ${formatNumber(
          statistics.maxAbsZ,
        )}`,
        metric,
      });
    }

    if (findings.length === 0) {
      findings.push({
        id: "normal",
        level: "normal",
        title: "ยังไม่พบสัญญาณผิดปกติ",
        description:
          "ข้อมูลช่วงนี้ยังไม่เข้าเกณฑ์เฝ้าระวัง",
        metric,
      });
    }

    const priority = { attention: 0, watch: 1, normal: 2 } as const;

    return findings
      .sort((a, b) => priority[a.level] - priority[b.level])
      .slice(0, 4);
  }, [
    resources,
    metric,
    metricMeta.label,
    statistics.anomalyCount,
    statistics.maxAbsZ,
  ]);

  const overallStatus = useMemo<PriorityLevel>(() => {
    if (smartFindings.some((item) => item.level === "attention")) {
      return "attention";
    }

    if (smartFindings.some((item) => item.level === "watch")) {
      return "watch";
    }

    return "normal";
  }, [smartFindings]);

  const managerBrief = useMemo(() => {
    const activeResources = METRIC_ORDER
      .filter((key) => resources[key].total > 0)
      .map((key) => ({
        key,
        change: resources[key].changePct,
        total: resources[key].total,
      }));

    const comparableResources = activeResources.filter(
  (item): item is typeof item & { change: number } =>
    item.change !== null,
);

const largestIncrease = [...comparableResources].sort(
  (a, b) => b.change - a.change,
)[0];
const topDepartment = sortedBreakdown[0];

    if (overallStatus === "attention") {
      const primary = smartFindings.find((item) => item.level === "attention");
      return {
        eyebrow: "ต้องตรวจสอบ",
        title: primary?.title ?? "พบสัญญาณที่ควรตรวจสอบ",
        body:
          primary?.description ??
          "ระบบพบรูปแบบการใช้ทรัพยากรที่ควรตรวจสอบเพิ่มเติมจากข้อมูลในช่วงที่เลือก",
      };
    }
    if (overallStatus === "watch") {
      return {
        eyebrow: "ควรติดตาม",
        title: "มีแนวโน้มที่ควรติดตาม",
        body:
          largestIncrease && largestIncrease.change > 0
            ? `${RESOURCE_META[largestIncrease.key].label}เพิ่มขึ้น ${formatNumber(
                largestIncrease.change,
              )}% จากช่วงก่อนหน้า${
                topDepartment
                  ? ` และ ${topDepartment.department} เป็นสัดส่วนตามแผนกของทรัพยากรที่กำลังดู`
                  : ""
              }`
            : "ยังไม่มีเหตุเร่งด่วน แต่ควรติดตามแนวโน้มต่อเนื่อง",
      };
    }
    return {
      eyebrow: "ภาพรวมปกติ",
      title: "ยังไม่พบประเด็นเร่งด่วน",
      body:
        activeResources.length > 0
          ? "แนวโน้มและค่าผิดปกติอยู่ในเกณฑ์ปกติ"
          : "ยังไม่มีข้อมูลทรัพยากรในช่วงและขอบเขตที่เลือก",
    };
  }, [overallStatus, resources, smartFindings, sortedBreakdown]);

  async function openEvidence(dateKey: string) {
    if (!dateKey) return;

    const params = new URLSearchParams({
      date: dateKey,
      from: dateFrom,
      to: dateTo,
      resources: RESOURCE_CODES[metric].join(","),
    });
    if (buildingId) params.set("building", buildingId);
    if (departmentId) params.set("department", departmentId);
    if (lineId) params.set("line", lineId);
    if (machineId) params.set("machine", machineId);

    setEvidenceOpen(true);
    setEvidenceLoading(true);
    setEvidenceError(null);
    setEvidence(null);

    try {
      const response = await fetch(`/api/manager/evidence/resource?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("application/json")) {
        throw new Error("ไม่สามารถโหลดหลักฐานของวันที่เลือกได้");
      }
      setEvidence((await response.json()) as ResourceEvidence);
    } catch (error) {
      setEvidenceError(error instanceof Error ? error.message : "ไม่สามารถโหลดหลักฐานได้");
    } finally {
      setEvidenceLoading(false);
    }
  }

  function buildUrl() {
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (buildingId) params.set("building", buildingId);
    if (departmentId) params.set("department", departmentId);
    if (lineId) params.set("line", lineId);
    if (machineId) params.set("machine", machineId);

    return `/manager/overview?${params.toString()}`;
  }

  function applyFilters() {
    if (!from || !to) return;
    router.push(buildUrl());
  }

  function resetAll() {
    router.push("/manager/overview");
  }

  function changeBuilding(value: string) {
    setBuildingId(value);
    setDepartmentId("");
    setLineId("");
    setMachineId("");
  }

  function changeDepartment(value: string) {
    setDepartmentId(value);
    setLineId("");
    setMachineId("");
  }

  function changeLine(value: string) {
    setLineId(value);
    setMachineId("");
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-12 text-slate-900">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-200/60">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative px-6 py-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300"><Sparkles className="h-3.5 w-3.5" /> Factory Intelligence</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"><Database className="h-3.5 w-3.5" /> Live Resource Analytics</span>
          </div>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl xl:text-[44px]">ศูนย์วิเคราะห์และคาดการณ์ทรัพยากรโรงงาน</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">เปลี่ยน ResourceUsage จากฐานข้อมูลให้เป็นสัญญาณที่ Manager ใช้ตัดสินใจได้ทันที ทั้งแนวโน้ม ความผิดปกติ จุดที่ใช้ทรัพยากรสูง และ Forecast 7 วัน</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Z-score Anomaly</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Evidence Investigation</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Linear Regression Forecast</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Department Contribution</span>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><SlidersHorizontal className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-slate-950">Analysis Scope</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">กำหนดครั้งเดียว</span></div><p className="mt-1 text-sm text-slate-500">เลือกช่วงเวลาและขอบเขตของโรงงาน แล้วกดอัปเดตการวิเคราะห์เพียงครั้งเดียว</p></div></div>
          <button type="button" onClick={resetAll} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> รีเซ็ตเป็นทั้งโรงงาน</button>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <DateField label="จากวันที่" value={from} onChange={setFrom} />
            <DateField label="ถึงวันที่" value={to} onChange={setTo} />
            <FilterSelect label="อาคาร" icon={Building2} value={buildingId} onChange={changeBuilding} placeholder="ทุกอาคาร" options={filterOptions.buildings.map((item) => ({ value: String(item.id), label: item.name }))} />
            <FilterSelect label="แผนก" icon={Layers3} value={departmentId} onChange={changeDepartment} placeholder="ทุกแผนก" disabled={availableDepartments.length === 0} options={availableDepartments.map((item) => ({ value: String(item.id), label: item.name }))} />
            <FilterSelect label="สายการผลิต" icon={Factory} value={lineId} onChange={changeLine} placeholder="ทุกสายการผลิต" disabled={availableLines.length === 0} options={availableLines.map((item) => ({ value: String(item.id), label: item.name }))} />
            <FilterSelect label="เครื่องจักร" icon={Wrench} value={machineId} onChange={setMachineId} placeholder="ทุกเครื่องจักร" disabled={availableMachines.length === 0} options={availableMachines.map((item) => ({ value: String(item.id), label: `${item.code} · ${item.name}` }))} />
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-sm text-slate-500">{contextLabel ? <span>ขอบเขตที่เลือก: <strong className="font-semibold text-slate-800">{contextLabel}</strong></span> : <span>ขอบเขตที่เลือก: <strong className="font-semibold text-slate-800">ทั้งโรงงาน</strong></span>}</div>
            <button type="button" onClick={applyFilters} disabled={!from || !to} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Search className="h-4 w-4" /> อัปเดตการวิเคราะห์</button>
          </div>
        </div>
      </section>
      <section className={`overflow-hidden rounded-3xl border shadow-sm ${overallStatus === "attention" ? "border-rose-200 bg-gradient-to-br from-rose-50 to-white" : overallStatus === "watch" ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white" : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"}`}>
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4"><StatusIcon level={overallStatus} large /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className={`text-xs font-bold uppercase tracking-[0.14em] ${overallStatus === "attention" ? "text-rose-700" : overallStatus === "watch" ? "text-amber-700" : "text-emerald-700"}`}>Executive Signal · {managerBrief.eyebrow}</p><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">AUTO ANALYZED</span></div><h2 className="mt-2 text-2xl font-bold leading-snug text-slate-950">{managerBrief.title}</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">{managerBrief.body}</p></div></div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]"><ExecutiveStat label="Anomaly" value={`${statistics.anomalyCount} วัน`} attention={statistics.anomalyCount > 0} /><ExecutiveStat label="Resource" value={metricMeta.label} /><ExecutiveStat label="Forecast" value={forecast.enoughData ? `${forecast.confidence}%` : "รอข้อมูล"} /></div>
        </div>
      </section>
      <Panel title="Manager Priority Feed" right={<span className="text-sm text-slate-500">ระบบจัดลำดับสิ่งที่ควรตรวจสอบให้อัตโนมัติ</span>}>
        <div className="grid gap-3 lg:grid-cols-3">
          {smartFindings.slice(0, 3).map((finding, index) => (
            <button key={finding.id} type="button" onClick={() => setMetric(finding.metric)} className="group flex min-h-[132px] w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-bold text-white">0{index + 1}</span><StatusIcon level={finding.level} />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{finding.title}</p>{index === 0 && finding.level !== "normal" && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">PRIORITY</span>}</div><p className="mt-1 text-sm leading-6 text-slate-600">{finding.description}</p><span className="mt-3 inline-flex text-xs font-semibold text-slate-400 transition group-hover:text-emerald-700">ดูทรัพยากรนี้ →</span></div>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Resource Focus" right={<span className="text-sm text-slate-500">สลับทรัพยากรได้ทันที · ไม่ต้องกดอัปเดตอีกครั้ง</span>}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {METRIC_ORDER.map((key) => { const item = resources[key]; const meta = RESOURCE_META[key]; const Icon = meta.icon; const isActive = key === metric; return (
            <button key={key} type="button" onClick={() => setMetric(key)} className={`min-h-[118px] rounded-2xl border p-3 text-left transition ${isActive ? "border-slate-950 bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-2"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : meta.softClass}`}><Icon className="h-4 w-4" /></span>{item.changePct !== null && <ChangePill value={item.changePct} inverse={isActive} />}</div><p className={`mt-3 text-sm font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>{meta.label}</p><p className={`mt-0.5 text-xs ${isActive ? "text-slate-400" : "text-slate-500"}`}>{formatNumber(item.total)} {item.unit}</p>
            </button>
          ); })}
        </div>
      </Panel>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={metricMeta.totalLabel}
          value={formatNumber(active.total)}
          unit={active.unit}
          icon={MetricIcon}
          iconClass={metricMeta.softClass}
          description={`รวมการใช้${metricMeta.label}ในขอบเขตที่ระบบกำลังวิเคราะห์`}
        />

        {active.changePct === null ? (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs text-slate-400">การเปลี่ยนแปลง</p>
    <p className="mt-1 text-sm font-medium text-slate-500">
      ไม่มีข้อมูลช่วงก่อนหน้าสำหรับเปรียบเทียบ
    </p>
  </div>
) : (
  <ChangeCard change={active.changePct} />
)}

        <SummaryCard
          label="เฉลี่ยต่อวัน"
          value={formatNumber(statistics.average)}
          unit={active.unit}
          icon={Gauge}
          iconClass="bg-violet-50 text-violet-700"
          description="คำนวณจากข้อมูลรายวันที่มีในช่วงปัจจุบัน"
        />

        <SummaryCard
          label="ความผิดปกติ"
          value={String(statistics.anomalyCount)}
          unit="วัน"
          icon={Activity}
          iconClass={
            statistics.anomalyCount > 0
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }
          description={
            statistics.anomalyCount > 0
              ? `พบจากเกณฑ์ |z| ≥ 2 · สูงสุด ${formatNumber(
                  statistics.maxAbsZ,
                )}`
              : "ยังไม่พบวันที่เกินเกณฑ์ |z| ≥ 2"
          }
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.72fr)]">
        <Panel
          title={`แนวโน้ม${metricMeta.label}`}
          right={
            <span className="text-sm text-slate-500">
              {formatThaiDate(dateFrom)} – {formatThaiDate(dateTo)}
            </span>
          }
        >
          {chartData.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูลในช่วงเวลาและขอบเขตที่เลือก" />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-sm font-medium text-slate-500">คลิกจุดบนกราฟเพื่อดูสาเหตุ</span>
                <InfoPill
                  icon={Gauge}
                  label={`เฉลี่ย ${formatNumber(statistics.average)} ${
                    active.unit
                  }`}
                />
                <InfoPill
                  icon={Activity}
                  label={`σ ${formatNumber(statistics.stdDev)}`}
                />
                <InfoPill
                  icon={AlertTriangle}
                  label={`Anomaly ${statistics.anomalyCount} วัน`}
                />
              </div>

              <div className="h-[390px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 12, right: 20, left: 12, bottom: 8 }}
                    onClick={(state) => {
                      const rawIndex = state?.activeTooltipIndex;
                      const index =
                        typeof rawIndex === "number"
                          ? rawIndex
                          : typeof rawIndex === "string"
                            ? Number(rawIndex)
                            : -1;

                      const point =
                        Number.isInteger(index) && index >= 0
                          ? chartData[index]
                          : undefined;

                      if (point?.dateKey) {
                        void openEvidence(point.dateKey);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <defs>
                      <linearGradient
                        id="analyticsAreaFillSmart"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={metricMeta.fill}
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor={metricMeta.fill}
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 6"
                      vertical={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="dateLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: "#64748b" }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: "#64748b" }}
                      width={64}
                    />

                    <Tooltip content={<SmartTooltip unit={active.unit} />} />

                    {chartData[0] && (
                      <>
                        <ReferenceLine
                          y={chartData[0].mean}
                          stroke="#64748b"
                          strokeDasharray="5 5"
                        />
                        <ReferenceLine
                          y={chartData[0].upperBand}
                          stroke="#f59e0b"
                          strokeDasharray="3 5"
                        />
                      </>
                    )}

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={metricMeta.line}
                      strokeWidth={3}
                      fill="url(#analyticsAreaFillSmart)"
                      activeDot={{
                        r: 6,
                        fill: metricMeta.line,
                        stroke: "#ffffff",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <SmallMetric
                  label="ต่ำสุด"
                  value={`${formatNumber(statistics.min)} ${active.unit}`}
                />
                <SmallMetric
                  label="เฉลี่ย"
                  value={`${formatNumber(statistics.average)} ${active.unit}`}
                />
                <SmallMetric
                  label="สูงสุด"
                  value={`${formatNumber(statistics.max)} ${active.unit}`}
                />
              </div>
            </>
          )}
        </Panel>

        <Panel
          title="Predictive Forecast · 7 วันข้างหน้า"
          right={
            forecast.enoughData ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
                <BrainCircuit className="h-4 w-4" />
                Confidence {forecast.confidence}%
              </span>
            ) : null
          }
        >
          {!forecast.enoughData ? (
            <EmptyState text="ต้องมีข้อมูลอย่างน้อย 3 วันเพื่อเริ่มคาดการณ์แนวโน้ม" />
          ) : (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <SmallMetric
                  label="คาดการณ์รวม 7 วัน"
                  value={`${formatNumber(forecast.next7Total)} ${active.unit}`}
                />
                <SmallMetric
                  label="เทียบกับช่วงล่าสุด"
                  value={`${signedNumber(forecast.changePct)}%`}
                />
                <SmallMetric
                  label="ช่วงคาดการณ์รวม"
                  value={`${formatNumber(forecast.lowerTotal)}–${formatNumber(
                    forecast.upperTotal,
                  )} ${active.unit}`}
                />
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-6 rounded-full" style={{ backgroundColor: metricMeta.line }} />
                  ข้อมูลจริง
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-6 border-t-2 border-dashed border-violet-500" />
                  Forecast
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-6 rounded bg-violet-100" />
                  Confidence band
                </span>
              </div>

              <div className="h-[330px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast.points} margin={{ top: 12, right: 20, left: 12, bottom: 8 }}>
                    <defs>
                      <linearGradient id="forecastConfidenceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} width={64} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (Array.isArray(value)) {
                          return [`${formatNumber(Number(value[0]))}–${formatNumber(Number(value[1]))} ${active.unit}`, "Confidence band"];
                        }
                        return [
                          `${formatNumber(Number(value ?? 0))} ${active.unit}`,
                          name === "forecast" ? "Forecast" : "Actual",
                        ];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceRange"
                      stroke="none"
                      fill="url(#forecastConfidenceFill)"
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Line type="monotone" dataKey="actual" stroke={metricMeta.line} strokeWidth={3} dot={false} connectNulls={false} />
                    <Line type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={3} strokeDasharray="8 6" dot={{ r: 3, fill: "#7c3aed" }} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3">
                <p className="text-sm font-semibold text-violet-900">
                  ระบบคาดการณ์จากข้อมูลจริง
                </p>
                <p className="mt-1 text-sm leading-6 text-violet-800">
                  ใช้ Linear Regression จากข้อมูลล่าสุดสูงสุด 14 วัน และคำนวณช่วงความไม่แน่นอนจาก residual ของข้อมูลจริง
                  ตัวเลขนี้เป็นค่าคาดการณ์เพื่อช่วย Manager วางแผน ไม่ใช่ตัวเลขที่ Gemini สร้างขึ้น
                </p>
              </div>
            </>
          )}
        </Panel>

        <Panel title="สัดส่วนตามแผนก">
          {active.breakdown.length === 0 ? (
            <EmptyState text="ยังไม่มีข้อมูลแยกตามแผนก" />
          ) : (
            <div className="space-y-5">
              {active.breakdown.slice(0, 8).map((item, index) => (
                <ContributionRow
                  key={item.department}
                  index={index}
                  label={item.department}
                  value={`${formatNumber(item.value)} ${active.unit}`}
                  percent={item.percent}
                />
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Panel
        title="การใช้ตามแผนก"
        right={
          <span className="text-sm text-slate-500">
            สูงสุด → ต่ำสุด
          </span>
        }
      >
        {sortedBreakdown.length === 0 ? (
          <EmptyState text="ยังไม่มีข้อมูลสำหรับเปรียบเทียบ" />
        ) : (
          <div className="space-y-4">
            {sortedBreakdown.slice(0, 12).map((item, index) => {
              const width =
                maxDepartmentValue > 0
                  ? (item.value / maxDepartmentValue) * 100
                  : 0;

              return (
                <div
                  key={item.department}
                  className="grid gap-2 sm:grid-cols-[minmax(190px,280px)_minmax(0,1fr)_150px] sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        index === 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-6 text-slate-800">
                        {item.department}
                      </p>
                      {index === 0 && (
                        <p className="text-xs font-medium text-amber-700">
                          สัดส่วนตามแผนก
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${metricMeta.barClass}`}
                      style={{
                        width: `${Math.max(
                          width,
                          item.value > 0 ? 1.5 : 0,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-slate-950">
                      {formatNumber(item.value)} {active.unit}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatNumber(item.percent)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200">
            <BrainCircuit className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              วิธีคำนวณ
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              ตัวเลขมาจาก ResourceUsage จริง ระบบคำนวณ % การเปลี่ยนแปลง
              ค่าเฉลี่ย ส่วนเบี่ยงเบนมาตรฐาน Z-score และ Contribution
              ก่อนสรุปเป็นสิ่งที่ Manager ควรรู้ จึงไม่ต้องอ่านทุกกราฟเอง
            </p>
          </div>
        </div>
      </section>

      {evidenceOpen && (
        <EvidenceDrawer
          evidence={evidence}
          loading={evidenceLoading}
          error={evidenceError}
          metricLabel={metricMeta.label}
          onClose={() => setEvidenceOpen(false)}
        />
      )}
    </div>
  );
}

function ExecutiveStat({ label, value, attention = false }: { label: string; value: string; attention?: boolean }) {
  return <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-3 text-center shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className={`mt-1 text-sm font-bold ${attention ? "text-rose-700" : "text-slate-950"}`}>{value}</p></div>;
}

function EvidenceDrawer({
  evidence,
  loading,
  error,
  metricLabel,
  onClose,
}: {
  evidence: ResourceEvidence | null;
  loading: boolean;
  error: string | null;
  metricLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="ปิด" onClick={onClose} className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px]" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[620px] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Investigation</p>
            <h2 className="mt-0.5 text-xl font-bold text-slate-950">หลักฐานการใช้{metricLabel}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="mt-3 text-sm font-medium text-slate-600">กำลังรวบรวมหลักฐาน...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
          ) : evidence ? (
            <>
              <section className={`rounded-2xl border p-5 ${evidence.statistics.isAnomaly ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                <div className="flex items-start gap-3">
                  <StatusIcon level={evidence.statistics.isAnomaly ? "attention" : "normal"} />
                  <div>
                    <p className="text-sm font-medium text-slate-600">{formatFullThaiDate(evidence.date)}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-950">{formatNumber(evidence.observed)}</span>
                      <span className="font-medium text-slate-500">{evidence.unit}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{evidence.conclusion}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-violet-600" /><h3 className="font-semibold text-slate-950">หลักฐานทางสถิติ</h3></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <EvidenceStat label="Observed x" value={`${formatNumber(evidence.observed)} ${evidence.unit}`} />
                  <EvidenceStat label="Mean μ" value={`${formatNumber(evidence.statistics.mean)} ${evidence.unit}`} />
                  <EvidenceStat label="Std. Dev. σ" value={formatNumber(evidence.statistics.standardDeviation)} />
                  <EvidenceStat label="Z-score" value={formatNumber(evidence.statistics.zScore)} attention={evidence.statistics.isAnomaly} />
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-700">z = (x - μ) / σ</p>
                  <p className="mt-1">เกณฑ์ |z| ≥ {evidence.statistics.threshold} · <strong className={evidence.statistics.isAnomaly ? "text-rose-700" : "text-emerald-700"}>{evidence.statistics.isAnomaly ? "เกินเกณฑ์" : "อยู่ในเกณฑ์"}</strong></p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2"><Target className="h-5 w-5 text-amber-600" /><h3 className="font-semibold text-slate-950">เครื่องที่มีส่วนมากที่สุด</h3></div>
                <div className="mt-4 space-y-4">
                  {evidence.contributors.length === 0 ? <p className="text-sm text-slate-500">ไม่มีข้อมูลเครื่องจักรในวันนี้</p> : evidence.contributors.slice(0, 6).map((item, index) => (
                    <div key={`${item.machineId ?? "none"}-${index}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-semibold text-slate-900">{item.machineName}</p><p className="mt-0.5 text-xs text-slate-500">{item.machineCode} · {item.recordCount} records</p></div>
                        <div className="text-right"><p className="text-sm font-semibold text-slate-950">{formatNumber(item.total)} {evidence.unit}</p><p className="text-xs text-slate-500">{formatNumber(item.percent)}%</p></div>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(Math.max(item.percent, 0), 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><Database className="h-5 w-5 text-sky-600" /><h3 className="font-semibold text-slate-950">ResourceUsage</h3></div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{evidence.records.length} records</span>
                </div>
                <div className="mt-4 space-y-3">
                  {evidence.records.slice(0, 12).map((record) => (
                    <div key={record.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{record.machineName}</p><p className="mt-1 text-xs text-slate-500">{record.reference}</p></div><p className="text-sm font-bold text-slate-950">{formatNumber(record.quantity)} {record.unit}</p></div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600"><span className="rounded-full bg-slate-100 px-2 py-1">{record.buildingName}</span><span className="rounded-full bg-slate-100 px-2 py-1">{record.departmentName}</span><span className="rounded-full bg-slate-100 px-2 py-1">{record.sourceType}</span><span className="rounded-full bg-slate-100 px-2 py-1">{record.processingStatus}</span></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3"><Database className="mt-0.5 h-5 w-5 text-slate-500" /><div><p className="text-sm font-semibold text-slate-800">Data lineage</p><p className="mt-1 text-sm text-slate-600">{evidence.dataLineage.source} · {evidence.dataLineage.resourceCodes.join(", ")}</p></div></div>
              </section>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("greenfactory:ask-ai", { detail: { prompt: `ช่วยอธิบายหลักฐานการใช้${metricLabel}วันที่ ${evidence.date}: observed ${evidence.observed} ${evidence.unit}, mean ${evidence.statistics.mean}, standard deviation ${evidence.statistics.standardDeviation}, z-score ${evidence.statistics.zScore}. สรุปจากหลักฐานนี้เท่านั้นและบอกสิ่งที่ Manager ควรตรวจต่อ`, evidence } }))}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-800 transition hover:bg-violet-100"
              >
                <BrainCircuit className="h-4 w-4" /> อธิบายหลักฐานนี้ด้วย AI
              </button>
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function EvidenceStat({ label, value, attention = false }: { label: string; value: string; attention?: boolean }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-1 text-base font-semibold ${attention ? "text-rose-700" : "text-slate-950"}`}>{value}</p></div>;
}

function StatusIcon({
  level,
  large = false,
}: {
  level: PriorityLevel;
  large?: boolean;
}) {
  const size = large ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl";
  const iconSize = large ? "h-7 w-7" : "h-5 w-5";

  if (level === "attention") {
    return (
      <span
        className={`flex shrink-0 items-center justify-center bg-rose-100 text-rose-700 ${size}`}
      >
        <AlertTriangle className={iconSize} />
      </span>
    );
  }

  if (level === "watch") {
    return (
      <span
        className={`flex shrink-0 items-center justify-center bg-amber-100 text-amber-700 ${size}`}
      >
        <TrendingUp className={iconSize} />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-emerald-100 text-emerald-700 ${size}`}
    >
      <CheckCircle2 className={iconSize} />
    </span>
  );
}

function ChangePill({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const positive = value > 0;
  const negative = value < 0;

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        inverse
          ? "bg-white/10 text-white"
          : positive
            ? "bg-amber-50 text-amber-700"
            : negative
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
      }`}
    >
      {signedNumber(value)}%
    </span>
  );
}

function DateField({
  label,
  value,
  onChange,
  dark = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dark?: boolean;
}) {
  return (
    <label className="block">
      <span className={`mb-1.5 block text-sm font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 rounded-xl border px-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 ${dark ? "border-white/10 bg-white/10 text-white [color-scheme:dark]" : "border-slate-200 bg-white text-slate-800"}`}
      />
    </label>
  );
}

function FilterSelect({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
        <Icon className="h-4 w-4 text-slate-400" />
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  icon: Icon,
  iconClass,
  description,
}: {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  iconClass: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{label}</p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl font-bold leading-none text-slate-950">
              {value}
            </span>
            <span className="text-sm font-medium text-slate-500">{unit}</span>
          </div>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}

function ChangeCard({ change }: { change: number }) {
  const positive = change > 0;
  const negative = change < 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">
        เทียบช่วงก่อนหน้า
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`text-3xl font-bold leading-none ${
            positive
              ? "text-amber-700"
              : negative
                ? "text-emerald-700"
                : "text-slate-950"
          }`}
        >
          {signedNumber(change)}%
        </span>

        {positive ? (
          <ArrowUpRight className="h-5 w-5 text-amber-600" />
        ) : negative ? (
          <ArrowDownRight className="h-5 w-5 text-emerald-600" />
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        ใช้จำนวนวันและขอบเขตเดียวกับช่วงปัจจุบัน
      </p>
    </article>
  );
}

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {right}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function ContributionRow({
  index,
  label,
  value,
  percent,
}: {
  index: number;
  label: string;
  value: string;
  percent: number;
}) {
  const tones = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-400",
  ];

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 text-sm font-medium leading-6 text-slate-800">
              {label}
            </p>

            <p className="shrink-0 text-sm font-semibold text-slate-950">
              {value}
            </p>
          </div>

          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                tones[index % tones.length]
              }`}
              style={{
                width: `${Math.min(Math.max(percent, 0), 100)}%`,
              }}
            />
          </div>

          <p className="mt-1.5 text-sm text-slate-500">
            {formatNumber(percent)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function SmartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload?: DailyPoint; value?: number }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;

  return (
    <div className="min-w-[190px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-lg font-semibold text-slate-950">
        {formatNumber(Number(payload[0]?.value ?? 0))}{" "}
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </p>

      {point && (
        <div className="mt-2 border-t border-slate-100 pt-2 text-sm text-slate-600">
          <p>เฉลี่ย {formatNumber(point.mean)} {unit}</p>
          <p className={point.isAnomaly ? "font-semibold text-rose-700" : ""}>
            z-score {formatNumber(point.zScore)}
            {point.isAnomaly ? " · ผิดปกติ" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function numberOrUndefined(value: string) {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function populationStdDev(values: number[], average: number) {
  if (values.length === 0) return 0;

  const variance =
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

function formatNumber(value: number) {
  return Number(value ?? 0).toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}

function signedNumber(value: number) {
  const rounded = Math.round((value ?? 0) * 10) / 10;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}
