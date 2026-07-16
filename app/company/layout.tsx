import { redirect } from "next/navigation";

<<<<<<< HEAD
import CompanyShell from "@/components/company/CompanyShell";
import { prisma } from "@/lib/prisma";
=======
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
import { getSession } from "@/lib/session";

export default async function CompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "COMPANY_ADMIN") {
    redirect("/");
  }

  if (!session.companyId) {
    redirect("/login");
  }

<<<<<<< HEAD
  const company = await prisma.company.findUnique({
    where: {
      companyId: session.companyId,
    },
    select: {
      companyName: true,
      companyCode: true,
      status: true,
    },
  });

  if (!company || company.status !== "ACTIVE") {
    redirect("/login");
  }

  return (
    <CompanyShell
      user={{
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
      }}
      company={{
        companyName: company.companyName,
        companyCode: company.companyCode,
      }}
    >
      {children}
    </CompanyShell>
  );
=======
  return <>{children}</>;
>>>>>>> 37ded5974e06fe0a84cce4492d54d7a27a12accd
}