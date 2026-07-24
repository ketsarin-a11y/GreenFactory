"use client";

import { CheckCircle2, Mail, Send, X } from "lucide-react";
import { useState } from "react";
import type { SupportFormData } from "./types";

const initialForm: SupportFormData = {
  subject: "",
  category: "general",
  description: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SupportPanel({ open, onClose }: Props) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof SupportFormData, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function submit() {
    if (!form.subject || !form.description) return;
    setSubmitted(true);
  }

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="ปิดหน้าต่างติดต่อทีมสนับสนุน"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[#102218]/30 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] overflow-y-auto border-l border-[#dfe8e2] bg-white p-6 shadow-[-20px_0_50px_rgba(28,64,42,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#eaf8ef] text-[#188250]">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-[21px] font-extrabold text-[#26362d]">
              ติดต่อทีมสนับสนุน
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-[#819087]">
              ส่งรายละเอียดปัญหาเพื่อให้ทีมงานตรวจสอบ
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-[#78867e] hover:bg-[#f2f6f3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 space-y-4">
          <label>
            <span className="mb-2 block text-[12px] font-bold text-[#425249]">
              หมวดหมู่
            </span>
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
              className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 text-[13px] font-semibold text-[#33453a] outline-none focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
            >
              <option value="general">คำถามทั่วไป</option>
              <option value="account">บัญชีผู้ใช้</option>
              <option value="report">รายงาน</option>
              <option value="sensor">เซนเซอร์</option>
              <option value="system">ปัญหาระบบ</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[12px] font-bold text-[#425249]">
              หัวข้อ
            </span>
            <input
              value={form.subject}
              onChange={(event) => update("subject", event.target.value)}
              placeholder="ระบุหัวข้อปัญหา"
              className="h-11 w-full rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 text-[13px] font-semibold text-[#33453a] outline-none placeholder:text-[#a0aba4] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[12px] font-bold text-[#425249]">
              รายละเอียด
            </span>
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="อธิบายปัญหาและขั้นตอนที่ทำให้เกิดปัญหา"
              className="min-h-[180px] w-full resize-y rounded-[14px] border border-[#dce6df] bg-[#f9fbfa] px-3.5 py-3 text-[13px] font-medium text-[#33453a] outline-none placeholder:text-[#a0aba4] focus:border-[#8fc9a8] focus:ring-4 focus:ring-[#dff4e7]"
            />
          </label>

          <button
            type="button"
            onClick={submit}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#167c4d] px-5 text-[13px] font-bold text-white shadow-[0_10px_24px_rgba(22,124,77,0.18)] hover:bg-[#126b42]"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                ส่งคำขอเรียบร้อย
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                ส่งคำขอ
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
