"use client";

import { useState } from "react";

import ActiveSessions from "./ActiveSessions";
import ActivityTimeline from "./ActivityTimeline";
import LogoutCard from "./LogoutCard";
import NotificationPreferences from "./NotificationPreferences";
import ProfileHero from "./ProfileHero";
import ProfileInformation from "./ProfileInformation";
import ProfileOverview from "./ProfileOverview";
import SecuritySettings from "./SecuritySettings";
import type { ProfileFormData } from "./types";

interface ProfilePageClientProps {
  initialData: ProfileFormData;
}

interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeCode: string | null;
  };
}

export default function ProfilePageClient({
  initialData,
}: ProfilePageClientProps) {
  const [data, setData] = useState<ProfileFormData>(initialData);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof ProfileFormData, value: string) {
    setData((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const phone = data.phone.trim();

    if (!firstName) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    if (!lastName) {
      setError("กรุณากรอกนามสกุล");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      const result =
        (await response.json()) as UpdateProfileResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "ไม่สามารถบันทึกข้อมูลได้",
        );
      }

      if (!result.data) {
        throw new Error("ไม่พบข้อมูลที่บันทึกกลับมาจากระบบ");
      }

      setData((current) => ({
        ...current,
        firstName: result.data!.firstName,
        lastName: result.data!.lastName,
        phone: result.data!.phone ?? "",
      }));

      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error("Save profile error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <ProfileHero
        firstName={data.firstName}
        lastName={data.lastName}
        email={data.email}
        position={data.position}
        companyName={data.companyName}
        factoryName={data.factoryName}
        onSave={handleSave}
        saved={saved}
      />

      {saving && (
        <div className="rounded-[14px] border border-[#dce6df] bg-white px-4 py-3 text-[13px] font-semibold text-[#5b6d62] shadow-sm">
          กำลังบันทึกข้อมูล...
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ProfileInformation
            data={data}
            update={update}
          />

          <SecuritySettings />

          <ActiveSessions />

          <LogoutCard />
        </div>

        <aside className="space-y-5">
          <ProfileOverview
            employeeCode={data.employeeCode}
            companyName={data.companyName}
            factoryName={data.factoryName}
            position={data.position}
          />

          <NotificationPreferences />

          <ActivityTimeline />
        </aside>
      </div>
    </div>
  );
}