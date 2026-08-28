import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-between border-t border-[#ece9e4] px-4 py-3.5">
      <p className="text-[11px] text-[#808985]">
        แสดง 1 - {totalVisible} จาก {total} รายการ
      </p>

      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#e0e3e1] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {[1, 2, 3].map((item) => (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`h-8 min-w-8 rounded-[8px] px-2 text-[11px] font-semibold ${
              page === item
                ? "bg-[#0d7659] text-white"
                : "border border-[#e0e3e1] bg-white text-[#68736e]"
            }`}
          >
            {item}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#e0e3e1]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
