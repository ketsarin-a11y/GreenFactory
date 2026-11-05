import { ProfilePage } from "@/components/account/profile-page";
import { requireTenantUser } from "@/server/auth/current-user";

export default async function Page() {
  const user = await requireTenantUser("MANAGER");
  return <ProfilePage user={user} />;
}
