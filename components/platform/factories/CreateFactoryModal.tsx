"use client";

import { LoaderCircle, MapPinned, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import type { CompanyOption, NewFactory } from "./types";

const emptyForm: NewFactory = {
  companyId: 0,
  code: "",
  name: "",
  address: "",
  province: "",
  postalCode: "",
  country: "Thailand",
  latitude: "",
  longitude: "",
  googleMapUrl: "",
  phone: "",
  email: "",
  timezone: "Asia/Bangkok",
};

export default function CreateFactoryModal({
  open,
  companies,
  submitting,
  onClose,
  onCreate,
}: {
  open: boolean;
  companies: CompanyOption[];
  submitting: boolean;
  onClose: () => void;
  onCreate: (form: NewFactory) => Promise<void>;
}) {
  const [form, setForm] = useState<NewFactory>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.companyId || !form.code.trim() || !form.name.trim()) {
      setError("กรุณาเลือกบริษัทและกรอกรหัสกับชื่อโรงงาน");
      return;
    }

    setError("");

    try {
      await onCreate({
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถเพิ่มโรงงานได้",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-[#18221d]/45 px-4 backdrop-blur-[4px]">
      <section className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] bg-white shadow-[0_45px_140px_rgba(25,42,33,0.3)]">
        <div className="flex items-start justify-between border-b border-[#e8ece9] px-7 py-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4c8d74]">
              Primary factory
            </p>
            <h2 className="mt-2 text-[23px] font-bold tracking-[-0.04em]">
              เพิ่มโรงงานหลัก
            </h2>
            <p className="mt-2 text-[11px] text-[#7d8882]">
              ช่วงเดโมกำหนดให้หนึ่งบริษัทมีหนึ่งโรงงานหลักก่อน
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-9 w-9 place-items-center rounded-full border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-[11px] font-semibold">บริษัท</span>
              <select
                value={form.companyId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyId: Number(event.target.value),
                  }))
                }
                className="mt-2 h-12 w-full rounded-[13px] border bg-[#fbfcfb] px-4 text-[12px]"
              >
                <option value={0}>เลือกบริษัทที่ยังไม่มีโรงงาน</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </option>
                ))}
              </select>
            </label>

            {[
              ["code", "รหัสโรงงาน", "เช่น NEX-KORAT"],
              ["name", "ชื่อโรงงาน", "เช่น Nextron Korat Plant"],
              ["province", "จังหวัด", "นครราชสีมา"],
              ["postalCode", "รหัสไปรษณีย์", "30000"],
              ["phone", "โทรศัพท์", "044-xxx-xxxx"],
              ["email", "อีเมลโรงงาน", "factory@example.com"],
              ["latitude", "Latitude", "14.9799"],
              ["longitude", "Longitude", "102.0977"],
            ].map(([key, label, placeholder]) => (
              <label key={key}>
                <span className="text-[11px] font-semibold">{label}</span>
                <input
                  value={String(form[key as keyof NewFactory])}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]:
                        key === "code"
                          ? event.target.value.toUpperCase()
                          : event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="mt-2 h-12 w-full rounded-[13px] border bg-[#fbfcfb] px-4 text-[12px] outline-none focus:border-[#168662]/45"
                />
              </label>
            ))}

            <label className="sm:col-span-2">
              <span className="text-[11px] font-semibold">ที่อยู่</span>
              <textarea
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                rows={3}
                className="mt-2 w-full rounded-[13px] border bg-[#fbfcfb] px-4 py-3 text-[12px] outline-none focus:border-[#168662]/45"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-[11px] font-semibold">
                Google Maps URL
              </span>
              <div className="relative mt-2">
                <MapPinned className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8984]" />
                <input
                  value={form.googleMapUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      googleMapUrl: event.target.value,
                    }))
                  }
                  placeholder="https://maps.google.com/..."
                  className="h-12 w-full rounded-[13px] border bg-[#fbfcfb] pl-11 pr-4 text-[12px]"
                />
              </div>
            </label>
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-[#fff5f6] px-4 py-3 text-[11px] text-[#b83b4b]">
              {error}
            </p>
          )}

          <div className="mt-7 flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 rounded-xl border px-5 text-[12px]"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0e7b5b] px-5 text-[12px] font-semibold text-white disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              สร้างโรงงาน
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
