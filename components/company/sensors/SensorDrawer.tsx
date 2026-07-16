"use client";

import { Check, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  protocols,
  sensorTypes,
  type SensorItem,
  type SensorStatus,
} from "./sensor-data";

type SensorDrawerProps = {
  open: boolean;
  sensor: SensorItem | null;
  onClose: () => void;
  onSave: (sensor: SensorItem) => void;
};

const locations = [
  {
    building: "อาคารผลิต A",
    department: "แผนก SMT",
    productionLine: "SMT Line 1",
    machines: ["SMT Printer 01", "Reflow Oven 01", "Conveyor 01"],
  },
  {
    building: "อาคารผลิต A",
    department: "แผนก SMT",
    productionLine: "SMT Line 2",
    machines: ["SMT Printer 02", "Reflow Oven 02", "Conveyor 02"],
  },
  {
    building: "อาคารผลิต A",
    department: "แผนกประกอบ",
    productionLine: "Assembly Line 1",
    machines: ["Pneumatic Station 01", "Assembly Cell 01"],
  },
  {
    building: "อาคารผลิต A",
    department: "แผนกทดสอบ",
    productionLine: "Testing Line 1",
    machines: ["Test Bench 01", "Test Bench 02"],
  },
  {
    building: "อาคารผลิต B",
    department: "แผนกบรรจุภัณฑ์",
    productionLine: "Packaging Line 1",
    machines: ["Packaging Room 01", "Sealing Machine 01"],
  },
  {
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบ Chiller",
    machines: ["Chiller 01", "Chiller Pump 01"],
  },
  {
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบ Air Compressor",
    machines: ["Air Compressor 01", "Air Dryer 01"],
  },
  {
    building: "อาคารสาธารณูปโภค",
    department: "ระบบสาธารณูปโภค",
    productionLine: "ระบบบำบัดน้ำ",
    machines: ["Water Treatment Pump 01", "Water Tank 01"],
  },
];

export default function SensorDrawer({
  open,
  sensor,
  onClose,
  onSave,
}: SensorDrawerProps) {
  const firstLocation = locations[0];

  const [code, setCode] = useState(sensor?.code ?? "");
  const [name, setName] = useState(sensor?.name ?? "");
  const [type, setType] = useState(sensor?.type ?? "Power Meter");
  const [unit, setUnit] = useState(sensor?.unit ?? "kWh");
  const [protocol, setProtocol] = useState(
    sensor?.protocol ?? "Modbus TCP",
  );
  const [building, setBuilding] = useState(
    sensor?.building ?? firstLocation.building,
  );
  const [department, setDepartment] = useState(
    sensor?.department ?? firstLocation.department,
  );
  const [productionLine, setProductionLine] = useState(
    sensor?.productionLine ?? firstLocation.productionLine,
  );
  const [machine, setMachine] = useState(
    sensor?.machine ?? firstLocation.machines[0],
  );
  const [status, setStatus] = useState<SensorStatus>(
    sensor?.status ?? "ONLINE",
  );
  const [description, setDescription] = useState(
    sensor?.description ?? "",
  );

  const availableLocations = useMemo(
    () => locations.filter((item) => item.building === building),
    [building],
  );

  const availableDepartments = useMemo(
    () =>
      Array.from(
        new Set(availableLocations.map((item) => item.department)),
      ),
    [availableLocations],
  );

  const availableLines = useMemo(
    () =>
      availableLocations.filter(
        (item) => item.department === department,
      ),
    [availableLocations, department],
  );

  const selectedLocation =
    availableLines.find(
      (item) => item.productionLine === productionLine,
    ) ?? availableLines[0];

  if (!open) return null;

  function handleBuildingChange(value: string) {
    const next = locations.find((item) => item.building === value);
    if (!next) return;

    setBuilding(next.building);
    setDepartment(next.department);
    setProductionLine(next.productionLine);
    setMachine(next.machines[0]);
  }

  function handleDepartmentChange(value: string) {
    const next = locations.find(
      (item) => item.building === building && item.department === value,
    );
    if (!next) return;

    setDepartment(value);
    setProductionLine(next.productionLine);
    setMachine(next.machines[0]);
  }

  function handleLineChange(value: string) {
    const next = availableLines.find(
      (item) => item.productionLine === value,
    );
    if (!next) return;

    setProductionLine(value);
    setMachine(next.machines[0]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({
      id: sensor?.id ?? `sensor-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      unit: unit.trim(),
      protocol,
      building,
      department,
      productionLine,
      machine,
      status,
      lastValue: sensor?.lastValue ?? "-",
      lastUpdated: sensor?.lastUpdated ?? "ยังไม่เคยเชื่อมต่อ",
      description: description.trim(),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[540px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
        <div className="flex h-[74px] items-center justify-between border-b border-[#e5e9ee] px-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#263247]">
              {sensor ? "แก้ไขเซนเซอร์" : "เพิ่มเซนเซอร์"}
            </h2>
            <p className="mt-1 text-[8px] text-[#929ca9]">
              Frontend preview — ยังไม่บันทึกลงฐานข้อมูล
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#718091] hover:bg-[#eef2f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="รหัสเซนเซอร์ *">
              <input
                required
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                placeholder="เช่น SEN-0010"
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8 uppercase"
              />
            </Field>

            <Field label="สถานะ">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as SensorStatus)
                }
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              >
                <option value="ONLINE">เชื่อมต่อ</option>
                <option value="OFFLINE">ออฟไลน์</option>
                <option value="MAINTENANCE">บำรุงรักษา</option>
                <option value="FAULT">ผิดปกติ</option>
              </select>
            </Field>
          </div>

          <Field label="ชื่อเซนเซอร์ *">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="กรอกชื่อเซนเซอร์"
              className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="ประเภท *">
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              >
                {sensorTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="หน่วย *">
              <input
                required
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                placeholder="เช่น kWh"
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              />
            </Field>

            <Field label="Protocol">
              <select
                value={protocol}
                onChange={(event) => setProtocol(event.target.value)}
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              >
                {protocols.map((item) => (
                  <option key={item}>{item}</option>
                ))}
                <option>BACnet</option>
              </select>
            </Field>
          </div>

          <Field label="อาคาร *">
            <select
              value={building}
              onChange={(event) =>
                handleBuildingChange(event.target.value)
              }
              className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            >
              {Array.from(new Set(locations.map((item) => item.building))).map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="แผนก *">
              <select
                value={department}
                onChange={(event) =>
                  handleDepartmentChange(event.target.value)
                }
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              >
                {availableDepartments.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="สายการผลิต / ระบบ *">
              <select
                value={productionLine}
                onChange={(event) => handleLineChange(event.target.value)}
                className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
              >
                {availableLines.map((item) => (
                  <option key={item.productionLine}>
                    {item.productionLine}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="เครื่องจักร / จุดตรวจ *">
            <select
              value={machine}
              onChange={(event) => setMachine(event.target.value)}
              className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            >
              {(selectedLocation?.machines ?? []).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>

          <Field label="หมายเหตุ">
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] text-[#2e3b4f] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8 min-h-[110px] resize-none py-3"
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-[#e6eaf0] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-[11px] border border-[#dfe5eb] px-5 text-[10px] text-[#667283]"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[11px] bg-[#1f8f62] px-5 text-[10px] font-semibold text-white"
            >
              <Check className="h-4 w-4" />
              บันทึก
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium text-[#465365]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
