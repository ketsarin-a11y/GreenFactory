import FormField from "./FormField";
import SectionCard from "./SectionCard";
import type { FactoryFormData } from "./types";

type Props = {
  data: FactoryFormData;
  update: (key: keyof FactoryFormData, value: string) => void;
};

export default function FactoryBasicInfo({ data, update }: Props) {
  return (
    <SectionCard
      title="ข้อมูลโรงงาน"
      description="ข้อมูลหลักสำหรับแสดงผลและอ้างอิงภายในระบบ"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FormField
          label="รหัสโรงงาน"
          inputProps={{
            value: data.factoryCode,
            onChange: (event) => update("factoryCode", event.target.value),
          }}
        />
        <FormField
          label="ชื่อโรงงาน"
          inputProps={{
            value: data.factoryName,
            onChange: (event) => update("factoryName", event.target.value),
          }}
        />
        <FormField
          label="ชื่อโรงงาน (ภาษาอังกฤษ)"
          inputProps={{
            value: data.englishName,
            onChange: (event) => update("englishName", event.target.value),
          }}
        />

        <FormField
          kind="select"
          label="ประเภทอุตสาหกรรม"
          selectProps={{
            value: data.industryType,
            onChange: (event) => update("industryType", event.target.value),
          }}
          options={[
            { value: "electronics", label: "อุตสาหกรรมอิเล็กทรอนิกส์" },
            { value: "automotive", label: "อุตสาหกรรมยานยนต์" },
            { value: "food", label: "อุตสาหกรรมอาหาร" },
          ]}
        />

        <FormField
          kind="select"
          label="ขนาดโรงงาน"
          selectProps={{
            value: data.factorySize,
            onChange: (event) => update("factorySize", event.target.value),
          }}
          options={[
            { value: "large", label: "ขนาดใหญ่ (มากกว่า 250 คน)" },
            { value: "medium", label: "ขนาดกลาง (51–250 คน)" },
            { value: "small", label: "ขนาดเล็ก (ไม่เกิน 50 คน)" },
          ]}
        />

        <FormField
          label="เลขประจำตัวผู้เสียภาษี"
          inputProps={{
            value: data.taxId,
            onChange: (event) => update("taxId", event.target.value),
          }}
        />

        <FormField
          label="วันที่เริ่มดำเนินงาน"
          inputProps={{
            type: "date",
            value: data.openingDate,
            onChange: (event) => update("openingDate", event.target.value),
          }}
        />

        <FormField
          label="พื้นที่โรงงาน (ตร.ม.)"
          inputProps={{
            type: "number",
            value: data.area,
            onChange: (event) => update("area", event.target.value),
          }}
        />

        <FormField
          label="จำนวนพนักงานทั้งหมด"
          inputProps={{
            type: "number",
            value: data.employeeCount,
            onChange: (event) => update("employeeCount", event.target.value),
          }}
        />
      </div>

      <div className="mt-4">
        <FormField
          kind="textarea"
          label="รายละเอียดโรงงาน"
          textareaProps={{
            value: data.description,
            onChange: (event) => update("description", event.target.value),
          }}
        />
      </div>
    </SectionCard>
  );
}
