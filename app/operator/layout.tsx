import { redirect } from "next/navigation";

import OperatorShell from "@/components/operator/OperatorShell";
import { getSession } from "@/lib/session";

export default async function OperatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "OPERATOR") {
    switch (session.roleName) {
      case "PLATFORM_ADMIN":
        redirect("/platform/dashboard");

      case "COMPANY_ADMIN":
        redirect("/company/dashboard");

      case "MANAGER":
        redirect("/manager/dashboard");

      default:
        redirect("/");
    }
  }

  return (
    <OperatorShell
      user={{
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
      }}
    >
      {children}
    </OperatorShell>
  );
}