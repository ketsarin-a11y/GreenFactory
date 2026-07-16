"use client";

import QRCode from "qrcode";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Copy,
  Download,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldBan,
  ShieldX,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { qrCodeService } from "@/services/qr-code.service";
import type {
  QRCodeFormValue,
  QRCodeItem,
  QRCodeStatus,
} from "@/types/qr-code";
import { qrTargets } from "./qr-code-data";

const PAGE_SIZE = 7;

function statusLabel(status: QRCodeStatus) {
  if (status === "ACTIVE") return "ใช้งานอยู่";
  if (status === "SUSPENDED") return "ระงับ";
  return "ยกเลิก";
}

function statusClass(status: QRCodeStatus) {
  if (status === "ACTIVE") return "bg-[#e8f7ef] text-[#24734b]";
  if (status === "SUSPENDED") return "bg-[#fff4df] text-[#9b6a16]";
  return "bg-[#fff0f0] text-[#b14848]";
}

function QRPreview({ item }: { item: QRCodeItem }) {
  const [dataUrl, setDataUrl] = useState("");
  const scanUrl =
    typeof window === "undefined"
      ? `http://localhost:3000/scan/${item.token}`
      : `${window.location.origin}/scan/${item.token}`;

  useEffect(() => {
    QRCode.toDataURL(scanUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
    }).then(setDataUrl);
  }, [scanUrl]);

  return dataUrl ? (
    <img
      src={dataUrl}
      alt={`QR ${item.code}`}
      className="mx-auto h-[220px] w-[220px]"
    />
  ) : (
    <div className="mx-auto h-[220px] w-[220px] animate-pulse rounded-[12px] bg-[#eef2f5]" />
  );
}

function QRDrawer({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
  onSave: (value: QRCodeFormValue) => void;
}) {
  const defaultTarget = qrTargets[0];
  const [code, setCode] = useState(item?.code ?? "");
  const [targetCode, setTargetCode] = useState(
    item?.targetCode ?? defaultTarget.targetCode,
  );
  const [status, setStatus] = useState<QRCodeStatus>(
    item?.status ?? "ACTIVE",
  );
  const [note, setNote] = useState(item?.note ?? "");

  const target =
    qrTargets.find((current) => current.targetCode === targetCode) ??
    defaultTarget;

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      targetType: target.targetType,
      targetName: target.targetName,
      targetCode: target.targetCode,
      building: target.building,
      department: target.department,
      productionLine: target.productionLine,
      status,
      createdBy: item?.createdBy ?? "Company Admin",
      note: note.trim(),
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-[#0d1726]/35 backdrop-blur-[2px]"
      />

      <aside className="fixed inset-y-0 right-0 z-[80] w-full max-w-[520px] overflow-y-auto bg-white shadow-[-24px_0_70px_rgba(17,31,51,0.18)]">
        <div className="flex h-[74px] items-center justify-between border-b border-[#e5e9ee] px-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#263247]">
              {item ? "แก้ไข QR Code" : "สร้าง QR Code"}
            </h2>
            <p className="mt-1 text-[8px] text-[#929ca9]">
              ระบบจะสร้าง Token แบบ UUID ให้โดยอัตโนมัติ
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
          <label className="block">
            <span className="text-[10px] font-medium text-[#465365]">
              รหัส QR *
            </span>
            <input
              required
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="เช่น INSP-006"
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px] uppercase outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-medium text-[#465365]">
              เครื่องจักร / จุดตรวจ *
            </span>
            <select
              value={targetCode}
              onChange={(event) => setTargetCode(event.target.value)}
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px]"
            >
              {qrTargets.map((current) => (
                <option key={current.targetCode} value={current.targetCode}>
                  {current.targetName} · {current.targetCode}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 rounded-[14px] border border-[#e2e7ec] bg-[#fafbfc] p-4 sm:grid-cols-2">
            {[
              ["ประเภท", target.targetType === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"],
              ["อาคาร", target.building],
              ["แผนก", target.department],
              ["สายการผลิต", target.productionLine],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[7px] text-[#99a2ad]">{label}</p>
                <p className="mt-1 text-[9px] font-medium text-[#4b586a]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="text-[10px] font-medium text-[#465365]">
              สถานะ
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as QRCodeStatus)
              }
              className="mt-2 h-[48px] w-full rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 text-[11px]"
            >
              <option value="ACTIVE">ใช้งานอยู่</option>
              <option value="SUSPENDED">ระงับ</option>
              <option value="REVOKED">ยกเลิก</option>
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-medium text-[#465365]">
              หมายเหตุ
            </span>
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-[110px] w-full resize-none rounded-[12px] border border-[#dfe5eb] bg-[#fbfcfd] px-4 py-3 text-[11px] outline-none focus:border-[#4d9c7a] focus:ring-4 focus:ring-[#4d9c7a]/8"
            />
          </label>

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

export default function QRCodePageClient() {
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [selected, setSelected] = useState<QRCodeItem | null>(null);
  const [editing, setEditing] = useState<QRCodeItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    qrCodeService.getAll().then((data) => {
      setItems(data);
      setSelected(data[0] ?? null);
    });
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(items.map((item) => item.department))),
    [items],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.code.toLowerCase().includes(keyword) ||
        item.targetName.toLowerCase().includes(keyword) ||
        item.targetCode.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "ALL" || item.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [items, search, statusFilter, departmentFilter]);

  const totals = useMemo(
    () => ({
      all: items.length,
      active: items.filter((item) => item.status === "ACTIVE").length,
      suspended: items.filter((item) => item.status === "SUSPENDED").length,
      revoked: items.filter((item) => item.status === "REVOKED").length,
    }),
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const scanUrl = selected
    ? `${typeof window === "undefined" ? "http://localhost:3000" : window.location.origin}/scan/${selected.token}`
    : "";

  async function saveItem(value: QRCodeFormValue) {
    if (editing) {
      const updated = await qrCodeService.update({ ...editing, ...value });
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected(updated);
    } else {
      const created = await qrCodeService.create(value);
      setItems((current) => [created, ...current]);
      setSelected(created);
    }
    setEditing(null);
    setDrawerOpen(false);
    setPage(1);
  }

  async function regenerate(item: QRCodeItem) {
    if (!window.confirm("สร้าง Token ใหม่หรือไม่? QR เดิมจะใช้งานไม่ได้")) {
      return;
    }
    const updated = await qrCodeService.regenerateToken(item.id);
    if (!updated) return;
    setItems((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
    setSelected(updated);
    setMenuId(null);
  }

  async function toggleSuspend(item: QRCodeItem) {
    const updated = await qrCodeService.update({
      ...item,
      status: item.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED",
    });
    setItems((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
    setSelected(updated);
  }

  async function remove(item: QRCodeItem) {
    if (!window.confirm(`ยืนยันการลบ ${item.code} หรือไม่?`)) return;
    await qrCodeService.remove(item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (selected?.id === item.id) setSelected(null);
  }

  async function copyLink() {
    if (scanUrl) await navigator.clipboard.writeText(scanUrl);
  }

  async function downloadSelected() {
    if (!selected) return;
    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 800,
      margin: 2,
      errorCorrectionLevel: "H",
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `QR_${selected.code}_${selected.targetCode}.png`;
    link.click();
  }

  async function printSelected() {
    if (!selected) return;
    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: "H",
    });
    const popup = window.open("", "_blank", "width=640,height=860");
    if (!popup) return;
    popup.document.write(`
      <html><head><title>${selected.code}</title>
      <style>body{font-family:Arial;padding:30px}.label{width:420px;border:2px solid #1f8f62;border-radius:16px;padding:24px}img{width:260px;height:260px;display:block;margin:20px auto}h1{font-size:24px;margin:0}p{font-size:14px}</style>
      </head><body><div class="label"><p>GreenFactory Insight</p><h1>${selected.targetName}</h1><p>${selected.targetCode} · ${selected.code}</p><img src="${dataUrl}"/><p>อาคาร: ${selected.building}</p><p>แผนก: ${selected.department}</p><p>สายการผลิต: ${selected.productionLine}</p></div></body></html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1800px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#182334] sm:text-[32px]">
              QR Code
            </h1>
            <p className="mt-2 text-[10px] text-[#7f8997]">
              สร้าง QR Code สำหรับเครื่องจักรและจุดตรวจ เพื่อให้ Operator สแกนเข้าใช้งานได้จริง
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] bg-[#1f8f62] px-4 text-[9px] font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            สร้าง QR Code
          </button>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["QR Code ทั้งหมด", totals.all, QrCode, "bg-[#e8f5ed] text-[#2d8057]"],
            ["ใช้งานอยู่", totals.active, CheckCircle2, "bg-[#e8f7ef] text-[#24734b]"],
            ["ระงับ", totals.suspended, CirclePause, "bg-[#fff4df] text-[#9b6a16]"],
            ["ยกเลิก", totals.revoked, ShieldX, "bg-[#fff0f0] text-[#b14848]"],
          ].map(([label, value, Icon, iconClass]) => (
            <article
              key={String(label)}
              className="rounded-[17px] border border-[#e0e5ea] bg-white p-4 shadow-[0_8px_28px_rgba(28,43,61,0.035)]"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${String(iconClass)}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-[8px] text-[#909aa7]">{String(label)}</p>
                  <p className="mt-1 text-[21px] font-semibold text-[#283548]">
                    {Number(value)} <span className="text-[9px] font-medium text-[#929ca9]">รายการ</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex overflow-hidden rounded-[18px] border border-[#e0e5ea] bg-white shadow-[0_8px_28px_rgba(28,43,61,0.035)]">
          <div className="min-w-0 flex-1">
            <div className="border-b border-[#e7ebef] p-4">
              <div className="grid gap-3 xl:grid-cols-[1.3fr_0.8fr_1fr_auto]">
                <div className="flex h-[40px] items-center gap-3 rounded-[10px] border border-[#dfe5eb] bg-[#f9fafb] px-3">
                  <Search className="h-3.5 w-3.5 text-[#8b96a4]" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="ค้นหารหัส QR เครื่องจักร หรือจุดตรวจ"
                    className="min-w-0 flex-1 bg-transparent text-[9px] outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[40px] rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px]"
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="ACTIVE">ใช้งานอยู่</option>
                  <option value="SUSPENDED">ระงับ</option>
                  <option value="REVOKED">ยกเลิก</option>
                </select>
                <select
                  value={departmentFilter}
                  onChange={(event) => {
                    setDepartmentFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-[40px] rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px]"
                >
                  <option value="ALL">ทุกแผนก</option>
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setDepartmentFilter("ALL");
                    setPage(1);
                  }}
                  className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] bg-white px-3 text-[9px] text-[#596677]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e7ebef] bg-[#fafbfc] text-left">
                    {["ลำดับ", "เครื่องจักร / จุดตรวจ", "รหัส QR", "แผนก", "สายการผลิต", "สถานะ", "QR", ""].map((label) => (
                      <th key={label} className="px-4 py-3 text-[8px] font-semibold text-[#8b96a4]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`cursor-pointer border-b border-[#eef1f3] last:border-0 ${selected?.id === item.id ? "bg-[#f2faf6]" : "hover:bg-[#fbfcfd]"}`}
                    >
                      <td className="px-4 py-3 text-[9px] text-[#7f8a98]">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-[9px] font-semibold text-[#3d4a5d]">{item.targetName}</p>
                        <p className="mt-1 text-[7px] text-[#98a1ac]">{item.targetType === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"} · {item.targetCode}</p>
                      </td>
                      <td className="px-4 py-3 text-[9px] font-medium text-[#566274]">{item.code}</td>
                      <td className="px-4 py-3 text-[9px] text-[#667283]">{item.department}</td>
                      <td className="px-4 py-3 text-[9px] text-[#667283]">{item.productionLine}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-medium ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
                      </td>
                      <td className="px-4 py-3"><span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef6f1] text-[#2d8057]"><QrCode className="h-4 w-4" /></span></td>
                      <td className="relative px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <button type="button" onClick={() => setMenuId((current) => current === item.id ? null : item.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#7d8896] hover:bg-[#eef2f5]"><MoreHorizontal className="h-4 w-4" /></button>
                        {menuId === item.id && (
                          <div className="absolute right-4 top-[44px] z-30 w-[178px] rounded-[11px] border border-[#dfe5eb] bg-white p-1.5 shadow-[0_16px_42px_rgba(26,38,57,0.14)]">
                            <button type="button" onClick={() => { setEditing(item); setDrawerOpen(true); setMenuId(null); }} className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#566274] hover:bg-[#f4f6f8]"><Pencil className="h-3.5 w-3.5" />แก้ไข</button>
                            <button type="button" onClick={() => regenerate(item)} className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#85611c] hover:bg-[#fff8e9]"><RefreshCw className="h-3.5 w-3.5" />สร้าง Token ใหม่</button>
                            <button type="button" onClick={() => remove(item)} className="flex min-h-[36px] w-full items-center gap-2.5 rounded-[8px] px-3 text-left text-[9px] text-[#b14848] hover:bg-[#fff1f1]"><Trash2 className="h-3.5 w-3.5" />ลบรายการ</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex items-center justify-between border-t border-[#e8ecf0] px-4 py-3">
              <p className="text-[8px] text-[#929ca9]">แสดง {visibleItems.length} จาก {filteredItems.length} รายการ</p>
              <div className="flex items-center gap-1.5">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button>
                <span className="min-w-[64px] text-center text-[8px] text-[#6f7b8a]">{currentPage} / {totalPages}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dfe5eb] text-[#6f7b8a] disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </footer>
          </div>

          {selected && (
            <aside className="hidden w-[360px] border-l border-[#e3e8ed] bg-white xl:block">
              <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-[#2b8057]">QR Code Detail</p>
                    <h2 className="mt-2 text-[15px] font-semibold text-[#283548]">{selected.targetName}</h2>
                    <p className="mt-1 text-[8px] text-[#929ca9]">{selected.code}</p>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c8795] hover:bg-[#eef2f5]"><X className="h-4 w-4" /></button>
                </div>

                <div className="mt-5 rounded-[16px] border border-[#dfe5eb] bg-[#fafbfc] p-4 text-center"><QRPreview item={selected} /></div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={downloadSelected} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] text-[9px] font-medium text-[#566274]"><Download className="h-3.5 w-3.5" />ดาวน์โหลด</button>
                  <button type="button" onClick={printSelected} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] text-[9px] font-medium text-[#566274]"><Printer className="h-3.5 w-3.5" />พิมพ์ฉลาก</button>
                  <button type="button" onClick={copyLink} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] text-[9px] font-medium text-[#566274]"><Copy className="h-3.5 w-3.5" />คัดลอกลิงก์</button>
                  <a href={scanUrl} target="_blank" rel="noreferrer" className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#dfe5eb] text-[9px] font-medium text-[#566274]"><ExternalLink className="h-3.5 w-3.5" />เปิดหน้า Scan</a>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["ประเภท", selected.targetType === "MACHINE" ? "เครื่องจักร" : "จุดตรวจ"],
                    ["รหัสอุปกรณ์", selected.targetCode],
                    ["อาคาร", selected.building],
                    ["แผนก", selected.department],
                    ["สายการผลิต", selected.productionLine],
                    ["สถานะ", statusLabel(selected.status)],
                    ["สร้างเมื่อ", selected.createdAt],
                    ["แก้ไขล่าสุด", selected.updatedAt],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[11px] border border-[#e6eaee] px-3 py-3">
                      <p className="text-[7px] text-[#99a2ad]">{label}</p>
                      <p className="mt-1 break-words text-[9px] font-medium text-[#495669]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[12px] border border-[#e6eaee] bg-[#fbfcfd] p-3">
                  <p className="text-[7px] text-[#99a2ad]">Scan URL</p>
                  <p className="mt-1 break-all text-[8px] leading-4 text-[#596677]">{scanUrl}</p>
                </div>

                <div className="mt-5 grid gap-2">
                  <button type="button" onClick={() => regenerate(selected)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#e4d8b5] bg-[#fffaf0] text-[9px] font-medium text-[#85611c]"><RefreshCw className="h-3.5 w-3.5" />สร้าง Token ใหม่</button>
                  <button type="button" onClick={() => toggleSuspend(selected)} className="inline-flex h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#f0caca] bg-[#fff7f7] text-[9px] font-medium text-[#b14848]"><ShieldBan className="h-3.5 w-3.5" />{selected.status === "SUSPENDED" ? "เปิดใช้งานอีกครั้ง" : "ระงับการใช้งาน"}</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>

      <QRDrawer
        key={`${editing?.id ?? "new"}-${drawerOpen}`}
        open={drawerOpen}
        item={editing}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSave={saveItem}
      />
    </>
  );
}
