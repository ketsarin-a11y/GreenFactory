import { AlertTriangle } from "lucide-react";

export default function ReportsAlert() {
  return (
    <article className="rounded-[22px] border border-[#f0dfc6] bg-[linear-gradient(145deg,#fffdf8_0%,#fff7e8_100%)] p-5 shadow-[0_18px_52px_rgba(113,76,21,0.07)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-[#c08218] shadow-sm">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-[16px] font-extrabold text-[#453827]">รายงานที่ต้องตรวจสอบ</h3>
      <p className="mt-2 text-[12px] leading-6 text-[#766754]">
        พบรายงาน 1 รายการที่สร้างไม่สำเร็จ ผู้ดูแลระบบสามารถตรวจสอบรายละเอียด
        และลองสร้างใหม่แทนผู้จัดการได้
      </p>
      <button type="button" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[15px] bg-[#8a5b10] px-4 text-[12px] font-bold text-white hover:bg-[#70490c]">
        เปิดรายการปัญหา
      </button>
    </article>
  );
}
