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

const initialData: ProfileFormData = {
  firstName: "เกศรินทร์",
  lastName: "นอพิมาย",
  email: "admin@gf.com",
  phone: "089-123-4567",
  employeeCode: "CA-001",
  position: "Company Admin",
  department: "ฝ่ายบริหารระบบ",
  companyName: "GreenFactory Electronics",
  factoryName: "โรงงานกรีนแฟคทอรี่ 1",
  preferredLanguage: "th",
  timezone: "Asia/Bangkok",
};

export default function ProfilePageClient() {
  const [data, setData] = useState<ProfileFormData>(initialData);
  const [saved, setSaved] = useState(false);

  function update(key: keyof ProfileFormData, value: string) {
    setData((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ProfileInformation data={data} update={update} />
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
