"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const systemRoutes = [
  "/login",
  "/platform",
  "/company",
  "/manager",
  "/operator",
];

function isSystemRoute(pathname: string) {
  return systemRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function SiteChrome({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hidePublicNavigation = isSystemRoute(pathname);

  return (
    <>
      {!hidePublicNavigation && <Navbar />}
      {children}
    </>
  );
}