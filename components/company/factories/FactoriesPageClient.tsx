"use client";

import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Cpu,
  Factory,
  Layers3,
  Mail,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Power,
  QrCode,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Waves,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type FactoryItem = {
  id: number;
  code: string;
  name: string;
  status: string;

  address: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;

  latitude: number | null;
  longitude: number | null;
  googleMapUrl: string | null;

  phone: string | null;
  email: string | null;
  timezone: string | null;

  buildings: number;
  departments: number;
  productionLines: number;
  users: number;
  machines: number;
  sensors: number;
  qrCodes: number;

  hasLocation: boolean;
  structureReady: boolean;
  readiness: number;
};

type FactoryResponse = {
  success: boolean;
  message?: string;

  data?: FactoryItem[];

  summary?: {
    total: number;
    active: number;
    ready: number;
    users: number;
  };
};

type FactoryForm = {
  factoryCode: string;
  factoryName: string;

  address: string;
  province: string;
  postalCode: string;
  country: string;

  latitude: string;
  longitude: string;
  googleMapUrl: string;

  phone: string;
  email: string;
  timezone: string;
};

const EMPTY_FORM: FactoryForm = {
  factoryCode: "",
  factoryName: "",

  address: "",
  province: "",
  postalCode: "",
  country: "Thailand",

  latitude: "",
  longitude: "",
  googleMapUrl: "",

  phone: "",
  email: "",
  timezone: "Asia/Bangkok",
};

export default function FactoriesPageClient() {
  const [factories, setFactories] = useState<FactoryItem[]>([]);

  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    ready: 0,
    users: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editingFactory, setEditingFactory] =
    useState<FactoryItem | null>(null);

  const [menuId, setMenuId] = useState<number | null>(null);

  const [form, setForm] =
    useState<FactoryForm>(EMPTY_FORM);

  const loadFactories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/company/factories",
        {
          cache: "no-store",
          credentials: "include",
        },
      );

      const result =
        (await response.json()) as FactoryResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "ไม่สามารถโหลดข้อมูลโรงงานได้",
        );
      }

      setFactories(result.data ?? []);

      setSummary(
        result.summary ?? {
          total: 0,
          active: 0,
          ready: 0,
          users: 0,
        },
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดข้อมูลโรงงานได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFactories();
  }, [loadFactories]);

  const filteredFactories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return factories.filter((factory) => {
      const matchesSearch =
        !keyword ||
        factory.name.toLowerCase().includes(keyword) ||
        factory.code.toLowerCase().includes(keyword) ||
        factory.province
          ?.toLowerCase()
          .includes(keyword) ||
        factory.address
          ?.toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        factory.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [factories, search, statusFilter]);

  function openCreateDrawer() {
    setEditingFactory(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEditDrawer(factory: FactoryItem) {
    setEditingFactory(factory);

    setForm({
      factoryCode: factory.code,
      factoryName: factory.name,

      address: factory.address ?? "",
      province: factory.province ?? "",
      postalCode: factory.postalCode ?? "",
      country: factory.country ?? "Thailand",

      latitude:
        factory.latitude === null
          ? ""
          : String(factory.latitude),

      longitude:
        factory.longitude === null
          ? ""
          : String(factory.longitude),

      googleMapUrl: factory.googleMapUrl ?? "",

      phone: factory.phone ?? "",
      email: factory.email ?? "",
      timezone:
        factory.timezone ?? "Asia/Bangkok",
    });

    setMenuId(null);
    setDrawerOpen(true);
  }

  async function saveFactory(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");

      const payload = {
        factoryCode: form.factoryCode,
        factoryName: form.factoryName,

        address: form.address,
        province: form.province,
        postalCode: form.postalCode,
        country: form.country,

        latitude: form.latitude
          ? Number(form.latitude)
          : null,

        longitude: form.longitude
          ? Number(form.longitude)
          : null,

        googleMapUrl: form.googleMapUrl,

        phone: form.phone,
        email: form.email,
        timezone: form.timezone,
      };

      const response = await fetch(
        editingFactory
          ? `/api/company/factories/${editingFactory.id}`
          : "/api/company/factories",
        {
          method: editingFactory
            ? "PATCH"
            : "POST",

          cache: "no-store",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const result =
        (await response.json()) as FactoryResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "ไม่สามารถบันทึกข้อมูลโรงงานได้",
        );
      }

      setDrawerOpen(false);
      setEditingFactory(null);
      setForm(EMPTY_FORM);

      setSuccess(
        result.message ??
          "บันทึกข้อมูลโรงงานเรียบร้อยแล้ว",
      );

      await loadFactories();

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถบันทึกข้อมูลโรงงานได้",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleFactoryStatus(
    factory: FactoryItem,
  ) {
    if (busy) return;

    try {
      setBusy(true);
      setError("");
      setSuccess("");
      setMenuId(null);

      const response = await fetch(
        `/api/company/factories/${factory.id}`,
        {
          method: "PATCH",

          cache: "no-store",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status:
              factory.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE",
          }),
        },
      );

      const result =
        (await response.json()) as FactoryResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ??
            "ไม่สามารถเปลี่ยนสถานะโรงงานได้",
        );
      }

      setSuccess(
        result.message ??
          "เปลี่ยนสถานะโรงงานเรียบร้อยแล้ว",
      );

      await loadFactories();

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถเปลี่ยนสถานะโรงงานได้",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1540px] pb-12">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.045)] sm:px-7 lg:px-9 lg:py-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-100/55 blur-3xl" />
          <div className="pointer-events-none absolute right-[18%] top-8 h-32 w-32 rounded-full bg-sky-100/45 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-600 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Company Infrastructure
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-950 px-3 py-2 text-[11px] font-black text-white shadow-sm">
                  {summary.total} Factory Sites
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <h1 className="text-[40px] font-black tracking-[-0.055em] text-slate-950 sm:text-[48px]">
                  โรงงานในสังกัด
                </h1>
                <span className="pb-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateDrawer}
              className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[16px] bg-slate-950 px-5 text-[14px] font-black text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-white/10 transition duration-200 group-hover:rotate-90">
                <Plus className="h-4 w-4" />
              </span>
              เพิ่มโรงงาน
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-[16px] border px-4 py-3.5 text-[13px] font-semibold shadow-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <CircleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0" />
            )}
            <span>{error || success}</span>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.12fr_1fr_1fr_1fr]">
          <SummaryCard
            icon={<Factory className="h-5 w-5" />}
            value={summary.total}
            label="โรงงานทั้งหมด"
            detail="ทุกไซต์ภายใต้บริษัท"
            tone="violet"
            featured
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={summary.active}
            label="กำลังเปิดใช้งาน"
            detail="รับผู้ใช้และข้อมูลได้"
            tone="emerald"
          />
          <SummaryCard
            icon={<Sparkles className="h-5 w-5" />}
            value={summary.ready}
            label="โครงสร้างพร้อม"
            detail="Readiness ตั้งแต่ 75%"
            tone="amber"
          />
          <SummaryCard
            icon={<Users className="h-5 w-5" />}
            value={summary.users}
            label="ผู้ใช้งานทั้งหมด"
            detail="ทุก role ทุกโรงงาน"
            tone="sky"
          />
        </div>

        <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.045)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="group flex h-[50px] min-w-0 flex-1 items-center gap-3 rounded-[14px] border border-slate-200 bg-slate-50/80 px-4 transition focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(15,23,42,0.04)] sm:max-w-[560px]">
                <Search className="h-4.5 w-4.5 shrink-0 text-slate-400 transition group-focus-within:text-slate-700" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาชื่อ รหัส จังหวัด หรือที่อยู่..."
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-[50px] min-w-[175px] appearance-none rounded-[14px] border border-slate-200 bg-white pl-10 pr-9 text-[13px] font-bold text-slate-600 outline-none transition hover:border-slate-300 focus:border-slate-400"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="ACTIVE">เปิดใช้งาน</option>
                  <option value="INACTIVE">ปิดใช้งาน</option>
                </select>
                <ChevronRight className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-[13px] bg-slate-50 px-4 py-3 lg:justify-end lg:bg-transparent lg:px-0 lg:py-0">
              <p className="text-[12px] font-medium text-slate-400">แสดงผล</p>
              <p className="text-[13px] font-black text-slate-800">
                {filteredFactories.length}
                <span className="ml-1 font-semibold text-slate-400">/ {factories.length} โรงงาน</span>
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <FactorySkeleton />
        ) : filteredFactories.length === 0 ? (
          <EmptyState onCreate={openCreateDrawer} hasFilter={Boolean(search) || statusFilter !== "ALL"} />
        ) : (
          <div className="mt-5 grid gap-5 2xl:grid-cols-2">
            {filteredFactories.map((factory, index) => (
              <FactoryCard
                key={factory.id}
                factory={factory}
                index={index}
                menuOpen={menuId === factory.id}
                onMenu={() =>
                  setMenuId((current) =>
                    current === factory.id ? null : factory.id,
                  )
                }
                onEdit={() => openEditDrawer(factory)}
                onToggle={() => void toggleFactoryStatus(factory)}
              />
            ))}
          </div>
        )}
      </section>

      {drawerOpen && (
        <FactoryDrawer
          editingFactory={editingFactory}
          form={form}
          setForm={setForm}
          busy={busy}
          onClose={() => {
            setDrawerOpen(false);
            setEditingFactory(null);
          }}
          onSubmit={saveFactory}
        />
      )}
    </>
  );
}

function FactoryCard({
  factory,
  index,
  menuOpen,
  onMenu,
  onEdit,
  onToggle,
}: {
  factory: FactoryItem;
  index: number;
  menuOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const active = factory.status === "ACTIVE";
  const readiness = Math.max(0, Math.min(factory.readiness, 100));
  const readinessTone =
    readiness >= 75
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : readiness >= 45
        ? "text-amber-700 bg-amber-50 border-amber-100"
        : "text-rose-700 bg-rose-50 border-rose-100";

  return (
    <article className="group relative overflow-visible rounded-[24px] border border-slate-200/90 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
      <div className="overflow-hidden rounded-[24px]">
        <div className="relative px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.09),transparent_68%)]" />

          <div className="relative flex items-start gap-4">
            <div className="relative shrink-0">
              <span className="grid h-12 w-12 place-items-center rounded-[15px] bg-slate-950 text-white shadow-[0_10px_22px_rgba(15,23,42,0.16)] transition duration-300 group-hover:rotate-[-3deg] group-hover:bg-emerald-700">
                <Factory className="h-5 w-5" />
              </span>
              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white ${
                  active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate text-[19px] font-black tracking-[-0.025em] text-slate-900 sm:text-[21px]">
                  {factory.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                    active
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-slate-400">
                <span>{factory.code}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{factory.province || factory.country || "ยังไม่ระบุพื้นที่"}</span>
              </div>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={onMenu}
                aria-label="เมนูโรงงาน"
                className={`grid h-10 w-10 place-items-center rounded-[12px] border transition ${
                  menuOpen
                    ? "border-slate-300 bg-slate-100 text-slate-900"
                    : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-30 w-[220px] origin-top-right rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex h-11 w-full items-center gap-3 rounded-[11px] px-3 text-left text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-slate-100 text-slate-600">
                      <Pencil className="h-3.5 w-3.5" />
                    </span>
                    แก้ไขข้อมูลโรงงาน
                  </button>

                  <button
                    type="button"
                    onClick={onToggle}
                    className={`mt-1 flex h-11 w-full items-center gap-3 rounded-[11px] px-3 text-left text-[13px] font-bold transition ${
                      active
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-[9px] ${active ? "bg-rose-50" : "bg-emerald-50"}`}>
                      <Power className="h-3.5 w-3.5" />
                    </span>
                    {active ? "ปิดใช้งานโรงงาน" : "เปิดใช้งานโรงงาน"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_176px] xl:items-stretch">
            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
              <MiniStat value={factory.buildings} label="อาคาร" icon={<Building2 className="h-4 w-4" />} tone="blue" />
              <MiniStat value={factory.departments} label="แผนก" icon={<Layers3 className="h-4 w-4" />} tone="violet" />
              <MiniStat value={factory.productionLines} label="สายผลิต" icon={<Waves className="h-4 w-4" />} tone="orange" />
              <MiniStat value={factory.users} label="ผู้ใช้" icon={<Users className="h-4 w-4" />} tone="pink" />
            </div>

            <div className="min-w-0 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Readiness</p>
                  <p className="mt-1 text-[27px] font-black tracking-[-0.04em] text-slate-900">{readiness}%</p>
                </div>
                <span className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-black ${readinessTone}`}>
                  {readiness >= 75 ? "พร้อม" : readiness >= 45 ? "กำลังตั้งค่า" : "ต้องเติมข้อมูล"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#059669_100%)] transition-all duration-700"
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-slate-100 bg-slate-50/45 px-5 py-4 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-3">
            <InfoChip icon={<Cpu className="h-4 w-4" />} label={`${factory.machines} เครื่องจักร`} tone="cyan" />
            <InfoChip icon={<Waves className="h-4 w-4" />} label={`${factory.sensors} เซนเซอร์`} tone="indigo" />
            <InfoChip
              icon={<MapPinned className="h-4 w-4" />}
              label={factory.hasLocation ? "พิกัดแผนที่พร้อม" : "ยังไม่มีพิกัด"}
              warning={!factory.hasLocation}
              tone="emerald"
            />
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <p className="truncate text-[13px] font-bold text-slate-700">
                  {factory.address || "ยังไม่ได้ระบุที่อยู่โรงงาน"}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5" /> {factory.qrCodes} QR</span>
                {factory.timezone && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {factory.timezone}</span>}
              </div>
            </div>

            <a
              href="/company/departments"
              className="group/link inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3.5 text-[12px] font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-950 hover:text-white"
            >
              จัดการโครงสร้าง
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>

      <span className="pointer-events-none absolute -left-px top-7 rounded-r-full bg-slate-950 px-2 py-1 text-[9px] font-black tracking-[0.08em] text-white opacity-0 transition duration-200 group-hover:opacity-100">
        {String(index + 1).padStart(2, "0")}
      </span>
    </article>
  );
}

function FactoryDrawer({
  editingFactory,
  form,
  setForm,
  busy,
  onClose,
  onSubmit,
}: {
  editingFactory: FactoryItem | null;
  form: FactoryForm;
  setForm: React.Dispatch<React.SetStateAction<FactoryForm>>;
  busy: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-[4px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[700px] overflow-y-auto bg-[#f8faf9] shadow-[-35px_0_90px_rgba(15,23,42,0.22)]">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-5 backdrop-blur-xl sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white">
                  <Factory className="h-3.5 w-3.5" />
                  {editingFactory ? "Edit Factory" : "New Factory"}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Company Admin</span>
              </div>

              <h2 className="mt-3 text-[28px] font-black tracking-[-0.045em] text-slate-950 sm:text-[32px]">
                {editingFactory ? "แก้ไขข้อมูลโรงงาน" : "เพิ่มโรงงานใหม่"}
              </h2>
              <p className="mt-2 max-w-[520px] text-[13px] leading-6 text-slate-500">
                กรอกเฉพาะข้อมูลที่จำเป็นก่อน ส่วนพิกัด แผนที่ และข้อมูลติดต่อสามารถกลับมาเติมภายหลังได้
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:rotate-90 hover:border-slate-300 hover:text-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-7">
          <FormSection
            index="01"
            title="ข้อมูลโรงงาน"
            description="ข้อมูลหลักสำหรับระบุตัวตนและพื้นที่ของโรงงาน"
            icon={<Factory className="h-4.5 w-4.5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="รหัสโรงงาน"
                value={form.factoryCode}
                placeholder="เช่น GF-001"
                onChange={(value) => setForm((current) => ({ ...current, factoryCode: value.toUpperCase() }))}
              />
              <Field
                label="ชื่อโรงงาน"
                value={form.factoryName}
                placeholder="ชื่อโรงงาน"
                onChange={(value) => setForm((current) => ({ ...current, factoryName: value }))}
              />
            </div>

            <div className="mt-4">
              <Field
                label="ที่อยู่"
                value={form.address}
                placeholder="เลขที่ ถนน ตำบล / อำเภอ"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, address: value }))}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field
                label="จังหวัด"
                value={form.province}
                placeholder="นครราชสีมา"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, province: value }))}
              />
              <Field
                label="รหัสไปรษณีย์"
                value={form.postalCode}
                placeholder="30000"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, postalCode: value }))}
              />
              <Field
                label="ประเทศ"
                value={form.country}
                placeholder="Thailand"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, country: value }))}
              />
            </div>
          </FormSection>

          <FormSection
            index="02"
            title="ตำแหน่งและแผนที่"
            description="ใช้สำหรับ Smart Factory Map และการอ้างอิงพื้นที่จริง"
            icon={<MapPinned className="h-4.5 w-4.5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Latitude"
                type="number"
                step="any"
                value={form.latitude}
                placeholder="14.9799"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, latitude: value }))}
              />
              <Field
                label="Longitude"
                type="number"
                step="any"
                value={form.longitude}
                placeholder="102.0977"
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, longitude: value }))}
              />
            </div>

            <div className="mt-4">
              <Field
                label="Google Maps URL"
                value={form.googleMapUrl}
                placeholder="https://maps.google.com/..."
                required={false}
                onChange={(value) => setForm((current) => ({ ...current, googleMapUrl: value }))}
              />
            </div>

            <div className="mt-4 flex gap-3 rounded-[15px] border border-sky-100 bg-sky-50/80 p-4 text-[12px] leading-5 text-sky-800">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Manager จะเห็นเฉพาะโรงงานตาม <span className="font-black">factoryId</span> ของบัญชี และเลือกดูอาคารภายในโรงงานนั้น
              </p>
            </div>
          </FormSection>

          <FormSection
            index="03"
            title="ข้อมูลติดต่อ"
            description="ช่องทางติดต่อและ timezone ของโรงงาน"
            icon={<Phone className="h-4.5 w-4.5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="โทรศัพท์"
                value={form.phone}
                placeholder="044-000-000"
                required={false}
                icon={<Phone className="h-4 w-4" />}
                onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              />
              <Field
                label="อีเมลโรงงาน"
                type="email"
                value={form.email}
                placeholder="factory@company.com"
                required={false}
                icon={<Mail className="h-4 w-4" />}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
            </div>

            <div className="mt-4">
              <Field
                label="Timezone"
                value={form.timezone}
                placeholder="Asia/Bangkok"
                required={false}
                icon={<Clock3 className="h-4 w-4" />}
                onChange={(value) => setForm((current) => ({ ...current, timezone: value }))}
              />
            </div>
          </FormSection>

          <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-slate-200 bg-white/92 px-5 py-4 backdrop-blur-xl sm:-mx-7 sm:-mb-7 sm:px-7 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="hidden text-[11px] font-semibold text-slate-400 sm:block">
                * จำเป็นเฉพาะรหัสและชื่อโรงงาน
              </p>
              <div className="ml-auto flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-[12px] border border-slate-200 bg-white px-5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-11 min-w-[145px] items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-5 text-[13px] font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      กำลังบันทึก
                    </>
                  ) : editingFactory ? (
                    "บันทึกการแก้ไข"
                  ) : (
                    "เพิ่มโรงงาน"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  detail,
  featured = false,
  tone = "emerald",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  detail: string;
  featured?: boolean;
  tone?: "emerald" | "violet" | "amber" | "sky";
}) {
  const tones = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      glow: "bg-emerald-300/20",
      accent: "bg-emerald-500",
    },
    violet: {
      icon: "bg-violet-50 text-violet-700 ring-violet-100",
      glow: "bg-violet-300/20",
      accent: "bg-violet-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700 ring-amber-100",
      glow: "bg-amber-300/20",
      accent: "bg-amber-500",
    },
    sky: {
      icon: "bg-sky-50 text-sky-700 ring-sky-100",
      glow: "bg-sky-300/20",
      accent: "bg-sky-500",
    },
  } as const;

  const selected = tones[tone];

  return (
    <article
      className={`group relative overflow-hidden rounded-[20px] border p-5 transition duration-200 hover:-translate-y-0.5 ${
        featured
          ? "border-slate-900 bg-slate-950 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)]"
          : "border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:border-slate-300"
      }`}
    >
      <div className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl ${selected.glow}`} />
      <span className={`absolute inset-x-5 bottom-0 h-[3px] rounded-full ${selected.accent} opacity-0 transition group-hover:opacity-100`} />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={`grid h-11 w-11 place-items-center rounded-[13px] ring-1 ring-inset transition duration-200 group-hover:scale-105 ${
            featured ? "bg-white/10 text-white ring-white/10" : selected.icon
          }`}
        >
          {icon}
        </span>
        <p className={`text-[30px] font-black leading-none tracking-[-0.05em] ${featured ? "text-white" : "text-slate-950"}`}>
          {value}
        </p>
      </div>

      <p className={`relative mt-5 text-[13px] font-black ${featured ? "text-white" : "text-slate-800"}`}>
        {label}
      </p>
      <p className={`relative mt-1 text-[11px] font-medium ${featured ? "text-white/45" : "text-slate-400"}`}>
        {detail}
      </p>
    </article>
  );
}

function MiniStat({
  value,
  label,
  icon,
  tone,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "orange" | "pink";
}) {
  const tones = {
    blue: {
      wrap: "border-blue-100 bg-blue-50/65 hover:border-blue-200 hover:bg-blue-50",
      icon: "bg-blue-100 text-blue-700 ring-blue-200/70",
      value: "text-blue-950",
      label: "text-blue-600",
    },
    violet: {
      wrap: "border-violet-100 bg-violet-50/65 hover:border-violet-200 hover:bg-violet-50",
      icon: "bg-violet-100 text-violet-700 ring-violet-200/70",
      value: "text-violet-950",
      label: "text-violet-600",
    },
    orange: {
      wrap: "border-orange-100 bg-orange-50/70 hover:border-orange-200 hover:bg-orange-50",
      icon: "bg-orange-100 text-orange-700 ring-orange-200/70",
      value: "text-orange-950",
      label: "text-orange-600",
    },
    pink: {
      wrap: "border-pink-100 bg-pink-50/65 hover:border-pink-200 hover:bg-pink-50",
      icon: "bg-pink-100 text-pink-700 ring-pink-200/70",
      value: "text-pink-950",
      label: "text-pink-600",
    },
  } as const;

  const selected = tones[tone];

  return (
    <div className={`group/stat relative overflow-hidden min-w-0 rounded-[16px] border px-3 py-3 transition duration-200 hover:-translate-y-0.5 ${selected.wrap}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
         <p
  className={`text-[27px] font-black leading-none tracking-[-0.04em] ${selected.value}`}
>
  {value}
</p>

<p
  className={`mt-2 whitespace-nowrap text-[13px] font-black leading-none ${selected.label}`}
>
  {label}
</p>
        </div>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ring-1 ring-inset transition duration-200 group-hover/stat:scale-110 ${selected.icon}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  warning = false,
  tone = "emerald",
}: {
  icon: React.ReactNode;
  label: string;
  warning?: boolean;
  tone?: "emerald" | "cyan" | "indigo";
}) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
    cyan: "border-cyan-100 bg-cyan-50/70 text-cyan-700",
    indigo: "border-indigo-100 bg-indigo-50/70 text-indigo-700",
  } as const;

  const iconTones = {
    emerald: "bg-emerald-100 text-emerald-700",
    cyan: "bg-cyan-100 text-cyan-700",
    indigo: "bg-indigo-100 text-indigo-700",
  } as const;

  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 rounded-[13px] border px-3 py-2.5 text-[11px] font-black transition hover:-translate-y-0.5 ${
        warning
          ? "border-amber-100 bg-amber-50/80 text-amber-700"
          : tones[tone]
      }`}
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[9px] ${warning ? "bg-amber-100 text-amber-700" : iconTones[tone]}`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function FormSection({
  index,
  title,
  description,
  icon,
  children,
}: {
  index: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-slate-950 text-white">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-black text-slate-900">{title}</h3>
            <span className="text-[9px] font-black tracking-[0.12em] text-slate-300">{index}</span>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  required = true,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[12px] font-bold text-slate-600">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </span>
      <div className="relative mt-2">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          required={required}
          type={type}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-[50px] w-full rounded-[12px] border border-slate-200 bg-slate-50/80 text-[13px] font-medium text-slate-700 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,23,42,0.04)] ${icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </label>
  );
}

function FactorySkeleton() {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-[15px] bg-slate-200" />
              <div className="flex-1">
                <div className="h-5 w-2/5 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/4 rounded bg-slate-100" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map((stat) => <div key={stat} className="h-[72px] rounded-[16px] bg-slate-100" />)}
            </div>
            <div className="mt-5 h-20 rounded-[18px] bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  onCreate,
  hasFilter,
}: {
  onCreate: () => void;
  hasFilter: boolean;
}) {
  return (
    <div className="mt-5 grid min-h-[430px] place-items-center overflow-hidden rounded-[26px] border border-dashed border-slate-300 bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#ffffff_50%)] px-6 text-center">
      <div className="max-w-[450px]">
        <div className="relative mx-auto w-fit">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-slate-950 text-white shadow-[0_16px_32px_rgba(15,23,42,0.14)]">
            {hasFilter ? <Search className="h-7 w-7" /> : <Factory className="h-7 w-7" />}
          </span>
          <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-4 border-white bg-emerald-500 text-white">
            <Sparkles className="h-3 w-3" />
          </span>
        </div>

        <h2 className="mt-5 text-[21px] font-black tracking-[-0.025em] text-slate-900">
          {hasFilter ? "ไม่พบโรงงานที่ตรงกับตัวกรอง" : "ยังไม่มีโรงงานในบริษัทนี้"}
        </h2>
        <p className="mx-auto mt-2 text-[13px] leading-6 text-slate-500">
          {hasFilter
            ? "ลองเปลี่ยนคำค้นหา หรือเลือกสถานะทั้งหมดเพื่อดูข้อมูลที่มีอยู่"
            : "เพิ่มโรงงานแรก แล้วค่อยต่อโครงสร้างอาคาร แผนก สายการผลิต เครื่องจักร และเซนเซอร์ภายหลังได้"}
        </p>

        {!hasFilter && (
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-[12px] bg-slate-950 px-4.5 text-[13px] font-black text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            เพิ่มโรงงานแรก
          </button>
        )}
      </div>
    </div>
  );
}
