import type { Metadata } from "next";
import { CONTACT } from "@/components/marketing/site";
import { ProsePage } from "@/components/marketing/prose";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน",
  description: "ข้อกำหนดพื้นฐานในการใช้งาน GreenFactory Insight",
};

export default function TermsPage() {
  return (
    <ProsePage title="ข้อกำหนดการใช้งาน" updated="3 พฤศจิกายน 2569">
      <section>
        <h2>บัญชีผู้ใช้</h2>
        <p>บัญชีถูกสร้างโดยผู้ดูแลบริษัทของคุณ เก็บรหัสผ่านไว้เป็นความลับและไม่ใช้บัญชีร่วมกับผู้อื่น ถ้าสงสัยว่าบัญชีถูกใช้โดยไม่ได้รับอนุญาต ให้แจ้งผู้ดูแลบริษัททันที</p>
      </section>
      <section>
        <h2>ข้อมูลของคุณ</h2>
        <p>ข้อมูลที่บริษัทของคุณบันทึกในระบบเป็นของบริษัทของคุณ คุณรับผิดชอบความถูกต้องของค่าที่บันทึก และส่งออกข้อมูลได้ผ่านเมนูรายงาน</p>
      </section>
      <section>
        <h2>ผลการคำนวณ</h2>
        <p>ค่าคาร์บอน KPI การแจ้งเตือน และคำแนะนำจาก G-FAY คำนวณจากข้อมูลที่บันทึกและค่า Emission Factor ที่ตั้งค่าไว้ ใช้เพื่อประกอบการตัดสินใจภายในองค์กร ถ้าจะใช้ในรายงานที่ต้องทวนสอบ ควรให้ผู้ทวนสอบตรวจสอบข้อมูลต้นทางอีกครั้ง</p>
      </section>
      <section>
        <h2>การใช้งานที่ไม่อนุญาต</h2>
        <ul>
          <li>พยายามเข้าถึงข้อมูลของบริษัทอื่นหรือส่วนของระบบที่ไม่ได้รับสิทธิ์</li>
          <li>ส่งข้อมูลหรือไฟล์ที่เป็นอันตรายเข้าสู่ระบบ</li>
          <li>ใช้ระบบในทางที่รบกวนการให้บริการผู้ใช้อื่น</li>
        </ul>
      </section>
      <section>
        <h2>ติดต่อ</h2>
        <p>สอบถามเกี่ยวกับข้อกำหนดเหล่านี้ได้ที่ <a className="text-primary hover:underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
      </section>
    </ProsePage>
  );
}
