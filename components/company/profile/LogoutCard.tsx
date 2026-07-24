"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[22px] border border-[#f0d8d8] bg-[#fffafa] p-5 shadow-[0_12px_36px_rgba(106,48,48,0.045)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[17px] font-extrabold text-[#453535]">
            ออกจากระบบ
          </h2>
          <p className="mt-1 text-[12px] text-[#8d7777]">
            สิ้นสุด Session ปัจจุบันและกลับไปยังหน้าเข้าสู่ระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e5bcbc] bg-white px-5 text-[13px] font-bold text-[#b94f4f] transition hover:bg-[#fff1f1] disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loading ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
        </button>
      </div>
    </section>
  );
}
