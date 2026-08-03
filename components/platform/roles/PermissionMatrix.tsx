"use client";

import { Fragment } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  Factory,
  FileText,
  Gauge,
  Leaf,
  Ruler,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Waves,
  Zap,
} from "lucide-react";

import type {
  PermissionGroup,
  PermissionItem,
  PermissionLevel,
  PermissionMatrixState,
  Role,
  RoleKey,
} from "./types";

import PermissionCell from "./PermissionCell";
import RoleIcon from "./RoleIcon";

const iconMap = {
  dashboard: Gauge,
  chart: BarChart3,
  target: Target,
  bell: Bell,
  sparkles: Sparkles,
  file: FileText,
  building: Building2,
  users: Users,
  shield: ShieldCheck,
  settings: Settings,
  factory: Factory,
  sensor: Waves,
  zap: Zap,
  boxes: Boxes,
  ruler: Ruler,
  leaf: Leaf,
  database: Database,
  clipboard: ClipboardList,
  search: Search,
};

function PermissionLabel({
  item,
}: {
  item: PermissionItem;
}) {
  const Icon = iconMap[item.icon];

  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-[#6d7973]" />

      <span className="text-[11px] font-medium text-[#44504a]">
        {item.label}
      </span>
    </div>
  );
}

export default function PermissionMatrix({
  groups,
  roles,
  matrix,
  onChange,
}: {
  groups: PermissionGroup[];
  roles: Role[];
  matrix: PermissionMatrixState;
  onChange: (
    permissionId: string,
    role: RoleKey,
    value: PermissionLevel,
  ) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#e4e8e5] bg-white shadow-[0_14px_42px_rgba(36,49,43,0.045)]">
      <div className="border-b border-[#e8ece9] px-5 py-4">
        <h3 className="text-[14px] font-bold text-[#26312c]">
          เมทริกซ์สิทธิ์การใช้งาน (Permission Matrix)
        </h3>

        <p className="mt-1 text-[10px] text-[#8d9692]">
          คลิกที่สัญลักษณ์เพื่อเปลี่ยนระดับสิทธิ์ของแต่ละบทบาท
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-[#e8ece9] bg-[#fbfcfb]">
              <th className="w-[38%] border-r border-[#e8ece9] px-4 py-3 text-left text-[10px] font-semibold text-[#5c6862]">
                เมนู / ฟีเจอร์
              </th>

              <th
                colSpan={roles.length}
                className="px-4 py-2 text-center text-[10px] font-semibold text-[#5c6862]"
              >
                บทบาท (Role)
              </th>
            </tr>

            <tr className="border-b border-[#e8ece9] bg-white">
              <th className="border-r border-[#e8ece9]" />

              {roles.map((role) => {
                const [firstName, ...remainingName] =
                  role.name.split(" ");

                return (
                  <th
                    key={role.key}
                    className="px-3 py-3 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RoleIcon role={role} size="sm" />

                      <div className="text-left">
                        <p className="text-[9px] font-bold leading-tight text-[#36423c]">
                          {firstName}
                        </p>

                        <p className="text-[9px] font-bold leading-tight text-[#36423c]">
                          {remainingName.join(" ")}
                        </p>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <Fragment key={`permission-group-${group.id}`}>
                <tr className="bg-[#eef7f2]">
                  <td
                    colSpan={roles.length + 1}
                    className="px-4 py-2 text-[10px] font-bold text-[#33443c]"
                  >
                    {group.label}
                  </td>
                </tr>

                {group.items.map((item) => (
                  <tr
                    key={`${group.id}-${item.id}`}
                    className="border-b border-[#eef1ef] last:border-b-0 hover:bg-[#fbfcfb]"
                  >
                    <td className="border-r border-[#eef1ef] px-4 py-2.5">
                      <PermissionLabel item={item} />
                    </td>

                    {roles.map((role) => {
                      const permissionValue =
                        matrix[item.id]?.[role.key];

                      return (
                        <td
                          key={`${item.id}-${role.key}`}
                          className="px-3 py-2.5 text-center"
                        >
                          <PermissionCell
                            value={permissionValue}
                            onChange={(value) =>
                              onChange(
                                item.id,
                                role.key,
                                value,
                              )
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}