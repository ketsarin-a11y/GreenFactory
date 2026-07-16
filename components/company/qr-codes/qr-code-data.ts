import type { QRCodeItem } from "@/types/qr-code";

export const qrTargets = [
  { targetType: "MACHINE" as const, targetName: "SMT Printer 01", targetCode: "MCH-SMT-001", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1" },
  { targetType: "MACHINE" as const, targetName: "Reflow Oven 01", targetCode: "MCH-SMT-002", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1" },
  { targetType: "MACHINE" as const, targetName: "Assembly Cell 01", targetCode: "MCH-ASM-001", building: "อาคารผลิต A", department: "แผนกประกอบ", productionLine: "Assembly Line 1" },
  { targetType: "MACHINE" as const, targetName: "Packaging Machine 01", targetCode: "MCH-PACK-001", building: "อาคารผลิต B", department: "แผนกบรรจุภัณฑ์", productionLine: "Packaging Line 1" },
  { targetType: "CHECKPOINT" as const, targetName: "จุดตรวจการใช้ไฟฟ้า SMT", targetCode: "CHK-SMT-001", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1" },
  { targetType: "CHECKPOINT" as const, targetName: "จุดตรวจน้ำระบบบำบัด", targetCode: "CHK-UTL-001", building: "อาคารสาธารณูปโภค", department: "ระบบสาธารณูปโภค", productionLine: "ระบบบำบัดน้ำ" },
];

export const initialQRCodes: QRCodeItem[] = [
  { id: "qr-001", code: "INSP-001", token: "7d2c05de-4167-41e2-bf52-6b7bf174a001", targetType: "MACHINE", targetName: "SMT Printer 01", targetCode: "MCH-SMT-001", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1", status: "ACTIVE", createdAt: "16 ก.ค. 2569 02:10", updatedAt: "16 ก.ค. 2569 02:10", createdBy: "Company Admin", note: "ติดบริเวณด้านหน้าตู้ควบคุม" },
  { id: "qr-002", code: "INSP-002", token: "7d2c05de-4167-41e2-bf52-6b7bf174a002", targetType: "MACHINE", targetName: "Reflow Oven 01", targetCode: "MCH-SMT-002", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1", status: "ACTIVE", createdAt: "16 ก.ค. 2569 02:12", updatedAt: "16 ก.ค. 2569 02:12", createdBy: "Company Admin", note: "" },
  { id: "qr-003", code: "INSP-003", token: "7d2c05de-4167-41e2-bf52-6b7bf174a003", targetType: "CHECKPOINT", targetName: "จุดตรวจการใช้ไฟฟ้า SMT", targetCode: "CHK-SMT-001", building: "อาคารผลิต A", department: "แผนก SMT", productionLine: "SMT Line 1", status: "SUSPENDED", createdAt: "16 ก.ค. 2569 02:15", updatedAt: "16 ก.ค. 2569 02:50", createdBy: "Company Admin", note: "ระงับชั่วคราว" },
  { id: "qr-004", code: "INSP-004", token: "7d2c05de-4167-41e2-bf52-6b7bf174a004", targetType: "MACHINE", targetName: "Packaging Machine 01", targetCode: "MCH-PACK-001", building: "อาคารผลิต B", department: "แผนกบรรจุภัณฑ์", productionLine: "Packaging Line 1", status: "ACTIVE", createdAt: "16 ก.ค. 2569 02:20", updatedAt: "16 ก.ค. 2569 02:20", createdBy: "Company Admin", note: "" },
  { id: "qr-005", code: "INSP-005", token: "7d2c05de-4167-41e2-bf52-6b7bf174a005", targetType: "CHECKPOINT", targetName: "จุดตรวจน้ำระบบบำบัด", targetCode: "CHK-UTL-001", building: "อาคารสาธารณูปโภค", department: "ระบบสาธารณูปโภค", productionLine: "ระบบบำบัดน้ำ", status: "REVOKED", createdAt: "16 ก.ค. 2569 02:25", updatedAt: "16 ก.ค. 2569 03:00", createdBy: "Company Admin", note: "QR เดิมชำรุด" },
];
