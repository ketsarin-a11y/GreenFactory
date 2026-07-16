"use client";

import {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Factory,
  FileDown,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Status = "ACTIVE" | "INACTIVE";
type Tab = "DEPARTMENT" | "LINE";
type DrawerMode =
  | "ADD_DEPARTMENT"
  | "EDIT_DEPARTMENT"
  | "ADD_LINE"
  | "EDIT_LINE";

type ProductionLine = {
  id: string;
  name: string;
  code: string;
  status: Status;
};

type Department = {
  id: string;
  name: string;
  code: string;
  status: Status;
  lines: ProductionLine[];
};

type Building = {
  id: string;
  name: string;
  code: string;
  departments: Department[];
};

type DepartmentRow = Department & {
  buildingId: string;
  buildingName: string;
};

type LineRow = ProductionLine & {
  buildingId: string;
  buildingName: string;
  departmentId: string;
  departmentName: string;
};

const PAGE_SIZE = 8;

const initialBuildings: Building[] = [
  {
    id: "building-a",
    name: "อาคารผลิต A",
    code: "BLD-A",
    departments: [
      {
        id: "dept-smt",
        name: "แผนก SMT",
        code: "SMT",
        status: "ACTIVE",
        lines: [
          {
            id: "line-smt-1",
            name: "SMT Line 1",
            code: "SMT-L01",
            status: "ACTIVE",
          },
          {
            id: "line-smt-2",
            name: "SMT Line 2",
            code: "SMT-L02",
            status: "ACTIVE",
          },
        ],
      },
      {
        id: "dept-assembly",
        name: "แผนกประกอบ",
        code: "ASM",
        status: "ACTIVE",
        lines: [
          {
            id: "line-assembly-1",
            name: "Assembly Line 1",
            code: "ASM-L01",
            status: "ACTIVE",
          },
        ],
      },
      {
        id: "dept-testing",
        name: "แผนกทดสอบ",
        code: "TEST",
        status: "ACTIVE",
        lines: [
          {
            id: "line-testing-1",
            name: "Testing Line 1",
            code: "TEST-L01",
            status: "ACTIVE",
          },
        ],
      },
    ],
  },
  {
    id: "building-b",
    name: "อาคารผลิต B",
    code: "BLD-B",
    departments: [
      {
        id: "dept-packaging",
        name: "แผนกบรรจุภัณฑ์",
        code: "PACK",
        status: "ACTIVE",
        lines: [
          {
            id: "line-packaging-1",
            name: "Packaging Line 1",
            code: "PACK-L01",
            status: "ACTIVE",
          },
        ],
      },
      {
        id: "dept-quality",
        name: "แผนกควบคุมคุณภาพ",
        code: "QC",
        status: "ACTIVE",
        lines: [],
      },
    ],
  },
  {
    id: "building-utility",
    name: "อาคารสาธารณูปโภค",
    code: "UTL-01",
    departments: [
      {
        id: "dept-utility",
        name: "ระบบสาธารณูปโภค",
        code: "UTILITY",
        status: "ACTIVE",
        lines: [
          {
            id: "line-chiller",
            name: "ระบบ Chiller",
            code: "UTL-CHILLER",
            status: "ACTIVE",
          },
          {
            id: "line-air",
            name: "ระบบ Air Compressor",
            code: "UTL-AIR",
            status: "ACTIVE",
          },
          {
            id: "line-water",
            name: "ระบบบำบัดน้ำ",
            code: "UTL-WATER",
            status: "ACTIVE",
          },
        ],
      },
    ],
  },
];

function StatusBadge({ status }: { status: Status }) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-medium ${
        active
          ? "bg-[#e8f7ef] text-[#24734b]"
          : "bg-[#f1f3f5] text-[#747f8d]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#2ca56c]" : "bg-[#9aa3ae]"
        }`}
      />
      {active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
    </span>
  );
}

function StructureTree({
  buildings,
  selectedBuildingId,
  selectedDepartmentId,
  onSelectBuilding,
  onSelectDepartment,
}: {
  buildings: Building[];
  selectedBuildingId: string;
  selectedDepartmentId: string | null;
  onSelectBuilding: (buildingId: string) => void;
  onSelectDepartment: (buildingId: string, departmentId: string) => void;
}) {
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(
    buildings.map((building) => building.id),
  );

  return (
    <div className="space-y-2">
      {buildings.map((building) => {
        const expanded = expandedBuildings.includes(building.id);
        const buildingSelected =
          selectedBuildingId === building.id && selectedDepartmentId === null;

        return (
          <div key={building.id}>
            <div
              className={`flex items-center gap-2 rounded-[11px] border px-2 py-2 transition ${
                buildingSelected
                  ? "border-[#4ea783]/30 bg-[#edf8f3]"
                  : "border-transparent hover:bg-[#f8faf9]"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedBuildings((current) =>
                    current.includes(building.id)
                      ? current.filter((id) => id !== building.id)
                      : [...current, building.id],
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-[8px] text-[#7e8997] hover:bg-white"
                aria-label={expanded ? "ย่ออาคาร" : "ขยายอาคาร"}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectBuilding(building.id)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#e8f5ed] text-[#2d8057]">
                  <Building2 className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9px] font-semibold text-[#3d4a5d]">
                    {building.name}
                  </span>
                  <span className="mt-0.5 block text-[7px] text-[#98a1ac]">
                    {building.departments.length} แผนก
                  </span>
                </span>
              </button>
            </div>

            {expanded && (
              <div className="ml-[23px] mt-1 border-l border-[#e1e6eb] pl-3">
                <div className="space-y-1">
                  {building.departments.map((department) => {
                    const selected =
                      selectedDepartmentId === department.id &&
                      selectedBuildingId === building.id;

                    return (
                      <button
                        key={department.id}
                        type="button"
                        onClick={() =>
                          onSelectDepartment(building.id, department.id)
                        }
                        className={`flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition ${
                          selected
                            ? "border-[#4ea783]/30 bg-[#edf8f3]"
                            : "border-transparent hover:bg-[#fafbfc]"
                        }`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#f0ebff] text-[#7158ad]">
                          <Layers3 className="h-3.5 w-3.5" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[9px] font-medium text-[#4b586a]">
                            {department.name}
                          </span>
                          <span className="mt-0.5 block text-[7px] text-[#9ba4af]">
                            {department.lines.length} สายการผลิต
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DataDrawer({
  open,
  mode,
  buildings,
  selectedBuildingId,
  department,
  line,
  onClose,
  onSaveDepartment,
  onSaveLine,
}: {
  open: boolean;
  mode: DrawerMode;
  buildings: Building[];
  selectedBuildingId: string;
  department: DepartmentRow | null;
  line: LineRow | null;
  onClose: () => void;
  onSaveDepartment: (value: {
    name: string;
    code: string;
    status: Status;
  }) => void;
  onSaveLine: (value: {
    name: string;
    code: string;
    departmentId: string;
    status: Status;
  }) => void;
}) {
  const isDepartment =
    mode === "ADD_DEPARTMENT" || mode === "EDIT_DEPARTMENT";

  const [name, setName] = useState(
    isDepartment ? department?.name ?? "" : line?.name ?? "",
  );
  const [code, setCode] = useState(
    isDepartment ? department?.code ?? "" : line?.code ?? "",
  );
  const [status, setStatus] = useState<Status>(
    isDepartment
      ? department?.status ?? "ACTIVE"
      : line?.status ?? "ACTIVE",
  );

  const fallbackDepartment =
    buildings.find((building) => building.id === selectedBuildingId)
      ?.departments[0]?.id ??
    buildings[0]?.departments[0]?.id ??
    "";

  const [departmentId, setDepartmentId] = useState(
    line?.departmentId ?? department?.id ?? fallbackDepartment,
  );

  if (!open) return null;

  const title =
    mode === "ADD_DEPARTMENT"
      ? "เพิ่มแผนก"
      : mode === "EDIT_DEPARTMENT"
        ? "แก้ไขแผนก"
        : mode === "ADD_LINE"
          ? "เพิ่มสายการผลิต"
          : "แก้ไขสายการผลิต";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDepartment) {
      onSaveDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status,
      });
      return;
    }

    onSaveLine({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      departmentId,
      status,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิดหน้าต่าง"
        className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[500px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
        <div className="flex h-[74px] items-center justify-between border-b border-[#e5e9ee] px-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#263247]">
              {title}
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

        <form onSubmit={submit} className="p-6">
          <label className="block">
            <span className="text-[10px] font-medium text-[#465365]">
              ชื่อ *
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-medium text-[#465365]">
              รหัส *
            </span>
            <input
              required
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] uppercase outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            />
          </label>

          {!isDepartment && (
            <label className="mt-5 block">
              <span className="text-[10px] font-medium text-[#465365]">
                แผนก *
              </span>
              <select
                required
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px]"
              >
                {buildings.flatMap((building) =>
                  building.departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {building.name} · {item.name}
                    </option>
                  )),
                )}
              </select>
            </label>
          )}

          <label className="mt-5 block">
            <span className="text-[10px] font-medium text-[#465365]">
              สถานะ
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px]"
            >
              <option value="ACTIVE">ใช้งานอยู่</option>
              <option value="INACTIVE">ปิดใช้งาน</option>
            </select>
          </label>

          <div className="mt-8 flex justify-end gap-3 border-t border-[#e6eaf0] pt-5">
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

export default function FactoryStructureClient() {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [activeTab, setActiveTab] = useState<Tab>("DEPARTMENT");
  const [selectedBuildingId, setSelectedBuildingId] =
    useState("building-a");
  const [selectedDepartmentId, setSelectedDepartmentId] =
    useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentRow | null>(null);
  const [editingLine, setEditingLine] = useState<LineRow | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const departments = useMemo<DepartmentRow[]>(
    () =>
      buildings.flatMap((building) =>
        building.departments.map((department) => ({
          ...department,
          buildingId: building.id,
          buildingName: building.name,
        })),
      ),
    [buildings],
  );

  const lines = useMemo<LineRow[]>(
    () =>
      buildings.flatMap((building) =>
        building.departments.flatMap((department) =>
          department.lines.map((line) => ({
            ...line,
            buildingId: building.id,
            buildingName: building.name,
            departmentId: department.id,
            departmentName: department.name,
          })),
        ),
      ),
    [buildings],
  );

  const selectedBuilding =
    buildings.find((building) => building.id === selectedBuildingId) ??
    buildings[0];

  const selectedDepartment =
    departments.find((item) => item.id === selectedDepartmentId) ?? null;

  const filteredDepartments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !keyword ||
        department.name.toLowerCase().includes(keyword) ||
        department.code.toLowerCase().includes(keyword) ||
        department.buildingName.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || department.status === statusFilter;

      const matchesSelection = selectedDepartmentId
        ? department.id === selectedDepartmentId
        : department.buildingId === selectedBuildingId;

      return matchesSearch && matchesStatus && matchesSelection;
    });
  }, [
    departments,
    search,
    statusFilter,
    selectedBuildingId,
    selectedDepartmentId,
  ]);

  const filteredLines = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return lines.filter((line) => {
      const matchesSearch =
        !keyword ||
        line.name.toLowerCase().includes(keyword) ||
        line.code.toLowerCase().includes(keyword) ||
        line.departmentName.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || line.status === statusFilter;

      const matchesSelection = selectedDepartmentId
        ? line.departmentId === selectedDepartmentId
        : line.buildingId === selectedBuildingId;

      return matchesSearch && matchesStatus && matchesSelection;
    });
  }, [
    lines,
    search,
    statusFilter,
    selectedBuildingId,
    selectedDepartmentId,
  ]);

  const currentItems =
    activeTab === "DEPARTMENT" ? filteredDepartments : filteredLines;

  const totalPages = Math.max(1, Math.ceil(currentItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = currentItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function selectBuilding(buildingId: string) {
    setSelectedBuildingId(buildingId);
    setSelectedDepartmentId(null);
    setPage(1);
  }

  function selectDepartment(buildingId: string, departmentId: string) {
    setSelectedBuildingId(buildingId);
    setSelectedDepartmentId(departmentId);
    setPage(1);
  }

  function saveDepartment(value: {
    name: string;
    code: string;
    status: Status;
  }) {
    if (drawerMode === "EDIT_DEPARTMENT" && editingDepartment) {
      setBuildings((current) =>
        current.map((building) => ({
          ...building,
          departments: building.departments.map((department) =>
            department.id === editingDepartment.id
              ? { ...department, ...value }
              : department,
          ),
        })),
      );
    } else {
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        name: value.name,
        code: value.code,
        status: value.status,
        lines: [],
      };

      setBuildings((current) =>
        current.map((building) =>
          building.id === selectedBuildingId
            ? {
                ...building,
                departments: [...building.departments, newDepartment],
              }
            : building,
        ),
      );

      setSelectedDepartmentId(newDepartment.id);
    }

    setDrawerMode(null);
    setEditingDepartment(null);
  }

  function saveLine(value: {
    name: string;
    code: string;
    departmentId: string;
    status: Status;
  }) {
    if (drawerMode === "EDIT_LINE" && editingLine) {
      setBuildings((current) =>
        current.map((building) => ({
          ...building,
          departments: building.departments.map((department) => {
            const remainingLines = department.lines.filter(
              (line) => line.id !== editingLine.id,
            );

            if (department.id === value.departmentId) {
              return {
                ...department,
                lines: [
                  ...remainingLines,
                  {
                    id: editingLine.id,
                    name: value.name,
                    code: value.code,
                    status: value.status,
                  },
                ],
              };
            }

            return {
              ...department,
              lines: remainingLines,
            };
          }),
        })),
      );
    } else {
      const newLine: ProductionLine = {
        id: `line-${Date.now()}`,
        name: value.name,
        code: value.code,
        status: value.status,
      };

      setBuildings((current) =>
        current.map((building) => ({
          ...building,
          departments: building.departments.map((department) =>
            department.id === value.departmentId
              ? {
                  ...department,
                  lines: [...department.lines, newLine],
                }
              : department,
          ),
        })),
      );
    }

    setDrawerMode(null);
    setEditingLine(null);
  }

  function deleteDepartment(department: DepartmentRow) {
    const warning =
      department.lines.length > 0
        ? `แผนก "${department.name}" มีสายการผลิต ${department.lines.length} สาย หากลบ สายการผลิตภายในจะถูกลบด้วย ยืนยันหรือไม่?`
        : `ยืนยันการลบแผนก "${department.name}" หรือไม่?`;

    if (!window.confirm(warning)) return;

    setBuildings((current) =>
      current.map((building) => ({
        ...building,
        departments: building.departments.filter(
          (item) => item.id !== department.id,
        ),
      })),
    );

    if (selectedDepartmentId === department.id) {
      setSelectedDepartmentId(null);
    }

    setMenuId(null);
  }

  function deleteLine(line: LineRow) {
    if (!window.confirm(`ยืนยันการลบสายการผลิต "${line.name}" หรือไม่?`)) {
      return;
    }

    setBuildings((current) =>
      current.map((building) => ({
        ...building,
        departments: building.departments.map((department) => ({
          ...department,
          lines: department.lines.filter((item) => item.id !== line.id),
        })),
      })),
    );

    setMenuId(null);
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1650px]">
        <header>
          <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#182334] sm:text-[32px]">
            แผนกและสายการผลิต
          </h1>
          <p className="mt-2 text-[10px] text-[#7f8997]">
            จัดการโครงสร้างแผนกและสายการผลิตภายในโรงงาน
          </p>
        </header>

        <div className="mt-6 flex gap-6 border-b border-[#e3e7ec]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("DEPARTMENT");
              setPage(1);
            }}
            className={`border-b-2 px-1 pb-3 text-[10px] font-semibold ${
              activeTab === "DEPARTMENT"
                ? "border-[#1f8f62] text-[#1f8f62]"
                : "border-transparent text-[#7e8997]"
            }`}
          >
            แผนก
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("LINE");
              setPage(1);
            }}
            className={`border-b-2 px-1 pb-3 text-[10px] font-semibold ${
              activeTab === "LINE"
                ? "border-[#1f8f62] text-[#1f8f62]"
                : "border-transparent text-[#7e8997]"
            }`}
          >
            สายการผลิต
          </button>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <article className="rounded-[18px] border border-[#e0e5ea] bg-white p-4 shadow-[0_8px_28px_rgba(28,43,61,0.035)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[12px] font-semibold text-[#354257]">
                    โครงสร้างแผนก
                  </h2>
                  <p className="mt-1 text-[8px] text-[#929ca9]">
                    เลือกอาคารหรือแผนกเพื่อกรองรายการ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingDepartment(null);
                    setDrawerMode("ADD_DEPARTMENT");
                  }}
                  className="inline-flex min-h-[36px] items-center gap-2 rounded-[9px] bg-[#1f8f62] px-3 text-[9px] font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มแผนก
                </button>
              </div>

              <div className="mt-4 flex h-[40px] items-center gap-3 rounded-[10px] border border-[#dfe5eb] bg-[#f9fafb] px-3">
                <Search className="h-3.5 w-3.5 text-[#8b96a4]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหา..."
                  className="min-w-0 flex-1 bg-transparent text-[9px] outline-none"
                />
              </div>

              <div className="mt-4 max-h-[520px] overflow-y-auto pr-1">
                <StructureTree
                  buildings={buildings}
                  selectedBuildingId={selectedBuildingId}
                  selectedDepartmentId={selectedDepartmentId}
                  onSelectBuilding={selectBuilding}
                  onSelectDepartment={selectDepartment}
                />
              </div>
            </article>

            <article className="rounded-[18px] border border-[#e0e5ea] bg-white p-4 shadow-[0_8px_28px_rgba(28,43,61,0.035)]">
              <h3 className="text-[11px] font-semibold text-[#354257]">
                สรุปภาพรวม
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[12px] bg-[#f7faf8] p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e8f5ed] text-[#2d8057]">
                    <Layers3 className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-[18px] font-semibold text-[#283548]">
                    {departments.length}
                  </p>
                  <p className="mt-1 text-[8px] text-[#939da9]">
                    แผนกทั้งหมด
                  </p>
                </div>

                <div className="rounded-[12px] bg-[#f7faf8] p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e8f5ed] text-[#2d8057]">
                    <Factory className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-[18px] font-semibold text-[#283548]">
                    {lines.length}
                  </p>
                  <p className="mt-1 text-[8px] text-[#939da9]">
                    สายการผลิต
                  </p>
                </div>
              </div>
            </article>
          </aside>

          <article className="overflow-hidden rounded-[18px] border border-[#e0e5ea] bg-white shadow-[0_8px_28px_rgba(28,43,61,0.035)]">
            <div className="flex flex-col gap-3 border-b border-[#e7ebef] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[12px] font-semibold text-[#354257]">
                  {activeTab === "DEPARTMENT"
                    ? "รายการแผนกทั้งหมด"
                    : "รายการสายการผลิตทั้งหมด"}
                </h2>
                <p className="mt-1 text-[8px] text-[#929ca9]">
                  {selectedDepartment?.name ??
                    selectedBuilding?.name ??
                    "ทั้งหมด"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[38px] rounded-[9px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="ACTIVE">ใช้งานอยู่</option>
                  <option value="INACTIVE">ปิดใช้งาน</option>
                </select>

                <button
                  type="button"
                  className="inline-flex h-[38px] items-center gap-2 rounded-[9px] border border-[#dfe5eb] bg-white px-3 text-[9px] font-medium text-[#596677]"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  ส่งออก
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "DEPARTMENT") {
                      setEditingDepartment(null);
                      setDrawerMode("ADD_DEPARTMENT");
                    } else {
                      setEditingLine(null);
                      setDrawerMode("ADD_LINE");
                    }
                  }}
                  className="inline-flex h-[38px] items-center gap-2 rounded-[9px] bg-[#1f8f62] px-3 text-[9px] font-semibold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {activeTab === "DEPARTMENT"
                    ? "เพิ่มแผนก"
                    : "เพิ่มสายการผลิต"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "DEPARTMENT" ? (
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e8ecf0] bg-[#fafbfc] text-left">
                      <th className="w-[70px] px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        ลำดับ
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        ชื่อแผนก
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        รหัส
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        อาคาร
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        สายการผลิต
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        สถานะ
                      </th>
                      <th className="w-[90px] px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {(visibleItems as DepartmentRow[]).map(
                      (department, index) => (
                        <tr
                          key={department.id}
                          className="border-b border-[#eef1f3] last:border-0 hover:bg-[#fbfcfd]"
                        >
                          <td className="px-4 py-3 text-[9px] text-[#7f8a98]">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#f0ebff] text-[#7158ad]">
                                <Layers3 className="h-3.5 w-3.5" />
                              </span>
                              <span className="text-[9px] font-semibold text-[#435065]">
                                {department.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                            {department.code}
                          </td>

                          <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                            {department.buildingName}
                          </td>

                          <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                            {department.lines.length}
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge status={department.status} />
                          </td>

                          <td className="relative px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setMenuId((current) =>
                                  current === department.id
                                    ? null
                                    : department.id,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d8896] hover:bg-[#eef2f5]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {menuId === department.id && (
                              <div className="absolute right-4 top-[44px] z-20 w-[160px] rounded-[11px] border border-[#dfe5eb] bg-white p-1.5 shadow-[0_16px_42px_rgba(26,38,57,0.14)]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingDepartment(department);
                                    setDrawerMode("EDIT_DEPARTMENT");
                                    setMenuId(null);
                                  }}
                                  className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#566274] hover:bg-[#f4f6f8]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  แก้ไข
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteDepartment(department)}
                                  className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#b14848] hover:bg-[#fff1f1]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  ลบแผนก
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#e8ecf0] bg-[#fafbfc] text-left">
                      <th className="w-[70px] px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        ลำดับ
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        ชื่อสายการผลิต
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        รหัส
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        แผนก
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        อาคาร
                      </th>
                      <th className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">
                        สถานะ
                      </th>
                      <th className="w-[90px] px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {(visibleItems as LineRow[]).map((line, index) => (
                      <tr
                        key={line.id}
                        className="border-b border-[#eef1f3] last:border-0 hover:bg-[#fbfcfd]"
                      >
                        <td className="px-4 py-3 text-[9px] text-[#7f8a98]">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e8f5ed] text-[#2d8057]">
                              <Factory className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[9px] font-semibold text-[#435065]">
                              {line.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                          {line.code}
                        </td>

                        <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                          {line.departmentName}
                        </td>

                        <td className="px-4 py-3 text-[9px] text-[#707c8b]">
                          {line.buildingName}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={line.status} />
                        </td>

                        <td className="relative px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuId((current) =>
                                current === line.id ? null : line.id,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d8896] hover:bg-[#eef2f5]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {menuId === line.id && (
                            <div className="absolute right-4 top-[44px] z-20 w-[160px] rounded-[11px] border border-[#dfe5eb] bg-white p-1.5 shadow-[0_16px_42px_rgba(26,38,57,0.14)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLine(line);
                                  setDrawerMode("EDIT_LINE");
                                  setMenuId(null);
                                }}
                                className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#566274] hover:bg-[#f4f6f8]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                แก้ไข
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteLine(line)}
                                className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#b14848] hover:bg-[#fff1f1]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                ลบสายการผลิต
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {visibleItems.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <Layers3 className="h-8 w-8 text-[#9aa4af]" />
                <p className="mt-3 text-[10px] font-semibold text-[#566274]">
                  ไม่พบข้อมูล
                </p>
              </div>
            )}

            <footer className="flex flex-col gap-3 border-t border-[#e8ecf0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[8px] text-[#929ca9]">
                แสดง {visibleItems.length} จาก {currentItems.length} รายการ
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="min-w-[64px] text-center text-[8px] text-[#6f7b8a]">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </footer>
          </article>
        </div>
      </section>

      <DataDrawer
        key={`${drawerMode}-${editingDepartment?.id ?? ""}-${editingLine?.id ?? ""}`}
        open={drawerMode !== null}
        mode={drawerMode ?? "ADD_DEPARTMENT"}
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        department={editingDepartment}
        line={editingLine}
        onClose={() => {
          setDrawerMode(null);
          setEditingDepartment(null);
          setEditingLine(null);
        }}
        onSaveDepartment={saveDepartment}
        onSaveLine={saveLine}
      />
    </>
  );
}