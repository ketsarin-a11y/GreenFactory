import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm">
        ข้ามไปยังเนื้อหา
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
