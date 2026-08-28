"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquareText,
  Send,
} from "lucide-react";
import { FormEvent, useState } from "react";

const topics = [
  "สนใจแพลตฟอร์ม",
  "สอบถามการใช้งาน",
  "ความร่วมมือทางวิชาการ",
  "ข้อเสนอแนะ",
  "อื่น ๆ",
];

const faqs = [
  {
    question: "สามารถพูดคุยเกี่ยวกับความต้องการขององค์กรก่อนได้หรือไม่",
    answer:
      "ได้ คุณสามารถส่งรายละเอียดเบื้องต้นเกี่ยวกับองค์กร ปัญหาที่พบ และข้อมูลที่ต้องการบริหารผ่านแบบฟอร์มนี้ได้",
  },
  {
    question: "แพลตฟอร์มรองรับหลายองค์กรหรือหลายหน่วยงานหรือไม่",
    answer:
      "รองรับ โดยระบบสามารถแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรได้อย่างเป็นระบบ",
  },
  {
    question: "ต้องเตรียมข้อมูลอะไรบ้างก่อนติดต่อ",
    answer:
      "ระบุประเภทองค์กร เป้าหมายที่ต้องการ และข้อมูลที่มีอยู่ เช่น พลังงาน คาร์บอน น้ำ ของเสีย หรือข้อมูลจากเครื่องจักร",
  },
];

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Suranaree+University+of+Technology";

export default function ContactExperience() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-[#f7f9f7] text-[#1b2a20]">
      {/* Header */}
      <section className="border-b border-[#dfe8e1] px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4e785b]">
            ติดต่อเรา
          </p>

          <h1 className="mt-3 max-w-[720px] text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-[#173323]">
            พูดคุยเกี่ยวกับความต้องการขององค์กร
          </h1>

          <p className="mt-4 max-w-[650px] text-[13px] leading-7 text-[#6b7a70] sm:text-[14px]">
            ส่งรายละเอียดเกี่ยวกับเป้าหมาย ปัญหา หรือข้อมูลที่องค์กรต้องการบริหาร
            เพื่อให้เรานำไปวางแนวทางการพัฒนาร่วมกัน
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-7 lg:grid-cols-[0.72fr_1.28fr]">
          {/* Contact information */}
          <aside className="rounded-2xl border border-[#dbe6de] bg-[#173426] p-6 text-white sm:p-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a6d9b3]">
                ข้อมูลติดต่อ
              </p>

              <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] sm:text-[28px]">
                ติดต่อ GreenFactory Insight
              </h2>

              <p className="mt-3 text-[13px] leading-7 text-white/60">
                สำหรับสอบถามข้อมูลระบบ ความร่วมมือ หรือข้อเสนอแนะเกี่ยวกับโครงการ
              </p>
            </div>

            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-3 py-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#a9deb5] transition group-hover:bg-white group-hover:text-[#173426]">
                  <Mail className="h-4 w-4" strokeWidth={1.7} />
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40">
                    Email
                  </p>
                  <p className="mt-1.5 break-all text-[13px] text-white/85">
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 py-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#a9deb5] transition group-hover:bg-white group-hover:text-[#173426]">
                  <MapPin className="h-4 w-4" strokeWidth={1.7} />
                </span>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] uppercase tracking-[0.13em] text-white/40">
                      สถานที่พัฒนาโครงการ
                    </p>
                    <ExternalLink className="h-3 w-3 text-white/35" />
                  </div>

                  <p className="mt-1.5 text-[13px] leading-6 text-white/85">
                    มหาวิทยาลัยเทคโนโลยีสุรนารี
                    <span className="block text-white/50">
                      นครราชสีมา ประเทศไทย
                    </span>
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#a9deb5]">
                  <MessageSquareText className="h-4 w-4" strokeWidth={1.7} />
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.13em] text-white/40">
                    การติดต่อกลับ
                  </p>
                  <p className="mt-1.5 text-[13px] leading-6 text-white/85">
                    ติดต่อกลับผ่านอีเมล
                    <span className="block text-white/50">
                      หลังได้รับรายละเอียดจากคุณ
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="rounded-2xl border border-[#dbe6de] bg-white p-6 shadow-[0_18px_50px_rgba(32,74,45,0.06)] sm:p-8 lg:p-10">
            {submitted ? (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f3e9] text-[#248050]">
                  <CheckCircle2 className="h-6 w-6" strokeWidth={1.7} />
                </span>

                <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.03em]">
                  ได้รับข้อความแล้ว
                </h2>

                <p className="mt-3 max-w-[460px] text-[13px] leading-7 text-[#718078]">
                  ขณะนี้เป็นแบบฟอร์มตัวอย่าง เมื่อต่อระบบหลังบ้านแล้ว
                  ข้อมูลจะถูกส่งและจัดเก็บจริง
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-7 rounded-lg bg-[#1d7d4b] px-5 py-3 text-[12px] font-medium text-white transition hover:bg-[#176a3f]"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-[#e3ebe5] pb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4d7b5c]">
                    แบบฟอร์มติดต่อ
                  </p>

                  <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#1b2a20] sm:text-[30px]">
                    ส่งรายละเอียดให้เรา
                  </h2>

                  <p className="mt-2 text-[13px] leading-6 text-[#77847b]">
                    กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้สามารถติดต่อกลับได้สะดวก
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8">
                  <div className="grid gap-x-7 gap-y-7 md:grid-cols-2">
                    <Field label="ชื่อ - นามสกุล" required>
                      <input
                        required
                        name="name"
                        autoComplete="name"
                        placeholder="ชื่อของคุณ"
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
                      />
                    </Field>

                    <Field label="อีเมล" required>
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
                      />
                    </Field>

                    <Field label="องค์กร / โรงงาน">
                      <input
                        name="organization"
                        placeholder="ชื่อองค์กรของคุณ"
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
                      />
                    </Field>

                    <Field label="หัวข้อที่ต้องการพูดคุย" required>
                      <div className="relative">
                        <select
                          required
                          name="topic"
                          value={selectedTopic}
                          onChange={(event) =>
                            setSelectedTopic(event.target.value)
                          }
                          className="w-full appearance-none rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 pr-10 text-[13px] outline-none transition focus:border-[#238252] focus:bg-white"
                        >
                          {topics.map((topic) => (
                            <option key={topic}>{topic}</option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7b72]" />
                      </div>
                    </Field>
                  </div>

                  <Field label="รายละเอียด" required className="mt-7">
                    <textarea
                      required
                      name="message"
                      rows={6}
                      placeholder="อธิบายเป้าหมาย ปัญหา หรือข้อมูลที่ต้องการบริหาร"
                      className="w-full resize-none rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] leading-7 outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
                    />
                  </Field>

                  <div className="mt-7 flex flex-col gap-4 border-t border-[#e3ebe5] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[480px] text-[10px] leading-5 text-[#8b958f]">
                      ข้อมูลจะใช้เพื่อการติดต่อกลับเกี่ยวกับคำขอของคุณเท่านั้น
                    </p>

                    <button
                      type="submit"
                      className="group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#1c7d4a] px-6 text-[12px] font-medium text-white transition hover:bg-[#176c40]"
                    >
                      ส่งข้อความ
                      <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#dfe8e1] bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-16 xl:px-16">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4d7b5c]">
              คำถามที่พบบ่อย
            </p>

            <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.03em] text-[#1b2a20] sm:text-[30px]">
              ข้อมูลก่อนเริ่มติดต่อ
            </h2>
          </div>

          <div className="divide-y divide-[#dfe8e1] border-y border-[#dfe8e1]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#24362b]">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dbe5de] transition ${
                        isOpen
                          ? "rotate-180 bg-[#1c7d4a] text-white"
                          : "bg-white text-[#42684f]"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="max-w-[720px] pb-5 pr-10 text-[13px] leading-7 text-[#6f7d74]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom contact strip */}
      <section className="border-t border-white/10 bg-[#173426] px-5 py-7 text-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-medium">
            ต้องการสอบถามเพิ่มเติมเกี่ยวกับโครงการ
          </p>

          <a
            href="mailto:kesrin9170@gmail.com"
            className="group inline-flex items-center gap-2 text-[12px] text-white/70 transition hover:text-white"
          >
            ส่งอีเมลโดยตรง
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-medium text-[#33483b]">
        {label}
        {required && <span className="ml-1 text-[#2b8555]">*</span>}
      </span>

      <span className="mt-2 block">{children}</span>
    </label>
  );
}
