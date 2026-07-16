"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const systemPrefixes = [
  "/login",
  "/platform",
  "/company",
  "/manager",
  "/operator",
];

function isSystemPath(pathname: string) {
  return systemPrefixes.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function AppChrome({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hidePublicChrome = isSystemPath(pathname);

  if (hidePublicChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}