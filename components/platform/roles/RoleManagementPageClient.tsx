"use client";



import {

  AlertTriangle,

  LoaderCircle,

  RefreshCw,

} from "lucide-react";

import {

  useCallback,

  useEffect,

  useMemo,

  useState,

} from "react";



import PermissionMatrix from "./PermissionMatrix";

import RoleList from "./RoleList";

import SavePermissionBar from "./SavePermissionBar";



import type {

  PermissionGroup,

  PermissionLevel,

  PermissionMatrixState,

  Role,

  RoleKey,

} from "./types";



type ApiRole = {

  id: number;

  key: string;

  code: string;

  name: string;

  description: string;

  status: string;

  userCount: number;

  permissionCount: number;

};



type PermissionApiResponse = {

  success: boolean;

  message?: string;



  data?: {

    roles: ApiRole[];

    groups: PermissionGroup[];

    matrix: PermissionMatrixState;

  };



  summary?: {

    totalRoles: number;

    totalPermissions: number;

    totalAssignments: number;

  };

};



const ROLE_LABELS: Record<string, string> = {

  PLATFORM_ADMIN: "Platform Admin",

  COMPANY_ADMIN: "Company Admin",

  FACTORY_MANAGER: "Factory Manager",

  ENVIRONMENT_OFFICER: "Environment Officer",

};



const ROLE_ICONS: Record<RoleKey, Role["icon"]> = {
  PLATFORM_ADMIN: "shield",
  COMPANY_ADMIN: "users",
  FACTORY_MANAGER: "factory",
  ENVIRONMENT_OFFICER: "leaf",
};

const ROLE_TONES: Record<RoleKey, Role["tone"]> = {

  PLATFORM_ADMIN: {

    activeBg: "bg-[#eef9f4]",

    activeBorder: "border-[#bfe6d5]",

    iconBg: "bg-[#dff5eb]",

    iconText: "text-[#0f8a64]",

  },

  COMPANY_ADMIN: {

    activeBg: "bg-[#eef5ff]",

    activeBorder: "border-[#cbdfff]",

    iconBg: "bg-[#e3efff]",

    iconText: "text-[#3978df]",

  },

  FACTORY_MANAGER: {

    activeBg: "bg-[#fff5eb]",

    activeBorder: "border-[#f3d7b9]",

    iconBg: "bg-[#ffead7]",

    iconText: "text-[#e27b20]",

  },

  ENVIRONMENT_OFFICER: {

    activeBg: "bg-[#f5efff]",

    activeBorder: "border-[#ddcff7]",

    iconBg: "bg-[#eee5ff]",

    iconText: "text-[#8257d5]",

  },

};



function isRoleKey(value: string): value is RoleKey {

  return [

    "PLATFORM_ADMIN",

    "COMPANY_ADMIN",

    "FACTORY_MANAGER",

    "ENVIRONMENT_OFFICER",

  ].includes(value);

}



function cloneMatrix(

  matrix: PermissionMatrixState,

): PermissionMatrixState {

  return Object.fromEntries(

    Object.entries(matrix).map(

      ([permissionId, roleMap]) => [

        permissionId,

        { ...roleMap },

      ],

    ),

  ) as PermissionMatrixState;

}



function mapApiRoles(apiRoles: ApiRole[]): Role[] {
  return apiRoles.flatMap((role) => {
    if (!isRoleKey(role.key)) {
      return [];
    }

    const roleKey = role.key;

    return [
      {
        id: role.id,
        key: roleKey,
        name: ROLE_LABELS[roleKey] ?? role.name,
        description: role.description,
        userCount: role.userCount,
        icon: ROLE_ICONS[roleKey],
        tone: ROLE_TONES[roleKey],
      },
    ];
  });
}

export default function RoleManagementPageClient() {

  const [roles, setRoles] = useState<Role[]>([]);

  const [groups, setGroups] = useState<PermissionGroup[]>([]);



  const [selectedRole, setSelectedRole] =

    useState<RoleKey>("PLATFORM_ADMIN");



  const [matrix, setMatrix] =

    useState<PermissionMatrixState>({});



  const [savedMatrix, setSavedMatrix] =

    useState<PermissionMatrixState>({});



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);



  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =

    useState("");



  const [summary, setSummary] = useState({

    totalRoles: 0,

    totalPermissions: 0,

    totalAssignments: 0,

  });



  const loadPermissions = useCallback(

    async (signal?: AbortSignal) => {

      try {

        setLoading(true);

        setError("");

        setSuccessMessage("");



        const response = await fetch(

          "/api/platform/roles/permissions",

          {

            method: "GET",

            cache: "no-store",

            signal,

          },

        );



        const result =

          (await response.json()) as PermissionApiResponse;



        if (

          !response.ok ||

          !result.success ||

          !result.data

        ) {

          throw new Error(

            result.message ??

              "ไม่สามารถโหลดข้อมูลสิทธิ์ได้",

          );

        }



        const mappedRoles = mapApiRoles(

          result.data.roles,

        );



        const nextMatrix = cloneMatrix(

          result.data.matrix,

        );



        setRoles(mappedRoles);

        setGroups(result.data.groups);

        setMatrix(nextMatrix);

        setSavedMatrix(cloneMatrix(nextMatrix));



        setSummary({

          totalRoles:

            result.summary?.totalRoles ??

            mappedRoles.length,

          totalPermissions:

            result.summary?.totalPermissions ??

            result.data.groups.reduce(

              (total, group) =>

                total + group.items.length,

              0,

            ),

          totalAssignments:

            result.summary?.totalAssignments ?? 0,

        });



        if (

          mappedRoles.length > 0 &&

          !mappedRoles.some(

            (role) => role.key === selectedRole,

          )

        ) {

          setSelectedRole(mappedRoles[0].key);

        }

      } catch (caught) {

        if (

          caught instanceof DOMException &&

          caught.name === "AbortError"

        ) {

          return;

        }



        setError(

          caught instanceof Error

            ? caught.message

            : "ไม่สามารถโหลดข้อมูลสิทธิ์ได้",

        );

      } finally {

        setLoading(false);

      }

    },

    [selectedRole],

  );



  useEffect(() => {

    const controller = new AbortController();



    void loadPermissions(controller.signal);



    return () => controller.abort();

  }, [loadPermissions]);



  const dirty = useMemo(

    () =>

      JSON.stringify(matrix) !==

      JSON.stringify(savedMatrix),

    [matrix, savedMatrix],

  );



  function updatePermission(

    permissionId: string,

    role: RoleKey,

    value: PermissionLevel,

  ) {

    setSuccessMessage("");



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

    setSuccessMessage("");

  }



  async function savePermissions() {

    if (!dirty || saving) {

      return;

    }



    try {

      setSaving(true);

      setError("");

      setSuccessMessage("");



      const response = await fetch(

        "/api/platform/roles/permissions",

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            matrix,

          }),

        },

      );



      const result = (await response.json()) as {

        success: boolean;

        message?: string;

        updatedCount?: number;

      };



      if (!response.ok || !result.success) {

        throw new Error(

          result.message ??

            "ไม่สามารถบันทึกสิทธิ์ได้",

        );

      }



      setSavedMatrix(cloneMatrix(matrix));



      setSuccessMessage(

        result.message ??

          "บันทึกสิทธิ์การใช้งานเรียบร้อยแล้ว",

      );



      setSummary((current) => ({

        ...current,

        totalAssignments:

          result.updatedCount ??

          current.totalAssignments,

      }));

    } catch (caught) {

      setError(

        caught instanceof Error

          ? caught.message

          : "ไม่สามารถบันทึกสิทธิ์ได้",

      );

    } finally {

      setSaving(false);

    }

  }



  if (loading) {

    return (

      <div className="grid min-h-[560px] place-items-center">

        <div className="text-center">

          <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] border border-[#dce8e2] bg-white shadow-sm">

            <LoaderCircle className="h-6 w-6 animate-spin text-[#168662]" />

          </div>



          <p className="mt-4 text-[12px] font-semibold text-[#68746e]">

            กำลังโหลดบทบาทและสิทธิ์

          </p>



          <p className="mt-1 text-[10px] text-[#9aa29e]">

            กำลังอ่านข้อมูลจากฐานข้อมูล

          </p>

        </div>

      </div>

    );

  }



  if (error && roles.length === 0) {

    return (

      <div className="grid min-h-[560px] place-items-center">

        <div className="w-full max-w-[620px] rounded-[24px] border border-[#efdadd] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-[#fff0f1] text-[#c15561]">

            <AlertTriangle className="h-5 w-5" />

          </div>



          <h2 className="mt-4 text-[17px] font-bold text-[#28332e]">

            โหลดข้อมูลสิทธิ์ไม่สำเร็จ

          </h2>



          <p className="mt-2 text-[12px] text-[#a44854]">

            {error}

          </p>



          <button

            type="button"

            onClick={() =>

              void loadPermissions()

            }

            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0e7b5b] px-5 text-[11px] font-semibold text-white"

          >

            <RefreshCw className="h-4 w-4" />

            ลองใหม่

          </button>

        </div>

      </div>

    );

  }



  return (

    <div className="space-y-6">

      <section>

        <p className="text-[11px] font-semibold text-[#7a847f]">

          User & Role Management

          <span className="mx-2 text-[#c0c4c1]">

            ›

          </span>

          กำหนดสิทธิ์การใช้งาน

        </p>



        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">

          <div>

            <h2 className="text-[27px] font-bold tracking-[-0.035em] text-[#1e2924]">

              กำหนดสิทธิ์การใช้งาน (Role)

            </h2>



            <p className="mt-1.5 text-[13px] text-[#7b8580]">

              กำหนดและจัดการสิทธิ์การเข้าถึงเมนูและฟีเจอร์ต่าง ๆ

              ในระบบ

            </p>

          </div>



          <div className="flex flex-wrap gap-2">

            <span className="rounded-full border border-[#dce8e2] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#617069]">

              {summary.totalRoles} บทบาท

            </span>



            <span className="rounded-full border border-[#dce8e2] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#617069]">

              {summary.totalPermissions} สิทธิ์

            </span>



            <span className="rounded-full border border-[#cfe9dc] bg-[#edf8f2] px-3 py-1.5 text-[10px] font-semibold text-[#168662]">

              เชื่อมฐานข้อมูลแล้ว

            </span>

          </div>

        </div>

      </section>



      {error && (

        <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#f0d8dc] bg-[#fff6f7] px-4 py-3">

          <div className="flex items-center gap-2">

            <AlertTriangle className="h-4 w-4 shrink-0 text-[#c15561]" />



            <p className="text-[11px] font-medium text-[#a44854]">

              {error}

            </p>

          </div>



          <button

            type="button"

            onClick={() => setError("")}

            className="text-[10px] font-semibold text-[#a44854]"

          >

            ปิด

          </button>

        </div>

      )}



      {successMessage && (

        <div className="rounded-[16px] border border-[#cce8da] bg-[#eef9f3] px-4 py-3 text-[11px] font-semibold text-[#147858]">

          {successMessage}

        </div>

      )}



      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">

        <RoleList

          roles={roles}

          selectedRole={selectedRole}

          onSelectRole={setSelectedRole}

        />



        <div className="space-y-4">

          <PermissionMatrix

            groups={groups}

            roles={roles}

            matrix={matrix}

            onChange={updatePermission}

          />



          <div

            className={

              saving

                ? "pointer-events-none opacity-60"

                : ""

            }

          >

            <SavePermissionBar

              dirty={dirty}

              onReset={resetPermissions}

              onSave={() =>

                void savePermissions()

              }

            />

          </div>



          {saving && (

            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#637069]">

              <LoaderCircle className="h-4 w-4 animate-spin text-[#168662]" />

              กำลังบันทึกสิทธิ์ลงฐานข้อมูล

            </div>

          )}

        </div>

      </section>

    </div>

  );

}