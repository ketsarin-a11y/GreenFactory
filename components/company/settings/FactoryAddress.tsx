import FormField from "./FormField";
import SectionCard from "./SectionCard";
import type { FactoryFormData } from "./types";

type Props = {
  data: FactoryFormData;
  update: (key: keyof FactoryFormData, value: string) => void;
};

export default function FactoryAddress({ data, update }: Props) {
  return (
    <SectionCard
      title="ที่อยู่โรงงาน"
      description="ที่อยู่สำหรับเอกสาร รายงาน และการอ้างอิงตำแหน่งโรงงาน"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2 xl:col-span-4">
          <FormField
            label="ที่อยู่"
            inputProps={{
              value: data.address,
              onChange: (event) => update("address", event.target.value),
            }}
          />
        </div>

        <FormField
          label="ตำบล / แขวง"
          inputProps={{
            value: data.subdistrict,
            onChange: (event) => update("subdistrict", event.target.value),
          }}
        />
        <FormField
          label="อำเภอ / เขต"
          inputProps={{
            value: data.district,
            onChange: (event) => update("district", event.target.value),
          }}
        />
        <FormField
          kind="select"
          label="จังหวัด"
          selectProps={{
            value: data.province,
            onChange: (event) => update("province", event.target.value),
          }}
          options={[
            { value: "นครราชสีมา", label: "นครราชสีมา" },
            { value: "กรุงเทพมหานคร", label: "กรุงเทพมหานคร" },
            { value: "ชลบุรี", label: "ชลบุรี" },
            { value: "พระนครศรีอยุธยา", label: "พระนครศรีอยุธยา" },
          ]}
        />
        <FormField
          label="รหัสไปรษณีย์"
          inputProps={{
            value: data.postalCode,
            onChange: (event) => update("postalCode", event.target.value),
          }}
        />
      </div>
    </SectionCard>
  );
}
