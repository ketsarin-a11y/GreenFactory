"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import type { NewCompany } from "./types";

const EMPTY_FORM: NewCompany = {
  name: "",
  email: "",
  code: "",
  industry: "",
  contactName: "",
  phone: "",
  province: "",
};

export default function CreateCompanyModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (company: NewCompany) => void;
}) {
  const [form, setForm] = useState<NewCompany>(EMPTY_FORM);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(form);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-slate-950/35 p-4">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="ปิด" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-[580px] overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              New company
            </p>
            <h2 className="mt-1 text-[18px] font-bold text-slate-950">เพิ่มบริษัทใหม่</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {[
            ["name", "ชื่อบริษัท", "บริษัท ตัวอย่าง จำกัด", "text"],
            ["code", "รหัสบริษัท", "CMP009", "text"],
            ["email", "อีเมล", "admin@company.com", "email"],
            ["industry", "อุตสาหกรรม", "อุตสาหกรรมการผลิต", "text"],
            ["contactName", "ผู้ดูแลหลัก", "ชื่อผู้ดูแล", "text"],
            ["phone", "โทรศัพท์", "02-000-0000", "text"],
            ["province", "จังหวัด", "นครราชสีมา", "text"],
          ].map(([key, label, placeholder, type], index) => (
            <label key={key} className={index === 0 || index === 3 ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-[10px] font-semibold text-slate-600">
                {label}
              </span>
              <input
                required
                type={type}
                value={form[key as keyof NewCompany]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[12px] text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-[11px] font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            เพิ่มบริษัท
          </button>
        </div>
      </form>
    </div>
  );
}
