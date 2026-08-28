import type {
  PermissionGroup,
  PermissionMatrixState,
  Role,
} from "./types";

export const MOCK_ROLES: Role[] = [
  {
    id: 1,
    key: "PLATFORM_ADMIN",
    name: "Platform Admin",
    description: "ดูแลระบบทั้งหมดและควบคุมการใช้งาน",
    userCount: 1,
    icon: "shield",
    tone: {
      iconBg: "bg-[#e7f8ef]",
      iconText: "text-[#0c8a5e]",
      activeBg: "bg-[#f1fbf6]",
      activeBorder: "border-[#bfe8d5]",
    },
  },
  {
    id: 2,
    key: "COMPANY_ADMIN",
    name: "Company Admin",
    description: "ดูแลข้อมูลบริษัทและผู้ใช้งานภายในบริษัท",
    userCount: 8,
    icon: "users",
    tone: {
      iconBg: "bg-[#eaf3ff]",
      iconText: "text-[#3478da]",
      activeBg: "bg-[#f4f8ff]",
      activeBorder: "border-[#cfe0f8]",
    },
  },
  {
    id: 3,
    key: "FACTORY_MANAGER",
    name: "Factory Manager",
    description: "ตรวจสอบข้อมูลและอนุมัติภายในโรงงาน",
    userCount: 15,
    icon: "factory",
    tone: {
      iconBg: "bg-[#fff1e6]",
      iconText: "text-[#e46f20]",
      activeBg: "bg-[#fff8f2]",
      activeBorder: "border-[#f4d8c2]",
    },
  },
  {
    id: 4,
    key: "ENVIRONMENT_OFFICER",
    name: "Environment Officer",
    description: "บันทึกข้อมูล ตรวจสอบ และติดตามผล",
    userCount: 32,
    icon: "leaf",
    tone: {
      iconBg: "bg-[#f2edff]",
      iconText: "text-[#8257de]",
      activeBg: "bg-[#f8f5ff]",
      activeBorder: "border-[#dfd4fb]",
    },
  },
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "operations",
    label: "1. การดำเนินงาน",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "carbon-result", label: "Carbon Result", icon: "chart" },
      { id: "kpi", label: "KPI", icon: "target" },
      { id: "alert", label: "Alert", icon: "bell" },
      { id: "ai-recommendation", label: "AI Recommendation", icon: "sparkles" },
      { id: "report-export", label: "Report & Export", icon: "file" },
    ],
  },
  {
    id: "administration",
    label: "2. การจัดการข้อมูล",
    items: [
      { id: "company-management", label: "จัดการข้อมูลบริษัท", icon: "building" },
      { id: "user-management", label: "จัดการผู้ใช้งาน", icon: "users" },
      { id: "role-management", label: "กำหนดสิทธิ์การใช้งาน", icon: "shield" },
      { id: "equipment-management", label: "เครื่องจักรและอุปกรณ์", icon: "settings" },
    ],
  },
  {
    id: "master-data",
    label: "3. ข้อมูลมาตรฐาน (Master Data)",
    items: [
      { id: "machine-types", label: "ประเภทเครื่องจักร", icon: "factory" },
      { id: "sensor-types", label: "ประเภทเซนเซอร์", icon: "sensor" },
      { id: "resource-types", label: "ประเภททรัพยากร", icon: "zap" },
      { id: "resource-categories", label: "หมวดหมู่ทรัพยากร", icon: "boxes" },
      { id: "units", label: "หน่วยวัด", icon: "ruler" },
      { id: "emission-factor", label: "ค่า Emission Factor", icon: "leaf" },
    ],
  },
  {
    id: "recording",
    label: "4. การบันทึกข้อมูล",
    items: [
      { id: "resource-usage", label: "บันทึกการใช้ทรัพยากร (Resource Usage)", icon: "database" },
    ],
  },
  {
    id: "monitoring",
    label: "5. ระบบและการตั้งค่า",
    items: [
      { id: "audit-log", label: "Audit Log", icon: "clipboard" },
      { id: "login-log", label: "Login Log", icon: "search" },
      { id: "system-settings", label: "ตั้งค่าระบบ", icon: "settings" },
    ],
  },
];

const defaults: PermissionMatrixState = {};

for (const group of PERMISSION_GROUPS) {
  for (const item of group.items) {
    defaults[item.id] = {
      PLATFORM_ADMIN: "FULL",
      COMPANY_ADMIN: "VIEW",
      FACTORY_MANAGER: "VIEW",
      ENVIRONMENT_OFFICER: "VIEW",
    };
  }
}

[
  "company-management",
  "user-management",
  "role-management",
  "machine-types",
  "sensor-types",
  "resource-types",
  "resource-categories",
  "units",
  "emission-factor",
  "audit-log",
  "login-log",
  "system-settings",
].forEach((id) => {
  defaults[id].FACTORY_MANAGER = "NONE";
  defaults[id].ENVIRONMENT_OFFICER = "NONE";
});

defaults["company-management"].COMPANY_ADMIN = "FULL";
defaults["user-management"].COMPANY_ADMIN = "FULL";
defaults["role-management"].COMPANY_ADMIN = "NONE";
defaults["resource-usage"].PLATFORM_ADMIN = "NONE";
defaults["resource-usage"].COMPANY_ADMIN = "FULL";
defaults["resource-usage"].FACTORY_MANAGER = "VIEW";
defaults["resource-usage"].ENVIRONMENT_OFFICER = "FULL";

export const INITIAL_PERMISSION_MATRIX = defaults;
