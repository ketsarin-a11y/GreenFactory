import { Trash2 } from "lucide-react";
import MockAnalyticsPage from "@/components/manager/Mockanalyticspage";

export const dynamic = "force-dynamic";

function mockTrend() {
  const days = ["20 มิ.ย.", "21 มิ.ย.", "22 มิ.ย.", "23 มิ.ย.", "24 มิ.ย.", "25 มิ.ย.", "26 มิ.ย."];
  const base = [1240, 1180, 1320, 1290, 1410, 1350, 1470];
  return days.map((dateLabel, i) => ({ dateLabel, value: base[i] }));
}

export default function ManagerWastePage() {
  return (
    <MockAnalyticsPage
      icon={<Trash2 size={24} />}
      kpiLabel="ของเสียรวมในช่วงที่เลือก"
      kpiValue="9,158"
      kpiUnit="kg"
      changePct={6.4}
      trendLabel="แนวโน้มปริมาณของเสียรายวัน"
      trendColor="#f97316"
      trendData={mockTrend()}
      breakdownTitle="สัดส่วนแยกตามประเภทของเสีย"
      breakdown={[
        { label: "Plastic (บรรจุภัณฑ์/Reel)", value: 2850, unit: "kg", color: "#f97316" },
        { label: "Metal Scrap", value: 2200, unit: "kg", color: "#0ea5e9" },
        { label: "PCB Waste (แผงวงจรเสีย)", value: 1540, unit: "kg", color: "#8b5cf6" },
        { label: "Solder Dross (ขี้ตะกรันบัดกรี)", value: 980, unit: "kg", color: "#ef4444" },
        { label: "Chemical/Flux Waste", value: 620, unit: "kg", color: "#14b8a6" },
        { label: "General Waste", value: 968, unit: "kg", color: "#64748b" },
      ]}
      missingSchemaNote="ระบบยังไม่มีตารางบันทึกของเสีย (WasteLog) เลย ต้องออกแบบ schema เพิ่ม (ประเภทของเสีย, น้ำหนัก/ปริมาณ, วิธีกำจัด) ก่อนถึงจะเป็นข้อมูลจริงได้"
    />
  );
}