"use client";

export type SensorStatus =
  | "ONLINE"
  | "OFFLINE"
  | "MAINTENANCE"
  | "FAULT";

export type SensorItem = {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  protocol: string;
  building: string;
  department: string;
  productionLine: string;
  machine: string;
  status: SensorStatus;
  lastValue: string;
  lastUpdated: string;
  description: string;
};

export const sensorTypes = [
  "Power Meter",
  "Temperature",
  "Humidity",
  "Pressure",
  "Water Flow",
  "Steam Flow",
  "Air Flow",
  "Energy Meter",
  "Gas Meter",
  "CO₂",
  "Current",
  "Voltage",
  "Vibration",
  "Custom",
];

export const protocols = [
  "Modbus TCP",
  "Modbus RTU",
  "MQTT",
  "OPC UA",
  "HTTP API",
  "LoRaWAN",
  "Manual",
];

export const initialSensors: SensorItem[] = [
  {
    id: "sensor-001",
    code: "SEN-0001",
    name: "Power Meter SMT-01",
    type: "Power Meter",
    unit: "kWh",
    protocol: "Modbus TCP",
    building: "อาคารผลิต A",
    department: "แผนก SMT",
    productionLine: "SMT Line 1",
    machine: "SMT Printer 01",
    status: "ONLINE",
    lastValue: "128.4 kWh",
    lastUpdated: "16 ก.ค. 2569 03:28",
    description: "ตรวจวัดการใช้พลังงานของเครื่องพิมพ์บัดกรี",
  },
  {
    id: "sensor-002",
    code: "SEN-0002",
    name: "Temperature Reflow-01",
    type: "Temperature",
    unit: "°C",
    protocol: "Modbus RTU",
    building: "อาคารผลิต A",
    department: "แผนก SMT",
    productionLine: "SMT Line 1",
    machine: "Reflow Oven 01",
    status: "ONLINE",
    lastValue: "247.8 °C",
    lastUpdated: "16 ก.ค. 2569 03:27",
    description: "ตรวจวัดอุณหภูมิภายในเตา Reflow",
  },
  {
    id: "sensor-003",
    code: "SEN-0003",
    name: "Vibration Conveyor-01",
    type: "Vibration",
    unit: "mm/s",
    protocol: "MQTT",
    building: "อาคารผลิต A",
    department: "แผนก SMT",
    productionLine: "SMT Line 2",
    machine: "Conveyor 01",
    status: "FAULT",
    lastValue: "11.6 mm/s",
    lastUpdated: "16 ก.ค. 2569 03:10",
    description: "ติดตามการสั่นสะเทือนของสายพานลำเลียง",
  },
  {
    id: "sensor-004",
    code: "SEN-0004",
    name: "Air Pressure Assembly-01",
    type: "Pressure",
    unit: "bar",
    protocol: "Modbus TCP",
    building: "อาคารผลิต A",
    department: "แผนกประกอบ",
    productionLine: "Assembly Line 1",
    machine: "Pneumatic Station 01",
    status: "ONLINE",
    lastValue: "6.2 bar",
    lastUpdated: "16 ก.ค. 2569 03:25",
    description: "ตรวจวัดแรงดันลมของสถานีประกอบ",
  },
  {
    id: "sensor-005",
    code: "SEN-0005",
    name: "Power Meter Testing-01",
    type: "Power Meter",
    unit: "kWh",
    protocol: "OPC UA",
    building: "อาคารผลิต A",
    department: "แผนกทดสอบ",
    productionLine: "Testing Line 1",
    machine: "Test Bench 01",
    status: "MAINTENANCE",
    lastValue: "0 kWh",
    lastUpdated: "15 ก.ค. 2569 22:40",
    description: "มิเตอร์พลังงานของโต๊ะทดสอบ",
  },
  {
    id: "sensor-006",
    code: "SEN-0006",
    name: "Humidity Packaging-01",
    type: "Humidity",
    unit: "%RH",
    protocol: "LoRaWAN",
    building: "อาคารผลิต B",
    department: "แผนกบรรจุภัณฑ์",
    productionLine: "Packaging Line 1",
    machine: "Packaging Room 01",
    status: "ONLINE",
    lastValue: "48 %RH",
    lastUpdated: "16 ก.ค. 2569 03:22",
    description: "ตรวจวัดความชื้นในพื้นที่บรรจุภัณฑ์",
  },
  {
    id: "sensor-007",
    code: "SEN-0007",
    name: "Water Flow Utility-01",
    type: "Water Flow",
    unit: "m³/h",
    protocol: "Modbus TCP",
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบบำบัดน้ำ",
    machine: "Water Treatment Pump 01",
    status: "ONLINE",
    lastValue: "24.5 m³/h",
    lastUpdated: "16 ก.ค. 2569 03:24",
    description: "วัดอัตราการไหลของน้ำเข้าสู่ระบบบำบัด",
  },
  {
    id: "sensor-008",
    code: "SEN-0008",
    name: "Chiller Temperature-01",
    type: "Temperature",
    unit: "°C",
    protocol: "BACnet",
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบ Chiller",
    machine: "Chiller 01",
    status: "OFFLINE",
    lastValue: "-",
    lastUpdated: "15 ก.ค. 2569 18:05",
    description: "ตรวจวัดอุณหภูมิน้ำเย็นจาก Chiller",
  },
  {
    id: "sensor-009",
    code: "SEN-0009",
    name: "Air Flow Compressor-01",
    type: "Air Flow",
    unit: "m³/min",
    protocol: "Modbus RTU",
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบ Air Compressor",
    machine: "Air Compressor 01",
    status: "ONLINE",
    lastValue: "18.7 m³/min",
    lastUpdated: "16 ก.ค. 2569 03:20",
    description: "วัดอัตราการไหลของลมอัด",
  },
];
