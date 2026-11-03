// Plain constants shared by company-admin server actions and client forms.
export const PROTOCOLS = ["Modbus TCP", "Modbus RTU", "MQTT", "OPC UA", "HTTP API", "LoRaWAN", "BACnet", "Manual"] as const;

export const OPERATIONAL = ["NORMAL", "WARNING", "MAINTENANCE", "STOPPED"] as const;
export const OPERATIONAL_LABEL: Record<(typeof OPERATIONAL)[number], string> = {
  NORMAL: "ปกติ",
  WARNING: "ตรวจสอบ",
  MAINTENANCE: "บำรุงรักษา",
  STOPPED: "หยุดทำงาน",
};

export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ใช้งานอยู่" },
  { value: "INACTIVE", label: "ปิดใช้งาน" },
];

export const QR_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ใช้งานอยู่" },
  { value: "SUSPENDED", label: "ระงับชั่วคราว" },
  { value: "REVOKED", label: "ยกเลิกแล้ว" },
];

export const SOURCE_LABEL: Record<string, string> = { QR: "สแกน QR", MANUAL: "บันทึกเอง", SENSOR: "เซนเซอร์", IMPORT: "นำเข้าไฟล์" };
