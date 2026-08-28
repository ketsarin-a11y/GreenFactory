"use client";

import { CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import FactoryAddress from "./FactoryAddress";
import FactoryBasicInfo from "./FactoryBasicInfo";
import FactoryContactInfo from "./FactoryContactInfo";
import FactoryLogoCard from "./FactoryLogoCard";
import FactorySettingsTabs from "./FactorySettingsTabs";
import RegionalSettings from "./RegionalSettings";
import type { FactoryFormData } from "./types";

const initialData: FactoryFormData = {
  factoryCode: "GF-001",
  factoryName: "โรงงานกรีนแฟคทอรี่ 1",
  englishName: "GreenFactory Plant 1",
  industryType: "electronics",
  factorySize: "large",
  taxId: "0123456789012",
  openingDate: "2017-01-01",
  area: "25650",
  employeeCount: "560",
  description:
    "โรงงานผลิตชิ้นส่วนอิเล็กทรอนิกส์และอุปกรณ์สำหรับอุตสาหกรรม",
  contactName: "นายสมชาย ใจดี",
  contactPosition: "ผู้จัดการโรงงาน",
  phone: "02-123-4567",
  email: "contact@gf-plant1.com",
  address: "123 หมู่ 4 ถนนสุรนารายณ์ ตำบลสุรนารี",
  subdistrict: "สุรนารี",
  district: "เมืองนครราชสีมา",
  province: "นครราชสีมา",
  postalCode: "30000",
  timezone: "Asia/Bangkok",
  currency: "THB",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24",
};

export default function FactorySettingsPageClient() {
  const [activeTab, setActiveTab] = useState("general");
  const [data, setData] = useState<FactoryFormData>(initialData);
  const [saved, setSaved] = useState(false);

  function update(key: keyof FactoryFormData, value: string) {
    setData((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[22px] border border-[#e1eae4] bg-white px-5 py-5 shadow-[0_12px_36px_rgba(30,73,46,0.055)] sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#26362d]">
              การตั้งค่าโรงงาน
            </h1>
            <p className="mt-2 text-[13px] leading-6 text-[#7a8980]">
              จัดการข้อมูลโรงงาน รูปแบบการแสดงผล และการตั้งค่าหลักของระบบ
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#167c4d] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(22,124,77,0.2)] transition hover:-translate-y-0.5 hover:bg-[#126b42]"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                บันทึกเรียบร้อย
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </div>

        <div className="mt-5">
          <FactorySettingsTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </section>

      {activeTab === "general" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <div className="space-y-5">
            <FactoryBasicInfo data={data} update={update} />
            <FactoryAddress data={data} update={update} />
          </div>

          <div className="space-y-5">
            <FactoryLogoCard />
            <FactoryContactInfo data={data} update={update} />
            <RegionalSettings data={data} update={update} />
          </div>
        </div>
      ) : (
        <section className="rounded-[22px] border border-[#e1eae4] bg-white p-8 text-center shadow-[0_12px_36px_rgba(30,73,46,0.055)]">
          <p className="text-[16px] font-bold text-[#435249]">
            ส่วนการตั้งค่านี้กำลังเตรียมโครงสร้างสำหรับเชื่อมข้อมูลจริง
          </p>
          <p className="mt-2 text-[12px] text-[#839087]">
            เลือกแท็บ “ข้อมูลโรงงาน” เพื่อแก้ไขข้อมูลหลัก
          </p>
        </section>
      )}
    </div>
  );
}
