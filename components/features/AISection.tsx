import { Bot } from "lucide-react";

import FeatureBlock from "@/components/features/FeatureBlock";

export default function AISection() {
  return (
    <FeatureBlock
      id="ai"
      eyebrow="Analytics and recommendations"
      title="เปลี่ยนข้อมูลจำนวนมาก"
      highlight="ให้เป็นสิ่งที่ควรทำต่อ"
      description="ระบบช่วยสรุปแนวโน้ม ความผิดปกติ และโอกาสในการปรับปรุง เพื่อให้ทีมงานจัดลำดับความสำคัญได้เร็วขึ้น"
      icon={Bot}
      dashboardVariant="ai"
      reversed
      tinted
      metrics={[
        {
          value: "24",
          label: "คำแนะนำ",
          detail: "จากข้อมูลล่าสุด",
        },
        {
          value: "145K",
          label: "ต้นทุนที่ลดได้",
          detail: "บาทต่อปีโดยประมาณ",
        },
        {
          value: "38.6",
          label: "คาร์บอนที่ลดได้",
          detail: "tCO₂e โดยประมาณ",
        },
      ]}
      tags={["Recommendation", "Priority", "Alert", "Saving"]}
      note="คำแนะนำแต่ละรายการมีระดับความสำคัญ ผลประหยัดโดยประมาณ และสถานะการดำเนินงาน"
    />
  );
}