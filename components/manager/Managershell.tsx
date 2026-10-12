"use client";

import ManagerTopbar from "@/components/manager/ManagerTopbar";

export default function ManagerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gf-app-responsive min-h-screen w-full overflow-x-hidden bg-[#f6f8f7]">
      <ManagerTopbar />

      <main className="w-full min-w-0">
        <div
          className="
            mx-auto
            w-full
            min-w-0
            max-w-[1600px]
            px-3
            py-4
            sm:px-5
            sm:py-5
            md:px-6
            lg:px-10
            lg:py-6
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
}