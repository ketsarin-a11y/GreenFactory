import FormField from "./FormField";
import SectionCard from "./SectionCard";
import type { FactoryFormData } from "./types";

type Props = {
  data: FactoryFormData;
  update: (key: keyof FactoryFormData, value: string) => void;
};

export default function RegionalSettings({ data, update }: Props) {
  return (
    <SectionCard
      title="เขตเวลาและสกุลเงิน"
      description="ใช้กำหนดรูปแบบวันที่ เวลา และสกุลเงินของโรงงาน"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          kind="select"
          label="เขตเวลา"
          selectProps={{
            value: data.timezone,
            onChange: (event) => update("timezone", event.target.value),
          }}
          options={[
            { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
            { value: "Asia/Singapore", label: "(GMT+08:00) Singapore" },
            { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
          ]}
        />

        <FormField
          kind="select"
          label="สกุลเงิน"
          selectProps={{
            value: data.currency,
            onChange: (event) => update("currency", event.target.value),
          }}
          options={[
            { value: "THB", label: "บาท (THB)" },
            { value: "USD", label: "ดอลลาร์สหรัฐ (USD)" },
            { value: "SGD", label: "ดอลลาร์สิงคโปร์ (SGD)" },
          ]}
        />

        <FormField
          kind="select"
          label="รูปแบบวันที่"
          selectProps={{
            value: data.dateFormat,
            onChange: (event) => update("dateFormat", event.target.value),
          }}
          options={[
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
          ]}
        />

        <FormField
          kind="select"
          label="รูปแบบเวลา"
          selectProps={{
            value: data.timeFormat,
            onChange: (event) => update("timeFormat", event.target.value),
          }}
          options={[
            { value: "24", label: "24 ชั่วโมง" },
            { value: "12", label: "12 ชั่วโมง" },
          ]}
        />
      </div>
    </SectionCard>
  );
}
