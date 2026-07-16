import { Droplets } from "lucide-react";

import FeatureBlock from "@/components/features/FeatureBlock";

export default function WaterSection() {
  return (
    <FeatureBlock
      id="water"
      eyebrow="Resource management"
      title="บริหารน้ำและทรัพยากร"
      highlight="ให้สัมพันธ์กับการผลิต"
      description="เห็นปริมาณการใช้น้ำ วัตถุดิบ และของเสียในแต่ละหน่วยงาน เพื่อค้นหาจุดที่ใช้ทรัพยากรสูงกว่าปกติ"
      icon={Droplets}
      dashboardVariant="water"
      metrics={[
        {
          value: "12.5K",
          label: "ปริมาณการใช้น้ำ",
          detail: "m³ ในเดือนปัจจุบัน",
        },
        {
          value: "38%",
          label: "นำกลับมาใช้ซ้ำ",
          detail: "จากปริมาณน้ำทั้งหมด",
        },
        {
          value: "-4.2%",
          label: "ลดลง",
          detail: "เทียบช่วงก่อนหน้า",
        },
      ]}
      tags={["Water", "Material", "Waste", "Department"]}
      note="ข้อมูลทรัพยากรสามารถเชื่อมโยงกับหน่วยงาน สายการผลิต เครื่องจักร และผู้บันทึกได้"
    />
  );
}