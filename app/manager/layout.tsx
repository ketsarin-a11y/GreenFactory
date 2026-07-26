import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRedirectPath, isAllowedRole } from "@/lib/roles";
import { AuthProvider } from "@/contexts/AuthContext";
import ManagerShell from "@/components/manager/Managershell";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // เฉพาะ MANAGER เท่านั้นที่เข้าหน้านี้ได้ตรงๆ role อื่นเด้งกลับไปหน้าแรกของตัวเอง
  if (isAllowedRole(user.roleName) && user.roleName !== "MANAGER") {
    redirect(getRedirectPath(user.roleName));
  }

  return (
    <AuthProvider initialUser={user}>
      <Suspense fallback={null}>
        <ManagerShell>{children}</ManagerShell>
      </Suspense>
    </AuthProvider>
  );
}