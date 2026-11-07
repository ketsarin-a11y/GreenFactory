import { MasterPage } from "@/components/platform/master-data/master-page";
import { requireUser } from "@/server/auth/current-user";

export default async function Page({ searchParams }: PageProps<"/platform/master-data/resource-types">) {
  await requireUser("PLATFORM_ADMIN");
  return <MasterPage kind="resource-types" searchParams={await searchParams} />;
}
