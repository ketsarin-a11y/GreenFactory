"use client";

import { useMemo, useState } from "react";
import {
  INITIAL_PERMISSION_MATRIX,
  MOCK_ROLES,
  PERMISSION_GROUPS,
} from "./mock";
import type {
  PermissionLevel,
  PermissionMatrixState,
  RoleKey,
} from "./types";
import RoleList from "./RoleList";
import PermissionMatrix from "./PermissionMatrix";
import SavePermissionBar from "./SavePermissionBar";

function cloneMatrix(matrix: PermissionMatrixState): PermissionMatrixState {
  return Object.fromEntries(
    Object.entries(matrix).map(([permissionId, roleMap]) => [
      permissionId,
      { ...roleMap },
    ]),
  );
}

export default function RoleManagementPageClient() {
  const [selectedRole, setSelectedRole] =
    useState<RoleKey>("PLATFORM_ADMIN");
  const [matrix, setMatrix] = useState<PermissionMatrixState>(() =>
    cloneMatrix(INITIAL_PERMISSION_MATRIX),
  );
  const [savedMatrix, setSavedMatrix] = useState<PermissionMatrixState>(() =>
    cloneMatrix(INITIAL_PERMISSION_MATRIX),
  );

  const dirty = useMemo(
    () => JSON.stringify(matrix) !== JSON.stringify(savedMatrix),
    [matrix, savedMatrix],
  );

  function updatePermission(
    permissionId: string,
    role: RoleKey,
    value: PermissionLevel,
  ) {
    setMatrix((current) => ({
      ...current,
      [permissionId]: {
        ...current[permissionId],
        [role]: value,
      },
    }));
  }

  function resetPermissions() {
    setMatrix(cloneMatrix(savedMatrix));
  }

  function savePermissions() {
    // จุดเชื่อม API ในอนาคต:
    // await fetch("/api/platform/roles/permissions", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ matrix }),
    // });
    setSavedMatrix(cloneMatrix(matrix));
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[11px] font-semibold text-[#7a847f]">
          User & Role Management
          <span className="mx-2 text-[#c0c4c1]">›</span>
          กำหนดสิทธิ์การใช้งาน
        </p>

        <h2 className="mt-2 text-[27px] font-bold tracking-[-0.035em] text-[#1e2924]">
          กำหนดสิทธิ์การใช้งาน (Role)
        </h2>

        <p className="mt-1.5 text-[13px] text-[#7b8580]">
          กำหนดและจัดการสิทธิ์การเข้าถึงเมนูและฟีเจอร์ต่าง ๆ ในระบบ
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <RoleList
          roles={MOCK_ROLES}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
        />

        <div className="space-y-4">
          <PermissionMatrix
            groups={PERMISSION_GROUPS}
            roles={MOCK_ROLES}
            matrix={matrix}
            onChange={updatePermission}
          />

          <SavePermissionBar
            dirty={dirty}
            onReset={resetPermissions}
            onSave={savePermissions}
          />
        </div>
      </section>
    </div>
  );
}
