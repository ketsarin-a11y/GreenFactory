"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileText,
  History,
  LifeBuoy,
  Loader2,
  Mail,
  MessageSquareText,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

type Category = "ALL" | "QR" | "RECORD" | "ACCOUNT" | "HISTORY";

const FAQS = [
  {
    category: "QR" as Category,
    question: "สแกน QR Code แล้วไม่พบเครื่องจักรต้องทำอย่างไร?",
    answer:
      "ตรวจสอบว่า QR Code ยังอยู่ในสถานะใช้งานและเป็น QR ของเครื่องจักรหรือจุดตรวจในบริษัทเดียวกับบัญชีของคุณ หากยังไม่พบ ให้แจ้งผู้ดูแลระบบพร้อมรหัส QR หรือรูปภาพของ QR Code",
  },
  {
    category: "RECORD" as Category,
    question: "บันทึกข้อมูลแล้วแก้ไขภายหลังได้หรือไม่?",
    answer:
      "รายการที่บันทึกแล้วจะปรากฏในหน้าประวัติการบันทึก หากข้อมูลผิด ควรแจ้งผู้ดูแลหรือดำเนินการตามสิทธิ์ที่ระบบกำหนด เพื่อให้ยังคงตรวจสอบย้อนหลังได้",
  },
  {
    category: "RECORD" as Category,
    question: "แนบหลักฐานชนิดใดได้บ้าง?",
    answer:
      "รองรับ JPG, PNG และ PDF ขนาดไม่เกิน 10MB ต่อไฟล์ เพื่อใช้เป็นหลักฐานประกอบรายการบันทึก",
  },
  {
    category: "HISTORY" as Category,
    question: "ค้นหารายการเก่าอย่างไร?",
    answer:
      "ไปที่ประวัติการบันทึก แล้วกรองตามช่วงวันที่ ประเภททรัพยากร สายการผลิต แผนก หน่วยวัด ผู้บันทึก หรือค้นหาจากชื่อเครื่องจักรและ Reference",
  },
  {
    category: "ACCOUNT" as Category,
    question: "รูปโปรไฟล์หรือชื่อไม่อัปเดตทำอย่างไร?",
    answer:
      "ตรวจสอบว่าบันทึกข้อมูลสำเร็จแล้ว จากนั้นรีเฟรชหน้า หากข้อมูลยังไม่เปลี่ยนให้แจ้งผู้ดูแลระบบพร้อมภาพหน้าจอ",
  },
];

const CATEGORY_LABEL: Record<Category, string> = {
  ALL: "ทั้งหมด",
  QR: "QR Code",
  RECORD: "การบันทึก",
  ACCOUNT: "บัญชี",
  HISTORY: "ประวัติ",
};

const GUIDES = [
  {
    title: "บันทึกข้อมูลด้วย QR Code",
    icon: QrCode,
    steps: [
      "เปิดเมนู สแกน QR Code",
      "สแกน QR ที่เครื่องจักรหรือจุดตรวจ",
      "ตรวจสอบชื่อเครื่องจักรและตำแหน่ง",
      "กดบันทึกการใช้ทรัพยากร",
      "กรอกข้อมูล ตรวจสอบ และยืนยัน",
    ],
  },
  {
    title: "บันทึกข้อมูลแบบเลือกเครื่อง",
    icon: FileText,
    steps: [
      "เปิดเมนู บันทึกข้อมูล",
      "ค้นหาและเลือกเครื่องจักร",
      "เลือกประเภททรัพยากร",
      "กรอกปริมาณ วันที่ เวลา และหลักฐาน",
      "ตรวจสอบข้อมูลก่อนยืนยัน",
    ],
  },
  {
    title: "ตรวจสอบประวัติ",
    icon: History,
    steps: [
      "เปิดเมนู ประวัติการบันทึก",
      "เลือกช่วงวันที่หรือเงื่อนไขที่ต้องการ",
      "ค้นหาด้วยชื่อเครื่อง รหัส หรือ Reference",
      "เปิดดูรายละเอียดและหลักฐานของรายการ",
    ],
  },
];

export default function HelpCenterPage() {
  const [category, setCategory] = useState<Category>("ALL");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showReport, setShowReport] = useState(false);

  const filteredFaqs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return FAQS.filter((faq) => {
      const categoryMatch = category === "ALL" || faq.category === category;
      const searchMatch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term);

      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-[22px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[26px] font-black tracking-[-0.025em] text-slate-950">
              ศูนย์ช่วยเหลือ
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <MessageSquareText className="h-4 w-4" />
            แจ้งปัญหา
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;

          return (
            <div
              key={guide.title}
              className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-extrabold text-slate-900">{guide.title}</h2>
              </div>

              <ol className="mt-4 space-y-3">
                {guide.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700">
                      {index + 1}
                    </span>
                    <span className="leading-5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <CircleHelp className="h-4 w-4" />
            </span>
            <h2 className="font-extrabold text-slate-900">คำถามที่พบบ่อย</h2>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาคำถาม"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`h-10 rounded-xl px-3.5 text-xs font-bold transition ${
                    category === item
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {CATEGORY_LABEL[item]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFaqs.map((faq) => {
            const originalIndex = FAQS.indexOf(faq);
            const open = openFaq === originalIndex;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : originalIndex)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm font-bold text-slate-800">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open && (
                  <div className="bg-slate-50/70 px-6 py-4 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              ไม่พบคำถามที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold text-slate-900">พบปัญหาที่คู่มือไม่ครอบคลุม?</p>
              <p className="mt-0.5 text-xs text-slate-400">
                ส่งรายละเอียดให้ผู้ดูแลแพลตฟอร์มตรวจสอบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <LifeBuoy className="h-4 w-4" />
            สร้างรายการแจ้งปัญหา
          </button>
        </div>
      </section>

      {showReport && <ReportIssueModal onClose={() => setShowReport(false)} />}
    </div>
  );
}

function ReportIssueModal({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState(
    typeof window !== "undefined" ? window.location.pathname : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successRef, setSuccessRef] = useState("");

  async function submitIssue() {
    if (!subject.trim() || !description.trim()) {
      setError("กรุณากรอกหัวข้อและรายละเอียด");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/operator/help/tickets", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          description: description.trim(),
          pageUrl: pageUrl.trim() || null,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "ไม่สามารถส่งรายการได้");
      }

      setSuccessRef(payload.data.ticketReference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ไม่สามารถส่งรายการได้");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button type="button" onClick={onClose} className="absolute inset-0" aria-label="ปิด" />

      <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-950">แจ้งปัญหา</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {successRef ? (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-black text-slate-900">ส่งรายการเรียบร้อยแล้ว</h3>
            <p className="mt-2 text-sm text-slate-500">
              Reference: <span className="font-bold text-slate-700">{successRef}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-10 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white"
            >
              ปิด
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 px-6 py-5">
              <Field label="หัวข้อ">
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value.slice(0, 150))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-sky-400"
                  placeholder="เช่น สแกน QR แล้วไม่พบเครื่องจักร"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ประเภทปัญหา">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="GENERAL">ทั่วไป</option>
                    <option value="QR">QR Code</option>
                    <option value="RECORD">การบันทึกข้อมูล</option>
                    <option value="ACCOUNT">บัญชีผู้ใช้</option>
                    <option value="HISTORY">ประวัติการบันทึก</option>
                    <option value="SYSTEM">ระบบผิดปกติ</option>
                  </select>
                </Field>

                <Field label="ความสำคัญ">
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="LOW">ต่ำ</option>
                    <option value="NORMAL">ปกติ</option>
                    <option value="HIGH">สูง</option>
                    <option value="URGENT">เร่งด่วน</option>
                  </select>
                </Field>
              </div>

              <Field label="หน้าที่พบปัญหา">
                <input
                  value={pageUrl}
                  onChange={(event) => setPageUrl(event.target.value.slice(0, 500))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none focus:border-sky-400"
                />
              </Field>

              <Field label="รายละเอียด">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value.slice(0, 3000))}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-sky-400"
                  placeholder="อธิบายสิ่งที่เกิดขึ้น ขั้นตอนก่อนเกิดปัญหา และข้อความผิดพลาดถ้ามี"
                />
              </Field>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitIssue}
                disabled={isSubmitting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังส่ง
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    ส่งรายการ
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
