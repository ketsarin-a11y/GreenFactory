import { Lightbulb } from "lucide-react";

interface TipBannerProps {
  title?: string;
  message?: string;
}

export default function TipBanner({
  title = "เคล็ดลับ",
  message = "บันทึกข้อมูลให้ถูกต้องและครบถ้วน เพื่อให้การวิเคราะห์และคำนวณคาร์บอนเป็นไปอย่างแม่นยำ",
}: TipBannerProps) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <Lightbulb size={20} />
      </span>
      <div>
        <p className="text-sm font-semibold text-emerald-700">{title}</p>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </section>
  );
}