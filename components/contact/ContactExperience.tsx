"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
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
      "รองรับ โดยสามารถแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรได้อย่างเป็นระบบ",
  },
  {
    question: "ต้องเตรียมข้อมูลอะไรบ้างก่อนติดต่อ",
    answer:
      "เพียงระบุประเภทองค์กร เป้าหมายที่ต้องการ และข้อมูลที่มีอยู่ เช่น พลังงาน คาร์บอน น้ำ ของเสีย หรือข้อมูลจากเครื่องจักร",
  },
];

export default function ContactExperience() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="overflow-x-clip bg-[#f5f7f3] text-[#18231c]">
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-36 sm:px-8 sm:pb-20 sm:pt-40 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute -right-40 -top-36 h-[460px] w-[460px] rounded-full bg-[#8fe0ad]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -left-52 top-48 h-[380px] w-[380px] rounded-full bg-white blur-[120px]" />

        <div className="relative mx-auto max-w-[1380px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4c7759]">
            Contact GreenFactory Insight
          </p>

          <h1 className="mt-5 max-w-[960px] text-[clamp(3rem,6vw,6.4rem)] font-medium leading-[1.01] tracking-[-0.06em]">
            เริ่มต้นบทสนทนา
            <span className="block text-[#4f805f]">
              เพื่อโรงงานที่จัดการข้อมูลได้ดีกว่า
            </span>
          </h1>

          <p className="mt-7 max-w-[650px] text-[14px] leading-8 text-[#69766e] sm:text-[15px]">
            บอกเราเกี่ยวกับเป้าหมาย ปัญหา หรือแนวทางที่องค์กรกำลังมองหา
            แล้วเราจะติดต่อกลับเพื่อพูดคุยรายละเอียดร่วมกัน
          </p>
        </div>
      </section>

      {/* Contact form */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28 xl:px-16">
        <div className="mx-auto grid max-w-[1380px] gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          {/* Contact information */}
          <aside className="rounded-[28px] bg-[#173426] p-7 text-white sm:p-9 lg:sticky lg:top-28 lg:self-start">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9ed7ac]">
              ติดต่อโดยตรง
            </p>

            <h2 className="mt-5 text-[30px] font-medium leading-[1.18] tracking-[-0.04em] sm:text-[36px]">
              พร้อมรับฟัง
              <span className="block text-white/60">และช่วยวางแนวทางร่วมกัน</span>
            </h2>

            <div className="mt-10 divide-y divide-white/10">
              <a
                href="mailto:kesrin9170@gmail.com"
                className="group flex items-start gap-4 py-6 first:pt-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-[#a9deb5] transition group-hover:bg-white group-hover:text-[#173426]">
                  <Mail className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                    Email
                  </p>
                  <p className="mt-2 text-[14px] text-white/88">
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4 py-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-[#a9deb5]">
                  <MapPin className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                    Research & Development
                  </p>
                  <p className="mt-2 text-[14px] leading-7 text-white/88">
                    Suranaree University
                    <span className="block text-white/50">
                      Nakhon Ratchasima, Thailand
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-6 last:pb-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-[#a9deb5]">
                  <MessageSquareText
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.6}
                  />
                </span>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                    Response
                  </p>
                  <p className="mt-2 text-[14px] leading-7 text-white/88">
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
          <div className="rounded-[28px] border border-[#203d2b]/10 bg-white p-7 shadow-[0_28px_80px_rgba(26,59,37,0.08)] sm:p-9 lg:p-12">
            {submitted ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e4f3e8] text-[#248050]">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={1.6} />
                </span>

                <h2 className="mt-7 text-[32px] font-medium tracking-[-0.04em]">
                  ขอบคุณสำหรับข้อความ
                </h2>

                <p className="mt-4 max-w-[480px] text-[13px] leading-7 text-[#718078]">
                  แบบฟอร์มตัวอย่างนี้แสดงหน้าสำเร็จแล้ว
                  เมื่อต่อระบบหลังบ้านจึงจะสามารถส่งข้อมูลจริงได้
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-8 rounded-full bg-[#1d7d4b] px-6 py-3 text-[12px] font-medium text-white"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <>
                <div className="max-w-[720px]">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4d7b5c]">
                    Send a message
                  </p>

                  <h2 className="mt-4 text-[clamp(2rem,3.2vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.045em]">
                    เล่าให้เราฟัง
                    <span className="block text-[#5b8067]">
                      ว่าองค์กรของคุณต้องการอะไร
                    </span>
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="mt-10">
                  <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
                    <Field label="ชื่อ - นามสกุล" required>
                      <input
                        required
                        name="name"
                        autoComplete="name"
                        placeholder="ชื่อของคุณ"
                        className="peer w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
                      />
                    </Field>

                    <Field label="อีเมล" required>
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
                      />
                    </Field>

                    <Field label="องค์กร / โรงงาน">
                      <input
                        name="organization"
                        placeholder="ชื่อองค์กรของคุณ"
                        className="w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
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
                          className="w-full appearance-none border-b border-[#233f2d]/18 bg-transparent py-3 pr-8 text-[14px] outline-none transition focus:border-[#238252]"
                        >
                          {topics.map((topic) => (
                            <option key={topic}>{topic}</option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7b72]" />
                      </div>
                    </Field>
                  </div>

                  <Field label="รายละเอียด" required className="mt-9">
                    <textarea
                      required
                      name="message"
                      rows={5}
                      placeholder="เป้าหมาย ปัญหาที่พบ หรือข้อมูลที่ต้องการบริหาร..."
                      className="w-full resize-none border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] leading-7 outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
                    />
                  </Field>

                  <div className="mt-9 flex flex-col gap-5 border-t border-[#203d2b]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[480px] text-[10px] leading-5 text-[#8b958f]">
                      ข้อมูลที่กรอกจะใช้เพื่อการติดต่อกลับเกี่ยวกับคำขอของคุณเท่านั้น
                    </p>

                    <button
                      type="submit"
                      className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#1c7d4a] px-7 text-[13px] font-medium text-white shadow-[0_14px_30px_rgba(24,122,70,0.20)] transition hover:-translate-y-0.5 hover:bg-[#176c40]"
                    >
                      ส่งข้อความ
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#203d2b]/10 bg-[#edf4ee] px-5 py-20 sm:px-8 lg:px-12 lg:py-24 xl:px-16">
        <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#4d7b5c]">
              Frequently asked
            </p>

            <h2 className="mt-4 text-[clamp(2rem,3.4vw,3.8rem)] font-medium leading-[1.08] tracking-[-0.05em]">
              คำถามก่อน
              <span className="block text-[#5b8168]">เริ่มพูดคุยกับเรา</span>
            </h2>
          </div>

          <div className="divide-y divide-[#213f2d]/12 border-y border-[#213f2d]/12">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-[15px] font-medium text-[#24362b]">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#285039]/15 transition ${
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
                      <p className="max-w-[720px] pb-6 pr-12 text-[13px] leading-7 text-[#6f7d74]">
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

      {/* Closing strip */}
      <section className="bg-[#173426] px-5 py-10 text-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-medium">
            มีรายละเอียดเพิ่มเติมที่อยากบอกเรา?
          </p>

          <a
            href="mailto:kesrin9170@gmail.com"
            className="group inline-flex items-center gap-2 text-[12px] text-white/72 transition hover:text-white"
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

      <span className="mt-1 block">{children}</span>
    </label>
  );
}
