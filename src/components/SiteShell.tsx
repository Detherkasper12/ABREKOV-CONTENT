import { getSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/settings-schema";
import { Typo } from "./Typo";
import { SiteFooter, SiteHeader, type NavKey } from "./SiteChrome";

// Header, main and footer for a public page, inside the .site design system.
// `quiet`: a link-only guide, with a smaller header. `paper`: the light page variant (/learn).
export async function SiteShell({
  children,
  settings,
  current = "",
  quiet = false,
  paper = false,
}: {
  children: React.ReactNode;
  settings?: SiteSettings;
  current?: NavKey;
  quiet?: boolean;
  paper?: boolean;
}) {
  const s = settings ?? (await getSettings());
  return (
    <div className={`site${paper ? " paper" : ""}`}>
      <a className="skiplink" href="#main">
        לתוכן
      </a>
      <SiteHeader settings={s} current={current} quiet={quiet} />
      <main id="main" dir="rtl" lang="he">
        {children}
      </main>
      <SiteFooter settings={s} />
      <Typo />
    </div>
  );
}
