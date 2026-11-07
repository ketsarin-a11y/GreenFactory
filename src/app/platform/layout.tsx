import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/server/auth/current-user";
import { factoryLabel } from "@/server/queries/context";

export const metadata: Metadata = { robots: { index: false } };

export default async function Layout({ children }: LayoutProps<"/platform">) {
  const user = await requireUser("PLATFORM_ADMIN");
  return (
    <AppShell user={user} context={await factoryLabel(user)}>
      {children}
    </AppShell>
  );
}
