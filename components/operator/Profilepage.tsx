"use client";

import { useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  PenLine,
  Lock,
  Building2,
  Factory,
  UserCircle,
  ShieldCheck,
  Clock,
  UserCog,
  Calendar,
  ChevronRight,
  ShieldAlert,
  X,
  Loader2,
} from "lucide-react";
import type { ProfileDetail } from "@/lib/Profile queries";

/**
 * components/operator/ProfilePage.tsx
 * --------------------------------------
 * หน้า "โปรไฟล์" ไฟล์เดียว (ไม่มีโฟลเดอร์ย่อย) — เชื่อม API จริง 2 endpoint:
 *   PATCH /api/profile          -> แก้ เบอร์โทร/แผนก/ไลน์การผลิต
 *   POST  /api/profile/password -> เปลี่ยนรหัสผ่าน (ตรวจรหัสเดิมก่อนเสมอ)
 *
 * ชื่อ-นามสกุล / อีเมล / username / รหัสพนักงาน / ตำแหน่ง เป็น read-only ในหน้านี้
 * ตั้งใจไม่ให้แก้เอง เพราะควรผ่านการอนุมัติจาก Company Admin (ดูหมายเหตุใน
 * app/api/profile/route.ts) — ถ้าต้องการให้แก้ได้เองทั้งหมด บอกได้
 *
 * "โรงงาน" และ "ผู้สร้างบัญชี" ไม่มีใน schema ตอนนี้ ตัดออก (ดูรายละเอียดใน
 * prisma/user-profile-fields-update.md)
 */

export default function ProfilePage({ profile }: { profile: ProfileDetail }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ProfileInfoCard profile={profile} />
        <ChangePasswordCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CompanyAccessCard profile={profile} />
        <AccountUsageCard profile={profile} />
      </div>

      <SecurityTip />
    </div>
  );
}

function ProfileInfoCard({ profile }: { profile: ProfileDetail }) {
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [department, setDepartment] = useState(profile.department ?? "");
  const [productionLine, setProductionLine] = useState(profile.productionLine ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, department, productionLine }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message ?? "บันทึกข้อมูลไม่สำเร็จ" });
        return;
      }
      setMessage({ type: "success", text: "บันทึกข้อมูลเรียบร้อยแล้ว" });
    } catch (err) {
      console.error("Update profile error:", err);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" });
    } finally {
      setIsSaving(false);
    }
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800">ข้อมูลโปรไฟล์</h2>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2 sm:w-40">
          <div className="relative">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-3xl font-semibold text-emerald-700">
              {profile.firstName.charAt(0)}
            </span>
            <button
              type="button"
              onClick={() => alert("ฟีเจอร์อัปโหลดรูปโปรไฟล์จะเปิดใช้งานในเวอร์ชันถัดไป")}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Camera size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => alert("ฟีเจอร์อัปโหลดรูปโปรไฟล์จะเปิดใช้งานในเวอร์ชันถัดไป")}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            เปลี่ยนรูปโปรไฟล์
          </button>
          <p className="text-center text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 5MB)</p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label="ชื่อ-นามสกุล" value={fullName} />
          <ReadOnlyField label="ชื่อผู้ใช้ (Username)" value={profile.username} />
          <ReadOnlyField label="อีเมล" value={profile.email} />
          <ReadOnlyField label="รหัสพนักงาน" value={profile.employeeCode ?? "-"} />

          <EditableField label="เบอร์โทรศัพท์" value={phone} onChange={setPhone} placeholder="098-765-4321" />
          <ReadOnlyField label="ตำแหน่ง" value={profile.roleLabel} />

          <EditableField label="แผนก" value={department} onChange={setDepartment} placeholder="เช่น Utility" />
          <EditableField label="ไลน์การผลิต" value={productionLine} onChange={setProductionLine} placeholder="เช่น Production Line 1" />
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <PenLine size={16} />}
          แก้ไขข้อมูล
        </button>
      </div>
    </section>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword() {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        return;
      }
      setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800">เปลี่ยนรหัสผ่าน</h2>

      <div className="flex flex-col gap-4">
        <PasswordField label="รหัสผ่านปัจจุบัน" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggleShow={() => setShowCurrent((v) => !v)} placeholder="กรอกรหัสผ่านปัจจุบัน" />
        <PasswordField label="รหัสผ่านใหม่" value={newPassword} onChange={setNewPassword} show={showNew} onToggleShow={() => setShowNew((v) => !v)} placeholder="กรอกรหัสผ่านใหม่" />
        <PasswordField label="ยืนยันรหัสผ่านใหม่" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggleShow={() => setShowConfirm((v) => !v)} placeholder="ยืนยันรหัสผ่านใหม่" />
      </div>

      {message && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={isSaving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
        เปลี่ยนรหัสผ่าน
      </button>
    </section>
  );
}

function CompanyAccessCard({ profile }: { profile: ProfileDetail }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800">ข้อมูลบริษัทและสิทธิ์การใช้งาน</h2>
      <ul className="flex flex-col divide-y divide-slate-100">
        <InfoRow icon={Building2} label="บริษัท" value={profile.companyName ?? "-"} />
        <InfoRow icon={UserCircle} label="บทบาท" value={profile.roleLabel} />
        <li className="flex items-start justify-between gap-4 py-3 text-sm">
          <span className="flex items-center gap-2.5 text-slate-500">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-slate-400" />
            สิทธิ์การเข้าถึง
          </span>
          <span className="text-right font-medium text-slate-800">{profile.permissions.join(", ")}</span>
        </li>
      </ul>
    </section>
  );
}

function AccountUsageCard({ profile }: { profile: ProfileDetail }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-800">ข้อมูลการใช้งานบัญชี</h2>
      <ul className="flex flex-col divide-y divide-slate-100">
        <InfoRow icon={Clock} label="เข้าสู่ระบบครั้งล่าสุด" value={formatDateTime(profile.lastLogin)} />
        <li className="flex items-center justify-between py-3 text-sm">
          <span className="flex items-center gap-2.5 text-slate-500">
            <UserCog size={16} className="text-slate-400" />
            สถานะบัญชี
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              profile.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {profile.status === "ACTIVE" ? "ใช้งานปกติ" : profile.status === "LOCKED" ? "ถูกล็อก" : "ระงับการใช้งาน"}
          </span>
        </li>
        <InfoRow icon={Calendar} label="วันที่สร้างบัญชี" value={formatDate(profile.createdAt)} />
      </ul>
    </section>
  );
}

function SecurityTip() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        <ShieldAlert size={18} />
      </span>
      <div className="flex-1">
        <p className="mb-1 text-sm font-semibold text-emerald-700">เคล็ดลับเพื่อความปลอดภัย</p>
        <p className="text-sm text-slate-500">ไม่แนะนำให้แชร์รหัสผ่านของคุณกับผู้อื่น และควรเปลี่ยนรหัสผ่านเป็นประจำเพื่อความปลอดภัยของข้อมูล</p>
      </div>
      <button type="button" onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">{value}</div>
    </label>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 focus-within:border-emerald-400">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 outline-none"
        />
        <button type="button" onClick={onToggleShow} className="text-slate-400 hover:text-slate-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-3 text-sm">
      <span className="flex items-center gap-2.5 text-slate-500">
        <Icon size={16} className="text-slate-400" />
        {label}
      </span>
      <span className="flex items-center gap-1 font-medium text-slate-800">
        {value}
        <ChevronRight size={14} className="text-slate-300" />
      </span>
    </li>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}