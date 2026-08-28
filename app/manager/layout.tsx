import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { getRedirectPath } from "@/lib/roles";
import { AuthProvider } from "@/contexts/AuthContext";
import ManagerShell from "@/components/manager/Managershell";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "MANAGER") {
    redirect(
  getRedirectPath(
    session.roleName as
      | "OPERATOR"
      | "PLATFORM_ADMIN"
      | "COMPANY_ADMIN"
      | "MANAGER"
  )
);
  }

  const currentUser = {
    id: session.userId,
    userId: session.userId,
    companyId: session.companyId,
    firstName: session.firstName,
    lastName: session.lastName,
    name:
      `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() ||
      session.email,
    email: session.email,
    roleName: session.roleName,
    role: session.roleName,
    avatarInitial:
      `${session.firstName?.charAt(0) ?? ""}${session.lastName?.charAt(0) ?? ""}` ||
      session.email.charAt(0).toUpperCase(),
  };

  return (
    <AuthProvider initialUser={currentUser}>
      <Suspense fallback={null}>
        <ManagerShell>{children}</ManagerShell>
      </Suspense>
    </AuthProvider>
  );
}

