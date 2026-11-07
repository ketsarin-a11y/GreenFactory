import { MasterPage } from "@/components/platform/master-data/master-page";
import { requireUser } from "@/server/auth/current-user";

export default async function Page({ searchParams }: PageProps<"/platform/master-data/machine-types">) {
  await requireUser("PLATFORM_ADMIN");
  return <MasterPage kind="machine-types" searchParams={await searchParams} />;
}
