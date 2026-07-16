import { Leaf } from "lucide-react";

import FeatureBlock from "@/components/features/FeatureBlock";

export default function CarbonSection() {
  return (
    <FeatureBlock
      id="carbon"
      eyebrow="Carbon management"
      title="ติดตามคาร์บอน"
      highlight="จากข้อมูลที่ตรวจสอบย้อนกลับได้"
      description="คำนวณผลการปล่อยจากข้อมูลทรัพยากรและค่าการปล่อยที่องค์กรกำหนด พร้อมแยกภาพรวมตามขอบเขตและช่วงเวลา"
      icon={Leaf}
      dashboardVariant="carbon"
      reversed
      tinted
      metrics={[
        {
          value: "1,256",
          label: "การปล่อยรวม",
          detail: "tCO₂e ปีปัจจุบัน",
        },
        {
          value: "64%",
          label: "มาจากไฟฟ้า",
          detail: "แหล่งการปล่อยหลัก",
        },
        {
          value: "-6.8%",
          label: "ลดลง",
          detail: "เทียบปีก่อนหน้า",
        },
      ]}
      tags={["Scope 1", "Scope 2", "Scope 3", "Emission factor"]}
      note="ผลการคำนวณเก็บค่า Emission Factor ที่ใช้จริงในแต่ละครั้ง จึงสามารถตรวจสอบย้อนหลังได้"
    />
  );
}