import { redirect } from "next/navigation";

import ProfilePage from "@/components/operator/Profilepage";
import { getProfileDetail } from "@/lib/Profile queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OperatorProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "OPERATOR") {
    redirect("/");
  }

  const profile = await getProfileDetail(session.userId);

  if (!profile) {
    throw new Error("Profile not found");
  }

  return <ProfilePage profile={profile} />;
}