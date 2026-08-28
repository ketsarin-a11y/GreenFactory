"use client";

import { Check, Sparkles, X } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";

import {
  protocols,
  type MachineOption,
  type SensorItem,
  type SensorTypeOption,
} from "./sensor-data";

type Props = {
  open: boolean;
  sensor: SensorItem | null;
  machines: MachineOption[];
  sensorTypes: SensorTypeOption[];
  busy?: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<void>;
};

function toDateInput(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function SensorDrawer({
  open,
  sensor,
  machines,
  sensorTypes,
  busy = false,
  onClose,
  onSave,
}: Props) {
  /*
   * เพิ่มใหม่:
   * - ไม่เลือกเครื่องจักรให้อัตโนมัติ
   * - ไม่เลือก Sensor Type ให้อัตโนมัติ
   *
   * แก้ไข:
   * - ใช้ค่าของ Sensor เดิม
   */
  const [machineId, setMachineId] = useState(
    sensor ? String(sensor.machine.id) : "",
  );

  const [sensorTypeId, setSensorTypeId] = useState(
    sensor ? String(sensor.type.id) : "",
  );

  const [code, setCode] = useState(sensor?.code ?? "");
  const [name, setName] = useState(sensor?.name ?? "");
  const [serialNumber, setSerialNumber] = useState(
    sensor?.serialNumber ?? "",
  );
  const [manufacturer, setManufacturer] = useState(
    sensor?.manufacturer ?? "",
  );

  const [protocol, setProtocol] = useState(
    sensor?.protocol ?? "Modbus TCP",
  );

  const [connectionAddress, setConnectionAddress] = useState(
    sensor?.connectionAddress ?? "",
  );

  const [dataTopic, setDataTopic] = useState(
    sensor?.dataTopic ?? "",
  );

  const [
    samplingIntervalSeconds,
    setSamplingIntervalSeconds,
  ] = useState(
    sensor?.samplingIntervalSeconds?.toString() ?? "60",
  );

  const [installationDate, setInstallationDate] = useState(
    toDateInput(sensor?.installationDate),
  );

  const [lastCalibrationDate, setLastCalibrationDate] = useState(
    toDateInput(sensor?.lastCalibrationDate),
  );

  const [nextCalibrationDate, setNextCalibrationDate] = useState(
    toDateInput(sensor?.nextCalibrationDate),
  );

  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    sensor?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  );

  const selectedMachine = useMemo(() => {
    if (!machineId) {
      return null;
    }

    return (
      machines.find(
        (item) => item.id === Number(machineId),
      ) ?? null
    );
  }, [machines, machineId]);

  if (!open) {
    return null;
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const parsedMachineId = Number(machineId);
    const parsedSensorTypeId = Number(sensorTypeId);

    if (
      !parsedMachineId ||
      !parsedSensorTypeId ||
      !code.trim() ||
      !name.trim()
    ) {
      return;
    }

    await onSave({
      machineId: parsedMachineId,
      sensorTypeId: parsedSensorTypeId,

      sensorCode: code.trim().toUpperCase(),
      sensorName: name.trim(),

      serialNumber: serialNumber.trim(),
      manufacturer: manufacturer.trim(),

      protocol,

      connectionAddress: connectionAddress.trim(),
      dataTopic: dataTopic.trim(),

      samplingIntervalSeconds,

      installationDate,
      lastCalibrationDate,
      nextCalibrationDate,

      status,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดหน้าต่าง"
        className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[3px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[720px] overflow-y-auto bg-[#f7f9f8] shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
        {/* HEADER */}
        <div className="sticky top-0 z-10 border-b border-[#e5e9ee] bg-white/95 px-7 py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />

                Sensor Registry
              </div>

              <h2 className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#182334]">
                {sensor
                  ? "แก้ไขเซนเซอร์"
                  : "เพิ่มเซนเซอร์ใหม่"}
              </h2>

              <p className="mt-2 text-[13px] leading-6 text-[#7f8997]">
                เลือกเครื่องจักรจริงของบริษัท
                และเลือกประเภทจาก Master Data ของ Platform
                Admin
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="ปิด"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e9ee] text-[#718091] transition hover:bg-[#eef2f5]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={submit}
          className="space-y-5 p-7"
        >
          {/* LOCATION + SENSOR TYPE */}
          <Card title="ตำแหน่งและประเภท">
            <Field label="เครื่องจักร *">
              <select
                required
                value={machineId}
                onChange={(event) =>
                  setMachineId(event.target.value)
                }
                className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition focus:border-[#4d9c7a]"
              >
                <option value="">
                  เลือกเครื่องจักร
                </option>

                {machines.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </Field>

            {selectedMachine && (
              <div className="mt-3 rounded-[13px] border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-[10px] leading-5 text-emerald-800">
                {selectedMachine.factory.name}
                {" → "}
                {selectedMachine.building.name}
                {" → "}
                {selectedMachine.department.name}
                {" → "}
                {selectedMachine.productionLine.name}
              </div>
            )}

            <div className="mt-4">
              <Field label="ประเภทเซนเซอร์จาก Master Data *">
                <select
                  required
                  value={sensorTypeId}
                  onChange={(event) =>
                    setSensorTypeId(
                      event.target.value,
                    )
                  }
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition focus:border-[#4d9c7a]"
                >
                  <option value="">
                    เลือกประเภทเซนเซอร์
                  </option>

                  {sensorTypes.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          {/* SENSOR INFORMATION */}
          <Card title="ข้อมูลเซนเซอร์">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="รหัสเซนเซอร์ *">
                <input
                  required
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="SEN-0001"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>

              <Field label="ชื่อเซนเซอร์ *">
                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Power Meter SMT-01"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>

              <Field label="Serial Number">
                <input
                  value={serialNumber}
                  onChange={(event) =>
                    setSerialNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Serial Number"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>

              <Field label="ผู้ผลิต">
                <input
                  value={manufacturer}
                  onChange={(event) =>
                    setManufacturer(
                      event.target.value,
                    )
                  }
                  placeholder="ชื่อผู้ผลิต"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>
            </div>
          </Card>

          {/* CONNECTION */}
          <Card title="การเชื่อมต่อ">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Protocol">
                <select
                  value={protocol}
                  onChange={(event) =>
                    setProtocol(event.target.value)
                  }
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition focus:border-[#4d9c7a]"
                >
                  {protocols.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Sampling Interval (วินาที)">
                <input
                  type="number"
                  min="1"
                  value={
                    samplingIntervalSeconds
                  }
                  onChange={(event) =>
                    setSamplingIntervalSeconds(
                      event.target.value,
                    )
                  }
                  placeholder="60"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>

              <Field label="Connection Address">
                <input
                  value={connectionAddress}
                  onChange={(event) =>
                    setConnectionAddress(
                      event.target.value,
                    )
                  }
                  placeholder="192.168.1.100:502"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>

              <Field label="Data Topic">
                <input
                  value={dataTopic}
                  onChange={(event) =>
                    setDataTopic(event.target.value)
                  }
                  placeholder="factory/smt/machine01/power"
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition placeholder:text-[#a5aeba] focus:border-[#4d9c7a]"
                />
              </Field>
            </div>
          </Card>

          {/* INSTALLATION */}
          <Card title="การติดตั้งและสอบเทียบ">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                label="วันที่ติดตั้ง"
                value={installationDate}
                onChange={setInstallationDate}
              />

              <DateField
                label="สอบเทียบล่าสุด"
                value={lastCalibrationDate}
                onChange={
                  setLastCalibrationDate
                }
              />

              <DateField
                label="สอบเทียบครั้งถัดไป"
                value={nextCalibrationDate}
                onChange={
                  setNextCalibrationDate
                }
              />

              <Field label="สถานะ Registry">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as
                        | "ACTIVE"
                        | "INACTIVE",
                    )
                  }
                  className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition focus:border-[#4d9c7a]"
                >
                  <option value="ACTIVE">
                    เปิดใช้งาน
                  </option>

                  <option value="INACTIVE">
                    ปิดใช้งาน
                  </option>
                </select>
              </Field>
            </div>
          </Card>

          {/* ACTIONS */}
          <div className="sticky bottom-0 -mx-7 flex justify-end gap-3 border-t border-[#e6eaf0] bg-white/95 px-7 py-5 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="min-h-[46px] rounded-[11px] border border-[#dfe5eb] bg-white px-5 text-[11px] font-medium text-[#667283] transition hover:bg-[#f7f9fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={
                busy ||
                !machineId ||
                !sensorTypeId ||
                !code.trim() ||
                !name.trim()
              }
              className="inline-flex min-h-[46px] items-center gap-2 rounded-[11px] bg-[#1f8f62] px-6 text-[11px] font-semibold text-white transition hover:bg-[#197a54] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" />

              {busy
                ? "กำลังบันทึก..."
                : sensor
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มเซนเซอร์"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-[#e2e7eb] bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-semibold text-[#263247]">
        {title}
      </h3>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-[#465365]">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[52px] w-full rounded-[13px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[12px] text-[#263247] outline-none transition focus:border-[#4d9c7a]"
      />
    </Field>
  );
}