import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/server/auth/current-user";
import { factoryLabel } from "@/server/queries/context";

export const metadata: Metadata = { robots: { index: false } };

export default async function Layout({ children }: LayoutProps<"/company">) {
  const user = await requireUser("COMPANY_ADMIN");
  return (
    <AppShell user={user} context={await factoryLabel(user)}>
      {children}
    </AppShell>
  );
}
