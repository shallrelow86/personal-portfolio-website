import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import { db, schema } from "@/lib/db";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Portfolio";
  let description = "Personal portfolio";
  let ogImage = "";
  try {
    const s = await db.select().from(schema.siteSettings).get();
    if (s) {
      title = s.siteTitle || title;
      description = s.siteDescription || description;
      ogImage = s.ogImage || "";
    }
  } catch {}
  const metadata: Metadata = { title, description };
  if (ogImage) {
    metadata.openGraph = { images: [ogImage] };
  }
  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${ibmSans.variable} ${ibmMono.variable}`}>
      <body className="min-h-screen bg-bg text-text-primary font-body antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
