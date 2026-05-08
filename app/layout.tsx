import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import CursorGlow from "@/components/CursorGlow";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <CursorGlow />
        <LayoutWrapper header={<Header />}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
