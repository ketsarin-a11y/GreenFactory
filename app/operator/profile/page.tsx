import { getCurrentUser } from "@/lib/auth";
import { getProfileDetail } from "@/lib/Profile queries";
import ProfilePage from "@/components/operator/Profilepage";

export const dynamic = "force-dynamic";

export default async function OperatorProfilePage() {
  const user = await getCurrentUser();
  const profile = await getProfileDetail(user!.id);

  return <ProfilePage profile={profile!} />;
}