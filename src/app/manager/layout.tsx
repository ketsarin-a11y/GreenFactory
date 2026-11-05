import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/server/auth/current-user";
import { factoryLabel } from "@/server/queries/context";
import { AlertsBell } from "@/components/manager/alerts-bell";

export const metadata: Metadata = { robots: { index: false } };

export default async function Layout({ children }: LayoutProps<"/manager">) {
  const user = await requireUser("MANAGER");
  return (
    <AppShell user={user} context={await factoryLabel(user)} actions={<AlertsBell user={user} />}>
      {children}
    </AppShell>
  );
}
