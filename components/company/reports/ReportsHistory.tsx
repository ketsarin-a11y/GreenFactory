import { RefreshCw } from "lucide-react";
import ReportsFilters from "./ReportsFilters";
import ReportsTable from "./ReportsTable";
import type { FileType, ReportItem, ReportStatus } from "./types";

type Props = {
  reports: ReportItem[];
  query: string;
  setQuery: (value: string) => void;
  status: "all" | ReportStatus;
  setStatus: (value: "all" | ReportStatus) => void;
  type: "all" | FileType;
  setType: (value: "all" | FileType) => void;
};

export default function ReportsHistory(props: Props) {
  return (
    <article className="rounded-[22px] border border-[#deebe3] bg-white p-5 shadow-[0_18px_52px_rgba(34,72,48,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[18px] font-extrabold text-[#25362c]">ประวัติการสร้างและส่งออกรายงาน</h3>
          <p className="mt-1 text-[12px] text-[#7b8981]">ตรวจสอบรายงานล่าสุดและสถานะการประมวลผล</p>
        </div>
        <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-[#dce6df] bg-white px-4 text-[12px] font-bold text-[#53645a] hover:bg-[#f4f8f6]">
          <RefreshCw className="h-4 w-4" />
          รีเฟรชข้อมูล
        </button>
      </div>

      <ReportsFilters
        query={props.query}
        setQuery={props.setQuery}
        status={props.status}
        setStatus={props.setStatus}
        type={props.type}
        setType={props.setType}
      />
      <ReportsTable reports={props.reports} />
    </article>
  );
}
