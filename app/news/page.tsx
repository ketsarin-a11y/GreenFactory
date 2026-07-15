import type { Metadata } from "next";
import InsightsExperience from "@/components/insights/InsightsExperience";

export const metadata: Metadata = {
  title: "ข้อมูลเชิงลึก",
  description:
    "บทความ แนวคิด และมุมมองด้านพลังงาน คาร์บอน เทคโนโลยี และการบริหารข้อมูลสำหรับองค์กรอุตสาหกรรม",
};

export default function InsightsPage() {
  return <InsightsExperience />;
}
