import { monthlyTrend } from "./data";

export default function ReportsChart() {
  return (
    <article className="rounded-[22px] border border-[#deebe3] bg-white p-5 shadow-[0_18px_52px_rgba(34,72,48,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-extrabold text-[#25362c]">ปริมาณรายงาน</h3>
          <p className="mt-1 text-[12px] text-[#829087]">จำนวนรายงานย้อนหลัง 6 เดือน</p>
        </div>
        <span className="rounded-full bg-[#edf5ff] px-3 py-1.5 text-[11px] font-bold text-[#5572c8]">6 เดือน</span>
      </div>

      <div className="mt-5 flex h-[185px] items-end gap-3">
        {monthlyTrend.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-[140px] w-full items-end rounded-[14px] bg-[#f0f4f1] p-1.5">
              <div className="w-full rounded-[10px] bg-gradient-to-t from-[#23885a] to-[#54ce8d]" style={{ height: `${item.value}%` }} />
            </div>
            <span className="text-[11px] font-bold text-[#78867e]">{item.month}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
