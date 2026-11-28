import Link from "next/link";
import type { SiteSettings } from "@/lib/settings-schema";

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export type NavKey = "home" | "library" | "agents" | "learn" | "";

// One header for every public page. On the home story it is fixed and takes the colours of the scene
// under it (`fixed`). A link-only guide gets a quiet version: the logo and one way back into the site.
export function SiteHeader({ current = "", fixed = false, quiet = false }: { settings?: SiteSettings; current?: NavKey; fixed?: boolean; quiet?: boolean }) {
  const cur = (k: NavKey) => (k === current ? { "aria-current": "page" as const } : {});
  return (
    <header className={`top${fixed ? " fx" : ""}`} data-top>
      <div className="in">
        <Link className="logo" href="/" aria-label="abrekov, לדף הבית">
          abrekov
        </Link>
        {quiet ? (
          <span className="hb">
            <Link className="back" href="/">
              יש עוד באתר ←
            </Link>
          </span>
        ) : (
          <>
            <nav aria-label="ניווט ראשי">
              <Link href="/resources" {...cur("library")}>
                מדריכים
              </Link>
              <Link href="/#about">עליי</Link>
              <Link href="/learn" {...cur("learn")}>
                ללמוד עוד
              </Link>
            </nav>
            <span className="hb">
              <Link className="tk2" href="/agents" {...cur("agents")}>
                קורס · בקרוב
              </Link>
              <Link className="tk" href="/resources">
                מדריכים בחינם
              </Link>
            </span>
          </>
        )}
      </div>
    </header>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const links = [
    settings.instagramHandle && { label: "Instagram", url: instagramUrl(settings.instagramHandle) },
    settings.telegramUrl && { label: "קהילה בוואטסאפ", url: settings.telegramUrl },
    settings.portfolioUrl && { label: "פורטפוליו", url: settings.portfolioUrl },
    settings.contactEmail && { label: settings.contactEmail, url: `mailto:${settings.contactEmail}` },
    ...settings.socials,
  ].filter(Boolean) as { label: string; url: string }[];
  return (
    <footer className="ft">
      <div className="lw">
        <div className="ftxt" aria-hidden>
          abrekov
        </div>
        <div className="fl">
          <nav aria-label="ניווט תחתון">
            <Link href="/resources">מדריכים</Link>
            <Link href="/#about">עליי</Link>
            <Link href="/learn">ללמוד עוד</Link>
            <Link href="/agents">קורס סוכנים</Link>
            {links.map((l) => (
              <a key={l.url} href={l.url} target={l.url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                <bdi>{l.label}</bdi>
              </a>
            ))}
          </nav>
          {settings.instagramHandle && <span className="m">@{settings.instagramHandle}</span>}
        </div>
      </div>
    </footer>
  );
}
