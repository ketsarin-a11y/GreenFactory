import type { ActivityItem, SessionItem } from "./types";

export const activityItems: ActivityItem[] = [
  {
    id: 1,
    title: "เข้าสู่ระบบ",
    description: "เข้าสู่ระบบจาก Chrome บน Windows",
    date: "20 ก.ค. 2569",
    time: "20:42 น.",
    type: "login",
  },
  {
    id: 2,
    title: "สร้างรายงานการปล่อยคาร์บอน",
    description: "สร้างรายงานแทนผู้จัดการโรงงาน 1",
    date: "19 ก.ค. 2569",
    time: "16:18 น.",
    type: "report",
  },
  {
    id: 3,
    title: "เพิ่มผู้ใช้งานใหม่",
    description: "เพิ่มผู้ใช้งานในบทบาท Operator จำนวน 1 คน",
    date: "18 ก.ค. 2569",
    time: "13:05 น.",
    type: "user",
  },
  {
    id: 4,
    title: "แก้ไขข้อมูลโรงงาน",
    description: "อัปเดตข้อมูลผู้ติดต่อและเขตเวลา",
    date: "17 ก.ค. 2569",
    time: "10:26 น.",
    type: "settings",
  },
];

export const sessions: SessionItem[] = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Chrome",
    location: "Nakhon Ratchasima, Thailand",
    lastActive: "ใช้งานอยู่ขณะนี้",
    current: true,
  },
  {
    id: 2,
    device: "iPhone",
    browser: "Safari",
    location: "Nakhon Ratchasima, Thailand",
    lastActive: "2 วันที่แล้ว",
    current: false,
  },
];
