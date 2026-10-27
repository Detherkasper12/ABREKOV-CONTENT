import type { Metadata, Viewport } from "next";
import { Assistant, JetBrains_Mono, Karantina } from "next/font/google";
import "./globals.css";

const assistant = Assistant({ variable: "--font-assistant", subsets: ["hebrew", "latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const karantina = Karantina({ variable: "--font-karantina", subsets: ["hebrew", "latin"], weight: "700", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ABREKOV Resources", template: "%s · ABREKOV" },
  description: "כלים, מדריכים ופרומפטים לעיצוב, AI ופיתוח מ־@abrekov.design",
  openGraph: { siteName: "ABREKOV Resources", locale: "he_IL", type: "website" },
};

export const viewport: Viewport = { themeColor: "#12332A" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${jetbrains.variable} ${karantina.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
