import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";

import AppChrome from "@/components/layout/AppChrome";

import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GreenFactory Insight",
    template: "%s | GreenFactory Insight",
  },
  description:
    "แพลตฟอร์มบริหารจัดการข้อมูลพลังงาน คาร์บอน และความยั่งยืนสำหรับองค์กรอุตสาหกรรม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#f7f8f4] text-[#17231c]">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}