"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/account/field";
import { FormSection, FormSheet } from "@/components/platform/form-sheet";
import { SelectField } from "@/components/platform/select-field";
import { TempPasswordInput } from "@/components/platform/temp-password";
import { useAction } from "@/hooks/use-action";
import { ROLES, ROLE_LABEL, type Role } from "@/server/auth/roles";
import { createUser, updateUser } from "@/server/actions/platform/users";

export type UserOptions = {
  companies: { id: number; name: string; status: string }[];
  factories: { id: number; name: string; companyId: number }[];
  departments: { id: number; name: string; factoryId: number }[];
};
export type EditableUser = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string | null;
  employeeCode: string | null;
  role: Role;
  companyId: number | null;
  factoryId: number | null;
  departmentId: number | null;
};

const NONE = "__none";

export function UserFormSheet({ open, onOpenChange, options, user }: { open: boolean; onOpenChange: (o: boolean) => void; options: UserOptions; user?: EditableUser }) {
  const editing = !!user;
  const create = useAction(createUser, { success: "เพิ่มผู้ใช้งานแล้ว" });
  const update = useAction(updateUser, { success: "บันทึกข้อมูลผู้ใช้แล้ว" });
  const { pending, errors } = editing ? update : create;

  const [role, setRole] = useState<Role>(user?.role ?? "OPERATOR");
  const [companyId, setCompanyId] = useState(user?.companyId ? String(user.companyId) : "");
  const [factoryId, setFactoryId] = useState(user?.factoryId ? String(user.factoryId) : NONE);
  const [departmentId, setDepartmentId] = useState(user?.departmentId ? String(user.departmentId) : NONE);
  const platform = role === "PLATFORM_ADMIN";
  const factories = options.factories.filter((f) => String(f.companyId) === companyId);
  const departments = options.departments.filter((d) => String(d.factoryId) === factoryId);
  const needsFactory = role === "MANAGER" || role === "OPERATOR";

  const text = (id: keyof EditableUser | "password" | "confirm", label: string, o: { required?: boolean; type?: string; hint?: string; mono?: boolean } = {}) => (
    <Field id={`u-${id}`} label={label} required={o.required} error={errors[id]} hint={o.hint}>
      <Input
        id={`u-${id}`}
        name={id}
        type={o.type ?? "text"}
        defaultValue={user && id in user ? String(user[id as keyof EditableUser] ?? "") : ""}
        required={o.required}
        aria-invalid={!!errors[id]}
        className={o.mono ? "h-10 font-mono" : "h-10"}
      />
    </Field>
  );

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      wide
      title={editing ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
      description={editing ? "เปลี่ยนสถานะหรือรหัสผ่านได้จากเมนูของแถวนั้น" : "ผู้ดูแลแพลตฟอร์มไม่สังกัดบริษัท บทบาทอื่นต้องเลือกบริษัท ผู้จัดการและผู้ปฏิบัติงานต้องเลือกโรงงาน"}
      pending={pending}
      onSubmit={async (fd) => {
        fd.set("role", role);
        fd.set("companyId", platform ? "" : companyId);
        fd.set("factoryId", platform || factoryId === NONE ? "" : factoryId);
        fd.set("departmentId", platform || departmentId === NONE ? "" : departmentId);
        if (user) fd.set("userId", String(user.userId));
        const r = await (editing ? update.run(fd) : create.run(fd));
        if (r.ok) onOpenChange(false);
      }}
    >
      <FormSection title="ข้อมูลบุคคล">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("firstName", "ชื่อ", { required: true })}
          {text("lastName", "นามสกุล", { required: true })}
          {text("email", "อีเมล", { required: true, type: "email" })}
          {text("username", "ชื่อผู้ใช้", { required: true, mono: true })}
          {text("phone", "โทรศัพท์", { type: "tel" })}
          {text("employeeCode", "รหัสพนักงาน", { mono: true })}
        </div>
      </FormSection>
      <FormSection title="บทบาทและสังกัด">
        <Field id="u-role" label="บทบาท" required error={errors.role}>
          <SelectField id="u-role" name="_role" value={role} onValueChange={(v) => setRole(v as Role)} options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
        </Field>
        {!platform && (
          <>
            <Field id="u-company" label="บริษัท" required error={errors.companyId}>
              <SelectField
                id="u-company"
                name="_company"
                value={companyId}
                onValueChange={(v) => {
                  setCompanyId(v);
                  setFactoryId(NONE);
                  setDepartmentId(NONE);
                }}
                placeholder="เลือกบริษัท"
                options={options.companies.map((c) => ({ value: String(c.id), label: c.status === "ACTIVE" ? c.name : `${c.name} (ไม่ได้ใช้งาน)` }))}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="u-factory" label="โรงงาน" required={needsFactory} error={errors.factoryId} hint={needsFactory ? undefined : "เว้นว่าง = ดูได้ทุกโรงงานของบริษัท"}>
                <SelectField
                  id="u-factory"
                  name="_factory"
                  value={factoryId}
                  disabled={!companyId}
                  onValueChange={(v) => {
                    setFactoryId(v);
                    setDepartmentId(NONE);
                  }}
                  options={[{ value: NONE, label: "ไม่ระบุ" }, ...factories.map((f) => ({ value: String(f.id), label: f.name }))]}
                />
              </Field>
              <Field id="u-dept" label="แผนก" error={errors.departmentId}>
                <SelectField
                  id="u-dept"
                  name="_dept"
                  value={departmentId}
                  disabled={factoryId === NONE}
                  onValueChange={setDepartmentId}
                  options={[{ value: NONE, label: "ไม่ระบุ" }, ...departments.map((d) => ({ value: String(d.id), label: d.name }))]}
                />
              </Field>
            </div>
          </>
        )}
      </FormSection>
      {!editing && (
        <FormSection title="เข้าสู่ระบบ">
          <Field id="u-status" label="สถานะ" error={errors.status}>
            <SelectField id="u-status" name="status" defaultValue="ACTIVE" options={[{ value: "ACTIVE", label: "ใช้งานอยู่" }, { value: "INACTIVE", label: "ปิดใช้งาน" }]} />
          </Field>
          <PasswordPair errors={errors} />
        </FormSection>
      )}
    </FormSheet>
  );
}

function PasswordPair({ errors }: { errors: Record<string, string> }) {
  const [confirm, setConfirm] = useState("");
  return (
    <>
      <Field id="u-password" label="รหัสผ่านชั่วคราว" required error={errors.password} hint="อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข กด “สุ่ม” เพื่อสร้างให้">
        <TempPasswordInput id="u-password" name="password" onGenerate={setConfirm} invalid={!!errors.password} />
      </Field>
      <Field id="u-confirm" label="ยืนยันรหัสผ่าน" required error={errors.confirm}>
        <Input id="u-confirm" name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="h-10 font-mono" required />
      </Field>
    </>
  );
}
