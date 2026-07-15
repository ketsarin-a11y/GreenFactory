import { redirect } from "next/navigation";

import PlatformShell from "@/components/platform/PlatformShell";
import { getSession } from "@/lib/session";

export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "PLATFORM_ADMIN") {
    redirect("/");
  }

  return (
    <PlatformShell
      user={{
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
      }}
    >
      {children}
    </PlatformShell>
  );
}