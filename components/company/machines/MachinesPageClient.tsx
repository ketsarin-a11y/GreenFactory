"use client";

import {
  Activity,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Edit3,
  Factory,
  Filter,
  Gauge,
  Layers3,
  Plus,
  QrCode,
  Search,
  Settings2,
  Trash2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type MachineStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";
type MachineType =
  | "Boiler"
  | "Compressor"
  | "Chiller"
  | "CNC Machine"
  | "Storage"
  | "Waste Station"
  | "Generator"
  | "Water Pump";

type ResourceType = {
  id: string;
  label: string;
  unit: string;
  icon: typeof Zap;
};

type MachineItem = {
  id: number;
  machineCode: string;
  machineName: string;
  department: string;
  productionLine: string;
  machineType: MachineType;
  status: MachineStatus;
  installedDate: string;
  manufacturer?: string;
  model?: string;
  resources: ResourceType[];
};

type MachineForm = {
  machineCode: string;
  machineName: string;
  department: string;
  productionLine: string;
  machineType: MachineType;
  status: MachineStatus;
  installedDate: string;
  manufacturer: string;
  model: string;
};

const PAGE_SIZE = 8;

const resourceOptions: ResourceType[] = [
  {
    id: "electricity",
    label: "ไฟฟ้า",
    unit: "kWh",
    icon: Zap,
  },
  {
    id: "water",
    label: "น้ำประปา",
    unit: "m³",
    icon: Gauge,
  },
  {
    id: "fuel",
    label: "น้ำมันเชื้อเพลิง",
    unit: "ลิตร",
    icon: Activity,
  },
  {
    id: "steam",
    label: "ไอน้ำ",
    unit: "kg",
    icon: Factory,
  },
];

const initialMachines: MachineItem[] = [
  {
    id: 1,
    machineCode: "BOI-001",
    machineName: "Boiler-01",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 1",
    machineType: "Boiler",
    status: "ACTIVE",
    installedDate: "01/01/2565",
    manufacturer: "Thermax",
    model: "THX-500",
    resources: resourceOptions,
  },
  {
    id: 2,
    machineCode: "CMP-001",
    machineName: "Compressor-01",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 1",
    machineType: "Compressor",
    status: "ACTIVE",
    installedDate: "11/03/2565",
    manufacturer: "Atlas Copco",
    model: "GA-45",
    resources: [resourceOptions[0]],
  },
  {
    id: 3,
    machineCode: "CHL-001",
    machineName: "Chiller-01",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 2",
    machineType: "Chiller",
    status: "ACTIVE",
    installedDate: "08/07/2565",
    manufacturer: "Daikin",
    model: "EWAD-TZ",
    resources: [resourceOptions[0], resourceOptions[1]],
  },
  {
    id: 4,
    machineCode: "CNC-001",
    machineName: "CNC Machine-01",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 2",
    machineType: "CNC Machine",
    status: "ACTIVE",
    installedDate: "21/09/2565",
    manufacturer: "Mazak",
    model: "VCN-530C",
    resources: [resourceOptions[0]],
  },
  {
    id: 5,
    machineCode: "STG-001",
    machineName: "Copper Storage",
    department: "คลังวัตถุดิบ",
    productionLine: "-",
    machineType: "Storage",
    status: "ACTIVE",
    installedDate: "03/02/2566",
    manufacturer: "-",
    model: "-",
    resources: [resourceOptions[0]],
  },
  {
    id: 6,
    machineCode: "WST-001",
    machineName: "Waste Collection Point",
    department: "ฝ่ายสิ่งแวดล้อม",
    productionLine: "-",
    machineType: "Waste Station",
    status: "MAINTENANCE",
    installedDate: "16/05/2566",
    manufacturer: "-",
    model: "-",
    resources: [resourceOptions[0], resourceOptions[1]],
  },
  {
    id: 7,
    machineCode: "GEN-001",
    machineName: "Generator-01",
    department: "ฝ่ายซ่อมบำรุง",
    productionLine: "-",
    machineType: "Generator",
    status: "ACTIVE",
    installedDate: "09/08/2566",
    manufacturer: "Cummins",
    model: "C250D5",
    resources: [resourceOptions[2]],
  },
  {
    id: 8,
    machineCode: "PMP-001",
    machineName: "Water Pump-01",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 3",
    machineType: "Water Pump",
    status: "ACTIVE",
    installedDate: "13/11/2566",
    manufacturer: "Grundfos",
    model: "CR-45",
    resources: [resourceOptions[0], resourceOptions[1]],
  },
  {
    id: 9,
    machineCode: "CMP-002",
    machineName: "Compressor-02",
    department: "ฝ่ายผลิต",
    productionLine: "สายการผลิตที่ 3",
    machineType: "Compressor",
    status: "INACTIVE",
    installedDate: "24/01/2567",
    manufacturer: "Hitachi",
    model: "OSP-37",
    resources: [resourceOptions[0]],
  },
];

const emptyForm: MachineForm = {
  machineCode: "",
  machineName: "",
  department: "ฝ่ายผลิต",
  productionLine: "สายการผลิตที่ 1",
  machineType: "Boiler",
  status: "ACTIVE",
  installedDate: "",
  manufacturer: "",
  model: "",
};

function getStatusLabel(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "ใช้งานอยู่";
    case "MAINTENANCE":
      return "ระงับการใช้งาน";
    case "INACTIVE":
      return "ไม่ถูกใช้งาน";
  }
}

function getStatusClass(status: MachineStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-[#e8f6ed] text-[#347555]";
    case "MAINTENANCE":
      return "bg-[#fff3df] text-[#b97922]";
    case "INACTIVE":
      return "bg-[#fff0ef] text-[#bc514d]";
  }
}

function getMachineIcon(type: MachineType) {
  switch (type) {
    case "Boiler":
      return Factory;
    case "Compressor":
      return Gauge;
    case "Chiller":
      return Activity;
    case "CNC Machine":
      return Settings2;
    case "Storage":
      return Boxes;
    case "Waste Station":
      return Layers3;
    case "Generator":
      return Zap;
    case "Water Pump":
      return Gauge;
  }
}

export default function MachinesPageClient() {
  const [machines, setMachines] = useState<MachineItem[]>(initialMachines);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedMachineId, setSelectedMachineId] = useState<number>(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"MACHINES" | "CHECKPOINTS">(
    "MACHINES",
  );
  const [form, setForm] = useState<MachineForm>(emptyForm);

  const departments = useMemo(
    () => Array.from(new Set(machines.map((machine) => machine.department))),
    [machines],
  );

  const productionLines = useMemo(
    () =>
      Array.from(
        new Set(
          machines
            .map((machine) => machine.productionLine)
            .filter((line) => line !== "-"),
        ),
      ),
    [machines],
  );

  const filteredMachines = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return machines.filter((machine) => {
      const matchesSearch =
        !keyword ||
        machine.machineName.toLowerCase().includes(keyword) ||
        machine.machineCode.toLowerCase().includes(keyword) ||
        machine.machineType.toLowerCase().includes(keyword);

      const matchesDepartment =
        departmentFilter === "ALL" ||
        machine.department === departmentFilter;

      const matchesLine =
        lineFilter === "ALL" || machine.productionLine === lineFilter;

      const matchesStatus =
        statusFilter === "ALL" || machine.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLine &&
        matchesStatus
      );
    });
  }, [machines, search, departmentFilter, lineFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMachines.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);

  const visibleMachines = filteredMachines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectedMachine =
    machines.find((machine) => machine.id === selectedMachineId) ??
    machines[0];

  const activeCount = machines.filter(
    (machine) => machine.status === "ACTIVE",
  ).length;

  const maintenanceCount = machines.filter(
    (machine) => machine.status === "MAINTENANCE",
  ).length;

  const inactiveCount = machines.filter(
    (machine) => machine.status === "INACTIVE",
  ).length;

  function resetFilters() {
    setSearch("");
    setDepartmentFilter("ALL");
    setLineFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  }

  function handleCreateMachine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newMachine: MachineItem = {
      id: Date.now(),
      machineCode: form.machineCode.trim().toUpperCase(),
      machineName: form.machineName.trim(),
      department: form.department,
      productionLine: form.productionLine,
      machineType: form.machineType,
      status: form.status,
      installedDate: form.installedDate || "-",
      manufacturer: form.manufacturer.trim() || "-",
      model: form.model.trim() || "-",
      resources: [resourceOptions[0]],
    };

    setMachines((current) => [newMachine, ...current]);
    setSelectedMachineId(newMachine.id);
    setForm(emptyForm);
    setDrawerOpen(false);
    setPage(1);
  }

  function deleteMachine(machineId: number) {
    setMachines((current) =>
      current.filter((machine) => machine.id !== machineId),
    );

    if (selectedMachineId === machineId) {
      const nextMachine = machines.find(
        (machine) => machine.id !== machineId,
      );
      if (nextMachine) setSelectedMachineId(nextMachine.id);
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1680px]">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.035em] text-[#26362d] sm:text-[25px]">
                เครื่องจักรและจุดตรวจ
              </h1>
              <CircleAlert
                className="h-4 w-4 text-[#8b9b91]"
                strokeWidth={1.7}
              />
            </div>

            <p className="mt-1.5 text-[10px] text-[#839087]">
              จัดการเครื่องจักรและจุดตรวจภายในโรงงาน เพื่อให้ Operator
              ใช้บันทึกข้อมูล
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-[40px] w-fit items-center justify-center gap-2 rounded-md bg-[#4f8363] px-4 text-[10px] font-medium text-white transition hover:bg-[#426f54]"
          >
            <Plus className="h-4 w-4" />
            เพิ่มเครื่องจักร
          </button>
        </header>

        <div className="mt-5 flex items-center gap-2 border-b border-[#dfe8e2]">
          <button
            type="button"
            onClick={() => setActiveTab("MACHINES")}
            className={`flex min-h-[40px] items-center gap-2 border-b-2 px-3 text-[10px] font-medium transition ${
              activeTab === "MACHINES"
                ? "border-[#6f9e7d] text-[#4e755c]"
                : "border-transparent text-[#8a978f] hover:text-[#5f6f65]"
            }`}
          >
            <Factory className="h-4 w-4" />
            เครื่องจักร
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CHECKPOINTS")}
            className={`flex min-h-[40px] items-center gap-2 border-b-2 px-3 text-[10px] font-medium transition ${
              activeTab === "CHECKPOINTS"
                ? "border-[#6f9e7d] text-[#4e755c]"
                : "border-transparent text-[#8a978f] hover:text-[#5f6f65]"
            }`}
          >
            <QrCode className="h-4 w-4" />
            จุดตรวจ
          </button>
        </div>

        {activeTab === "CHECKPOINTS" ? (
          <div className="mt-5 rounded-lg border border-[#dfe8e2] bg-white px-6 py-16 text-center">
            <QrCode
              className="mx-auto h-9 w-9 text-[#82a28e]"
              strokeWidth={1.5}
            />
            <p className="mt-4 text-[13px] font-semibold text-[#405147]">
              หน้าจุดตรวจ
            </p>
            <p className="mt-2 text-[9px] text-[#89968e]">
              ส่วนนี้สามารถเชื่อมกับข้อมูลจุดตรวจของแต่ละเครื่องจักรภายหลัง
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "เครื่องจักรทั้งหมด",
                  value: machines.length,
                  detail: "รายการ",
                  icon: Factory,
                  iconClass: "bg-[#edf7f0] text-[#5f9170]",
                },
                {
                  label: "ใช้งานอยู่",
                  value: activeCount,
                  detail: "รายการ",
                  icon: CheckCircle2,
                  iconClass: "bg-[#edf7f0] text-[#4d8b64]",
                },
                {
                  label: "ระงับการใช้งาน",
                  value: maintenanceCount,
                  detail: "รายการ",
                  icon: Wrench,
                  iconClass: "bg-[#fff5e8] text-[#d28b35]",
                },
                {
                  label: "ไม่ถูกใช้งาน",
                  value: inactiveCount,
                  detail: "รายการ",
                  icon: CircleAlert,
                  iconClass: "bg-[#fff0ef] text-[#dd625d]",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.label}
                    className="rounded-lg border border-[#e3ebe6] bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${item.iconClass}`}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                      </span>

                      <div>
                        <p className="text-[9px] font-medium text-[#53635a]">
                          {item.label}
                        </p>
                        <p className="mt-1 flex items-end gap-1.5">
                          <span className="text-[24px] font-semibold leading-none text-[#27382f]">
                            {item.value.toLocaleString("th-TH")}
                          </span>
                          <span className="pb-0.5 text-[8px] text-[#919d96]">
                            {item.detail}
                          </span>
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
              <article className="min-w-0 overflow-hidden rounded-lg border border-[#e0e8e3] bg-white">
                <div className="border-b border-[#e7ede9] p-3">
                  <div className="flex flex-col gap-2.5 xl:flex-row">
                    <div className="flex h-[40px] min-w-0 flex-1 items-center gap-2.5 rounded-md border border-[#dfe7e2] bg-white px-3 focus-within:border-[#8caf96]">
                      <Search
                        className="h-4 w-4 text-[#89968f]"
                        strokeWidth={1.7}
                      />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="ค้นหาเครื่องจักร..."
                        className="min-w-0 flex-1 bg-transparent text-[9px] text-[#405147] outline-none placeholder:text-[#9da8a1]"
                      />
                    </div>

                    <select
                      value={departmentFilter}
                      onChange={(event) => {
                        setDepartmentFilter(event.target.value);
                        setPage(1);
                      }}
                      className="h-[40px] rounded-md border border-[#dfe7e2] bg-white px-3 text-[9px] text-[#65736b] outline-none"
                    >
                      <option value="ALL">แผนกทั้งหมด</option>
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>

                    <select
                      value={lineFilter}
                      onChange={(event) => {
                        setLineFilter(event.target.value);
                        setPage(1);
                      }}
                      className="h-[40px] rounded-md border border-[#dfe7e2] bg-white px-3 text-[9px] text-[#65736b] outline-none"
                    >
                      <option value="ALL">สายการผลิตทั้งหมด</option>
                      {productionLines.map((line) => (
                        <option key={line} value={line}>
                          {line}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                      }}
                      className="h-[40px] rounded-md border border-[#dfe7e2] bg-white px-3 text-[9px] text-[#65736b] outline-none"
                    >
                      <option value="ALL">สถานะทั้งหมด</option>
                      <option value="ACTIVE">ใช้งานอยู่</option>
                      <option value="MAINTENANCE">ระงับการใช้งาน</option>
                      <option value="INACTIVE">ไม่ถูกใช้งาน</option>
                    </select>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex h-[40px] items-center justify-center gap-2 rounded-md border border-[#dfe7e2] px-3 text-[9px] text-[#66746c] hover:bg-[#f5f8f6]"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      ตัวกรอง
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#e5ebe7] bg-[#fbfcfb] text-left">
                        <th className="w-[54px] px-4 py-3 text-[8px] font-medium text-[#819087]">
                          ลำดับ
                        </th>
                        <th className="px-3 py-3 text-[8px] font-medium text-[#819087]">
                          ชื่อเครื่องจักร
                        </th>
                        <th className="px-3 py-3 text-[8px] font-medium text-[#819087]">
                          แผนก
                        </th>
                        <th className="px-3 py-3 text-[8px] font-medium text-[#819087]">
                          สายการผลิต
                        </th>
                        <th className="px-3 py-3 text-[8px] font-medium text-[#819087]">
                          ประเภทเครื่องจักร
                        </th>
                        <th className="px-3 py-3 text-[8px] font-medium text-[#819087]">
                          สถานะ
                        </th>
                        <th className="w-[110px] px-3 py-3 text-[8px] font-medium text-[#819087]">
                          จัดการ
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleMachines.map((machine, index) => {
                        const MachineIcon = getMachineIcon(machine.machineType);
                        const selected = selectedMachineId === machine.id;

                        return (
                          <tr
                            key={machine.id}
                            onClick={() => setSelectedMachineId(machine.id)}
                            className={`cursor-pointer border-b border-[#edf1ee] transition last:border-0 ${
                              selected
                                ? "bg-[#f1f7f3]"
                                : "hover:bg-[#fafcfb]"
                            }`}
                          >
                            <td className="px-4 py-3 text-center text-[8px] text-[#7f8c84]">
                              {(currentPage - 1) * PAGE_SIZE + index + 1}
                            </td>

                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#edf6f0] text-[#5f8f6f]">
                                  <MachineIcon
                                    className="h-4 w-4"
                                    strokeWidth={1.7}
                                  />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-[9px] font-semibold text-[#35463c]">
                                    {machine.machineName}
                                  </p>
                                  <p className="mt-0.5 text-[7px] text-[#8d9992]">
                                    {machine.machineCode}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <p className="text-[8px] text-[#54645b]">
                                {machine.department}
                              </p>
                            </td>

                            <td className="px-3 py-3 text-[8px] text-[#617068]">
                              {machine.productionLine}
                            </td>

                            <td className="px-3 py-3 text-[8px] text-[#617068]">
                              {machine.machineType}
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[7px] font-medium ${getStatusClass(
                                  machine.status,
                                )}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {getStatusLabel(machine.status)}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="QR Code"
                                  onClick={(event) => event.stopPropagation()}
                                  className="flex h-7 w-7 items-center justify-center rounded text-[#66766c] hover:bg-[#edf4ef] hover:text-[#4d7d5e]"
                                >
                                  <QrCode className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  title="แก้ไข"
                                  onClick={(event) => event.stopPropagation()}
                                  className="flex h-7 w-7 items-center justify-center rounded text-[#4f8b68] hover:bg-[#edf6f0]"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  title="ลบ"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    deleteMachine(machine.id);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded text-[#df6862] hover:bg-[#fff1f0]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {visibleMachines.length === 0 && (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <Factory
                      className="h-8 w-8 text-[#9aa69f]"
                      strokeWidth={1.5}
                    />
                    <p className="mt-3 text-[11px] font-medium text-[#526159]">
                      ไม่พบเครื่องจักร
                    </p>
                    <p className="mt-1 text-[8px] text-[#939f98]">
                      ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                    </p>
                  </div>
                )}

                <footer className="flex flex-col gap-3 border-t border-[#e6ece8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[8px] text-[#89968f]">
                    แสดง {visibleMachines.length} จาก{" "}
                    {filteredMachines.length} รายการ
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((value) => Math.max(1, value - 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#dfe7e2] text-[#718078] hover:bg-[#f3f7f4] disabled:opacity-35"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <span className="min-w-[60px] text-center text-[8px] text-[#718078]">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((value) =>
                          Math.min(totalPages, value + 1),
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#dfe7e2] text-[#718078] hover:bg-[#f3f7f4] disabled:opacity-35"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </footer>
              </article>

              <aside className="h-fit rounded-lg border border-[#e0e8e3] bg-white">
                <div className="flex items-center justify-between border-b border-[#e6ece8] px-4 py-3">
                  <h2 className="text-[11px] font-semibold text-[#35463c]">
                    รายละเอียดเครื่องจักร
                  </h2>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded text-[#829087] hover:bg-[#f2f6f3]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#edf6f0] text-[#5f8f6f]">
                      <Factory className="h-[18px] w-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-[12px] font-semibold text-[#35463c]">
                          {selectedMachine.machineName}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-medium ${getStatusClass(
                            selectedMachine.status,
                          )}`}
                        >
                          {getStatusLabel(selectedMachine.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-[8px] text-[#8b9891]">
                        รหัสเครื่องจักร: {selectedMachine.machineCode}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 border-b border-[#e8edea] pb-4">
                    {[
                      ["แผนก", selectedMachine.department],
                      ["สายการผลิต", selectedMachine.productionLine],
                      ["ประเภทเครื่องจักร", selectedMachine.machineType],
                      ["ยี่ห้อ / รุ่น", `${selectedMachine.manufacturer} / ${selectedMachine.model}`],
                      ["วันที่ติดตั้ง", selectedMachine.installedDate],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="grid grid-cols-[105px_minmax(0,1fr)] gap-3"
                      >
                        <dt className="text-[8px] text-[#8c9891]">{label}</dt>
                        <dd className="text-[8px] font-medium text-[#56655c]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4">
                    <h4 className="text-[9px] font-semibold text-[#44554b]">
                      ทรัพยากรที่อนุญาตให้บันทึก
                    </h4>
                    <p className="mt-1 text-[7px] leading-4 text-[#909c95]">
                      Operator สามารถบันทึกทรัพยากรต่อไปนี้ได้
                    </p>

                    <div className="mt-3 space-y-2">
                      {selectedMachine.resources.map((resource) => {
                        const ResourceIcon = resource.icon;

                        return (
                          <div
                            key={resource.id}
                            className="flex items-center gap-2.5 rounded-md border border-[#e7ede9] px-3 py-2"
                          >
                            <ResourceIcon
                              className="h-3.5 w-3.5 text-[#5d906d]"
                              strokeWidth={1.7}
                            />
                            <span className="flex-1 text-[8px] text-[#56655c]">
                              {resource.label} ({resource.unit})
                            </span>
                            <span className="inline-flex items-center gap-1 text-[7px] font-medium text-[#4f8b68]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#55a773]" />
                              ใช้งานอยู่
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-md border border-[#dce7df] text-[8px] font-medium text-[#4f7d5f] hover:bg-[#f2f7f3]"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      จัดการทรัพยากร
                    </button>

                    <button
                      type="button"
                      className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-md border border-[#dce7df] text-[8px] font-medium text-[#4f7d5f] hover:bg-[#f2f7f3]"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      จัดการจุดตรวจ
                    </button>
                  </div>

                  <div className="mt-5 border-t border-[#e8edea] pt-4">
                    <h4 className="text-[9px] font-semibold text-[#44554b]">
                      QR Code สำหรับจุดนี้
                    </h4>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="grid h-[78px] w-[78px] shrink-0 grid-cols-5 gap-0.5 rounded border border-[#dfe7e2] bg-white p-2">
                        {Array.from({ length: 25 }).map((_, index) => (
                          <span
                            key={index}
                            className={
                              [
                                0, 1, 2, 5, 7, 10, 11, 12, 14, 17, 19, 20,
                                21, 22, 24,
                              ].includes(index)
                                ? "bg-[#23352b]"
                                : "bg-white"
                            }
                          />
                        ))}
                      </div>

                      <div>
                        <p className="text-[8px] text-[#8b9891]">
                          รหัสจุด:{" "}
                          <span className="font-medium text-[#506057]">
                            {selectedMachine.machineCode}
                          </span>
                        </p>
                        <p className="mt-1 text-[9px] font-medium text-[#44554b]">
                          {selectedMachine.machineName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-3 inline-flex min-h-[34px] w-full items-center justify-center gap-2 rounded-md border border-[#dce7df] text-[8px] font-medium text-[#4f7d5f] hover:bg-[#f2f7f3]"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      ดาวน์โหลด QR Code
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>

      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="ปิดหน้าต่างเพิ่มเครื่องจักร"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[70] bg-[#243229]/30"
          />

          <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[520px] overflow-y-auto bg-white shadow-[-18px_0_50px_rgba(31,52,39,0.14)]">
            <div className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#e2e9e4] bg-white px-6">
              <div>
                <h2 className="text-[15px] font-semibold text-[#304138]">
                  เพิ่มเครื่องจักร
                </h2>
                <p className="mt-1 text-[8px] text-[#8c9891]">
                  เพิ่มข้อมูลเครื่องจักรภายในโรงงาน
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#76857c] hover:bg-[#f1f5f2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    รหัสเครื่องจักร *
                  </span>
                  <input
                    required
                    value={form.machineCode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        machineCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="เช่น BOI-002"
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  />
                </label>

                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    สถานะ *
                  </span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as MachineStatus,
                      }))
                    }
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  >
                    <option value="ACTIVE">ใช้งานอยู่</option>
                    <option value="MAINTENANCE">ระงับการใช้งาน</option>
                    <option value="INACTIVE">ไม่ถูกใช้งาน</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-[9px] font-medium text-[#516159]">
                  ชื่อเครื่องจักร *
                </span>
                <input
                  required
                  value={form.machineName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      machineName: event.target.value,
                    }))
                  }
                  placeholder="กรอกชื่อเครื่องจักร"
                  className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                />
              </label>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    แผนก *
                  </span>
                  <select
                    value={form.department}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  >
                    <option>ฝ่ายผลิต</option>
                    <option>ฝ่ายซ่อมบำรุง</option>
                    <option>คลังวัตถุดิบ</option>
                    <option>ฝ่ายสิ่งแวดล้อม</option>
                  </select>
                </label>

                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    สายการผลิต *
                  </span>
                  <select
                    value={form.productionLine}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        productionLine: event.target.value,
                      }))
                    }
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  >
                    <option>สายการผลิตที่ 1</option>
                    <option>สายการผลิตที่ 2</option>
                    <option>สายการผลิตที่ 3</option>
                    <option>-</option>
                  </select>
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    ประเภทเครื่องจักร *
                  </span>
                  <select
                    value={form.machineType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        machineType: event.target.value as MachineType,
                      }))
                    }
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  >
                    <option>Boiler</option>
                    <option>Compressor</option>
                    <option>Chiller</option>
                    <option>CNC Machine</option>
                    <option>Storage</option>
                    <option>Waste Station</option>
                    <option>Generator</option>
                    <option>Water Pump</option>
                  </select>
                </label>

                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    วันที่ติดตั้ง
                  </span>
                  <input
                    type="date"
                    value={form.installedDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        installedDate: event.target.value,
                      }))
                    }
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    ยี่ห้อ
                  </span>
                  <input
                    value={form.manufacturer}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        manufacturer: event.target.value,
                      }))
                    }
                    placeholder="เช่น Daikin"
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  />
                </label>

                <label>
                  <span className="text-[9px] font-medium text-[#516159]">
                    รุ่น
                  </span>
                  <input
                    value={form.model}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        model: event.target.value,
                      }))
                    }
                    placeholder="กรอกรุ่นเครื่องจักร"
                    className="mt-2 h-[44px] w-full rounded-md border border-[#dfe7e2] bg-[#fbfcfb] px-3 text-[10px] outline-none focus:border-[#83aa91]"
                  />
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-[#e5ebe7] pt-5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-h-[40px] rounded-md border border-[#dfe7e2] px-5 text-[9px] font-medium text-[#66746c] hover:bg-[#f4f7f5]"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#5f8f6f] px-5 text-[9px] font-medium text-white hover:bg-[#4d7b5d]"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มเครื่องจักร
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}