import { ChevronDown, RefreshCw, Search } from "lucide-react";

export default function MasterToolbar({
  search,
  category,
  status,
  categories,
  categoryLabel,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onReset,
}: {
  search: string;
  category: string;
  status: string;
  categories: string[];
  categoryLabel: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#ece9e4] p-4 xl:flex-row xl:items-center">
      <label className="relative block min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#949c98]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ค้นหาชื่อ รหัส หรือคำอธิบาย..."
          className="h-11 w-full rounded-[11px] border border-[#e2e4e1] bg-white pl-10 pr-4 text-[12px] text-[#26312c] outline-none placeholder:text-[#9da4a0] focus:border-[#9acabb] focus:ring-4 focus:ring-[#e8f5f0]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 xl:flex">
        <label className="relative">
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-11 min-w-[210px] appearance-none rounded-[11px] border border-[#e2e4e1] bg-white pl-3.5 pr-9 text-[12px] font-medium text-[#4f5954] outline-none"
          >
            <option value="ALL">{categoryLabel}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9591]" />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-11 min-w-[155px] appearance-none rounded-[11px] border border-[#e2e4e1] bg-white pl-3.5 pr-9 text-[12px] font-medium text-[#4f5954] outline-none"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9591]" />
        </label>

        <button
          type="button"
          onClick={onReset}
          className="grid h-11 w-11 place-items-center rounded-[11px] border border-[#e2e4e1] bg-white text-[#5e6964] transition hover:bg-[#f7f9f8]"
          aria-label="รีเซ็ตตัวกรอง"
        >
          <RefreshCw className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}
