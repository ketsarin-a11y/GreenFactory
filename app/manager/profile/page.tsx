import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getProfileDetail } from "@/lib/profile-queries";
import ProfilePage from "@/components/manager/profilepage";

export const dynamic = "force-dynamic";

export default async function ManagerProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "MANAGER") {
    redirect("/");
  }

  const profile = await getProfileDetail(session.userId);

  if (!profile) {
    redirect("/manager");
  }

  return <ProfilePage profile={profile} />;
}