import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRedirectPath, isAllowedRole } from "@/lib/roles";
import { AuthProvider } from "@/contexts/AuthContext";
import OperatorShell from "@/components/operator/OperatorShell";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // ไม่มี session / ไม่พบผู้ใช้ -> เด้งไปหน้า login
  if (!user) {
    redirect("/login");
  }

  // ล็อกอินอยู่แต่ role ไม่ใช่ OPERATOR -> เด้งไปหน้าแรกของ role ตัวเอง
  if (isAllowedRole(user.roleName) && user.roleName !== "OPERATOR") {
    redirect(getRedirectPath(user.roleName));
  }

  return (
    <AuthProvider initialUser={user}>
      <OperatorShell>{children}</OperatorShell>
    </AuthProvider>
  );
}