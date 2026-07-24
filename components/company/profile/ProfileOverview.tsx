import {
  Building2,
  CalendarDays,
  Clock3,
  Factory,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import SectionCard from "./SectionCard";

type Props = {
  employeeCode: string;
  companyName: string;
  factoryName: string;
  position: string;
};

const stats = [
  {
    label: "สถานะบัญชี",
    value: "ใช้งานอยู่",
    icon: ShieldCheck,
    color: "bg-[#eaf8ef] text-[#188250]",
  },
  {
    label: "เข้าสู่ระบบล่าสุด",
    value: "วันนี้ 20:42 น.",
    icon: Clock3,
    color: "bg-[#edf3ff] text-[#5577d9]",
  },
  {
    label: "เริ่มใช้งานระบบ",
    value: "12 ม.ค. 2569",
    icon: CalendarDays,
    color: "bg-[#fff5df] text-[#b47708]",
  },
];

export default function ProfileOverview({
  employeeCode,
  companyName,
  factoryName,
  position,
}: Props) {
  return (
    <SectionCard
      title="ภาพรวมบัญชี"
      description="ข้อมูลประจำตัวและสิทธิ์การใช้งานในระบบ"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-[16px] border border-[#e3ebe6] bg-[#fbfdfc] p-4"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-[13px] ${item.color}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[11px] font-semibold text-[#829087]">
                {item.label}
              </p>
              <p className="mt-1 text-[13px] font-extrabold text-[#35463c]">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-[16px] bg-[#f5f8f6] px-4 py-3">
          <IdCard className="h-5 w-5 text-[#2c8a5d]" />
          <div>
            <p className="text-[10px] font-semibold text-[#89968e]">
              รหัสพนักงาน
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#35463c]">
              {employeeCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[16px] bg-[#f5f8f6] px-4 py-3">
          <Building2 className="h-5 w-5 text-[#5a78d8]" />
          <div>
            <p className="text-[10px] font-semibold text-[#89968e]">
              บริษัท
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#35463c]">
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[16px] bg-[#f5f8f6] px-4 py-3">
          <Factory className="h-5 w-5 text-[#d67d2b]" />
          <div>
            <p className="text-[10px] font-semibold text-[#89968e]">
              โรงงาน
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#35463c]">
              {factoryName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[16px] bg-[#f5f8f6] px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-[#8b5acf]" />
          <div>
            <p className="text-[10px] font-semibold text-[#89968e]">
              บทบาท
            </p>
            <p className="mt-1 text-[12px] font-bold text-[#35463c]">
              {position}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
