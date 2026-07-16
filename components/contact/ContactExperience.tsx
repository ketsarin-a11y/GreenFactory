"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
<<<<<<< HEAD
  ExternalLink,
=======
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
      "รองรับ โดยระบบสามารถแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรได้อย่างเป็นระบบ",
=======
      "รองรับ โดยสามารถแยกข้อมูล ผู้ใช้งาน หน่วยงาน และสิทธิ์การเข้าถึงของแต่ละองค์กรได้อย่างเป็นระบบ",
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
  },
  {
    question: "ต้องเตรียมข้อมูลอะไรบ้างก่อนติดต่อ",
    answer:
<<<<<<< HEAD
      "ระบุประเภทองค์กร เป้าหมายที่ต้องการ และข้อมูลที่มีอยู่ เช่น พลังงาน คาร์บอน น้ำ ของเสีย หรือข้อมูลจากเครื่องจักร",
  },
];

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Suranaree+University+of+Technology";

=======
      "เพียงระบุประเภทองค์กร เป้าหมายที่ต้องการ และข้อมูลที่มีอยู่ เช่น พลังงาน คาร์บอน น้ำ ของเสีย หรือข้อมูลจากเครื่องจักร",
  },
];

>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
export default function ContactExperience() {
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          </p>
        </div>
      </section>

<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    kesrin9170@gmail.com
                  </p>
                </div>
              </a>

<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
<<<<<<< HEAD
                  className="mt-7 rounded-lg bg-[#1d7d4b] px-5 py-3 text-[12px] font-medium text-white transition hover:bg-[#176a3f]"
=======
                  className="mt-8 rounded-full bg-[#1d7d4b] px-6 py-3 text-[12px] font-medium text-white"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <>
<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    <Field label="ชื่อ - นามสกุล" required>
                      <input
                        required
                        name="name"
                        autoComplete="name"
                        placeholder="ชื่อของคุณ"
<<<<<<< HEAD
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
=======
                        className="peer w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                      />
                    </Field>

                    <Field label="อีเมล" required>
                      <input
                        required
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="name@company.com"
<<<<<<< HEAD
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
=======
                        className="w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                      />
                    </Field>

                    <Field label="องค์กร / โรงงาน">
                      <input
                        name="organization"
                        placeholder="ชื่อองค์กรของคุณ"
<<<<<<< HEAD
                        className="w-full rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 text-[13px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252] focus:bg-white"
=======
                        className="w-full border-b border-[#233f2d]/18 bg-transparent py-3 text-[14px] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#238252]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
                          className="w-full appearance-none rounded-lg border border-[#dbe5de] bg-[#fbfcfb] px-4 py-3 pr-10 text-[13px] outline-none transition focus:border-[#238252] focus:bg-white"
=======
                          className="w-full appearance-none border-b border-[#233f2d]/18 bg-transparent py-3 pr-8 text-[14px] outline-none transition focus:border-[#238252]"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                        >
                          {topics.map((topic) => (
                            <option key={topic}>{topic}</option>
                          ))}
                        </select>

<<<<<<< HEAD
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7b72]" />
=======
                        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7b72]" />
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                      </div>
                    </Field>
                  </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    </p>

                    <button
                      type="submit"
<<<<<<< HEAD
                      className="group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#1c7d4a] px-6 text-[12px] font-medium text-white transition hover:bg-[#176c40]"
                    >
                      ส่งข้อความ
                      <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
=======
                      className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#1c7d4a] px-7 text-[13px] font-medium text-white shadow-[0_14px_30px_rgba(24,122,70,0.20)] transition hover:-translate-y-0.5 hover:bg-[#176c40]"
                    >
                      ส่งข้อความ
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
<<<<<<< HEAD
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
=======
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
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
<<<<<<< HEAD
                    className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  >
                    <span className="text-[14px] font-medium text-[#24362b]">
=======
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-[15px] font-medium text-[#24362b]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
                      {faq.question}
                    </span>

                    <span
<<<<<<< HEAD
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dbe5de] transition ${
=======
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#285039]/15 transition ${
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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
<<<<<<< HEAD
                      <p className="max-w-[720px] pb-5 pr-10 text-[13px] leading-7 text-[#6f7d74]">
=======
                      <p className="max-w-[720px] pb-6 pr-12 text-[13px] leading-7 text-[#6f7d74]">
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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

<<<<<<< HEAD
      {/* Bottom contact strip */}
      <section className="border-t border-white/10 bg-[#173426] px-5 py-7 text-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] font-medium">
            ต้องการสอบถามเพิ่มเติมเกี่ยวกับโครงการ
=======
      {/* Closing strip */}
      <section className="bg-[#173426] px-5 py-10 text-white sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-medium">
            มีรายละเอียดเพิ่มเติมที่อยากบอกเรา?
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
          </p>

          <a
            href="mailto:kesrin9170@gmail.com"
<<<<<<< HEAD
            className="group inline-flex items-center gap-2 text-[12px] text-white/70 transition hover:text-white"
=======
            className="group inline-flex items-center gap-2 text-[12px] text-white/72 transition hover:text-white"
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
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

<<<<<<< HEAD
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
=======
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
