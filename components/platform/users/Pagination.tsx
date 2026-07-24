import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  page,
  totalVisible,
  total,
  onPageChange,
}: {
  page: number;
  totalVisible: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-[#ece9e4] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] text-[#808985]">
        แสดง 1 - {totalVisible} จาก {total} รายการ
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#e0e3e1] text-[#808985] disabled:opacity-40"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`h-8 min-w-8 rounded-[8px] px-2 text-[11px] font-semibold transition ${
              page === item
                ? "bg-[#0d7659] text-white"
                : "border border-[#e0e3e1] bg-white text-[#68736e] hover:bg-[#f6f8f7]"
            }`}
          >
            {item}
          </button>
        ))}

        <span className="px-1 text-[#919995]">…</span>

        <button
          type="button"
          className="h-8 min-w-8 rounded-[8px] border border-[#e0e3e1] px-2 text-[11px] font-semibold text-[#68736e]"
        >
          71
        </button>

        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#e0e3e1] text-[#808985]"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="ml-2 inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#e0e3e1] px-3 text-[11px] font-medium text-[#68736e]"
        >
          10 / หน้า
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
