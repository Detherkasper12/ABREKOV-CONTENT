import Link from "next/link";
import type { SiteSettings } from "@/lib/settings-schema";

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1080px] items-center justify-between gap-4 px-4">
        <Link href="/" className="sig text-[15px]" aria-label="ABREKOV, לדף הבית">
          <i />
          ABREKOV
        </Link>
        <nav className="flex items-center gap-1 text-[15px] font-bold" aria-label="ניווט ראשי">
          <Link href="/#library" className="rounded-full px-3 py-1.5 hover:bg-surface">
            משאבים
          </Link>
          <Link href="/#about" className="rounded-full px-3 py-1.5 hover:bg-surface">
            עליי
          </Link>
          {settings.instagramHandle && (
            <a
              href={instagramUrl(settings.instagramHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="ltr hidden rounded-full px-3 py-1.5 font-mono text-[13px] hover:bg-surface sm:inline"
            >
              @{settings.instagramHandle}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const links = [
    settings.instagramHandle && { label: "Instagram", url: instagramUrl(settings.instagramHandle) },
    settings.portfolioUrl && { label: "פורטפוליו", url: settings.portfolioUrl },
    settings.contactEmail && { label: settings.contactEmail, url: `mailto:${settings.contactEmail}` },
    ...settings.socials,
  ].filter(Boolean) as { label: string; url: string }[];
  return (
    <footer className="mt-20 bg-forest text-[#e4e7e4]">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-6 px-4 py-10">
        <span className="sig text-[15px] text-[#e4e7e4]">
          <i />
          ABREKOV
        </span>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-bold">
          {links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target={l.url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className="hover:text-lime">
                <bdi>{l.label}</bdi>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
