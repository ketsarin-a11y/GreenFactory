import FormField from "./FormField";
import SectionCard from "./SectionCard";
import type { FactoryFormData } from "./types";

type Props = {
  data: FactoryFormData;
  update: (key: keyof FactoryFormData, value: string) => void;
};

export default function FactoryContactInfo({ data, update }: Props) {
  return (
    <SectionCard
      title="ข้อมูลผู้ติดต่อโรงงาน"
      description="ผู้รับผิดชอบหลักสำหรับประสานงานด้านระบบ"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="ชื่อผู้ติดต่อ"
          inputProps={{
            value: data.contactName,
            onChange: (event) => update("contactName", event.target.value),
          }}
        />
        <FormField
          label="ตำแหน่ง"
          inputProps={{
            value: data.contactPosition,
            onChange: (event) => update("contactPosition", event.target.value),
          }}
        />
        <FormField
          label="เบอร์โทรศัพท์"
          inputProps={{
            value: data.phone,
            onChange: (event) => update("phone", event.target.value),
          }}
        />
        <FormField
          label="อีเมล"
          inputProps={{
            type: "email",
            value: data.email,
            onChange: (event) => update("email", event.target.value),
          }}
        />
      </div>
    </SectionCard>
  );
}
