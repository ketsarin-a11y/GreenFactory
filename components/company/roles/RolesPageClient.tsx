"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import EditPermissionDrawer from "./EditPermissionDrawer";
import PermissionMatrix, {
  PermissionAction,
  PermissionItem,
  RoleKey,
} from "./PermissionMatrix";

const initialPermissions: Record<RoleKey, PermissionItem[]> = {
  MANAGER: [
    {
      module: "หน้าหลัก",
      description: "ดูภาพรวมโรงงาน งานที่รอดำเนินการ และการแจ้งเตือน",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "ผู้ใช้งาน",
      description: "ดูรายชื่อบุคลากรในโรงงานตามขอบเขตที่ได้รับมอบหมาย",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "แผนกและสายการผลิต",
      description: "ดูโครงสร้างแผนกและสายการผลิตของโรงงาน",
      permissions: { view: true, create: false, edit: true, delete: false, approve: false, export: false },
    },
    {
      module: "เครื่องจักรและจุดตรวจ",
      description: "ตรวจสอบและแก้ไขข้อมูลเครื่องจักรในโรงงานที่รับผิดชอบ",
      permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
    },
    {
      module: "เซนเซอร์",
      description: "ตรวจสอบสถานะและข้อมูลจากเซนเซอร์",
      permissions: { view: true, create: false, edit: true, delete: false, approve: false, export: true },
    },
    {
      module: "QR Code",
      description: "ดู สร้าง และจัดการ QR Code ของเครื่องจักร",
      permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    },
    {
      module: "การบันทึกการใช้ทรัพยากร",
      description: "ตรวจสอบ แก้ไข และอนุมัติข้อมูลที่ Operator บันทึก",
      permissions: { view: true, create: false, edit: true, delete: false, approve: true, export: true },
    },
    {
      module: "ประวัติการสแกน QR",
      description: "ดูประวัติการสแกน QR ภายในโรงงาน",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
    },
    {
      module: "รายงานและส่งออกข้อมูล",
      description: "ดูและส่งออกรายงานของโรงงาน",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
    },
    {
      module: "การตั้งค่าโรงงาน",
      description: "ดูข้อมูลการตั้งค่าพื้นฐานของโรงงาน",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
  ],
  OPERATOR: [
    {
      module: "หน้าหลัก",
      description: "ดูงานที่ได้รับมอบหมายและรายการล่าสุดของตนเอง",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "ผู้ใช้งาน",
      description: "ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้งาน",
      permissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "แผนกและสายการผลิต",
      description: "ดูแผนกและสายการผลิตที่ตนเองได้รับมอบหมาย",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "เครื่องจักรและจุดตรวจ",
      description: "ดูรายละเอียดเครื่องจักรจาก QR Code",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "เซนเซอร์",
      description: "ดูสถานะเซนเซอร์ที่เกี่ยวข้องกับเครื่องจักร",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "QR Code",
      description: "สแกน QR Code เพื่อเปิดหน้าบันทึกข้อมูล",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "การบันทึกการใช้ทรัพยากร",
      description: "เพิ่มและแก้ไขข้อมูลที่ตนเองบันทึกก่อนส่งตรวจสอบ",
      permissions: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
    },
    {
      module: "ประวัติการสแกน QR",
      description: "ดูประวัติการสแกน QR ของตนเอง",
      permissions: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "รายงานและส่งออกข้อมูล",
      description: "ไม่มีสิทธิ์เข้าถึงรายงานระดับโรงงาน",
      permissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
    {
      module: "การตั้งค่าโรงงาน",
      description: "ไม่มีสิทธิ์เปลี่ยนแปลงการตั้งค่าโรงงาน",
      permissions: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    },
  ],
};

export default function RolesPageClient() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("MANAGER");
  const [permissions, setPermissions] =
    useState<Record<RoleKey, PermissionItem[]>>(initialPermissions);
  const [draftPermissions, setDraftPermissions] =
    useState<PermissionItem[]>(initialPermissions.MANAGER);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const selectedItems = permissions[selectedRole];

  const allowedPermissionCount = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) =>
          total + Object.values(item.permissions).filter(Boolean).length,
        0,
      ),
    [selectedItems],
  );

  const roleInfo = {
    MANAGER: {
      title: "Manager",
      thaiTitle: "ผู้จัดการโรงงาน",
      description:
        "ตรวจสอบข้อมูลโรงงาน จัดการเครื่องจักร และอนุมัติข้อมูลที่ Operator บันทึก",
      userCount: 2,
      icon: UserCog,
      badge: "bg-[#e7f7ef] text-[#238156]",
      activeCard:
        "border-[#63bd98]/35 bg-[#edf9f3] shadow-[0_12px_30px_rgba(35,129,86,0.08)]",
      iconStyle: "bg-[#dff4e9] text-[#238156]",
    },
    OPERATOR: {
      title: "Operator",
      thaiTitle: "ผู้ปฏิบัติงาน",
      description:
        "สแกน QR Code และบันทึกข้อมูลการใช้ทรัพยากรจากหน้างาน",
      userCount: 8,
      icon: Users,
      badge: "bg-[#f0ebff] text-[#7154b5]",
      activeCard:
        "border-[#a391d5]/35 bg-[#f6f2ff] shadow-[0_12px_30px_rgba(113,84,181,0.08)]",
      iconStyle: "bg-[#ede6ff] text-[#7154b5]",
    },
  } satisfies Record<
    RoleKey,
    {
      title: string;
      thaiTitle: string;
      description: string;
      userCount: number;
      icon: typeof Users;
      badge: string;
      activeCard: string;
      iconStyle: string;
    }
  >;

  function openEditDrawer() {
    setDraftPermissions(
      permissions[selectedRole].map((item) => ({
        ...item,
        permissions: { ...item.permissions },
      })),
    );
    setDrawerOpen(true);
    setSavedMessage("");
  }

  function updateDraftPermission(
    moduleIndex: number,
    action: PermissionAction,
    value: boolean,
  ) {
    setDraftPermissions((current) =>
      current.map((item, index) =>
        index === moduleIndex
          ? {
              ...item,
              permissions: {
                ...item.permissions,
                [action]: value,
              },
            }
          : item,
      ),
    );
  }

  function savePermissions() {
    setPermissions((current) => ({
      ...current,
      [selectedRole]: draftPermissions,
    }));
    setDrawerOpen(false);
    setSavedMessage(`บันทึกสิทธิ์ ${roleInfo[selectedRole].title} แล้ว`);
    window.setTimeout(() => setSavedMessage(""), 3000);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1600px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f7f0] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#25734d]">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
              Role-Based Access Control
            </div>

            <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.045em] text-[#182334] sm:text-[36px]">
              บทบาทและสิทธิ์
            </h1>

            <p className="mt-2 max-w-[720px] text-[11px] leading-5 text-[#788392]">
              Company Admin จัดการสิทธิ์ได้เฉพาะ Manager และ Operator
              โดยไม่สามารถสร้างหรือแก้ไขสิทธิ์ Platform Admin และ Company Admin
            </p>
          </div>

          <button
            type="button"
            onClick={openEditDrawer}
            className={`inline-flex min-h-[44px] w-fit items-center justify-center gap-2.5 rounded-[12px] px-5 text-[11px] font-semibold text-white shadow-[0_12px_28px_rgba(31,143,98,0.18)] transition hover:-translate-y-0.5 ${
              selectedRole === "MANAGER"
                ? "bg-[#1f8f62] hover:bg-[#187852]"
                : "bg-[#7254b5] hover:bg-[#60459d]"
            }`}
          >
            <Pencil className="h-4 w-4" />
            แก้ไขสิทธิ์
          </button>
        </header>

        {savedMessage && (
          <div className="mt-5 flex items-center gap-3 rounded-[13px] border border-[#58b88e]/20 bg-[#eef9f3] px-4 py-3 text-[10px] text-[#25734d]">
            <CheckCircle2 className="h-4 w-4" />
            {savedMessage}
          </div>
        )}

        <div className="mt-7 grid gap-5 xl:grid-cols-[350px_1fr]">
          <aside className="space-y-5">
            <article className="rounded-[20px] border border-[#dfe5eb] bg-white p-5 shadow-[0_12px_38px_rgba(26,38,57,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#2d394c]">
                    บทบาทที่จัดการได้
                  </h2>
                  <p className="mt-1 text-[8px] text-[#929ca9]">
                    เลือกเพื่อดูและกำหนดสิทธิ์
                  </p>
                </div>

                <span className="rounded-full bg-[#eef2f5] px-2.5 py-1 text-[8px] font-medium text-[#697586]">
                  2 บทบาท
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {(Object.keys(roleInfo) as RoleKey[]).map((role) => {
                  const item = roleInfo[role];
                  const Icon = item.icon;
                  const active = selectedRole === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role);
                        setSavedMessage("");
                      }}
                      className={`flex w-full items-center gap-3 rounded-[15px] border p-4 text-left transition ${
                        active
                          ? item.activeCard
                          : "border-[#e3e7ec] bg-[#fbfcfd] hover:border-[#cfd6df] hover:bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${item.iconStyle}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold text-[#344154]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-[8px] text-[#8e99a6]">
                          {item.thaiTitle}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span className="block text-[9px] font-semibold text-[#556173]">
                          {item.userCount} คน
                        </span>
                        <ChevronRight
                          className={`ml-auto mt-1 h-3.5 w-3.5 ${
                            active ? "text-[#4d8a70]" : "text-[#a6afba]"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[20px] border border-[#dfe5eb] bg-white p-5 shadow-[0_12px_38px_rgba(26,38,57,0.04)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#edf2ff] text-[#5874b8]">
                  <Info className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>

                <div>
                  <h3 className="text-[11px] font-semibold text-[#344154]">
                    ขอบเขตการจัดการ
                  </h3>
                  <p className="mt-1 text-[8px] text-[#929ca9]">
                    กำหนดโดย Company Admin
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-[8px] leading-5 text-[#707c8b]">
                <p className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2c9b69]" />
                  Manager มีสิทธิ์ตรวจสอบและอนุมัติข้อมูลในโรงงานที่ได้รับมอบหมาย
                </p>
                <p className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7356b7]" />
                  Operator บันทึกข้อมูลหน้างานและดูประวัติของตนเอง
                </p>
                <p className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e0a12e]" />
                  การเปลี่ยนแปลงหน้านี้เป็น Frontend preview จนกว่า ER จะได้รับอนุมัติ
                </p>
              </div>
            </article>
          </aside>

          <div className="space-y-5">
            <article className="rounded-[20px] border border-[#dfe5eb] bg-white p-5 shadow-[0_12px_38px_rgba(26,38,57,0.04)] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-[15px] ${roleInfo[selectedRole].iconStyle}`}
                  >
                    {selectedRole === "MANAGER" ? (
                      <UserCog className="h-5 w-5" strokeWidth={1.8} />
                    ) : (
                      <Users className="h-5 w-5" strokeWidth={1.8} />
                    )}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#29364a]">
                        {roleInfo[selectedRole].title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-medium ${roleInfo[selectedRole].badge}`}
                      >
                        {roleInfo[selectedRole].thaiTitle}
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-[680px] text-[9px] leading-5 text-[#8792a0]">
                      {roleInfo[selectedRole].description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[13px] border border-[#e2e7ec] bg-[#fafbfc] px-4 py-3 text-center">
                    <p className="text-[18px] font-semibold text-[#273449]">
                      {roleInfo[selectedRole].userCount}
                    </p>
                    <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-[#929ca9]">
                      ผู้ใช้งาน
                    </p>
                  </div>

                  <div className="rounded-[13px] border border-[#e2e7ec] bg-[#fafbfc] px-4 py-3 text-center">
                    <p className="text-[18px] font-semibold text-[#273449]">
                      {allowedPermissionCount}
                    </p>
                    <p className="mt-1 text-[7px] uppercase tracking-[0.1em] text-[#929ca9]">
                      สิทธิ์ที่เปิด
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[20px] border border-[#dfe5eb] bg-white p-5 shadow-[0_12px_38px_rgba(26,38,57,0.04)] sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#2d394c]">
                    ตารางสิทธิ์การเข้าถึง
                  </h2>
                  <p className="mt-1 text-[8px] text-[#929ca9]">
                    สิทธิ์ของแต่ละโมดูลสำหรับ {roleInfo[selectedRole].title}
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f4f6f8] px-3 py-1.5 text-[8px] text-[#748091]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Frontend Preview
                </div>
              </div>

              <PermissionMatrix role={selectedRole} items={selectedItems} />
            </article>

            <div className="flex items-start gap-3 rounded-[15px] border border-[#f0dcae] bg-[#fff9ec] px-4 py-4">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#b27a19]"
                strokeWidth={1.8}
              />
              <p className="text-[8px] leading-5 text-[#7e6a41]">
                สิทธิ์ในหน้านี้เป็นข้อมูลจำลองสำหรับออกแบบ Frontend
                หลังอาจารย์ตรวจ ER แล้วจึงเชื่อม Role และ Permission
                เข้ากับฐานข้อมูลจริง
              </p>
            </div>
          </div>
        </div>
      </section>

      <EditPermissionDrawer
        open={drawerOpen}
        role={selectedRole}
        items={draftPermissions}
        onClose={() => setDrawerOpen(false)}
        onChange={updateDraftPermission}
        onSave={savePermissions}
      />
    </>
  );
}