import type { Metadata } from "next";
import ContactExperience from "@/components/contact/ContactExperience";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description:
    "ติดต่อ GreenFactory Insight เพื่อพูดคุยเกี่ยวกับการบริหารข้อมูลพลังงาน คาร์บอน ทรัพยากร และความยั่งยืนสำหรับองค์กรอุตสาหกรรม",
};

export default function ContactPage() {
  return <ContactExperience />;
}
