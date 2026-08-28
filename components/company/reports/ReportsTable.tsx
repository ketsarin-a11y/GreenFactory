import { Download, FileText, UserRound } from "lucide-react";
import FileTypeIcon from "./FileTypeIcon";
import StatusBadge from "./StatusBadge";
import type { ReportItem } from "./types";

export default function ReportsTable({ reports }: { reports: ReportItem[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-[18px] border border-[#e2ebe5]">
      <div className="max-h-[440px] overflow-auto [scrollbar-color:#b7c8bd_#f3f7f4] [scrollbar-width:thin]">
        <div className="min-w-[980px]">
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(280px,1.5fr)_180px_155px_165px_120px] gap-4 bg-[#f5f8f6] px-4 py-3 text-[11px] font-bold text-[#718078]">
            <span>รายงาน</span>
            <span>ผู้ขอรายงาน</span>
            <span>สถานะ</span>
            <span>วันที่สร้าง</span>
            <span className="text-right">การจัดการ</span>
          </div>

          <div className="divide-y divide-[#e8eee9]">
            {reports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-[minmax(280px,1.5fr)_180px_155px_165px_120px] items-center gap-4 bg-white px-4 py-3.5 transition hover:bg-[#fbfdfc]"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <FileTypeIcon type={report.fileType} />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-[#2d3d33]">
                      {report.title}
                    </p>
                    <p className="mt-1 text-[10px] text-[#87948c]">
                      {report.period} · {report.fileType} · {report.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef5f1] text-[#4d6c5a]">
                    <UserRound className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] font-semibold text-[#526159]">
                    {report.requestedBy}
                  </span>
                </div>

                <StatusBadge status={report.status} />

                <p className="text-[11px] font-medium text-[#66756c]">
                  {report.createdAt}
                </p>

                <div className="flex justify-end">
                  {report.status === "ready" ? (
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#eaf8ef] px-3 text-[11px] font-bold text-[#17804f] transition hover:bg-[#dff3e7]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      ดาวน์โหลด
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-[#dce5df] bg-white px-3 text-[11px] font-bold text-[#5c6b62] transition hover:bg-[#f3f7f4]"
                    >
                      ตรวจสอบ
                    </button>
                  )}
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-9 w-9 text-[#b7c1bb]" />
                <p className="mt-3 text-[13px] font-bold text-[#65736b]">
                  ไม่พบรายงานที่ตรงกับเงื่อนไข
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
