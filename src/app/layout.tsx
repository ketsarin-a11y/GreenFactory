import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sans = IBM_Plex_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "GreenFactory Insight", template: "%s · GreenFactory Insight" },
  description: "แพลตฟอร์มบริหารจัดการข้อมูลพลังงาน คาร์บอน และความยั่งยืนสำหรับโรงงานอุตสาหกรรม",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
