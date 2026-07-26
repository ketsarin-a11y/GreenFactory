import { Wind } from "lucide-react";
import MockAnalyticsPage from "@/components/manager/Mockanalyticspage";

export const dynamic = "force-dynamic";

function mockTrend() {
  const days = ["20 มิ.ย.", "21 มิ.ย.", "22 มิ.ย.", "23 มิ.ย.", "24 มิ.ย.", "25 มิ.ย.", "26 มิ.ย."];
  const base = [22, 19, 25, 18, 30, 24, 18];
  return days.map((dateLabel, i) => ({ dateLabel, value: base[i] }));
}

export default function ManagerAirQualityPage() {
  return (
    <MockAnalyticsPage
      icon={<Wind size={24} />}
      kpiLabel="ดัชนีคุณภาพอากาศเฉลี่ย (AQI)"
      kpiValue="18"
      kpiUnit="ดีมาก"
      changePct={-8.1}
      trendLabel="แนวโน้ม AQI รายวัน"
      trendColor="#14b8a6"
      trendData={mockTrend()}
      breakdownTitle="AQI แยกตามพื้นที่"
      breakdown={[
        { label: "อาคารผลิต ชั้น 1", value: 16, unit: "AQI", color: "#059669" },
        { label: "อาคารผลิต ชั้น 2", value: 20, unit: "AQI", color: "#14b8a6" },
        { label: "Clean Room", value: 12, unit: "AQI", color: "#0ea5e9" },
        { label: "อาคารคลังสินค้า", value: 24, unit: "AQI", color: "#f59e0b" },
      ]}
      missingSchemaNote="ต้องมีเซนเซอร์วัดคุณภาพอากาศจริงติดตั้งในโรงงาน และตารางเก็บค่าที่วัดได้ (AirQualityReading) — ระบบยังไม่มีการเชื่อมต่อ IoT sensor เลย"
    />
  );
}