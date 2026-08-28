"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { UserRow } from "./types";
import UserAvatar from "./UserAvatar";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import { roleConfig } from "./constants";

export default function UserProfileDrawer({
  user,
  onClose,
}: {
  user: UserRow | null;
  onClose: () => void;
}) {
  if (!user) return null;

  const details = [
    { icon: Mail, label: "อีเมล", value: user.email },
    { icon: Phone, label: "เบอร์โทรศัพท์", value: user.phone },
    { icon: Building2, label: "บริษัท", value: user.company },
    { icon: ShieldCheck, label: "บทบาท", value: roleConfig[user.role].label },
    { icon: UserRound, label: "ตำแหน่ง", value: user.position },
    { icon: MapPin, label: "สถานที่ปฏิบัติงาน", value: user.office },
    {
      icon: CalendarDays,
      label: "วันที่ลงทะเบียน",
      value: `${user.registeredAt} ${user.registeredTime}`,
    },
    { icon: CheckCircle2, label: "เข้าสู่ระบบล่าสุด", value: user.lastLogin },
  ];

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-[#17201c]/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="ปิดรายละเอียดผู้ใช้งาน"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[430px] overflow-y-auto border-l border-[#e4e6e3] bg-[#fbfaf8] shadow-[-24px_0_70px_rgba(31,42,37,0.14)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e5e0] bg-[#fbfaf8]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[15px] font-bold text-[#26312c]">
              รายละเอียดผู้ใช้งาน
            </p>
            <p className="mt-1 text-[11px] text-[#89928e]">
              พร้อมสำหรับเชื่อมฐานข้อมูลจริง
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[10px] text-[#707a75] transition hover:bg-white"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-[20px] border border-[#e5e3df] bg-white p-5 shadow-[0_10px_30px_rgba(46,43,38,0.05)]">
            <div className="flex items-center gap-4">
              <UserAvatar user={user} size="lg" />
              <div className="min-w-0">
                <h3 className="truncate text-[19px] font-bold tracking-[-0.03em] text-[#26312c]">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="mt-1 text-[11px] text-[#89928e]">
                  @{user.username}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {details.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-[15px] border border-[#e7e5e1] bg-white px-4 py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#f1f4f3] text-[#577066]">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#949c98]">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-[12px] font-medium text-[#39453f]">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#dfe4e1] bg-white text-[12px] font-semibold text-[#4b5852] transition hover:bg-[#f6f8f7]"
            >
              <Pencil className="h-4 w-4" />
              แก้ไขข้อมูล
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0d7659] text-[12px] font-semibold text-white transition hover:bg-[#09694f]"
            >
              <KeyRound className="h-4 w-4" />
              จัดการสิทธิ์
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
