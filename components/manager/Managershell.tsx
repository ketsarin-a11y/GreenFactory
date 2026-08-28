"use client";

import ManagerTopbar from "@/components/manager/ManagerTopbar";

export default function ManagerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f6f8f7]">
      <ManagerTopbar />

      <main className="w-full">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}