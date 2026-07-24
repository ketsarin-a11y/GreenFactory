"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplets,
  Eye,
  FileSpreadsheet,
  Fuel,
  Leaf,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ResourceCategory,
  ResourceSource,
  ResourceStatus,
  ResourceUsageRecord,
} from "@/types/resource-usage";
import {
  initialResourceUsage,
  machineDefinitions,
  resourceDefinitions,
} from "./resource-usage-data";

const STORAGE_KEY = "greenfactory_resource_usage";
const PAGE_SIZE = 7;

function resourceIcon(category: ResourceCategory) {
  if (category === "ELECTRICITY") return Zap;
  if (category === "WATER") return Droplets;
  if (category === "DIESEL") return Fuel;
  if (category === "STEAM") return Waves;
  return Trash2;
}

function statusLabel(status: ResourceStatus) {
  if (status === "NORMAL") return "ปกติ";
  if (status === "WARNING") return "เฝ้าระวัง";
  return "ผิดปกติ";
}

function statusClass(status: ResourceStatus) {
  if (status === "NORMAL") return "bg-[#eaf7ef] text-[#26734c]";
  if (status === "WARNING") return "bg-[#fff4df] text-[#9b6a16]";
  return "bg-[#fff0f0] text-[#b14848]";
}

export default function ResourceUsagePageClient() {
  const [records, setRecords] = useState<ResourceUsageRecord[]>([]);
  const [selected, setSelected] = useState<ResourceUsageRecord | null>(null);
  const [editing, setEditing] = useState<ResourceUsageRecord | null>(null);
  const [deleting, setDeleting] = useState<ResourceUsageRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as ResourceUsageRecord[]) : initialResourceUsage;
    if (!raw) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setRecords(data);
    setSelected(data[0] ?? null);
  }, []);

  function persist(next: ResourceUsageRecord[]) {
    setRecords(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const departments = useMemo(
    () => Array.from(new Set(records.map((item) => item.department))),
    [records],
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !keyword ||
        record.machineName.toLowerCase().includes(keyword) ||
        record.machineCode.toLowerCase().includes(keyword) ||
        record.operatorName.toLowerCase().includes(keyword) ||
        record.resourceName.toLowerCase().includes(keyword) ||
        record.reference.toLowerCase().includes(keyword);
      return (
        matchesSearch &&
        (category === "ALL" || record.resourceCategory === category) &&
        (department === "ALL" || record.department === department) &&
        (status === "ALL" || record.status === status)
      );
    });
  }, [records, search, category, department, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totals = useMemo(() => {
    const sum = (type: ResourceCategory) =>
      records.filter((item) => item.resourceCategory === type).reduce((total, item) => total + item.quantity, 0);
    return {
      electricity: sum("ELECTRICITY"),
      water: sum("WATER"),
      diesel: sum("DIESEL"),
      waste: sum("WASTE"),
      carbon: records.reduce((total, item) => total + item.carbonValue, 0) / 1000,
    };
  }, [records]);

  function saveRecord(record: ResourceUsageRecord) {
    const next = editing
      ? records.map((item) => (item.id === record.id ? record : item))
      : [record, ...records];
    persist(next);
    setSelected(record);
    setEditing(null);
    setDrawerOpen(false);
    setPage(1);
  }

  function confirmDelete() {
    if (!deleting) return;
    const next = records.filter((item) => item.id !== deleting.id);
    persist(next);
    if (selected?.id === deleting.id) setSelected(next[0] ?? null);
    setDeleting(null);
  }

  function exportCsv() {
    const rows = filtered.map((record) => [
      record.reference,
      record.occurredAt,
      record.machineName,
      record.machineCode,
      record.resourceName,
      record.quantity,
      record.unit,
      record.carbonValue,
      record.carbonUnit,
      record.operatorName,
      record.department,
      record.productionLine,
      record.status,
    ]);
    const headers = ["Reference", "Date", "Machine", "Machine Code", "Resource", "Quantity", "Unit", "Carbon", "Carbon Unit", "Operator", "Department", "Production Line", "Status"];
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resource-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const cards = [
    ["ไฟฟ้า", totals.electricity, "kWh", Zap, "bg-[#eaf8ef] text-[#258154]"],
    ["น้ำประปา", totals.water, "m³", Droplets, "bg-[#edf5ff] text-[#3a75b8]"],
    ["น้ำมันดีเซล", totals.diesel, "L", Fuel, "bg-[#fff4e7] text-[#bb7020]"],
    ["ของเสีย", totals.waste, "kg", Trash2, "bg-[#f1edff] text-[#7554bd]"],
    ["คาร์บอนรวม", totals.carbon, "tCO₂e", Leaf, "bg-[#edf8f1] text-[#287b54]"],
  ] as const;

  return (
    <>
      <section className="mx-auto w-full max-w-[1800px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2b8057]">Resource management</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#18281f] sm:text-[32px]">การบันทึกและการใช้ทรัพยากร</h1>
            <p className="mt-2 text-[10px] text-[#7f8a83]">ตรวจสอบ เพิ่ม แก้ไข ลบ และส่งออกข้อมูลการใช้ทรัพยากรของโรงงาน</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] border border-[#d9e2dc] bg-white px-4 text-[9px] font-medium text-[#56655c]"><FileSpreadsheet className="h-3.5 w-3.5" />ส่งออก Excel</button>
            <button onClick={() => window.print()} className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] border border-[#d9e2dc] bg-white px-4 text-[9px] font-medium text-[#56655c]"><Download className="h-3.5 w-3.5" />ส่งออก PDF</button>
            <button onClick={() => { setEditing(null); setDrawerOpen(true); }} className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] bg-[#1f8f62] px-4 text-[9px] font-semibold text-white"><Plus className="h-3.5 w-3.5" />เพิ่มรายการ</button>
          </div>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(([label, value, unit, Icon, className]) => (
            <article key={label} className="rounded-[17px] border border-[#dfe5e1] bg-white p-4 shadow-[0_8px_24px_rgba(36,55,43,0.035)]">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${className}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
                <p className="text-right text-[20px] font-semibold tracking-[-0.04em] text-[#26362d]">{Number(value).toLocaleString("th-TH", { maximumFractionDigits: 2 })}</p>
              </div>
              <p className="mt-4 text-[9px] font-semibold text-[#405247]">{label}</p>
              <p className="mt-1 text-[8px] text-[#919b94]">{unit}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[18px] border border-[#dfe5e1] bg-white shadow-[0_8px_28px_rgba(28,43,34,0.035)]">
          <div className="flex">
            <div className="min-w-0 flex-1">
              <div className="grid gap-3 border-b border-[#e7ebe8] p-4 xl:grid-cols-[1.5fr_0.8fr_0.9fr_0.8fr_auto]">
                <label className="flex h-[42px] items-center gap-3 rounded-[10px] border border-[#dfe5e1] bg-[#fafcfb] px-3"><Search className="h-4 w-4 text-[#89958e]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="ค้นหาเครื่องจักร รหัส ผู้บันทึก หรือทรัพยากร" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none" /></label>
                <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="h-[42px] rounded-[10px] border border-[#dfe5e1] bg-white px-3 text-[10px]"><option value="ALL">ทุกทรัพยากร</option>{resourceDefinitions.map((item) => <option key={item.category} value={item.category}>{item.name}</option>)}</select>
                <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }} className="h-[42px] rounded-[10px] border border-[#dfe5e1] bg-white px-3 text-[10px]"><option value="ALL">ทุกแผนก</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-[42px] rounded-[10px] border border-[#dfe5e1] bg-white px-3 text-[10px]"><option value="ALL">ทุกสถานะ</option><option value="NORMAL">ปกติ</option><option value="WARNING">เฝ้าระวัง</option><option value="ERROR">ผิดปกติ</option></select>
                <button onClick={() => { setSearch(""); setCategory("ALL"); setDepartment("ALL"); setStatus("ALL"); setPage(1); }} className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5e1] px-4 text-[9px]"><RotateCcw className="h-3.5 w-3.5" />ล้างตัวกรอง</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead><tr className="border-b border-[#e6ebe7] bg-[#fafcfb] text-left">{["วันที่ / เวลา", "เครื่องจักร / จุดตรวจ", "ทรัพยากร", "ปริมาณ", "Carbon", "ผู้บันทึก", "แผนก", "สถานะ", ""].map((label) => <th key={label} className="px-4 py-3 text-[8px] font-semibold text-[#87928b]">{label}</th>)}</tr></thead>
                  <tbody>
                    {visible.map((record) => {
                      const Icon = resourceIcon(record.resourceCategory);
                      return (
                        <tr key={record.id} onClick={() => { setSelected(record); setMenuId(null); }} className={`cursor-pointer border-b border-[#edf1ee] ${selected?.id === record.id ? "bg-[#f2faf5]" : "hover:bg-[#fbfdfb]"}`}>
                          <td className="px-4 py-3"><p className="text-[9px] font-medium">{new Date(record.occurredAt).toLocaleDateString("th-TH")}</p><p className="mt-1 text-[8px] text-[#929c96]">{new Date(record.occurredAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</p></td>
                          <td className="px-4 py-3"><p className="text-[9px] font-semibold">{record.machineName}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.machineCode}</p></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#edf7f1] text-[#2b8057]"><Icon className="h-4 w-4" /></span><span className="text-[9px]">{record.resourceName}</span></div></td>
                          <td className="px-4 py-3"><p className="text-[10px] font-semibold">{record.quantity.toLocaleString("th-TH", { maximumFractionDigits: 2 })}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.unit}</p></td>
                          <td className="px-4 py-3"><p className="text-[9px] font-semibold text-[#2f684b]">{record.carbonValue.toLocaleString("th-TH", { maximumFractionDigits: 2 })}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.carbonUnit}</p></td>
                          <td className="px-4 py-3"><p className="text-[9px]">{record.operatorName}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.operatorRole}</p></td>
                          <td className="px-4 py-3"><p className="text-[9px]">{record.department}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.productionLine}</p></td>
                          <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-medium ${statusClass(record.status)}`}>{statusLabel(record.status)}</span></td>
                          <td className="relative px-4 py-3" onClick={(event) => event.stopPropagation()}><button onClick={() => setMenuId((current) => current === record.id ? null : record.id)} className="flex h-8 w-8 items-center justify-center rounded-full"><MoreHorizontal className="h-4 w-4" /></button>{menuId === record.id && <div className="absolute right-4 top-[44px] z-30 w-[165px] rounded-[11px] border bg-white p-1.5 shadow-xl"><button onClick={() => { setSelected(record); setMenuId(null); }} className="flex min-h-[36px] w-full items-center gap-2 rounded-lg px-3 text-[9px]"><Eye className="h-3.5 w-3.5" />ดูรายละเอียด</button><button onClick={() => { setEditing(record); setDrawerOpen(true); setMenuId(null); }} className="flex min-h-[36px] w-full items-center gap-2 rounded-lg px-3 text-[9px]"><Pencil className="h-3.5 w-3.5" />แก้ไข</button><button onClick={() => { setDeleting(record); setMenuId(null); }} className="flex min-h-[36px] w-full items-center gap-2 rounded-lg px-3 text-[9px] text-[#b14848]"><Trash2 className="h-3.5 w-3.5" />ลบรายการ</button></div>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="flex items-center justify-between border-t px-4 py-3"><p className="text-[8px] text-[#929c96]">แสดง {visible.length} จาก {filtered.length} รายการ</p><div className="flex items-center gap-1.5"><button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-[8px] border disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-[64px] text-center text-[8px]">{currentPage} / {totalPages}</span><button disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-[8px] border disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button></div></footer>
            </div>

            <div className="hidden xl:block"><DetailPanel record={selected} records={records} onClose={() => setSelected(null)} onEdit={(record) => { setEditing(record); setDrawerOpen(true); }} onDelete={setDeleting} /></div>
          </div>
        </div>
      </section>

      <ResourceDrawer key={`${editing?.id ?? "new"}-${drawerOpen}`} open={drawerOpen} editing={editing} onClose={() => { setDrawerOpen(false); setEditing(null); }} onSave={saveRecord} />
      <DeleteDialog record={deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}

function DetailPanel({ record, records, onClose, onEdit, onDelete }: { record: ResourceUsageRecord | null; records: ResourceUsageRecord[]; onClose: () => void; onEdit: (record: ResourceUsageRecord) => void; onDelete: (record: ResourceUsageRecord) => void; }) {
  if (!record) return null;
  const trend = records.filter((item) => item.machineCode === record.machineCode && item.resourceCategory === record.resourceCategory).slice(0, 7).reverse().map((item) => ({ time: new Date(item.occurredAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }), value: item.quantity }));
  const chartData = trend.length >= 2 ? trend : [{ time: "08:00", value: record.quantity * 0.82 }, { time: "09:00", value: record.quantity * 0.9 }, { time: "10:00", value: record.quantity }, { time: "11:00", value: record.quantity * 0.94 }, { time: "12:00", value: record.quantity * 1.04 }];
  const details = [["เลขอ้างอิง", record.reference], ["เครื่องจักร / จุดตรวจ", record.machineName], ["รหัส", record.machineCode], ["อาคาร", record.building], ["แผนก", record.department], ["สายการผลิต", record.productionLine], ["ประเภททรัพยากร", record.resourceName], ["Emission Factor", String(record.emissionFactor)], ["แหล่งข้อมูล", record.sourceType], ["ผู้บันทึก", `${record.operatorName} (${record.operatorRole})`]];
  return <aside className="w-[370px] border-l bg-white"><div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto p-5"><div className="flex items-start justify-between"><div><p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#2b8057]">Resource detail</p><h2 className="mt-2 text-[16px] font-semibold">รายละเอียดการบันทึก</h2></div><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full"><X className="h-4 w-4" /></button></div><div className="mt-5 rounded-[15px] border bg-[#f7faf8] p-4"><p className="text-[9px] text-[#7e8a82]">{record.resourceName}</p><div className="mt-2 flex items-end gap-2"><p className="text-[28px] font-semibold text-[#204f38]">{record.quantity.toLocaleString("th-TH")}</p><p className="pb-1 text-[10px]">{record.unit}</p></div><p className="mt-2 text-[9px] text-[#668072]">Carbon {record.carbonValue.toLocaleString("th-TH", { maximumFractionDigits: 2 })} {record.carbonUnit}</p></div><div className="mt-5 grid gap-2">{details.map(([label, value]) => <div key={label} className="rounded-[11px] border px-3 py-3"><p className="text-[7px] text-[#98a19b]">{label}</p><p className="mt-1 text-[9px] font-medium">{value}</p></div>)}</div>{record.sensorName && <div className="mt-5 rounded-[13px] border bg-[#fafcfb] p-4"><p className="text-[8px] font-semibold">ข้อมูลเซนเซอร์</p><p className="mt-3 text-[9px]">{record.sensorName}</p><p className="mt-1 text-[8px] text-[#929c96]">{record.sensorCode}</p></div>}<div className="mt-5 rounded-[13px] border p-4"><p className="text-[9px] font-semibold">แนวโน้มย้อนหลัง</p><div className="mt-3 h-[170px] text-[#2b8057]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="time" tick={{ fontSize: 8 }} axisLine={false} /><YAxis tick={{ fontSize: 8 }} axisLine={false} /><Tooltip /><Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} dot={{ r: 2.5 }} /></LineChart></ResponsiveContainer></div></div>{record.note && <div className="mt-5 rounded-[13px] border bg-[#fafcfb] p-4"><p className="text-[8px] text-[#929c96]">หมายเหตุ</p><p className="mt-2 text-[9px] leading-5">{record.note}</p></div>}<div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => onEdit(record)} className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border text-[9px]"><Pencil className="h-3.5 w-3.5" />แก้ไข</button><button onClick={() => onDelete(record)} className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#f0caca] bg-[#fff8f8] text-[9px] text-[#b14848]"><Trash2 className="h-3.5 w-3.5" />ลบรายการ</button></div></div></aside>;
}

function ResourceDrawer({ open, editing, onClose, onSave }: { open: boolean; editing: ResourceUsageRecord | null; onClose: () => void; onSave: (record: ResourceUsageRecord) => void; }) {
  const [machineCode, setMachineCode] = useState(editing?.machineCode ?? machineDefinitions[0].code);
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>(editing?.resourceCategory ?? resourceDefinitions[0].category);
  const [quantity, setQuantity] = useState(editing?.quantity.toString() ?? "");
  const [occurredAt, setOccurredAt] = useState(editing?.occurredAt.slice(0, 16) ?? new Date().toISOString().slice(0, 16));
  const [operatorName, setOperatorName] = useState(editing?.operatorName ?? "Company Admin");
  const [sourceType, setSourceType] = useState<ResourceSource>(editing?.sourceType ?? "MANUAL");
  const [status, setStatus] = useState<ResourceStatus>(editing?.status ?? "NORMAL");
  const [note, setNote] = useState(editing?.note ?? "");
  const machine = machineDefinitions.find((item) => item.code === machineCode) ?? machineDefinitions[0];
  const resource = resourceDefinitions.find((item) => item.category === resourceCategory) ?? resourceDefinitions[0];
  if (!open) return null;
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const now = new Date(); const numericQuantity = Number(quantity); onSave({ id: editing?.id ?? crypto.randomUUID(), reference: editing?.reference ?? `RU-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-4)}`, occurredAt, machineName: machine.name, machineCode: machine.code, resourceCategory: resource.category, resourceName: resource.name, quantity: numericQuantity, unit: resource.unit, emissionFactor: resource.factor, carbonValue: Number((numericQuantity * resource.factor).toFixed(4)), carbonUnit: "kgCO₂e", operatorName: operatorName.trim(), operatorRole: editing?.operatorRole ?? "Company Admin", building: machine.building, department: machine.department, productionLine: machine.productionLine, sourceType, sensorName: editing?.sensorName, sensorCode: editing?.sensorCode, note: note.trim(), status, createdAt: editing?.createdAt ?? now.toISOString(), updatedAt: now.toISOString() }); }
  return <><button onClick={onClose} className="fixed inset-0 z-[80] bg-[#102019]/35 backdrop-blur-[2px]" /><section className="fixed inset-y-0 right-0 z-[90] w-full max-w-[540px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(22,39,29,0.2)]"><div className="flex min-h-[74px] items-center justify-between border-b px-6"><div><h2 className="text-[16px] font-semibold">{editing ? "แก้ไขรายการทรัพยากร" : "เพิ่มรายการทรัพยากร"}</h2><p className="mt-1 text-[8px] text-[#929c96]">Company Admin เพิ่มหรือแก้ไขข้อมูลแทน Operator ได้</p></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full"><X className="h-4 w-4" /></button></div><form onSubmit={submit} className="space-y-5 p-6"><label className="block"><span className="text-[10px] font-medium">เครื่องจักร / จุดตรวจ *</span><select value={machineCode} onChange={(e) => setMachineCode(e.target.value)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]">{machineDefinitions.map((item) => <option key={item.code} value={item.code}>{item.name} · {item.code}</option>)}</select></label><div className="grid gap-3 rounded-[14px] border bg-[#fafcfb] p-4 sm:grid-cols-2">{[["อาคาร", machine.building], ["แผนก", machine.department], ["สายการผลิต", machine.productionLine], ["รหัสเครื่อง", machine.code]].map(([label, value]) => <div key={label}><p className="text-[7px] text-[#99a29c]">{label}</p><p className="mt-1 text-[9px] font-medium">{value}</p></div>)}</div><label className="block"><span className="text-[10px] font-medium">ประเภททรัพยากร *</span><select value={resourceCategory} onChange={(e) => setResourceCategory(e.target.value as ResourceCategory)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]">{resourceDefinitions.map((item) => <option key={item.category} value={item.category}>{item.name} · {item.unit}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="text-[10px] font-medium">ปริมาณ *</span><input required min="0" step="0.01" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]" /></label><label><span className="text-[10px] font-medium">หน่วย</span><input readOnly value={resource.unit} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#f2f5f3] px-4 text-[11px]" /></label></div><div className="rounded-[14px] border border-[#cfe5d8] bg-[#f3faf6] p-4"><p className="text-[8px]">คาร์บอนโดยประมาณ</p><p className="mt-2 text-[20px] font-semibold text-[#246746]">{(Number(quantity || 0) * resource.factor).toLocaleString("th-TH", { maximumFractionDigits: 4 })} kgCO₂e</p><p className="mt-1 text-[8px] text-[#8a968f]">Emission Factor: {resource.factor}</p></div><label className="block"><span className="text-[10px] font-medium">วันที่และเวลา *</span><input required type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]" /></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="text-[10px] font-medium">ผู้บันทึก *</span><input required value={operatorName} onChange={(e) => setOperatorName(e.target.value)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]" /></label><label><span className="text-[10px] font-medium">แหล่งข้อมูล</span><select value={sourceType} onChange={(e) => setSourceType(e.target.value as ResourceSource)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]"><option value="MANUAL">Manual</option><option value="QR">QR Code</option><option value="SENSOR">Sensor</option><option value="API">API</option></select></label></div><label className="block"><span className="text-[10px] font-medium">สถานะ</span><select value={status} onChange={(e) => setStatus(e.target.value as ResourceStatus)} className="mt-2 h-[48px] w-full rounded-[12px] border bg-[#fbfcfb] px-4 text-[11px]"><option value="NORMAL">ปกติ</option><option value="WARNING">เฝ้าระวัง</option><option value="ERROR">ผิดปกติ</option></select></label><label className="block"><span className="text-[10px] font-medium">หมายเหตุ</span><textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 min-h-[110px] w-full resize-none rounded-[12px] border bg-[#fbfcfb] px-4 py-3 text-[11px]" /></label><div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} className="min-h-[44px] rounded-[11px] border px-5 text-[10px]">ยกเลิก</button><button type="submit" className="min-h-[44px] rounded-[11px] bg-[#1f8f62] px-5 text-[10px] font-semibold text-white">บันทึกข้อมูล</button></div></form></section></>;
}

function DeleteDialog({ record, onClose, onConfirm }: { record: ResourceUsageRecord | null; onClose: () => void; onConfirm: () => void; }) {
  if (!record) return null;
  return <><button onClick={onClose} className="fixed inset-0 z-[100] bg-[#102019]/40 backdrop-blur-[2px]" /><div className="fixed inset-0 z-[110] flex items-center justify-center p-5"><section className="w-full max-w-[430px] rounded-[20px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#fff0f0] text-[#c14d4d]"><AlertTriangle className="h-5 w-5" /></span><button onClick={onClose}><X className="h-4 w-4" /></button></div><h2 className="mt-5 text-[16px] font-semibold">ลบรายการทรัพยากร</h2><p className="mt-2 text-[10px] leading-5 text-[#778291]">ยืนยันการลบ {record.reference} ของ {record.machineName} หรือไม่? ผลรวม Carbon จะเปลี่ยนตามข้อมูลที่เหลือ</p><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="min-h-[42px] rounded-[10px] border px-4 text-[10px]">ยกเลิก</button><button onClick={onConfirm} className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-[#c34f4f] px-4 text-[10px] font-semibold text-white"><Trash2 className="h-4 w-4" />ลบรายการ</button></div></section></div></>;
}
