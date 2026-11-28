import type { Metadata, Viewport } from "next";
import { Assistant, Fredoka, IBM_Plex_Mono, IBM_Plex_Sans_Hebrew, JetBrains_Mono, Karantina } from "next/font/google";
import { SiteAnalytics } from "@/components/ClickTracker";
import "./globals.css";
import "./site.css";

const assistant = Assistant({ variable: "--font-assistant", subsets: ["hebrew", "latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });
const karantina = Karantina({ variable: "--font-karantina", subsets: ["hebrew", "latin"], weight: "700", display: "swap" });

// Public site: Fredoka for display, IBM Plex Sans Hebrew for text, IBM Plex Mono for labels.
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["hebrew", "latin"], weight: ["400", "500", "600"], display: "swap" });
const plex = IBM_Plex_Sans_Hebrew({ variable: "--font-plex", subsets: ["hebrew", "latin"], weight: ["400", "500"], display: "swap" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plexmono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ABREKOV · מדריכים חינם לבנייה עם AI", template: "%s · ABREKOV" },
  description: "מדריכים חינם לבנייה עם AI מדימה אברקוב (@abrekov.design): פרומפטים להעתקה, קבצים להורדה וכל השלבים.",
  openGraph: { siteName: "ABREKOV Resources", locale: "he_IL", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0B0B0B" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${jetbrains.variable} ${karantina.variable} ${fredoka.variable} ${plex.variable} ${plexMono.variable} antialiased`}
      suppressHydrationWarning>
      <body className="min-h-dvh">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
