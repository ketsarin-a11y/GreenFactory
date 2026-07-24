import { RotateCcw, Save } from "lucide-react";

export default function SavePermissionBar({
  dirty,
  onReset,
  onSave,
}: {
  dirty: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#e3e7e4] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(39,50,45,0.045)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-bold text-[#3a4640]">
          {dirty ? "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" : "สิทธิ์ล่าสุดถูกบันทึกแล้ว"}
        </p>
        <p className="mt-1 text-[10px] text-[#909894]">
          การตั้งค่านี้จะถูกนำไปใช้กับผู้ใช้ทุกคนในบทบาทนั้น
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-2 rounded-[11px] border border-[#dfe4e1] bg-white px-4 text-[11px] font-semibold text-[#59655f] transition hover:bg-[#f6f8f7]"
        >
          <RotateCcw className="h-4 w-4" />
          คืนค่าเดิม
        </button>

        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-[#0d7659] px-4 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(13,118,89,0.18)] transition hover:-translate-y-0.5 hover:bg-[#09694f]"
        >
          <Save className="h-4 w-4" />
          บันทึกและใช้งาน
        </button>
      </div>
    </div>
  );
}
