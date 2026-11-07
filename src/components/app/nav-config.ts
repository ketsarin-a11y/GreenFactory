import {
  AlertTriangle, BarChart3, Bot, Boxes, Building2, ClipboardList, Cpu, Database, FileBarChart,
  Factory, GitCompare, Gauge, HardDriveDownload, HelpCircle, History, Home, KeyRound, Leaf, LifeBuoy,
  ListChecks, LogIn, Network, QrCode, Radio, Ruler, ScanLine, Settings, ShieldCheck, Tags, User, Users, Zap,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/server/auth/roles";

export type NavItem = { title: string; href: string; icon: LucideIcon; exact?: boolean };
export type NavGroup = { label?: string; items: NavItem[] };

export const NAV: Record<Role, NavGroup[]> = {
  OPERATOR: [
    {
      items: [
        { title: "ภาพรวม", href: "/operator", icon: Home, exact: true },
        { title: "สแกน QR Code", href: "/operator/scan", icon: ScanLine },
        { title: "บันทึกข้อมูล", href: "/operator/record", icon: ClipboardList },
        { title: "ประวัติการบันทึก", href: "/operator/history", icon: History },
      ],
    },
    {
      label: "บัญชี",
      items: [
        { title: "โปรไฟล์ของฉัน", href: "/operator/profile", icon: User },
        { title: "ศูนย์ช่วยเหลือ", href: "/operator/help", icon: HelpCircle },
      ],
    },
  ],
  MANAGER: [
    { items: [{ title: "ภาพรวมโรงงาน", href: "/manager", icon: Home, exact: true }] },
    {
      label: "วิเคราะห์",
      items: [
        { title: "การใช้ทรัพยากร", href: "/manager/analytics", icon: BarChart3 },
        { title: "คาร์บอน", href: "/manager/carbon", icon: Leaf },
        { title: "KPI", href: "/manager/kpi", icon: Gauge },
        { title: "เปรียบเทียบช่วงเวลา", href: "/manager/compare", icon: GitCompare },
      ],
    },
    {
      label: "การดำเนินงาน",
      items: [
        { title: "เครื่องจักร", href: "/manager/machines", icon: Cpu },
        { title: "การแจ้งเตือน", href: "/manager/alerts", icon: AlertTriangle },
        { title: "ประวัติการบันทึก", href: "/manager/history", icon: History },
        { title: "รายงาน", href: "/manager/reports", icon: FileBarChart },
        { title: "ผู้ช่วย G-FAY", href: "/manager/assistant", icon: Bot },
      ],
    },
    { label: "บัญชี", items: [{ title: "โปรไฟล์ของฉัน", href: "/manager/profile", icon: User }] },
  ],
  COMPANY_ADMIN: [
    { items: [{ title: "แดชบอร์ด", href: "/company", icon: Home, exact: true }] },
    {
      label: "องค์กร",
      items: [
        { title: "โรงงาน", href: "/company/factories", icon: Factory },
        { title: "โครงสร้างโรงงาน", href: "/company/structure", icon: Network },
        { title: "ผู้ใช้งาน", href: "/company/users", icon: Users },
        { title: "บทบาทและสิทธิ์", href: "/company/roles", icon: ShieldCheck },
      ],
    },
    {
      label: "สินทรัพย์",
      items: [
        { title: "เครื่องจักร", href: "/company/machines", icon: Cpu },
        { title: "เซนเซอร์", href: "/company/sensors", icon: Radio },
        { title: "QR Code", href: "/company/qr-codes", icon: QrCode },
      ],
    },
    {
      label: "ข้อมูล",
      items: [
        { title: "การใช้ทรัพยากร", href: "/company/usage", icon: Zap },
        { title: "รายงาน", href: "/company/reports", icon: FileBarChart },
      ],
    },
    {
      label: "ตั้งค่า",
      items: [
        { title: "ข้อมูลบริษัท", href: "/company/settings", icon: Settings },
        { title: "โปรไฟล์ของฉัน", href: "/company/profile", icon: User },
        { title: "ศูนย์ช่วยเหลือ", href: "/company/help", icon: HelpCircle },
      ],
    },
  ],
  PLATFORM_ADMIN: [
    { items: [{ title: "ภาพรวมระบบ", href: "/platform", icon: Home, exact: true }] },
    {
      label: "ลูกค้า",
      items: [
        { title: "บริษัท", href: "/platform/companies", icon: Building2 },
        { title: "โรงงาน", href: "/platform/factories", icon: Factory },
        { title: "ผู้ใช้งาน", href: "/platform/users", icon: Users },
        { title: "บทบาทและสิทธิ์", href: "/platform/roles", icon: KeyRound },
      ],
    },
    {
      label: "ข้อมูลมาตรฐาน",
      items: [
        { title: "ประเภทเครื่องจักร", href: "/platform/master-data/machine-types", icon: Cpu },
        { title: "ประเภทเซนเซอร์", href: "/platform/master-data/sensor-types", icon: Radio },
        { title: "ประเภททรัพยากร", href: "/platform/master-data/resource-types", icon: Boxes },
        { title: "หมวดหมู่ทรัพยากร", href: "/platform/master-data/resource-categories", icon: Tags },
        { title: "หน่วยวัด", href: "/platform/master-data/units", icon: Ruler },
        { title: "Emission Factor", href: "/platform/master-data/emission-factors", icon: Leaf },
      ],
    },
    {
      label: "การดำเนินงานระบบ",
      items: [
        { title: "Audit Log", href: "/platform/audit-logs", icon: ListChecks },
        { title: "Login Log", href: "/platform/login-logs", icon: LogIn },
        { title: "สำรองและกู้คืน", href: "/platform/backups", icon: HardDriveDownload },
        { title: "คำร้องขอความช่วยเหลือ", href: "/platform/support", icon: LifeBuoy },
        { title: "ตั้งค่าระบบ", href: "/platform/settings", icon: Database },
      ],
    },
  ],
};

