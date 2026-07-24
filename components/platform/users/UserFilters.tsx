import {
  CalendarDays,
  ChevronDown,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import type { UserRole, UserStatus } from "./types";

type Props = {
  search: string;
  status: "ALL" | UserStatus;
  role: "ALL" | UserRole;
  company: string;
  companies: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | UserStatus) => void;
  onRoleChange: (value: "ALL" | UserRole) => void;
  onCompanyChange: (value: string) => void;
  onReset: () => void;
};

export default function UserFilters({
  search,
  status,
  role,
  company,
  companies,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onCompanyChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#ece9e4] p-4 xl:flex-row xl:items-center">
      <label className="relative block min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#949c98]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ค้นหาชื่อ, อีเมล, บริษัท, ตำแหน่ง"
          className="h-11 w-full rounded-[11px] border border-[#e2e4e1] bg-white pl-10 pr-4 text-[12px] text-[#26312c] outline-none transition placeholder:text-[#9da4a0] focus:border-[#9acabb] focus:ring-4 focus:ring-[#e8f5f0]"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 xl:flex">
        <label className="relative">
          <select
            value={company}
            onChange={(event) => onCompanyChange(event.target.value)}
            className="h-11 min-w-[175px] appearance-none rounded-[11px] border border-[#e2e4e1] bg-white pl-3.5 pr-9 text-[12px] font-medium text-[#4f5954] outline-none focus:border-[#9acabb] focus:ring-4 focus:ring-[#e8f5f0]"
          >
            <option value="ALL">บริษัททั้งหมด</option>
            {companies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9591]" />
        </label>

        <label className="relative">
          <select
            value={role}
            onChange={(event) =>
              onRoleChange(event.target.value as "ALL" | UserRole)
            }
            className="h-11 min-w-[170px] appearance-none rounded-[11px] border border-[#e2e4e1] bg-white pl-3.5 pr-9 text-[12px] font-medium text-[#4f5954] outline-none focus:border-[#9acabb] focus:ring-4 focus:ring-[#e8f5f0]"
          >
            <option value="ALL">บทบาททั้งหมด</option>
            <option value="PLATFORM_ADMIN">Platform Admin</option>
            <option value="COMPANY_ADMIN">Company Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="OPERATOR">Operator</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9591]" />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as "ALL" | UserStatus)
            }
            className="h-11 min-w-[155px] appearance-none rounded-[11px] border border-[#e2e4e1] bg-white pl-3.5 pr-9 text-[12px] font-medium text-[#4f5954] outline-none focus:border-[#9acabb] focus:ring-4 focus:ring-[#e8f5f0]"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="SUSPENDED">ระงับการใช้งาน</option>
            <option value="EXPIRED">หมดอายุ</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c9591]" />
        </label>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#e2e4e1] bg-white px-3.5 text-[12px] font-medium text-[#56615c] transition hover:bg-[#f7f9f8]"
        >
          <CalendarDays className="h-[16px] w-[16px]" />
          วันที่ลงทะเบียน
        </button>

        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#e2e4e1] bg-white px-3.5 text-[12px] font-medium text-[#56615c] transition hover:bg-[#f7f9f8]"
        >
          <Filter className="h-[16px] w-[16px]" />
          ตัวกรองเพิ่มเติม
          <ChevronDown className="h-4 w-4" />
        </button>

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
