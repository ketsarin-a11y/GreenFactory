import type { ReportItem } from "./types";

export const reports: ReportItem[] = [
  {
    id: 1,
    title: "รายงานการใช้พลังงานประจำเดือน",
    period: "1–30 มิถุนายน 2567",
    requestedBy: "ผู้จัดการโรงงาน 1",
    createdAt: "30 มิ.ย. 2567, 16:40 น.",
    fileType: "Excel",
    status: "ready",
    size: "1.8 MB",
  },
  {
    id: 2,
    title: "รายงานการปล่อยคาร์บอน",
    period: "1–30 มิถุนายน 2567",
    requestedBy: "ผู้จัดการโรงงาน 1",
    createdAt: "30 มิ.ย. 2567, 15:10 น.",
    fileType: "PDF",
    status: "ready",
    size: "2.4 MB",
  },
  {
    id: 3,
    title: "รายงานการใช้น้ำและทรัพยากร",
    period: "1–30 มิถุนายน 2567",
    requestedBy: "ผู้จัดการโรงงาน 2",
    createdAt: "30 มิ.ย. 2567, 14:05 น.",
    fileType: "CSV",
    status: "processing",
    size: "-",
  },
  {
    id: 4,
    title: "รายงานประสิทธิภาพสายการผลิต",
    period: "1–30 มิถุนายน 2567",
    requestedBy: "ผู้จัดการโรงงาน 2",
    createdAt: "30 มิ.ย. 2567, 12:55 น.",
    fileType: "Excel",
    status: "failed",
    size: "-",
  },
  {
    id: 5,
    title: "รายงานสรุป KPI โรงงาน",
    period: "1–31 พฤษภาคม 2567",
    requestedBy: "ผู้จัดการโรงงาน 1",
    createdAt: "31 พ.ค. 2567, 17:15 น.",
    fileType: "PDF",
    status: "ready",
    size: "2.1 MB",
  },
];

export const monthlyTrend = [
  { month: "ม.ค.", value: 63 },
  { month: "ก.พ.", value: 69 },
  { month: "มี.ค.", value: 58 },
  { month: "เม.ย.", value: 78 },
  { month: "พ.ค.", value: 72 },
  { month: "มิ.ย.", value: 86 },
];
