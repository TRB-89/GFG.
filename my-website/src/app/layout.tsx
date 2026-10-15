import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { AccessibilityProvider } from "@/lib/accessibility/AccessibilityContext";
import { BandwidthProvider } from "@/lib/bandwidth/BandwidthContext";

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GFG — Inclusive Career Continuity & Return-to-Work Platform | Return. Rebuild. Rise.",
  description:
    "An inclusive, accessible editorial career platform designed to help women rebuild skills, regain confidence, find flexible work, or launch sustainable businesses without stigma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#111111] text-[#F1E7DB] font-sans selection:bg-[#A56F7C] selection:text-[#F1E7DB]">
        <LanguageProvider>
          <AccessibilityProvider>
            <BandwidthProvider>
              {children}
            </BandwidthProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
