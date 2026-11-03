import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { CONTACT } from "@/components/marketing/site";
import { PageIntro, Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ขอเดโม GreenFactory Insight หรือสอบถามข้อมูลระบบ ส่งรายละเอียดโรงงานของคุณ แล้วทีมงานจะติดต่อกลับ",
  openGraph: { title: "ติดต่อเรา · GreenFactory Insight" },
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="ขอเดโมกับโครงสร้างโรงงานของคุณ"
        body="บอกเราว่ามีกี่โรงงาน ตอนนี้จดมิเตอร์อย่างไร และอยากเห็นตัวเลขไหน ทีมงานจะเตรียมการสาธิตที่ใช้เครื่องจักรและจุดวัดใกล้เคียงกับของคุณ"
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-xl border bg-card p-5 sm:p-8">
            <h2 className="text-lg font-semibold">แบบฟอร์มขอเดโม</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก</p>
            <ContactForm />
          </div>
          <aside aria-label="ช่องทางติดต่อ" className="space-y-6">
            <h2 className="text-lg font-semibold">ช่องทางอื่น</h2>
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium">อีเมล</p>
                  <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">{CONTACT.email}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium">สถานที่พัฒนาโครงการ</p>
                  <a href={CONTACT.mapUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    {CONTACT.place}, {CONTACT.city}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium">การติดต่อกลับ</p>
                  <p className="text-muted-foreground">ทีมงานติดต่อกลับทางอีเมลหรือโทรศัพท์หลังได้รับรายละเอียด</p>
                </div>
              </li>
            </ul>
            <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              เป็นลูกค้าอยู่แล้ว? เข้าสู่ระบบแล้วใช้เมนู “ช่วยเหลือ” เพื่อแจ้งปัญหา ทีมดูแลระบบจะเห็นคำขอพร้อมข้อมูลบัญชีของคุณ
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
