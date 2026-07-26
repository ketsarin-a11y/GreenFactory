import { getCurrentUser } from "@/lib/auth";
import { getProfileDetail } from "@/lib/profile-queries";
import ProfilePage from "@/components/manager/profilepage";

export const dynamic = "force-dynamic";

export default async function ManagerProfilePage() {
  const user = await getCurrentUser();
  const profile = await getProfileDetail(user!.id);

  return <ProfilePage profile={profile!} />;
}