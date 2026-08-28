"use client";

import {
  Eye,
  KeyRound,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import type { UserRow } from "./types";
import UserAvatar from "./UserAvatar";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserActionMenu from "./UserActionMenu";

type Props = {
  users: UserRow[];
  openActionId: number | null;
  onOpenAction: (id: number) => void;
  onSelectUser: (user: UserRow) => void;
};

export default function UserTable({
  users,
  openActionId,
  onOpenAction,
  onSelectUser,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1420px] border-collapse">
        <thead>
          <tr className="border-b border-[#ece9e4] bg-[#fbfcfb] text-left">
            {[
              "#",
              "ชื่อผู้ใช้",
              "อีเมล",
              "บริษัท",
              "บทบาท",
              "ตำแหน่ง",
              "บริษัท/สังกัด",
              "วันที่ลงทะเบียน",
              "สถานะ",
              "จัดการ",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7f8883]"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className="border-b border-[#f0ede9] transition last:border-b-0 hover:bg-[#fbfcfb]"
            >
              <td className="px-4 py-3.5 text-[12px] font-medium text-[#75807b]">
                {index + 1}
              </td>

              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="max-w-[190px] truncate text-[12px] font-semibold text-[#26312c]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 max-w-[190px] truncate text-[10px] text-[#8a938f]">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3.5 text-[11px] text-[#4f5b56]">
                {user.email}
              </td>

              <td className="px-4 py-3.5">
                <p className="max-w-[200px] truncate text-[11px] font-medium text-[#4f5b56]">
                  {user.company}
                </p>
                <p className="mt-1 text-[10px] text-[#919995]">
                  {user.companyCode}
                </p>
              </td>

              <td className="px-4 py-3.5">
                <UserRoleBadge role={user.role} />
              </td>

              <td className="px-4 py-3.5 text-[11px] text-[#4f5b56]">
                {user.position}
              </td>

              <td className="px-4 py-3.5 text-[11px] text-[#4f5b56]">
                {user.office}
              </td>

              <td className="px-4 py-3.5">
                <p className="text-[11px] font-medium text-[#4f5b56]">
                  {user.registeredAt}
                </p>
                <p className="mt-1 text-[10px] text-[#909894]">
                  {user.registeredTime}
                </p>
              </td>

              <td className="px-4 py-3.5">
                <UserStatusBadge status={user.status} />
              </td>

              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectUser(user)}
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#168066] transition hover:border-[#b9dbcf] hover:bg-[#eef8f4]"
                  >
                    <Eye className="h-[15px] w-[15px]" />
                  </button>

                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#3c72b3] transition hover:border-[#c4d6ed] hover:bg-[#f0f5fb]"
                  >
                    <Pencil className="h-[14px] w-[14px]" />
                  </button>

                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#7a56d1] transition hover:border-[#d9cdf7] hover:bg-[#f5f1ff]"
                  >
                    <KeyRound className="h-[14px] w-[14px]" />
                  </button>

                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-[9px] border border-[#e1e5e2] text-[#d1505e] transition hover:border-[#efc8ce] hover:bg-[#fff1f3]"
                  >
                    <Trash2 className="h-[14px] w-[14px]" />
                  </button>

                  <UserActionMenu
                    open={openActionId === user.id}
                    onToggle={() => onOpenAction(user.id)}
                  />
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={10} className="px-6 py-16 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f2f5f3] text-[#7e8984]">
                  <Search className="h-5 w-5" />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-[#4f5a55]">
                  ไม่พบข้อมูลผู้ใช้งาน
                </p>
                <p className="mt-1 text-[11px] text-[#8d9692]">
                  ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
