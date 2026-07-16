import { Zap } from "lucide-react";

import FeatureBlock from "@/components/features/FeatureBlock";

export default function EnergySection() {
  return (
    <FeatureBlock
      id="energy"
      eyebrow="Energy management"
      title="มองเห็นการใช้พลังงาน"
      highlight="ก่อนต้นทุนจะเพิ่มขึ้น"
      description="ติดตามการใช้พลังงานของหน่วยงาน สายการผลิต และเครื่องจักร พร้อมเห็นความผิดปกติจากข้อมูลที่เกิดขึ้นจริง"
      icon={Zap}
      dashboardVariant="energy"
      metrics={[
        {
          value: "128K",
          label: "พลังงานที่ใช้",
          detail: "kWh ในเดือนปัจจุบัน",
        },
        {
          value: "-12.6%",
          label: "ลดลง",
          detail: "เทียบช่วงก่อนหน้า",
        },
        {
          value: "82%",
          label: "เทียบเป้าหมาย",
          detail: "ประสิทธิภาพการใช้พลังงาน",
        },
      ]}
      tags={["Sensor", "Machine", "Production line", "Alert"]}
      note="ข้อมูลสามารถบันทึกจากเซนเซอร์ เครื่องจักร หรือผู้ปฏิบัติงาน ก่อนสรุปเป็นภาพรวมสำหรับผู้บริหาร"
    />
  );
}