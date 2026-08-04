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

const ray = localFont({
  src: [
    {
      path: "./fonts/ray-medium.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "./fonts/ray-bold.ttf",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-ray",
  display: "swap"
});

export const metadata: Metadata = {
  title: "دورة الذكاء العاطفي | أكاديمية الرواد",
  description:
    "برنامج تدريبي حضوري مع د. أحمد الكاتب لفهم المشاعر وإدارتها، وتحسين العلاقات واتخاذ قرارات أكثر وعياً.",
  openGraph: {
    title: "دورة الذكاء العاطفي | أكاديمية الرواد",
    description:
      "افهم نفسك ومشاعرك وابنِ علاقات أفضل من خلال برنامج تدريبي عملي في بغداد.",
    locale: "ar_IQ",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${ray.variable} ${ray.className}`}>
        {children}
      </body>
    </html>
  );
}
