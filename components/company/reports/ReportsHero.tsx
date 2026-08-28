import { FileDown, ShieldCheck } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function ReportsHero({ onCreate }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#deebe3] bg-white px-5 py-5 shadow-[0_20px_60px_rgba(28,77,46,0.07)] sm:px-6 lg:px-7">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d8f7e4] blur-3xl" />
      <div className="absolute -bottom-24 right-48 h-56 w-56 rounded-full bg-[#e6efff] blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#edf8f1] px-3 py-1.5 text-[12px] font-bold text-[#1f8655]">
            <ShieldCheck className="h-4 w-4" />
            สิทธิ์ผู้ดูแลระบบ
          </div>

          <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#213229] sm:text-[28px]">
            ตรวจสอบและจัดการรายงาน
          </h2>

          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-[#68776e] sm:text-[13px]">
            ติดตามสถานะรายงาน ตรวจสอบปัญหา และดำเนินการแทนผู้จัดการเมื่อจำเป็น
            โดยข้อมูลเชิงวิเคราะห์หลักยังคงเป็นหน้าที่ของผู้จัดการโรงงาน
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] bg-[#167c4d] px-5 text-[13px] font-bold text-white shadow-[0_12px_28px_rgba(22,124,77,0.22)] transition hover:-translate-y-0.5 hover:bg-[#126b42]"
        >
          <FileDown className="h-5 w-5" />
          สร้างรายงานแทนผู้จัดการ
        </button>
      </div>
    </section>
  );
}
