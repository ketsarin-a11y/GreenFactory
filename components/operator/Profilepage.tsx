"use client";

import {

  ChangeEvent,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";

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

type ProfileState = {

  firstName: string;

  lastName: string;

  phone: string;

  department: string;

  productionLine: string;

  avatarUrl: string;

};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ACCEPTED_AVATAR_TYPES = [

  "image/jpeg",

  "image/png",

  "image/webp",

];

const PROFILE_EVENT = "gfi-profile-updated";

const PROFILE_AVATAR_KEY = "gfi_operator_avatar";

export default function ProfilePage({

  profile,

}: {

  profile: ProfileWithAvatar;

}) {

  const [profileState, setProfileState] =

    useState<ProfileState>({

      firstName: profile.firstName,

      lastName: profile.lastName,

      phone: profile.phone ?? "",

      department: profile.department ?? "",

      productionLine: profile.productionLine ?? "",

      avatarUrl: profile.avatarUrl ?? "",

    });

  useEffect(() => {

    let active = true;

    async function hydrateProfileFromDatabase() {

      try {

        const response = await fetch("/api/Profile", {

          method: "GET",

          credentials: "include",

          cache: "no-store",

        });

        const responseText = await response.text();

        let data: {

          success?: boolean;

          profile?: {

            firstName?: string;

            lastName?: string;

            phone?: string;

            department?: string;

            productionLine?: string;

            avatarUrl?: string | null;

          };

        } = {};

        try {

          data = responseText

            ? JSON.parse(responseText)

            : {};

        } catch {

          return;

        }

        if (

          !active ||

          !response.ok ||

          !data.success ||

          !data.profile

        ) {

          return;

        }

        setProfileState((current) => ({

          ...current,

          firstName:

            data.profile?.firstName ?? current.firstName,

          lastName:

            data.profile?.lastName ?? current.lastName,

          phone:

            data.profile?.phone ?? current.phone,

          department:

            data.profile?.department ?? current.department,

          productionLine:

            data.profile?.productionLine ?? current.productionLine,

          avatarUrl:

            data.profile?.avatarUrl ?? current.avatarUrl,

        }));

        if (data.profile.avatarUrl) {

          window.localStorage.setItem(

            PROFILE_AVATAR_KEY,

            data.profile.avatarUrl,

          );

        }

      } catch (error) {

        console.error(

          "Hydrate profile from database error:",

          error,

        );

        const cachedAvatar =

          window.localStorage.getItem(

            PROFILE_AVATAR_KEY,

          );

        if (active && cachedAvatar) {

          setProfileState((current) => ({

            ...current,

            avatarUrl: cachedAvatar,

          }));

        }

      }

    }

    const cachedAvatar =

      window.localStorage.getItem(

        PROFILE_AVATAR_KEY,

      );

    if (cachedAvatar) {

      setProfileState((current) => ({

        ...current,

        avatarUrl:

          current.avatarUrl || cachedAvatar,

      }));

    }

    void hydrateProfileFromDatabase();

    return () => {

      active = false;

    };

  }, []);

  return (

    <div className="mx-auto w-full max-w-[1240px] space-y-4 px-0 pb-8 sm:space-y-6 sm:pb-12">

      <ProfileHero

        profile={profile}

        state={profileState}

        setState={setProfileState}

      />

      <div className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">

        <PersonalInformationCard

          profile={profile}

          state={profileState}

          setState={setProfileState}

        />

        <div className="space-y-6">

          <AccountSummaryCard profile={profile} />

          <ChangePasswordCard />

        </div>

      </div>

    </div>

  );

}

function notifyProfileChanged(detail: {

  avatarUrl?: string;

  firstName?: string;

  lastName?: string;

}) {

  window.dispatchEvent(

    new CustomEvent(PROFILE_EVENT, {

      detail,

    }),

  );

}

function ProfileHero({

  profile,

  state,

  setState,

}: {

  profile: ProfileWithAvatar;

  state: ProfileState;

  setState: React.Dispatch<

    React.SetStateAction<ProfileState>

  >;

}) {

  const fileInputRef =

    useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] =

    useState(false);

  const [notice, setNotice] =

    useState<Notice | null>(null);

  const fullName =

    `${state.firstName} ${state.lastName}`.trim();

  const initials = useMemo(

    () =>

      `${state.firstName?.[0] ?? ""}${

        state.lastName?.[0] ?? ""

      }`.toUpperCase(),

    [state.firstName, state.lastName],

  );

  async function handleAvatarChange(

    event: ChangeEvent<HTMLInputElement>,

  ) {

    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {

      setNotice({

        type: "error",

        text: "รองรับเฉพาะไฟล์ JPG, PNG และ WEBP",

      });

      return;

    }

    if (file.size > MAX_AVATAR_SIZE) {

      setNotice({

        type: "error",

        text: "รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB",

      });

      return;

    }

    const previewUrl =

      URL.createObjectURL(file);

    const previousAvatar =

      state.avatarUrl;

    setState((current) => ({

      ...current,

      avatarUrl: previewUrl,

    }));

    setNotice(null);

    setIsUploading(true);

    try {

      const formData = new FormData();

      formData.append("avatar", file);

      const response = await fetch(

        "/api/Profile/avatar",

        {

          method: "POST",

          body: formData,

        },

      );

      const responseText = await response.text();

      let data: {

        success?: boolean;

        avatarUrl?: string;

        message?: string;

      } = {};

      try {

        data = responseText

          ? JSON.parse(responseText)

          : {};

      } catch {

        data = {

          success: false,

          message:

            response.ok

              ? "รูปแบบข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง"

              : `อัปโหลดรูปไม่สำเร็จ (${response.status})`,

        };

      }

      if (

        !response.ok ||

        !data.success ||

        !data.avatarUrl

      ) {

        setState((current) => ({

          ...current,

          avatarUrl: previousAvatar,

        }));

        setNotice({

          type: "error",

          text:

            data.message ??

            "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ",

        });

        return;

      }

      const persistedAvatarUrl = `${data.avatarUrl}${

        data.avatarUrl.includes("?") ? "&" : "?"

      }v=${Date.now()}`;

      setState((current) => ({

        ...current,

        avatarUrl: persistedAvatarUrl,

      }));

      /*

       * เก็บสำรองฝั่ง browser เพื่อให้ Header

       * ใช้รูปได้ทันที แต่ DB/API ยังเป็น source of truth

       */

      window.localStorage.setItem(

        PROFILE_AVATAR_KEY,

        persistedAvatarUrl,

      );

      notifyProfileChanged({

        avatarUrl: persistedAvatarUrl,

        firstName: state.firstName,

        lastName: state.lastName,

      });

      setNotice({

        type: "success",

        text: "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว",

      });

    } catch (error) {

      console.error(

        "Upload avatar error:",

        error,

      );

      setState((current) => ({

        ...current,

        avatarUrl: previousAvatar,

      }));

      setNotice({

        type: "error",

        text: "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่อีกครั้ง",

      });

    } finally {

      URL.revokeObjectURL(previewUrl);

      setIsUploading(false);

    }

  }

  return (

    <section className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:rounded-[30px]">

      <div className="h-12 bg-gradient-to-r from-emerald-100 via-teal-50 to-sky-100 sm:h-16" />

      <div className="px-4 py-5 sm:px-7 sm:py-7 lg:px-9 lg:py-8">

        <div className="flex min-w-0 flex-col gap-5 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">

            <div className="relative w-fit shrink-0">

              <button

                type="button"

                onClick={() =>

                  fileInputRef.current?.click()

                }

                disabled={isUploading}

                className="group relative flex h-28 w-28 touch-manipulation items-center justify-center overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br from-emerald-100 to-teal-100 shadow-sm transition active:scale-[0.99] hover:shadow-md sm:h-36 sm:w-36 sm:rounded-[32px]"

                aria-label="เปลี่ยนรูปโปรไฟล์"

              >

                {state.avatarUrl ? (

                  // eslint-disable-next-line @next/next/no-img-element

                  <img

                    src={state.avatarUrl}

                    alt={fullName}

                    className="h-full w-full object-cover"

                  />

                ) : (

                  <span className="text-4xl font-black text-emerald-700">

                    {initials || "U"}

                  </span>

                )}

                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">

                  <Camera className="h-7 w-7" />

                </span>

              </button>

              <button

                type="button"

                onClick={() =>

                  fileInputRef.current?.click()

                }

                disabled={isUploading}

                className="absolute -bottom-2 -right-2 flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-white shadow-lg transition active:scale-95 hover:bg-slate-800 disabled:opacity-60"

                aria-label="เลือกรูปโปรไฟล์"

              >

                {isUploading ? (

                  <Loader2 className="h-5 w-5 animate-spin" />

                ) : (

                  <Camera className="h-5 w-5" />

                )}

              </button>

              <input

                ref={fileInputRef}

                type="file"

                accept="image/jpeg,image/png,image/webp"

                onChange={handleAvatarChange}

                className="hidden"

              />

            </div>

            <div className="min-w-0">

              <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">

                <h1 className="max-w-full break-words text-[26px] font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-[36px]">

                  {fullName || "ผู้ใช้งาน"}

                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">

                  <Check className="h-3.5 w-3.5" />

                  {profile.status === "ACTIVE"

                    ? "บัญชีใช้งานปกติ"

                    : "บัญชีถูกจำกัด"}

                </span>

              </div>

              <div className="mt-3 flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">

                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">

                  {profile.roleLabel}

                </span>

                <span className="inline-flex min-w-0 max-w-full items-center gap-2 break-all text-sm font-medium text-slate-500">

                  <Mail className="h-4 w-4 text-slate-400" />

                  {profile.email}

                </span>

              </div>

              <p className="mt-4 text-xs font-medium leading-5 text-slate-400">

                JPG, PNG หรือ WEBP • ขนาดไม่เกิน 5 MB • บันทึกทันทีเมื่ออัปโหลดสำเร็จ

              </p>

            </div>

          </div>

          <button

            type="button"

            onClick={() =>

              fileInputRef.current?.click()

            }

            disabled={isUploading}

            className="inline-flex h-12 w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition active:scale-[0.99] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60 sm:w-auto"

          >

            <ImagePlus className="h-4 w-4" />

            เปลี่ยนรูปโปรไฟล์

          </button>

        </div>

        {notice && (

          <InlineNotice

            notice={notice}

            className="mt-6"

          />

        )}

      </div>

    </section>

  );

}

function PersonalInformationCard({

  profile,

  state,

  setState,

}: {

  profile: ProfileWithAvatar;

  state: ProfileState;

  setState: React.Dispatch<

    React.SetStateAction<ProfileState>

  >;

}) {

  const [isEditing, setIsEditing] =

    useState(false);

  const [savedValues, setSavedValues] =

    useState({

      firstName: state.firstName,

      lastName: state.lastName,

      phone: state.phone,

      department: state.department,

      productionLine:

        state.productionLine,

    });

  const [isSaving, setIsSaving] =

    useState(false);

  const [notice, setNotice] =

    useState<Notice | null>(null);

  function update(

    key:

      | "firstName"

      | "lastName"

      | "phone"

      | "department"

      | "productionLine",

    value: string,

  ) {

    setState((current) => ({

      ...current,

      [key]: value,

    }));

  }

  function handleCancel() {

    setState((current) => ({

      ...current,

      ...savedValues,

    }));

    setNotice(null);

    setIsEditing(false);

  }

  async function handleSave() {

    if (

      !state.firstName.trim() ||

      !state.lastName.trim()

    ) {

      setNotice({

        type: "error",

        text: "กรุณากรอกชื่อและนามสกุล",

      });

      return;

    }

    setIsSaving(true);

    setNotice(null);

    try {

      const response = await fetch(

        "/api/Profile",

        {

          method: "PATCH",

          headers: {

            "Content-Type":

              "application/json",

          },

          body: JSON.stringify({

            firstName:

              state.firstName.trim(),

            lastName:

              state.lastName.trim(),

            phone: state.phone.trim(),

            department:

              state.department.trim(),

            productionLine:

              state.productionLine.trim(),

          }),

        },

      );

      const data =

        (await response.json()) as {

          success?: boolean;

          message?: string;

        };

      if (

        !response.ok ||

        !data.success

      ) {

        setNotice({

          type: "error",

          text:

            data.message ??

            "บันทึกข้อมูลไม่สำเร็จ",

        });

        return;

      }

      const nextValues = {

        firstName:

          state.firstName.trim(),

        lastName:

          state.lastName.trim(),

        phone: state.phone.trim(),

        department:

          state.department.trim(),

        productionLine:

          state.productionLine.trim(),

      };

      setState((current) => ({

        ...current,

        ...nextValues,

      }));

      setSavedValues(nextValues);

      setIsEditing(false);

      notifyProfileChanged({

        avatarUrl: state.avatarUrl,

        firstName:

          nextValues.firstName,

        lastName:

          nextValues.lastName,

      });

      setNotice({

        type: "success",

        text: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว",

      });

    } catch (error) {

      console.error(

        "Update profile error:",

        error,

      );

      setNotice({

        type: "error",

        text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่",

      });

    } finally {

      setIsSaving(false);

    }

  }

  return (

    <section className="min-w-0 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-6 lg:p-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">

            ข้อมูลส่วนตัว

          </h2>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">

            แก้ไขชื่อ ข้อมูลติดต่อ และข้อมูลการทำงานของคุณ

          </p>

        </div>

        {isEditing ? (

          <div className="flex flex-wrap items-center gap-2">

            <button

              type="button"

              onClick={handleCancel}

              disabled={isSaving}

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 sm:h-10"

            >

              <X className="h-4 w-4" />

              ยกเลิก

            </button>

            <button

              type="button"

              onClick={handleSave}

              disabled={isSaving}

              className="inline-flex h-11 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:h-10"

            >

              {isSaving ? (

                <Loader2 className="h-4 w-4 animate-spin" />

              ) : (

                <Save className="h-4 w-4" />

              )}

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

            className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:h-10 sm:w-auto"

          >

            <Pencil className="h-4 w-4" />

            แก้ไข

          </button>

        )}

      </div>

      <div className="mt-5 grid min-w-0 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">

        <EditableProfileField

          icon={UserRound}

          label="ชื่อ"

          value={state.firstName}

          onChange={(value) =>

            update("firstName", value)

          }

          editable={isEditing}

          placeholder="ชื่อ"

        />

        <EditableProfileField

          icon={UserRound}

          label="นามสกุล"

          value={state.lastName}

          onChange={(value) =>

            update("lastName", value)

          }

          editable={isEditing}

          placeholder="นามสกุล"

        />

        <ProfileField

          icon={UserRound}

          label="ชื่อผู้ใช้"

          value={profile.username}

        />

        <ProfileField

          icon={Mail}

          label="อีเมล"

          value={profile.email}

        />

        <ProfileField

          icon={UsersRound}

          label="รหัสพนักงาน"

          value={

            profile.employeeCode ?? "-"

          }

        />

        <ProfileField

          icon={ShieldCheck}

          label="ตำแหน่ง"

          value={profile.roleLabel}

        />

        <EditableProfileField

          icon={Phone}

          label="เบอร์โทรศัพท์"

          value={state.phone}

          onChange={(value) =>

            update("phone", value)

          }

          editable={isEditing}

          placeholder="เช่น 098-765-4321"

        />

        <EditableProfileField

          icon={Building2}

          label="แผนก"

          value={state.department}

          onChange={(value) =>

            update("department", value)

          }

          editable={isEditing}

          placeholder="เช่น SMT"

        />

        <EditableProfileField

          icon={Building2}

          label="ไลน์การผลิต"

          value={state.productionLine}

          onChange={(value) =>

            update(

              "productionLine",

              value,

            )

          }

          editable={isEditing}

          placeholder="เช่น SMT Line 1"

        />

      </div>

      {notice && (

        <InlineNotice

          notice={notice}

          className="mt-5"

        />

      )}

    </section>

  );

}

function AccountSummaryCard({

  profile,

}: {

  profile: ProfileWithAvatar;

}) {

  return (

    <section className="min-w-0 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-6 lg:p-8">

      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">

        บัญชีและสิทธิ์

      </h2>

      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">

        ข้อมูลการเข้าถึงระบบของบัญชีนี้

      </p>

      <div className="mt-5 space-y-1">

        <SummaryRow

          icon={Building2}

          label="บริษัท"

          value={

            profile.companyName ?? "-"

          }

        />

        <SummaryRow

          icon={ShieldCheck}

          label="บทบาท"

          value={profile.roleLabel}

        />

        <SummaryRow

          icon={Clock3}

          label="เข้าสู่ระบบล่าสุด"

          value={formatDateTime(

            profile.lastLogin,

          )}

        />

        <SummaryRow

          icon={CalendarDays}

          label="สร้างบัญชีเมื่อ"

          value={formatDate(

            profile.createdAt,

          )}

        />

      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-400">

          สิทธิ์การเข้าถึง

        </p>

        <div className="flex flex-wrap gap-2">

          {profile.permissions.length >

          0 ? (

            profile.permissions.map(

              (permission) => (

                <span

                  key={permission}

                  className="rounded-xl border border-emerald-200/50 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"

                >

                  {permission}

                </span>

              ),

            )

          ) : (

            <span className="text-sm text-slate-400">

              ยังไม่มีสิทธิ์ที่กำหนด

            </span>

          )}

        </div>

      </div>

    </section>

  );

}

function ChangePasswordCard() {

  const [currentPassword, setCurrentPassword] =

    useState("");

  const [newPassword, setNewPassword] =

    useState("");

  const [

    confirmPassword,

    setConfirmPassword,

  ] = useState("");

  const [showCurrent, setShowCurrent] =

    useState(false);

  const [showNew, setShowNew] =

    useState(false);

  const [showConfirm, setShowConfirm] =

    useState(false);

  const [isSaving, setIsSaving] =

    useState(false);

  const [notice, setNotice] =

    useState<Notice | null>(null);

  async function handleChangePassword() {

    if (

      !currentPassword ||

      !newPassword ||

      !confirmPassword

    ) {

      setNotice({

        type: "error",

        text: "กรุณากรอกรหัสผ่านให้ครบทุกช่อง",

      });

      return;

    }

    if (

      newPassword !== confirmPassword

    ) {

      setNotice({

        type: "error",

        text: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",

      });

      return;

    }

    setIsSaving(true);

    setNotice(null);

    try {

      const response = await fetch(

        "/api/password",

        {

          method: "POST",

          headers: {

            "Content-Type":

              "application/json",

          },

          body: JSON.stringify({

            currentPassword,

            newPassword,

            confirmPassword,

          }),

        },

      );

      const data =

        (await response.json()) as {

          success?: boolean;

          message?: string;

        };

      if (

        !response.ok ||

        !data.success

      ) {

        setNotice({

          type: "error",

          text:

            data.message ??

            "เปลี่ยนรหัสผ่านไม่สำเร็จ",

        });

        return;

      }

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

      setNotice({

        type: "success",

        text: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",

      });

    } catch (error) {

      console.error(

        "Change password error:",

        error,

      );

      setNotice({

        type: "error",

        text: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่",

      });

    } finally {

      setIsSaving(false);

    }

  }

  return (

    <section className="min-w-0 rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-6 lg:p-8">

      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">

        ความปลอดภัย

      </h2>

      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-400">

        เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี

      </p>

      <div className="mt-5 space-y-4">

        <PasswordInput

          label="รหัสผ่านปัจจุบัน"

          value={currentPassword}

          onChange={setCurrentPassword}

          show={showCurrent}

          onToggle={() =>

            setShowCurrent(

              (value) => !value,

            )

          }

          autoComplete="current-password"

        />

        <PasswordInput

          label="รหัสผ่านใหม่"

          value={newPassword}

          onChange={setNewPassword}

          show={showNew}

          onToggle={() =>

            setShowNew(

              (value) => !value,

            )

          }

          autoComplete="new-password"

        />

        <PasswordInput

          label="ยืนยันรหัสผ่านใหม่"

          value={confirmPassword}

          onChange={setConfirmPassword}

          show={showConfirm}

          onToggle={() =>

            setShowConfirm(

              (value) => !value,

            )

          }

          autoComplete="new-password"

        />

      </div>

      {notice && (

        <InlineNotice

          notice={notice}

          className="mt-4"

        />

      )}

      <button

        type="button"

        onClick={handleChangePassword}

        disabled={isSaving}

        className="mt-6 inline-flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-bold text-white transition active:scale-[0.99] hover:bg-slate-800 disabled:opacity-60"

      >

        {isSaving ? (

          <Loader2 className="h-4 w-4 animate-spin" />

        ) : (

          <LockKeyhole className="h-4 w-4" />

        )}

        เปลี่ยนรหัสผ่าน

      </button>

    </section>

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

    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">

      <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-400">

        <Icon className="h-3.5 w-3.5" />

        {label}

      </div>

      <p className="min-h-5 break-words text-sm font-bold text-slate-700">

        {value || "-"}

      </p>

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

    return (

      <ProfileField

        icon={Icon}

        label={label}

        value={value || "-"}

      />

    );

  }

  return (

    <label className="block min-w-0 rounded-2xl border-2 border-emerald-300/80 bg-emerald-50/20 p-3.5 transition-all focus-within:border-emerald-500 focus-within:bg-white sm:p-4">

      <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-emerald-700">

        <Icon className="h-3.5 w-3.5" />

        {label}

      </span>

      <input

        value={value}

        onChange={(event) =>

          onChange(

            event.target.value,

          )

        }

        placeholder={placeholder}

        className="min-h-6 w-full min-w-0 bg-transparent text-base font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300 sm:text-sm"

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

    <div className="flex min-w-0 flex-col items-start gap-2 rounded-xl px-2 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

      <div className="flex min-w-0 items-center gap-3 text-sm text-slate-500">

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500">

          <Icon className="h-4 w-4" />

        </span>

        <span className="font-medium">

          {label}

        </span>

      </div>

      <span className="max-w-full break-words pl-12 text-left text-sm font-bold text-slate-700 sm:max-w-[55%] sm:pl-0 sm:text-right">

        {value}

      </span>

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

      <span className="mb-1.5 block text-xs font-bold text-slate-600">

        {label}

      </span>

      <div className="flex h-12 min-w-0 items-center rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 transition-all focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">

        <input

          type={

            show

              ? "text"

              : "password"

          }

          value={value}

          onChange={(event) =>

            onChange(

              event.target.value,

            )

          }

          autoComplete={autoComplete}

          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"

          placeholder="••••••••"

        />

        <button

          type="button"

          onClick={onToggle}

          className="ml-2 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"

        >

          {show ? (

            <EyeOff className="h-4 w-4" />

          ) : (

            <Eye className="h-4 w-4" />

          )}

        </button>

      </div>

    </label>

  );

}

function InlineNotice({

  notice,

  className = "",

}: {

  notice: Notice;

  className?: string;

}) {

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

function formatDate(

  iso: string,

): string {

  return new Intl.DateTimeFormat(

    "th-TH",

    {

      day: "numeric",

      month: "short",

      year: "numeric",

    },

  ).format(new Date(iso));

}

function formatDateTime(

  iso: string | null,

): string {

  if (!iso) return "-";

  return new Intl.DateTimeFormat(

    "th-TH",

    {

      day: "numeric",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",

      hour12: false,

    },

  ).format(new Date(iso));

}