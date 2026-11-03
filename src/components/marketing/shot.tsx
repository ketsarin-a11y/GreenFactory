import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Real screenshots of the running app (demo company "Voltera", seeded data), captured at 2x.
 * Re-capture with the Playwright script described in the 2026-11-04 polish plan if screens change.
 */
export const SHOTS = {
  managerHome: { src: "/images/product/manager-home.png", w: 2880, h: 1800, alt: "หน้าภาพรวมโรงงานของผู้จัดการ แถบค่าหลักไฟฟ้า คาร์บอน น้ำประปา และการแจ้งเตือน พร้อมกราฟไฟฟ้ารายวันแยกเครื่องจักร" },
  managerBand: { src: "/images/product/manager-band.png", w: 2272, h: 448, alt: "แถบค่าหลักของโรงงาน ไฟฟ้า 24,046 kWh คาร์บอน 12.83 tCO₂e น้ำประปา 573.3 m³ และการแจ้งเตือนที่เปิดอยู่ 5 รายการ" },
  heatmap: { src: "/images/product/manager-heatmap.png", w: 2272, h: 728, alt: "ตารางสีการใช้ไฟฟ้ารายเครื่อง × วัน ของ 8 เครื่องที่ใช้มากที่สุดในรอบ 28 วัน สีเข้มคือใช้มาก" },
  alerts: { src: "/images/product/step-alerts.png", w: 720, h: 680, alt: "รายการแจ้งเตือนที่ยังไม่ปิด เช่น ไฟฟ้าสูงผิดปกติที่เครื่องตรวจสอบด้วยภาพ SMT 2 ระดับวิกฤต" },
  carbon: { src: "/images/product/carbon.png", w: 2368, h: 1560, alt: "หน้าคาร์บอน แสดงคาร์บอนรวม Scope 1 และ Scope 2 กราฟคาร์บอนรายวันตามทรัพยากร และสัดส่วนตาม Scope" },
  kpi: { src: "/images/product/kpi-gauges.png", w: 2272, h: 750, alt: "ผล KPI งวดล่าสุด มาตรวัดความสำเร็จ 92% และ 100% พร้อมผล 12 งวดล่าสุดของแต่ละ KPI" },
  compare: { src: "/images/product/company-compare.png", w: 2336, h: 1562, alt: "กราฟเทียบไฟฟ้าต่อวันของโรงงานชลบุรีและโรงงานระยอง และตารางไฟฟ้าเฉลี่ยต่อวัน คาร์บอน 30 วัน และความพร้อมของแต่ละโรงงาน" },
  sensors: { src: "/images/product/sensors.png", w: 2336, h: 1640, alt: "หน้าเซนเซอร์ IoT แสดงสถานะเชื่อมต่อ ค่าล่าสุด และเวลาที่ส่งข้อมูลของเซนเซอร์แต่ละตัว" },
  operatorHome: { src: "/images/product/operator-home.png", w: 780, h: 1688, alt: "หน้าแรกของผู้ปฏิบัติงานบนมือถือ ปุ่มสแกน QR และรายการเครื่องจักรที่ยังไม่บันทึกวันนี้" },
  record: { src: "/images/product/step-record.png", w: 780, h: 1120, alt: "ฟอร์มบันทึกบนมือถือ เครื่องอัดอากาศหลัก CMP-01 ปริมาณลมอัด 1284.6 m³ หน่วยถูกกำหนดตามประเภททรัพยากร" },
  qr: { src: "/images/product/step-qr.png", w: 670, h: 656, alt: "ป้าย QR ของเครื่องตรวจสอบด้วยภาพ SMT 2 รหัส AOI-02 พร้อมตำแหน่งอาคาร ฝ่าย และสายการผลิต" },
  report: { src: "/images/product/step-report.png", w: 2272, h: 284, alt: "แผงสร้างรายงาน เลือกประเภทรายงาน รูปแบบไฟล์ Excel และช่วงวันที่" },
} as const;

type ShotKey = keyof typeof SHOTS;

/** A screenshot on a thin hairline frame. No fake browser chrome. */
export function Shot({ name, sizes, priority, className, imgClassName }: {
  name: ShotKey;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const s = SHOTS[name];
  return (
    <div className={cn("overflow-hidden rounded-[10px] border border-border bg-card", className)}>
      <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className={cn("h-auto w-full", imgClassName)} />
    </div>
  );
}

/** Phone-shaped frame for the operator screens. */
export function PhoneShot({ name, sizes, priority, className }: { name: ShotKey; sizes: string; priority?: boolean; className?: string }) {
  const s = SHOTS[name];
  return (
    <div className={cn("rounded-[30px] bg-[#0d1512] p-2 shadow-[0_24px_48px_-12px_rgb(6_46_34/0.45)] ring-1 ring-white/10", className)}>
      <div className="overflow-hidden rounded-[23px] bg-card">
        <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes={sizes} priority={priority} className="h-auto w-full" />
      </div>
    </div>
  );
}
