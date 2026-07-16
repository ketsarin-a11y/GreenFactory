import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthProvider } from "@/contexts/AuthContext";
import Sidebar from "@/components/operator/sidebar";
import Header from "@/components/operator/Header";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // ไม่มี session / ไม่พบผู้ใช้ -> เด้งไปหน้า login
  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1">
          <Header />
          <div className="flex flex-col gap-6 px-8 pb-10">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}