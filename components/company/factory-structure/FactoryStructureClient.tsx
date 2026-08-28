"use client";

import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Factory,
  Layers3,
  MoreHorizontal,
  Network,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Status = "ACTIVE" | "INACTIVE";
type EntityType = "BUILDING" | "DEPARTMENT" | "LINE";

type Line = {
  lineId: number;
  lineCode: string;
  lineName: string;
  description: string | null;
  status: Status;
  _count: { machines: number; checkpoints: number };
};

type Department = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description: string | null;
  status: Status;
  _count: { productionLines: number; users: number };
  productionLines: Line[];
};

type Building = {
  buildingId: number;
  buildingCode: string;
  buildingName: string;
  buildingType: string | null;
  floorCount: number | null;
  description: string | null;
  status: Status;
  _count: { departments: number };
  departments: Department[];
};

type FactoryItem = {
  factoryId: number;
  factoryCode: string;
  factoryName: string;
  status: Status;
  buildings: Building[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: FactoryItem[];
  summary?: {
    factories: number;
    buildings: number;
    departments: number;
    lines: number;
    machines: number;
  };
};

type SelectedNode =
  | { type: "FACTORY"; factory: FactoryItem }
  | { type: "BUILDING"; factory: FactoryItem; building: Building }
  | {
      type: "DEPARTMENT";
      factory: FactoryItem;
      building: Building;
      department: Department;
    }
  | {
      type: "LINE";
      factory: FactoryItem;
      building: Building;
      department: Department;
      line: Line;
    };

type DrawerState =
  | null
  | {
      mode: "CREATE" | "EDIT";
      type: EntityType;
      factoryId?: number;
      buildingId?: number;
      departmentId?: number;
      entity?: Building | Department | Line;
    };

export default function FactoryStructureClient() {
  const [factories, setFactories] = useState<FactoryItem[]>([]);
  const [summary, setSummary] = useState({
    factories: 0,
    buildings: 0,
    departments: 0,
    lines: 0,
    machines: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedKey, setSelectedKey] = useState("");
  const [expandedFactories, setExpandedFactories] = useState<number[]>([]);
  const [expandedBuildings, setExpandedBuildings] = useState<number[]>([]);
  const [expandedDepartments, setExpandedDepartments] = useState<number[]>([]);

  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/company/structure", {
        cache: "no-store",
        credentials: "include",
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "ไม่สามารถโหลดโครงสร้างโรงงานได้",
        );
      }

      const next = result.data ?? [];
      setFactories(next);
      setSummary(
        result.summary ?? {
          factories: 0,
          buildings: 0,
          departments: 0,
          lines: 0,
          machines: 0,
        },
      );

      setExpandedFactories((current) =>
        current.length ? current : next.map((item) => item.factoryId),
      );

      setExpandedBuildings((current) =>
        current.length
          ? current
          : next.flatMap((factory) =>
              factory.buildings.map((item) => item.buildingId),
            ),
      );

      setSelectedKey((current) =>
        current || (next[0] ? `factory:${next[0].factoryId}` : ""),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดโครงสร้างโรงงานได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedNode = useMemo<SelectedNode | null>(() => {
    if (!selectedKey) return null;

    const [kind, rawId] = selectedKey.split(":");
    const id = Number(rawId);

    for (const factory of factories) {
      if (kind === "factory" && factory.factoryId === id) {
        return { type: "FACTORY", factory };
      }

      for (const building of factory.buildings) {
        if (kind === "building" && building.buildingId === id) {
          return { type: "BUILDING", factory, building };
        }

        for (const department of building.departments) {
          if (
            kind === "department" &&
            department.departmentId === id
          ) {
            return {
              type: "DEPARTMENT",
              factory,
              building,
              department,
            };
          }

          for (const line of department.productionLines) {
            if (kind === "line" && line.lineId === id) {
              return {
                type: "LINE",
                factory,
                building,
                department,
                line,
              };
            }
          }
        }
      }
    }

    return null;
  }, [factories, selectedKey]);

  const filteredFactories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword && statusFilter === "ALL") return factories;

    return factories
      .map((factory) => ({
        ...factory,
        buildings: factory.buildings
          .map((building) => ({
            ...building,
            departments: building.departments
              .map((department) => ({
                ...department,
                productionLines: department.productionLines.filter(
                  (line) =>
                    (statusFilter === "ALL" ||
                      line.status === statusFilter) &&
                    (!keyword ||
                      `${line.lineName} ${line.lineCode} ${department.departmentName} ${building.buildingName} ${factory.factoryName}`
                        .toLowerCase()
                        .includes(keyword)),
                ),
              }))
              .filter(
                (department) =>
                  (statusFilter === "ALL" ||
                    department.status === statusFilter) &&
                  (!keyword ||
                    `${department.departmentName} ${department.departmentCode} ${building.buildingName} ${factory.factoryName}`
                      .toLowerCase()
                      .includes(keyword) ||
                    department.productionLines.length > 0),
              ),
          }))
          .filter(
            (building) =>
              (statusFilter === "ALL" ||
                building.status === statusFilter) &&
              (!keyword ||
                `${building.buildingName} ${building.buildingCode} ${factory.factoryName}`
                  .toLowerCase()
                  .includes(keyword) ||
                building.departments.length > 0),
          ),
      }))
      .filter(
        (factory) =>
          !keyword ||
          `${factory.factoryName} ${factory.factoryCode}`
            .toLowerCase()
            .includes(keyword) ||
          factory.buildings.length > 0,
      );
  }, [factories, search, statusFilter]);

  async function mutate(
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    payload?: unknown,
  ) {
    if (busy) return false;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const response = await fetch(url, {
        method,
        cache: "no-store",
        credentials: "include",
        headers:
          payload === undefined
            ? undefined
            : { "Content-Type": "application/json" },
        body:
          payload === undefined ? undefined : JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "ดำเนินการไม่สำเร็จ");
      }

      setSuccess(result.message ?? "บันทึกเรียบร้อยแล้ว");
      await load();
      window.setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ดำเนินการไม่สำเร็จ",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  function openCreate(type: EntityType) {
    if (!selectedNode) return;

    if (type === "BUILDING") {
      setDrawer({
        mode: "CREATE",
        type,
        factoryId: selectedNode.factory.factoryId,
      });
      return;
    }

    if (type === "DEPARTMENT") {
      const buildingId =
        selectedNode.type === "BUILDING"
          ? selectedNode.building.buildingId
          : selectedNode.type === "DEPARTMENT" ||
              selectedNode.type === "LINE"
            ? selectedNode.building.buildingId
            : selectedNode.factory.buildings[0]?.buildingId;

      if (!buildingId) {
        setError("กรุณาสร้างอาคารก่อนเพิ่มแผนก");
        return;
      }

      setDrawer({
        mode: "CREATE",
        type,
        factoryId: selectedNode.factory.factoryId,
        buildingId,
      });
      return;
    }

    const departmentId =
      selectedNode.type === "DEPARTMENT"
        ? selectedNode.department.departmentId
        : selectedNode.type === "LINE"
          ? selectedNode.department.departmentId
          : selectedNode.type === "BUILDING"
            ? selectedNode.building.departments[0]?.departmentId
            : selectedNode.factory.buildings[0]?.departments[0]
                ?.departmentId;

    if (!departmentId) {
      setError("กรุณาสร้างแผนกก่อนเพิ่มสายการผลิต");
      return;
    }

    setDrawer({
      mode: "CREATE",
      type,
      factoryId: selectedNode.factory.factoryId,
      departmentId,
    });
  }

  function openEdit(node: SelectedNode) {
    if (node.type === "FACTORY") return;

    if (node.type === "BUILDING") {
      setDrawer({
        mode: "EDIT",
        type: "BUILDING",
        factoryId: node.factory.factoryId,
        buildingId: node.building.buildingId,
        entity: node.building,
      });
    } else if (node.type === "DEPARTMENT") {
      setDrawer({
        mode: "EDIT",
        type: "DEPARTMENT",
        factoryId: node.factory.factoryId,
        buildingId: node.building.buildingId,
        entity: node.department,
      });
    } else {
      setDrawer({
        mode: "EDIT",
        type: "LINE",
        factoryId: node.factory.factoryId,
        buildingId: node.building.buildingId,
        departmentId: node.department.departmentId,
        entity: node.line,
      });
    }

    setMenuOpen(false);
  }

  async function removeNode(node: SelectedNode) {
    if (node.type === "FACTORY") return;

    const label =
      node.type === "BUILDING"
        ? node.building.buildingName
        : node.type === "DEPARTMENT"
          ? node.department.departmentName
          : node.line.lineName;

    if (
      !window.confirm(
        `ยืนยันการลบหรือปิดใช้งาน "${label}" ใช่หรือไม่?`,
      )
    ) {
      return;
    }

    const url =
      node.type === "BUILDING"
        ? `/api/company/structure/buildings/${node.building.buildingId}`
        : node.type === "DEPARTMENT"
          ? `/api/company/structure/departments/${node.department.departmentId}`
          : `/api/company/structure/production-lines/${node.line.lineId}`;

    const ok = await mutate(url, "DELETE");

    if (ok) {
      setSelectedKey(`factory:${node.factory.factoryId}`);
      setMenuOpen(false);
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1680px] pb-12">
        <header className="mb-6 rounded-[26px] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_55px_rgba(15,23,42,0.045)] sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                <Network className="h-3.5 w-3.5 text-violet-600" />
                Organization Blueprint
              </div>

              <h1 className="text-[38px] font-black tracking-[-0.05em] text-slate-950 sm:text-[44px]">
                โครงสร้างโรงงาน
              </h1>

              <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-slate-500">
                จัดลำดับ โรงงาน → อาคาร → แผนก → สายการผลิต ให้ทุกข้อมูลอ้างอิงโครงสร้างเดียวกัน
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
            <ActionButton
              label="เพิ่มอาคาร"
              icon={<Building2 className="h-4 w-4" />}
              onClick={() => openCreate("BUILDING")}
              secondary
            />
            <ActionButton
              label="เพิ่มแผนก"
              icon={<Layers3 className="h-4 w-4" />}
              onClick={() => openCreate("DEPARTMENT")}
              secondary
            />
            <ActionButton
              label="เพิ่มสายการผลิต"
              icon={<Workflow className="h-4 w-4" />}
              onClick={() => openCreate("LINE")}
            />
            </div>
          </div>
        </header>

        {(error || success) && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-[15px] border px-5 py-4 text-[14px] font-semibold ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <CircleAlert className="h-5 w-5 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            )}
            {error || success}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={<Factory className="h-5 w-5" />} value={summary.factories} label="โรงงาน" detail="Company scope" tone="emerald" />
          <StatCard icon={<Building2 className="h-5 w-5" />} value={summary.buildings} label="อาคาร" detail="Building registry" tone="blue" />
          <StatCard icon={<Layers3 className="h-5 w-5" />} value={summary.departments} label="แผนก" detail="Organization units" tone="violet" />
          <StatCard icon={<Workflow className="h-5 w-5" />} value={summary.lines} label="สายการผลิต" detail="Production lines" tone="orange" />
          <StatCard icon={<Sparkles className="h-5 w-5" />} value={summary.machines} label="เครื่องจักร" detail="Linked assets" tone="cyan" />
        </div>

        <div className="mt-5 grid gap-5 2xl:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">
                    Structure Navigator
                  </h2>
                  <p className="mt-1 text-[12px] text-slate-400">
                    เลือก node เพื่อดูและจัดการ
                  </p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
                  <Network className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4 flex h-[48px] items-center gap-3 rounded-[13px] border border-slate-200 bg-slate-50/80 px-4 transition focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.05)]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาโรงงาน อาคาร แผนก หรือ Line..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-3 h-[44px] w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-600 outline-none transition hover:border-slate-300 focus:border-violet-300"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="ACTIVE">เปิดใช้งาน</option>
                <option value="INACTIVE">ปิดใช้งาน</option>
              </select>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-3 [scrollbar-width:thin]">
              {loading ? (
                <div className="grid min-h-[360px] place-items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                </div>
              ) : (
                <StructureTree
                  factories={filteredFactories}
                  selectedKey={selectedKey}
                  setSelectedKey={setSelectedKey}
                  expandedFactories={expandedFactories}
                  setExpandedFactories={setExpandedFactories}
                  expandedBuildings={expandedBuildings}
                  setExpandedBuildings={setExpandedBuildings}
                  expandedDepartments={expandedDepartments}
                  setExpandedDepartments={setExpandedDepartments}
                />
              )}
            </div>
          </aside>

          {selectedNode ? (
            <Inspector
              node={selectedNode}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onEdit={() => openEdit(selectedNode)}
              onDelete={() => void removeNode(selectedNode)}
              onCreate={openCreate}
            />
          ) : (
            <EmptyInspector />
          )}
        </div>
      </section>

      {drawer && (
        <Drawer
          drawer={drawer}
          factories={factories}
          busy={busy}
          onClose={() => setDrawer(null)}
          onSave={async (url, method, payload) => {
            if (await mutate(url, method, payload)) setDrawer(null);
          }}
        />
      )}
    </>
  );
}

function StructureTree({
  factories,
  selectedKey,
  setSelectedKey,
  expandedFactories,
  setExpandedFactories,
  expandedBuildings,
  setExpandedBuildings,
  expandedDepartments,
  setExpandedDepartments,
}: {
  factories: FactoryItem[];
  selectedKey: string;
  setSelectedKey: (value: string) => void;
  expandedFactories: number[];
  setExpandedFactories: React.Dispatch<React.SetStateAction<number[]>>;
  expandedBuildings: number[];
  setExpandedBuildings: React.Dispatch<React.SetStateAction<number[]>>;
  expandedDepartments: number[];
  setExpandedDepartments: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const toggle = (
    id: number,
    values: number[],
    setter: React.Dispatch<React.SetStateAction<number[]>>,
  ) =>
    setter(
      values.includes(id)
        ? values.filter((value) => value !== id)
        : [...values, id],
    );

  if (!factories.length) {
    return (
      <div className="grid min-h-[340px] place-items-center px-5 text-center">
        <div>
          <Factory className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-[14px] font-bold text-slate-700">
            ไม่พบโครงสร้าง
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {factories.map((factory) => {
        const open = expandedFactories.includes(factory.factoryId);

        return (
          <div key={factory.factoryId}>
            <TreeRow
              active={selectedKey === `factory:${factory.factoryId}`}
              title={factory.factoryName}
              subtitle={`${factory.factoryCode} · ${factory.buildings.length} อาคาร`}
              icon={<Factory className="h-4 w-4" />}
              tone="emerald"
              expanded={open}
              expandable
              onToggle={() =>
                toggle(
                  factory.factoryId,
                  expandedFactories,
                  setExpandedFactories,
                )
              }
              onClick={() =>
                setSelectedKey(`factory:${factory.factoryId}`)
              }
            />

            {open && (
              <div className="ml-5 border-l border-slate-100 pl-2">
                {factory.buildings.map((building) => {
                  const buildingOpen = expandedBuildings.includes(
                    building.buildingId,
                  );

                  return (
                    <div key={building.buildingId}>
                      <TreeRow
                        active={
                          selectedKey ===
                          `building:${building.buildingId}`
                        }
                        title={building.buildingName}
                        subtitle={`${building.buildingCode} · ${building.departments.length} แผนก`}
                        icon={<Building2 className="h-4 w-4" />}
                        tone="blue"
                        status={building.status}
                        expanded={buildingOpen}
                        expandable
                        onToggle={() =>
                          toggle(
                            building.buildingId,
                            expandedBuildings,
                            setExpandedBuildings,
                          )
                        }
                        onClick={() =>
                          setSelectedKey(
                            `building:${building.buildingId}`,
                          )
                        }
                      />

                      {buildingOpen && (
                        <div className="ml-5 border-l border-slate-100 pl-2">
                          {building.departments.map((department) => {
                            const departmentOpen =
                              expandedDepartments.includes(
                                department.departmentId,
                              );

                            return (
                              <div key={department.departmentId}>
                                <TreeRow
                                  active={
                                    selectedKey ===
                                    `department:${department.departmentId}`
                                  }
                                  title={department.departmentName}
                                  subtitle={`${department.departmentCode} · ${department.productionLines.length} Line`}
                                  icon={<Layers3 className="h-4 w-4" />}
                                  tone="violet"
                                  status={department.status}
                                  expanded={departmentOpen}
                                  expandable
                                  onToggle={() =>
                                    toggle(
                                      department.departmentId,
                                      expandedDepartments,
                                      setExpandedDepartments,
                                    )
                                  }
                                  onClick={() =>
                                    setSelectedKey(
                                      `department:${department.departmentId}`,
                                    )
                                  }
                                />

                                {departmentOpen && (
                                  <div className="ml-6 border-l border-slate-100 pl-2">
                                    {department.productionLines.map(
                                      (line) => (
                                        <TreeRow
                                          key={line.lineId}
                                          active={
                                            selectedKey ===
                                            `line:${line.lineId}`
                                          }
                                          title={line.lineName}
                                          subtitle={`${line.lineCode} · ${line._count.machines} เครื่อง`}
                                          icon={
                                            <Workflow className="h-4 w-4" />
                                          }
                                          tone="orange"
                                          status={line.status}
                                          onClick={() =>
                                            setSelectedKey(
                                              `line:${line.lineId}`,
                                            )
                                          }
                                        />
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TreeRow({
  active,
  title,
  subtitle,
  icon,
  status,
  expandable = false,
  expanded = false,
  onToggle,
  onClick,
  tone = "slate",
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: ReactNode;
  status?: Status;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onClick: () => void;
  tone?: "emerald" | "blue" | "violet" | "orange" | "slate";
}) {
  const tones = {
    emerald: { active: "border-emerald-100 bg-emerald-50", icon: "bg-emerald-100 text-emerald-700" },
    blue: { active: "border-blue-100 bg-blue-50", icon: "bg-blue-100 text-blue-700" },
    violet: { active: "border-violet-100 bg-violet-50", icon: "bg-violet-100 text-violet-700" },
    orange: { active: "border-orange-100 bg-orange-50", icon: "bg-orange-100 text-orange-700" },
    slate: { active: "border-slate-200 bg-slate-50", icon: "bg-slate-100 text-slate-600" },
  } as const;
  const selectedTone = tones[tone];

  return (
    <div
      className={`my-1 flex items-center gap-1 rounded-[13px] border px-2 py-2 transition ${
        active
          ? `${selectedTone.active} shadow-sm`
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <span className="w-7" />
      )}

      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition ${
            active
              ? `${selectedTone.icon} shadow-sm`
              : selectedTone.icon
          }`}
        >
          {icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13px] font-black text-slate-700">
              {title}
            </span>
            {status === "INACTIVE" && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                OFF
              </span>
            )}
          </span>
          <span className="mt-1 block truncate text-[11px] text-slate-400">
            {subtitle}
          </span>
        </span>
      </button>
    </div>
  );
}

function Inspector({
  node,
  menuOpen,
  setMenuOpen,
  onEdit,
  onDelete,
  onCreate,
}: {
  node: SelectedNode;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreate: (type: EntityType) => void;
}) {
  const title =
    node.type === "FACTORY"
      ? node.factory.factoryName
      : node.type === "BUILDING"
        ? node.building.buildingName
        : node.type === "DEPARTMENT"
          ? node.department.departmentName
          : node.line.lineName;

  const code =
    node.type === "FACTORY"
      ? node.factory.factoryCode
      : node.type === "BUILDING"
        ? node.building.buildingCode
        : node.type === "DEPARTMENT"
          ? node.department.departmentCode
          : node.line.lineCode;

  const status =
    node.type === "FACTORY"
      ? node.factory.status
      : node.type === "BUILDING"
        ? node.building.status
        : node.type === "DEPARTMENT"
          ? node.department.status
          : node.line.status;

  const metrics =
    node.type === "FACTORY"
      ? [
          ["อาคาร", node.factory.buildings.length],
          [
            "แผนก",
            node.factory.buildings.reduce(
              (sum, item) => sum + item.departments.length,
              0,
            ),
          ],
          [
            "สายการผลิต",
            node.factory.buildings.reduce(
              (sum, item) =>
                sum +
                item.departments.reduce(
                  (total, department) =>
                    total + department.productionLines.length,
                  0,
                ),
              0,
            ),
          ],
        ]
      : node.type === "BUILDING"
        ? [
            ["แผนก", node.building.departments.length],
            [
              "สายการผลิต",
              node.building.departments.reduce(
                (sum, item) => sum + item.productionLines.length,
                0,
              ),
            ],
            ["จำนวนชั้น", node.building.floorCount ?? 0],
          ]
        : node.type === "DEPARTMENT"
          ? [
              ["สายการผลิต", node.department.productionLines.length],
              ["ผู้ใช้งาน", node.department._count.users],
              [
                "เครื่องจักร",
                node.department.productionLines.reduce(
                  (sum, item) => sum + item._count.machines,
                  0,
                ),
              ],
            ]
          : [
              ["เครื่องจักร", node.line._count.machines],
              ["Checkpoints", node.line._count.checkpoints],
              ["สถานะ", node.line.status === "ACTIVE" ? 100 : 0],
            ];

  const description =
    node.type === "FACTORY"
      ? "โรงงานเป็นขอบเขตหลักของระบบและเป็นต้นทางของอาคารภายในโรงงาน"
      : node.type === "BUILDING"
        ? node.building.description ||
          "ยังไม่ได้ระบุคำอธิบายของอาคารนี้"
        : node.type === "DEPARTMENT"
          ? node.department.description ||
            "ยังไม่ได้ระบุคำอธิบายของแผนกนี้"
          : node.line.description ||
            "ยังไม่ได้ระบุคำอธิบายของสายการผลิตนี้";

  const inspectorTone =
    node.type === "FACTORY"
      ? { header: "from-emerald-600 via-emerald-700 to-teal-800", soft: "bg-emerald-50 text-emerald-700 border-emerald-100" }
      : node.type === "BUILDING"
        ? { header: "from-blue-600 via-blue-700 to-sky-800", soft: "bg-blue-50 text-blue-700 border-blue-100" }
        : node.type === "DEPARTMENT"
          ? { header: "from-violet-600 via-violet-700 to-purple-800", soft: "bg-violet-50 text-violet-700 border-violet-100" }
          : { header: "from-orange-500 via-orange-600 to-amber-700", soft: "bg-orange-50 text-orange-700 border-orange-100" };

  return (
    <main className="space-y-5">
      <section className="overflow-visible rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
        <div className={`relative overflow-visible rounded-t-[24px] bg-gradient-to-br ${inspectorTone.header} px-6 py-6 text-white sm:px-7 sm:py-7`}>
          <div className="flex items-start gap-4">
            <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-white/15 bg-white/10">
              {node.type === "FACTORY" ? (
                <Factory className="h-6 w-6" />
              ) : node.type === "BUILDING" ? (
                <Building2 className="h-6 w-6" />
              ) : node.type === "DEPARTMENT" ? (
                <Layers3 className="h-6 w-6" />
              ) : (
                <Workflow className="h-6 w-6" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                {node.type}
              </p>
              <h2 className="mt-2 truncate text-[28px] font-bold tracking-[-0.035em]">
                {title}
              </h2>
              <p className="mt-1 text-[13px] text-white/65">{code}</p>
            </div>

            <div className="relative flex items-center gap-2">
              <StatusBadge status={status} />

              {node.type !== "FACTORY" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 z-30 w-[190px] rounded-[14px] border border-slate-200 bg-white p-2 text-slate-700 shadow-xl">
                      <button
                        type="button"
                        onClick={onEdit}
                        className="flex h-11 w-full items-center gap-2 rounded-[10px] px-3 text-left text-[13px] font-semibold hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                        แก้ไขข้อมูล
                      </button>
                      <button
                        type="button"
                        onClick={onDelete}
                        className="flex h-11 w-full items-center gap-2 rounded-[10px] px-3 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        ลบ / ปิดใช้งาน
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div
              key={String(label)}
              className={`rounded-[17px] border p-5 transition hover:-translate-y-0.5 ${inspectorTone.soft}`}
            >
              <p className="text-[30px] font-black tracking-[-0.04em] text-slate-950">
                {value}
                {label === "สถานะ" ? "%" : ""}
              </p>
              <p className="mt-2 whitespace-nowrap text-[13px] font-black opacity-75">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-slate-900">
              Next structure action
            </h3>
            <p className="mt-1 text-[13px] text-slate-400">
              เพิ่ม node ถัดไปจากตำแหน่งที่เลือก
            </p>
          </div>

          {node.type === "FACTORY" ? (
            <ActionButton
              label="เพิ่มอาคาร"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => onCreate("BUILDING")}
            />
          ) : node.type === "BUILDING" ? (
            <ActionButton
              label="เพิ่มแผนก"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => onCreate("DEPARTMENT")}
            />
          ) : node.type === "DEPARTMENT" ? (
            <ActionButton
              label="เพิ่มสายการผลิต"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => onCreate("LINE")}
            />
          ) : (
            <a
              href="/company/machines"
              className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-emerald-700 px-4 text-[13px] font-bold text-white hover:bg-emerald-800"
            >
              ไปเพิ่มเครื่องจักร
              <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="mt-5 rounded-[16px] border border-slate-100 bg-slate-50/80 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Description
          </p>
          <p className="mt-2 text-[14px] leading-7 text-slate-600">
            {description}
          </p>
        </div>
      </section>
    </main>
  );
}

function Drawer({
  drawer,
  factories,
  busy,
  onClose,
  onSave,
}: {
  drawer: Exclude<DrawerState, null>;
  factories: FactoryItem[];
  busy: boolean;
  onClose: () => void;
  onSave: (
    url: string,
    method: "POST" | "PATCH",
    payload: unknown,
  ) => Promise<void>;
}) {
  const buildingEntity =
    drawer.type === "BUILDING" && drawer.entity
      ? (drawer.entity as Building)
      : null;
  const departmentEntity =
    drawer.type === "DEPARTMENT" && drawer.entity
      ? (drawer.entity as Department)
      : null;
  const lineEntity =
    drawer.type === "LINE" && drawer.entity
      ? (drawer.entity as Line)
      : null;

  const [factoryId, setFactoryId] = useState(
    String(drawer.factoryId ?? factories[0]?.factoryId ?? ""),
  );
  const [buildingId, setBuildingId] = useState(
    String(drawer.buildingId ?? ""),
  );
  const [departmentId, setDepartmentId] = useState(
    String(drawer.departmentId ?? ""),
  );

  const [code, setCode] = useState(
    buildingEntity?.buildingCode ??
      departmentEntity?.departmentCode ??
      lineEntity?.lineCode ??
      "",
  );
  const [name, setName] = useState(
    buildingEntity?.buildingName ??
      departmentEntity?.departmentName ??
      lineEntity?.lineName ??
      "",
  );
  const [description, setDescription] = useState(
    buildingEntity?.description ??
      departmentEntity?.description ??
      lineEntity?.description ??
      "",
  );
  const [status, setStatus] = useState<Status>(
    buildingEntity?.status ??
      departmentEntity?.status ??
      lineEntity?.status ??
      "ACTIVE",
  );

  const [buildingType, setBuildingType] = useState(
    buildingEntity?.buildingType ?? "",
  );
  const [floorCount, setFloorCount] = useState(
    buildingEntity?.floorCount?.toString() ?? "",
  );

  const factory = factories.find(
    (item) => item.factoryId === Number(factoryId),
  );
  const buildings = factory?.buildings ?? [];
  const building = buildings.find(
    (item) => item.buildingId === Number(buildingId),
  );
  const departments = building?.departments ?? [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (drawer.type === "BUILDING") {
      await onSave(
        drawer.mode === "CREATE"
          ? "/api/company/structure/buildings"
          : `/api/company/structure/buildings/${buildingEntity?.buildingId}`,
        drawer.mode === "CREATE" ? "POST" : "PATCH",
        {
          factoryId: Number(factoryId),
          buildingCode: code,
          buildingName: name,
          buildingType,
          floorCount,
          description,
          status,
        },
      );
      return;
    }

    if (drawer.type === "DEPARTMENT") {
      await onSave(
        drawer.mode === "CREATE"
          ? "/api/company/structure/departments"
          : `/api/company/structure/departments/${departmentEntity?.departmentId}`,
        drawer.mode === "CREATE" ? "POST" : "PATCH",
        {
          buildingId: Number(buildingId),
          departmentCode: code,
          departmentName: name,
          description,
          status,
        },
      );
      return;
    }

    await onSave(
      drawer.mode === "CREATE"
        ? "/api/company/structure/production-lines"
        : `/api/company/structure/production-lines/${lineEntity?.lineId}`,
      drawer.mode === "CREATE" ? "POST" : "PATCH",
      {
        departmentId: Number(departmentId),
        lineCode: code,
        lineName: name,
        description,
        status,
      },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-[3px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[720px] overflow-y-auto bg-[#f8faf9] shadow-[-35px_0_90px_rgba(15,23,42,0.22)]">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-7 py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {drawer.mode === "CREATE" ? "Create Node" : "Edit Node"}
              </div>
              <h2 className="mt-3 text-[30px] font-black tracking-[-0.045em] text-slate-950">
                {drawer.mode === "CREATE" ? "เพิ่ม" : "แก้ไข"}
                {drawer.type === "BUILDING"
                  ? "อาคาร"
                  : drawer.type === "DEPARTMENT"
                    ? "แผนก"
                    : "สายการผลิต"}
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-slate-500">
                บันทึกลงฐานข้อมูลจริงและถูกจำกัดด้วย companyId
                ของบัญชีที่กำลังเข้าสู่ระบบ
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 p-7">
          <FormCard title="Structure Placement">
            <SelectField
              label="โรงงาน"
              value={factoryId}
              onChange={(value) => {
                setFactoryId(value);
                setBuildingId("");
                setDepartmentId("");
              }}
              options={factories.map((item) => ({
                value: String(item.factoryId),
                label: `${item.factoryName} (${item.factoryCode})`,
              }))}
            />

            {drawer.type !== "BUILDING" && (
              <div className="mt-4">
                <SelectField
                  label="อาคาร"
                  value={buildingId}
                  onChange={(value) => {
                    setBuildingId(value);
                    setDepartmentId("");
                  }}
                  options={buildings.map((item) => ({
                    value: String(item.buildingId),
                    label: `${item.buildingName} (${item.buildingCode})`,
                  }))}
                />
              </div>
            )}

            {drawer.type === "LINE" && (
              <div className="mt-4">
                <SelectField
                  label="แผนก"
                  value={departmentId}
                  onChange={setDepartmentId}
                  options={departments.map((item) => ({
                    value: String(item.departmentId),
                    label: `${item.departmentName} (${item.departmentCode})`,
                  }))}
                />
              </div>
            )}
          </FormCard>

          <FormCard title="Identity & Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="รหัส"
                value={code}
                onChange={(value) => setCode(value.toUpperCase())}
              />
              <Field label="ชื่อ" value={name} onChange={setName} />
            </div>

            {drawer.type === "BUILDING" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="ประเภทอาคาร"
                  value={buildingType}
                  onChange={setBuildingType}
                  required={false}
                />
                <Field
                  label="จำนวนชั้น"
                  value={floorCount}
                  onChange={setFloorCount}
                  type="number"
                  required={false}
                />
              </div>
            )}

            <label className="mt-4 block">
              <span className="text-[13px] font-semibold text-slate-600">
                คำอธิบาย
              </span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full resize-none rounded-[13px] border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] outline-none focus:border-emerald-400 focus:bg-white"
              />
            </label>
          </FormCard>

          <FormCard title="Registry Status">
            <SelectField
              label="สถานะ"
              value={status}
              onChange={(value) => setStatus(value as Status)}
              options={[
                { value: "ACTIVE", label: "เปิดใช้งาน" },
                { value: "INACTIVE", label: "ปิดใช้งาน" },
              ]}
            />
          </FormCard>

          <div className="sticky bottom-0 -mx-7 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-7 py-5 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-[13px] border border-slate-200 bg-white px-6 text-[14px] font-semibold text-slate-600"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={
                busy ||
                !factoryId ||
                !code.trim() ||
                !name.trim() ||
                (drawer.type !== "BUILDING" && !buildingId) ||
                (drawer.type === "LINE" && !departmentId)
              }
              className="h-12 rounded-[13px] bg-emerald-700 px-7 text-[14px] font-bold text-white shadow-lg hover:bg-emerald-800 disabled:opacity-40"
            >
              {busy
                ? "กำลังบันทึก..."
                : drawer.mode === "CREATE"
                  ? "สร้างและบันทึก"
                  : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  secondary = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex h-11 items-center gap-2 rounded-[12px] px-4 text-[13px] font-black transition duration-200 hover:-translate-y-0.5 ${
        secondary
          ? "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
          : "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] hover:bg-violet-700"
      }`}
    >
      <span className="transition group-hover:scale-110">{icon}</span>
      {label}
    </button>
  );
}

function StatCard({
  icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  detail: string;
  tone: "emerald" | "blue" | "violet" | "orange" | "cyan";
}) {
  const tones = {
    emerald: { wrap: "border-emerald-100 bg-emerald-50/55", icon: "bg-emerald-100 text-emerald-700 ring-emerald-200", value: "text-emerald-950", label: "text-emerald-700" },
    blue: { wrap: "border-blue-100 bg-blue-50/55", icon: "bg-blue-100 text-blue-700 ring-blue-200", value: "text-blue-950", label: "text-blue-700" },
    violet: { wrap: "border-violet-100 bg-violet-50/55", icon: "bg-violet-100 text-violet-700 ring-violet-200", value: "text-violet-950", label: "text-violet-700" },
    orange: { wrap: "border-orange-100 bg-orange-50/55", icon: "bg-orange-100 text-orange-700 ring-orange-200", value: "text-orange-950", label: "text-orange-700" },
    cyan: { wrap: "border-cyan-100 bg-cyan-50/55", icon: "bg-cyan-100 text-cyan-700 ring-cyan-200", value: "text-cyan-950", label: "text-cyan-700" },
  } as const;
  const selected = tones[tone];

  return (
    <article className={`group flex min-h-[118px] items-center gap-4 rounded-[18px] border px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)] ${selected.wrap}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ring-1 ring-inset transition group-hover:scale-105 ${selected.icon}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-[30px] font-black leading-none tracking-[-0.05em] ${selected.value}`}>
          {value}
        </p>
        <p className={`mt-2 whitespace-nowrap text-[14px] font-black ${selected.label}`}>
          {label}
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">{detail}</p>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  );
}

function FormCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[19px] border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-[16px] font-bold text-slate-800">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-slate-600">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] outline-none focus:border-emerald-400 focus:bg-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-slate-600">
        {label} *
      </span>
      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-[52px] w-full rounded-[13px] border border-slate-200 bg-slate-50 px-4 text-[14px] outline-none focus:border-emerald-400"
      >
        <option value="">เลือก{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyInspector() {
  return (
    <div className="grid min-h-[600px] place-items-center rounded-[22px] border border-dashed border-slate-300 bg-white text-center">
      <div>
        <Network className="mx-auto h-10 w-10 text-emerald-700" />
        <h2 className="mt-4 text-[20px] font-bold text-slate-800">
          เลือกโครงสร้างทางด้านซ้าย
        </h2>
      </div>
    </div>
  );
}