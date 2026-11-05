// Client-safe description of each master-data table: columns to show and fields to edit.
// Server rules (validation, references) live in src/server/actions/platform/master-data.ts.

export const MASTER_KINDS = ["machine-types", "sensor-types", "resource-types", "resource-categories", "units", "emission-factors"] as const;
export type MasterKind = (typeof MASTER_KINDS)[number];

export const UNIT_TYPES = ["Energy", "Power", "Volume", "Mass", "Temperature", "Pressure", "Ratio", "Count", "Time"] as const;

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "switch" | "number" | "date";
  required?: boolean;
  hint?: string;
  max?: number;
  mono?: boolean;
  /** Options come from the page (`options[name]`) unless listed here. */
  options?: { value: string; label: string }[];
  /** Selecting a value fills another field, e.g. resource → factor unit. Values come from `options[`${name}:autofill`]`. */
  autofill?: string;
  /** Read-only when editing (codes are identifiers). */
  lockOnEdit?: boolean;
};
export type ColumnDef = { key: string; label: string; mono?: boolean; numeric?: boolean };

const codeField = (label = "รหัส"): FieldDef => ({
  name: "code",
  label,
  type: "text",
  required: true,
  max: 50,
  mono: true,
  hint: "A-Z, 0-9 และ _ ไม่เกิน 50 ตัว เช่น CNC_MACHINE",
  lockOnEdit: true,
});
const nameField: FieldDef = { name: "name", label: "ชื่อ", type: "text", required: true, max: 150 };
const descField: FieldDef = { name: "description", label: "คำอธิบาย", type: "textarea", max: 500 };

export const MASTER: Record<MasterKind, { title: string; noun: string; description: string; columns: ColumnDef[]; fields: FieldDef[] }> = {
  "machine-types": {
    title: "ประเภทเครื่องจักร",
    noun: "ประเภทเครื่องจักร",
    description: "ประเภทที่บริษัทเลือกใช้ตอนลงทะเบียนเครื่องจักร",
    columns: [{ key: "code", label: "รหัส", mono: true }, { key: "name", label: "ชื่อ" }, { key: "description", label: "คำอธิบาย" }],
    fields: [codeField(), nameField, descField],
  },
  "sensor-types": {
    title: "ประเภทเซนเซอร์",
    noun: "ประเภทเซนเซอร์",
    description: "ประเภทที่บริษัทเลือกใช้ตอนติดตั้งเซนเซอร์",
    columns: [{ key: "code", label: "รหัส", mono: true }, { key: "name", label: "ชื่อ" }, { key: "description", label: "คำอธิบาย" }],
    fields: [codeField(), nameField, descField],
  },
  "resource-categories": {
    title: "หมวดหมู่ทรัพยากร",
    noun: "หมวดหมู่",
    description: "จัดกลุ่มประเภททรัพยากร เช่น พลังงาน น้ำ เชื้อเพลิง",
    columns: [{ key: "code", label: "รหัส", mono: true }, { key: "name", label: "ชื่อ" }, { key: "description", label: "คำอธิบาย" }],
    fields: [codeField(), nameField, descField],
  },
  units: {
    title: "หน่วยวัด",
    noun: "หน่วยวัด",
    description: "หน่วยที่ใช้บันทึกปริมาณการใช้ทรัพยากร สัญลักษณ์และประเภทต้องไม่ซ้ำกัน",
    columns: [
      { key: "code", label: "รหัส", mono: true },
      { key: "name", label: "ชื่อ" },
      { key: "symbol", label: "สัญลักษณ์" },
      { key: "unitType", label: "ประเภทหน่วย" },
    ],
    fields: [
      codeField(),
      { ...nameField, max: 100 },
      { name: "symbol", label: "สัญลักษณ์", type: "text", required: true, max: 30, mono: true, hint: "เช่น kWh, m³, L" },
      { name: "unitType", label: "ประเภทหน่วย", type: "select", required: true, options: UNIT_TYPES.map((u) => ({ value: u, label: u })) },
    ],
  },
  "resource-types": {
    title: "ประเภททรัพยากร",
    noun: "ประเภททรัพยากร",
    description: "ทรัพยากรที่บันทึกได้ (ไฟฟ้า น้ำ เชื้อเพลิง) พร้อมหน่วยหลักและการคำนวณคาร์บอน",
    columns: [
      { key: "code", label: "รหัส", mono: true },
      { key: "name", label: "ชื่อ" },
      { key: "category", label: "หมวดหมู่" },
      { key: "unit", label: "หน่วยหลัก" },
      { key: "carbon", label: "คำนวณคาร์บอน" },
    ],
    fields: [
      codeField(),
      nameField,
      { name: "categoryId", label: "หมวดหมู่", type: "select", required: true },
      { name: "defaultUnitId", label: "หน่วยหลัก", type: "select", required: true, hint: "ผู้ปฏิบัติงานบันทึกด้วยหน่วยนี้" },
      { name: "carbonCalculable", label: "นำไปคำนวณคาร์บอน", type: "switch", hint: "เปิดเมื่อมี Emission Factor สำหรับทรัพยากรนี้" },
      descField,
    ],
  },
  "emission-factors": {
    title: "Emission Factor",
    noun: "ค่า Emission Factor",
    description: "ค่าการปล่อยก๊าซเรือนกระจกต่อหน่วยทรัพยากร ช่วงเวลาที่ใช้งานของทรัพยากร/Scope/ภูมิภาคเดียวกันต้องไม่ซ้อนกัน",
    columns: [
      { key: "resource", label: "ทรัพยากร" },
      { key: "scope", label: "Scope" },
      { key: "region", label: "ภูมิภาค" },
      { key: "factor", label: "ค่า Factor", numeric: true },
      { key: "factorUnit", label: "หน่วย" },
      { key: "period", label: "ช่วงที่ใช้" },
      { key: "source", label: "แหล่งที่มา" },
    ],
    fields: [
      { name: "resourceTypeId", label: "ทรัพยากร", type: "select", required: true, autofill: "factorUnit", hint: "แสดงเฉพาะทรัพยากรที่ใช้งานอยู่และคำนวณคาร์บอนได้" },
      { name: "scope", label: "Scope", type: "select", required: true, options: ["SCOPE 1", "SCOPE 2", "SCOPE 3"].map((s) => ({ value: s, label: s.replace("SCOPE", "Scope") })) },
      { name: "region", label: "ภูมิภาค", type: "text", required: true, max: 100, mono: true, hint: "ค่าเริ่มต้น TH" },
      { name: "factor", label: "ค่า Factor", type: "number", required: true, hint: "ต้องไม่ติดลบ" },
      { name: "factorUnit", label: "หน่วยของ Factor", type: "text", required: true, max: 100, mono: true, hint: "เติมให้อัตโนมัติจากหน่วยของทรัพยากร" },
      { name: "effectiveDate", label: "วันที่เริ่มใช้", type: "date", required: true },
      { name: "expiryDate", label: "วันสิ้นสุด", type: "date", hint: "เว้นว่างถ้ายังใช้อยู่" },
      { name: "source", label: "แหล่งที่มา", type: "text", max: 255, hint: "เช่น อบก. (TGO) ประกาศปี 2567" },
    ],
  },
};
