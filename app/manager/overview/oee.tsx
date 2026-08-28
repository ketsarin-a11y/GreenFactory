import { Gauge } from "lucide-react";
import MockAnalyticsPage from "@/components/manager/Mockanalyticspage";

export const dynamic = "force-dynamic";

function mockTrend() {
  const days = ["20 มิ.ย.", "21 มิ.ย.", "22 มิ.ย.", "23 มิ.ย.", "24 มิ.ย.", "25 มิ.ย.", "26 มิ.ย."];
  const base = [82, 84, 79, 86, 88, 83, 85];
  return days.map((dateLabel, i) => ({ dateLabel, value: base[i] }));
}

export default function ManagerOeePage() {
  return (
    <MockAnalyticsPage
      icon={<Gauge size={24} />}
      kpiLabel="ประสิทธิภาพการผลิตเฉลี่ย (OEE)"
      kpiValue="85"
      kpiUnit="%"
      changePct={-3.2}
      trendLabel="แนวโน้ม OEE รายวัน"
      trendColor="#64748b"
      trendData={mockTrend()}
      breakdownTitle="OEE แยกตามไลน์การผลิต"
      breakdown={[
        { label: "SMT Line 1", value: 89, unit: "%", color: "#059669" },
        { label: "SMT Line 2", value: 76, unit: "%", color: "#f59e0b" },
        { label: "THT Line 1", value: 84, unit: "%", color: "#0ea5e9" },
        { label: "Packing Line 1", value: 88, unit: "%", color: "#8b5cf6" },
      ]}
      missingSchemaNote="OEE (Availability × Performance × Quality) ต้องมีข้อมูลจำนวนหน่วยผลผลิต, เวลา downtime, และของเสียจากการผลิตจริง — ระบบยังไม่มีตาราง ProductionOutput เลย"
    />
  );
}