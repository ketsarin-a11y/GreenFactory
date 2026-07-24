import { ArrowRight, Headphones } from "lucide-react";

type Props = {
  onOpen: () => void;
};

export default function SupportCallout({ onOpen }: Props) {
  return (
    <section className="rounded-[22px] border border-[#dce9e1] bg-[#f7faf8] px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#168451] shadow-sm">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[15px] font-extrabold text-[#304138]">
              ยังไม่พบคำตอบที่ต้องการ?
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-[#7f8d85]">
              ส่งรายละเอียดให้ทีมสนับสนุนตรวจสอบและติดต่อกลับ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#b9d9c7] bg-white px-4 text-[12px] font-bold text-[#168451] transition hover:bg-[#edf8f1]"
        >
          ติดต่อทีมสนับสนุน
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
