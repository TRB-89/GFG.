import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

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
  title: "GFG — Editorial Career Comeback Platform | Return. Rebuild. Rise.",
  description:
    "A minimal, cinematic editorial career platform designed to help women rebuild skills, regain confidence, and return to meaningful work after a career break.",
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
        {children}
      </body>
    </html>
  );
}

