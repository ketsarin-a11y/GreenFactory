"use client";

import { Eye, EyeOff, LoaderCircle, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { CreateUserOptions, NewUserForm } from "./types";

type Props = {
  open: boolean;
  options: CreateUserOptions;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onCreate: (form: NewUserForm) => void;
};

const EMPTY_FORM: NewUserForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  employeeCode: "",
  password: "",
  confirmPassword: "",
  roleCode: "",
  companyId: "",
  factoryId: "",
  departmentId: "",
  status: "ACTIVE",
};

export default function CreateUserModal({
  open,
  options,
  submitting,
  error,
  onClose,
  onCreate,
}: Props) {
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setLocalError("");
      setShowPassword(false);
    }
  }, [open]);

  const factories = useMemo(
    () =>
      options.factories.filter(
        (factory) => String(factory.companyId) === form.companyId,
      ),
    [form.companyId, options.factories],
  );

  const departments = useMemo(
    () =>
      options.departments.filter(
        (department) => String(department.factoryId) === form.factoryId,
      ),
    [form.factoryId, options.departments],
  );

  if (!open) return null;

  const isPlatformAdmin = form.roleCode === "PLATFORM_ADMIN";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.roleCode ||
      !form.password
    ) {
      setLocalError("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!isPlatformAdmin && !form.companyId) {
      setLocalError("กรุณาเลือกบริษัทของผู้ใช้งาน");
      return;
    }

    onCreate(form);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14231d]/45 p-4 backdrop-blur-[3px]">
      <div className="max-h-[92vh] w-full max-w-[900px] overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(21,40,32,0.24)]">
        <div className="flex items-start justify-between border-b border-[#e8ece9] px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#24302a]">เพิ่มผู้ใช้งานใหม่</h2>
            <p className="mt-1 text-[10px] text-[#8a9490]">สร้างบัญชีและกำหนดบริษัท โรงงาน แผนก และบทบาทจริง</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="grid h-9 w-9 place-items-center rounded-xl border border-[#e1e6e3] text-[#6e7973]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="max-h-[calc(92vh-82px)] overflow-y-auto">
          <div className="space-y-6 p-6">
            {(localError || error) && (
              <div className="rounded-[14px] border border-[#f0d6da] bg-[#fff5f6] px-4 py-3 text-[11px] font-medium text-[#a84452]">
                {localError || error}
              </div>
            )}

            <section>
              <h3 className="mb-3 text-[11px] font-bold text-[#35423c]">ข้อมูลบัญชี</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="ชื่อ *" value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                <Input label="นามสกุล *" value={form.lastName} onChange={(value) => setForm((current) => ({ ...current, lastName: value }))} />
                <Input label="Username *" value={form.username} onChange={(value) => setForm((current) => ({ ...current, username: value }))} />
                <Input label="อีเมล *" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
                <Input label="โทรศัพท์" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                <Input label="รหัสพนักงาน" value={form.employeeCode} onChange={(value) => setForm((current) => ({ ...current, employeeCode: value }))} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-bold text-[#35423c]">บทบาทและสังกัด</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="บทบาท *"
                  value={form.roleCode}
                  placeholder="เลือกบทบาท"
                  options={options.roles.map((role) => ({ value: role.code, label: role.name }))}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      roleCode: value as NewUserForm["roleCode"],
                      ...(value === "PLATFORM_ADMIN"
                        ? { companyId: "", factoryId: "", departmentId: "" }
                        : {}),
                    }))
                  }
                />

                <Select
                  label="สถานะเริ่มต้น"
                  value={form.status}
                  options={[
                    { value: "ACTIVE", label: "เปิดใช้งาน" },
                    { value: "INACTIVE", label: "ไม่ใช้งาน" },
                    { value: "LOCKED", label: "ล็อกบัญชี" },
                  ]}
                  onChange={(value) => setForm((current) => ({ ...current, status: value as NewUserForm["status"] }))}
                />

                <Select
                  label={isPlatformAdmin ? "บริษัท (ไม่จำเป็น)" : "บริษัท *"}
                  value={form.companyId}
                  disabled={isPlatformAdmin}
                  placeholder="เลือกบริษัท"
                  options={options.companies.map((company) => ({ value: String(company.id), label: `${company.code} — ${company.name}` }))}
                  onChange={(value) => setForm((current) => ({ ...current, companyId: value, factoryId: "", departmentId: "" }))}
                />

                <Select
                  label="โรงงาน"
                  value={form.factoryId}
                  disabled={isPlatformAdmin || !form.companyId}
                  placeholder="เลือกโรงงาน"
                  options={factories.map((factory) => ({ value: String(factory.id), label: `${factory.code} — ${factory.name}` }))}
                  onChange={(value) => setForm((current) => ({ ...current, factoryId: value, departmentId: "" }))}
                />

                <Select
                  label="แผนก"
                  value={form.departmentId}
                  disabled={isPlatformAdmin || !form.factoryId}
                  placeholder="เลือกแผนก"
                  options={departments.map((department) => ({ value: String(department.id), label: `${department.code} — ${department.name}` }))}
                  onChange={(value) => setForm((current) => ({ ...current, departmentId: value }))}
                />
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-bold text-[#35423c]">รหัสผ่านเริ่มต้น</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Password label="รหัสผ่าน *" value={form.password} visible={showPassword} onToggle={() => setShowPassword((current) => !current)} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
                <Password label="ยืนยันรหัสผ่าน *" value={form.confirmPassword} visible={showPassword} onToggle={() => setShowPassword((current) => !current)} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} />
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e8ece9] bg-[#fafbfa] px-6 py-4">
            <button type="button" onClick={onClose} disabled={submitting} className="h-10 rounded-xl border border-[#dfe4e1] bg-white px-5 text-[11px] font-semibold text-[#66726c]">ยกเลิก</button>
            <button type="submit" disabled={submitting} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0e7b5b] px-5 text-[11px] font-semibold text-white disabled:opacity-60">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {submitting ? "กำลังบันทึก" : "เพิ่มผู้ใช้งาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold text-[#65716b]">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-[12px] border border-[#dfe5e1] px-3 text-[11px] outline-none focus:border-[#72b39c] focus:ring-4 focus:ring-[#eaf7f2]" />
    </label>
  );
}

function Select({ label, value, options, placeholder, disabled = false, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; placeholder?: string; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold text-[#65716b]">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-[12px] border border-[#dfe5e1] bg-white px-3 text-[11px] outline-none disabled:bg-[#f3f5f4]">
        <option value="">{placeholder ?? "เลือกข้อมูล"}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Password({ label, value, visible, onToggle, onChange }: { label: string; value: string; visible: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold text-[#65716b]">{label}</span>
      <div className="relative">
        <input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-[12px] border border-[#dfe5e1] px-3 pr-11 text-[11px] outline-none" />
        <button type="button" onClick={onToggle} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#7c8781]">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
