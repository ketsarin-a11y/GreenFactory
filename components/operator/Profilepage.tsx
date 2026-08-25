"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import type { ProfileDetail } from "@/lib/Profile queries";

type ProfileWithAvatar = ProfileDetail & {
  avatarUrl?: string | null;
};

type Notice = {
  type: "success" | "error";
  text: string;
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePage({ profile }: { profile: ProfileWithAvatar }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6 pb-12">
      <ProfileHero profile={profile} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.85fr)]">
        <PersonalInformationCard profile={profile} />
        <div className="space-y-6">
          <AccountSummaryCard profile={profile} />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}

function ProfileHero({ profile }: { profile: ProfileWithAvatar }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = useMemo(
    () => `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase(),
    [profile.firstName, profile.lastName],
  );

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setNotice({ type: "error", text: "รองรับเฉพาะไฟล์ JPG, PNG และ WEBP เท่านั้นครับ" });
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setNotice({ type: "error", text: "รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB นะครับ" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const previousAvatar = avatarUrl;
    setAvatarUrl(previewUrl);
    setNotice(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        success?: boolean;
        avatarUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.success || !data.avatarUrl) {
        setAvatarUrl(previousAvatar);
        setNotice({ type: "error", text: data.message ?? "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ" });
        return;
      }

      setAvatarUrl(data.avatarUrl);
      setNotice({ type: "success", text: "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว ✨" });
    } catch (error) {
      console.error("Upload avatar error:", error);
      setAvatarUrl(previousAvatar);
      setNotice({ type: "error", text: "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่อีกครั้ง" });
    } finally {
      URL.revokeObjectURL(previewUrl);
      setIsUploading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)] transition-all">
      {/* Banner พื้นหลังไล่สีละมุนๆ */}
      <div className="h-28 bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-sky-400/20 relative">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between relative z-10">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            {/* รูปโปรไฟล์ */}
            <div className="relative w-fit shrink-0">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-emerald-700">{initials || "U"}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
                aria-label="เปลี่ยนรูปโปรไฟล์"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* ข้อมูลชื่อและอีเมล */}
            <div className="min-w-0 pb-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{fullName}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                  <Check size={13} className="stroke-[2.5]" />
                  {profile.status === "ACTIVE" ? "บัญชีใช้งานปกติ" : "บัญชีถูกจำกัด"}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-600">{profile.roleLabel}</p>
              <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                <Mail size={14} className="text-slate-400" />
                <span className="truncate">{profile.email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 active:scale-95"
          >
            <ImagePlus size={17} className="text-slate-500" />
            เปลี่ยนรูปโปรไฟล์
          </button>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-400 sm:ml-36">รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5 MB</p>

        {notice && <InlineNotice notice={notice} className="mt-4" />}
      </div>
    </section>
  );
}

function PersonalInformationCard({ profile }: { profile: ProfileWithAvatar }) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [department, setDepartment] = useState(profile.department ?? "");
  const [productionLine, setProductionLine] = useState(profile.productionLine ?? "");
  const [savedValues, setSavedValues] = useState({
    phone: profile.phone ?? "",
    department: profile.department ?? "",
    productionLine: profile.productionLine ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  function handleCancel() {
    setPhone(savedValues.phone);
    setDepartment(savedValues.department);
    setProductionLine(savedValues.productionLine);
    setNotice(null);
    setIsEditing(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          department: department.trim(),
          productionLine: productionLine.trim(),
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        setNotice({ type: "error", text: data.message ?? "บันทึกข้อมูลไม่สำเร็จ" });
        return;
      }

      const nextValues = {
        phone: phone.trim(),
        department: department.trim(),
        productionLine: productionLine.trim(),
      };

      setPhone(nextValues.phone);
      setDepartment(nextValues.department);
      setProductionLine(nextValues.productionLine);
      setSavedValues(nextValues);
      setIsEditing(false);
      setNotice({ type: "success", text: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว ✨" });
    } catch (error) {
      console.error("Update profile error:", error);
      setNotice({ type: "error", text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-8">
      <CardHeader
        title="ข้อมูลส่วนตัว"
        description="จัดการข้อมูลที่ใช้ในการติดต่อและข้อมูลการทำงานของคุณ"
        action={
          isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={16} />
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                บันทึก
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNotice(null);
                setIsEditing(true);
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              <Pencil size={15} className="text-slate-500" />
              แก้ไข
            </button>
          )
        }
      />

      <div className="mt-6 grid gap-x-5 gap-y-4.5 md:grid-cols-2">
        <ProfileField icon={UserRound} label="ชื่อ-นามสกุล" value={fullName} />
        <ProfileField icon={UserRound} label="ชื่อผู้ใช้" value={profile.username} />
        <ProfileField icon={Mail} label="อีเมล" value={profile.email} />
        <ProfileField icon={UsersRound} label="รหัสพนักงาน" value={profile.employeeCode ?? "-"} />
        <ProfileField icon={ShieldCheck} label="ตำแหน่ง" value={profile.roleLabel} />

        <EditableProfileField
          icon={Phone}
          label="เบอร์โทรศัพท์"
          value={phone}
          onChange={setPhone}
          editable={isEditing}
          placeholder="เช่น 098-765-4321"
        />
        <EditableProfileField
          icon={Building2}
          label="แผนก"
          value={department}
          onChange={setDepartment}
          editable={isEditing}
          placeholder="เช่น Utility"
        />
        <EditableProfileField
          icon={Building2}
          label="ไลน์การผลิต"
          value={productionLine}
          onChange={setProductionLine}
          editable={isEditing}
          placeholder="เช่น Production Line 1"
        />
      </div>

      {notice && <InlineNotice notice={notice} className="mt-5" />}

      <div className="mt-6 rounded-2xl bg-slate-50/80 border border-slate-100 px-4 py-3.5 text-xs leading-relaxed text-slate-500">
        💡 <span className="font-semibold text-slate-700">หมายเหตุ:</span> ชื่อ อีเมล ชื่อผู้ใช้ รหัสพนักงาน และตำแหน่งถูกกำหนดโดยผู้ดูแลระบบ หากต้องการเปลี่ยนข้อมูลเหล่านี้ให้ติดต่อ Company Admin
      </div>
    </section>
  );
}

function AccountSummaryCard({ profile }: { profile: ProfileWithAvatar }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-8">
      <CardHeader title="บัญชีและสิทธิ์" description="ข้อมูลการเข้าถึงระบบของบัญชีนี้" />

      <div className="mt-5 space-y-1">
        <SummaryRow icon={Building2} label="บริษัท" value={profile.companyName ?? "-"} />
        <SummaryRow icon={ShieldCheck} label="บทบาท" value={profile.roleLabel} />
        <SummaryRow icon={Clock3} label="เข้าสู่ระบบล่าสุด" value={formatDateTime(profile.lastLogin)} />
        <SummaryRow icon={CalendarDays} label="สร้างบัญชีเมื่อ" value={formatDate(profile.createdAt)} />
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">สิทธิ์การเข้าถึง</p>
        <div className="flex flex-wrap gap-2">
          {profile.permissions.length > 0 ? (
            profile.permissions.map((permission) => (
              <span key={permission} className="rounded-xl bg-emerald-50 border border-emerald-200/50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {permission}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">ยังไม่มีสิทธิ์ที่กำหนด</span>
          )}
        </div>
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
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: "error", text: "กรุณากรอกรหัสผ่านให้ครบทุกช่องด้วยนะครับ" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน" });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        setNotice({ type: "error", text: data.message ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว 🔒" });
    } catch (error) {
      console.error("Change password error:", error);
      setNotice({ type: "error", text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-8">
      <CardHeader title="ความปลอดภัย" description="เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี" />

      <div className="mt-5 space-y-4">
        <PasswordInput
          label="รหัสผ่านปัจจุบัน"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggle={() => setShowCurrent((value) => !value)}
          autoComplete="current-password"
        />
        <PasswordInput
          label="รหัสผ่านใหม่"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew((value) => !value)}
          autoComplete="new-password"
        />
        <PasswordInput
          label="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm((value) => !value)}
          autoComplete="new-password"
        />
      </div>

      {notice && <InlineNotice notice={notice} className="mt-4" />}

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={isSaving}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
        เปลี่ยนรหัสผ่าน
      </button>
    </section>
  );
}

function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h2>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-400">
        <Icon size={14} className="text-slate-400" />
        {label}
      </div>
      <p className="min-h-5 break-words text-sm font-bold text-slate-700">{value || "-"}</p>
    </div>
  );
}

function EditableProfileField({
  icon: Icon,
  label,
  value,
  onChange,
  editable,
  placeholder,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  placeholder: string;
}) {
  if (!editable) {
    return <ProfileField icon={Icon} label={label} value={value || "-"} />;
  }

  return (
    <label className="block rounded-2xl border-2 border-emerald-300/80 bg-emerald-50/20 p-4 transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:shadow-sm">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-emerald-700">
        <Icon size={14} />
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300"
      />
    </label>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-2 py-3 transition hover:bg-slate-50/80">
      <div className="flex min-w-0 items-center gap-3 text-sm text-slate-500">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 shadow-2xs">
          <Icon size={16} />
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="max-w-[55%] text-right text-sm font-bold text-slate-700">{value}</span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 transition-all focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

function InlineNotice({ notice, className = "" }: { notice: Notice; className?: string }) {
  return (
    <div
      className={`${className} rounded-2xl border px-4 py-3 text-xs font-semibold ${
        notice.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-600"
      }`}
    >
      {notice.text}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}