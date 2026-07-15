import type { Metadata } from "next";

import CTASection from "@/components/common/CTASection";
import AISection from "@/components/features/AISection";
import CarbonSection from "@/components/features/CarbonSection";
import EnergySection from "@/components/features/EnergySection";
import FeaturesHero from "@/components/features/Hero";
import PlatformSection from "@/components/features/PlatformSection";
import SolutionNavigation from "@/components/features/SolutionNavigation";
import WaterSection from "@/components/features/WaterSection";
export const metadata: Metadata = {
  title: "โซลูชัน",
  description:
    "แพลตฟอร์มบริหารจัดการข้อมูลพลังงาน คาร์บอน น้ำ ทรัพยากร และข้อมูลความยั่งยืนสำหรับองค์กรอุตสาหกรรม",
};

export default function FeaturesPage() {
  return (
    <main className="overflow-x-clip bg-[#f7f8f4] text-[#1c2921]">
      <FeaturesHero />

      <SolutionNavigation />

      <div id="solutions">
        <EnergySection />
        <CarbonSection />
        <WaterSection />
        <AISection />
      </div>

      <PlatformSection />

      <CTASection
        eyebrow="GreenFactory Insight"
        title="พร้อมยกระดับ"
        highlight="การบริหารข้อมูลโรงงาน"
        description="เชื่อมโยงข้อมูลด้านพลังงาน คาร์บอน ทรัพยากร และกระบวนการผลิตไว้ในแพลตฟอร์มเดียว เพื่อให้องค์กรเห็นภาพรวมและตัดสินใจได้อย่างชัดเจนยิ่งขึ้น"
        buttonLabel="ติดต่อเรา"
        buttonHref="/contact"
      />
    </main>
  );
}