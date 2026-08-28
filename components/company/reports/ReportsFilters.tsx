import { ChevronDown, Filter, Search } from "lucide-react";
import type { FileType, ReportStatus } from "./types";

type Props = {
  query: string;
  setQuery: (value: string) => void;
  status: "all" | ReportStatus;
  setStatus: (value: "all" | ReportStatus) => void;
  type: "all" | FileType;
  setType: (value: "all" | FileType) => void;
};

export default function ReportsFilters({
  query,
  setQuery,
  status,
  setStatus,
  type,
  setType,
}: Props) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px]">
      <label className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a098]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหารายงานหรือชื่อผู้ขอ..."
          className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] pl-11 pr-4 text-[12px] font-medium text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
        />
      </label>

      <label className="relative">
        <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a098]" />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "all" | ReportStatus)}
          className="h-11 w-full appearance-none rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] pl-11 pr-10 text-[12px] font-semibold text-[#53645a] outline-none"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="ready">พร้อมดาวน์โหลด</option>
          <option value="processing">กำลังประมวลผล</option>
          <option value="failed">สร้างไม่สำเร็จ</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
      </label>

      <label className="relative">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as "all" | FileType)}
          className="h-11 w-full appearance-none rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-4 pr-10 text-[12px] font-semibold text-[#53645a] outline-none"
        >
          <option value="all">ทุกไฟล์</option>
          <option value="Excel">Excel</option>
          <option value="PDF">PDF</option>
          <option value="CSV">CSV</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
      </label>
    </div>
  );
}
