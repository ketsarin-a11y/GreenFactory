import { ChevronDown } from "lucide-react";
import SectionCard from "./SectionCard";
import type { ProfileFormData } from "./types";

type Props = {
  data: ProfileFormData;
  update: (key: keyof ProfileFormData, value: string) => void;
};

function inputClass(disabled = false) {
  return `h-11 w-full rounded-[14px] border px-3.5 text-[13px] font-semibold outline-none transition ${
    disabled
      ? "cursor-not-allowed border-[#e5ebe7] bg-[#f3f6f4] text-[#87938c]"
      : "border-[#dce6df] bg-[#f9fbfa] text-[#33453a] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
  }`;
}

export default function ProfileInformation({ data, update }: Props) {
  return (
    <SectionCard
      title="ข้อมูลส่วนตัว"
      description="ข้อมูลของผู้ใช้งานที่กำลังเข้าสู่ระบบ"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            ชื่อ
          </span>
          <input
            value={data.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            className={inputClass()}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            นามสกุล
          </span>
          <input
            value={data.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            className={inputClass()}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            อีเมล
          </span>
          <input
            type="email"
            value={data.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass()}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            เบอร์โทรศัพท์
          </span>
          <input
            value={data.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass()}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            รหัสพนักงาน
          </span>
          <input
            value={data.employeeCode}
            disabled
            className={inputClass(true)}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            ตำแหน่ง
          </span>
          <input
            value={data.position}
            disabled
            className={inputClass(true)}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            แผนก
          </span>
          <input
            value={data.department}
            disabled
            className={inputClass(true)}
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            ภาษา
          </span>
          <div className="relative">
            <select
              value={data.preferredLanguage}
              onChange={(event) =>
                update("preferredLanguage", event.target.value)
              }
              className={`${inputClass()} appearance-none pr-10`}
            >
              <option value="th">ภาษาไทย</option>
              <option value="en">English</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
          </div>
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-[12px] font-bold text-[#425249]">
            เขตเวลา
          </span>
          <div className="relative">
            <select
              value={data.timezone}
              onChange={(event) => update("timezone", event.target.value)}
              className={`${inputClass()} appearance-none pr-10`}
            >
              <option value="Asia/Bangkok">(GMT+07:00) Bangkok</option>
              <option value="Asia/Singapore">(GMT+08:00) Singapore</option>
              <option value="Asia/Tokyo">(GMT+09:00) Tokyo</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
          </div>
        </label>
      </div>
    </SectionCard>
  );
}
