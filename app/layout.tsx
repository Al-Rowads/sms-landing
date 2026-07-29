import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-arabic",
  display: "swap"
});

const rayBold = localFont({
  src: "./fonts/ray-bold.ttf",
  weight: "700",
  variable: "--font-ray-bold",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AL-ROWADs | صفحة الدورة",
  description: "صفحة هبوط عربية لتسجيل الاهتمام بالدورة من AL-ROWADs."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${rayBold.variable}`}>{children}</body>
    </html>
  );
}
