import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function CreateReportPanel() {
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2024-06-30");

  return (
    <section className="rounded-[22px] border border-[#dce9e1] bg-white p-5 shadow-[0_12px_34px_rgba(34,72,48,0.06)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(210px,1.1fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_150px_auto] lg:items-end">
        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#405047]">
            ประเภทรายงาน
          </span>
          <div className="relative">
            <select className="h-11 w-full appearance-none rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 pr-9 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]">
              <option>รายงานการใช้พลังงาน</option>
              <option>รายงานการปล่อยคาร์บอน</option>
              <option>รายงานการใช้น้ำและทรัพยากร</option>
              <option>รายงานประสิทธิภาพสายการผลิต</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
          </div>
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#405047]">
            วันที่เริ่มต้น
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#405047]">
            วันที่สิ้นสุด
          </span>
          <input
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
          />
        </label>

        <label>
          <span className="mb-2 block text-[12px] font-bold text-[#405047]">
            รูปแบบไฟล์
          </span>
          <div className="relative">
            <select className="h-11 w-full appearance-none rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 pr-9 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]">
              <option>Excel</option>
              <option>PDF</option>
              <option>CSV</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89968e]" />
          </div>
        </label>

        <button
          type="button"
          className="h-11 rounded-[14px] bg-[#243b2f] px-5 text-[13px] font-bold text-white transition hover:bg-[#192b21]"
        >
          เริ่มสร้างรายงาน
        </button>
      </div>
    </section>
  );
}
