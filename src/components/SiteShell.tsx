import { getSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/settings-schema";
import { SiteFooter, SiteHeader } from "./SiteChrome";

// Header, main and footer for a public page. A link-only guide renders `isolated`, with no way
// into the rest of the library from the page chrome.
export async function SiteShell({
  children,
  settings,
  isolated = false,
}: {
  children: React.ReactNode;
  settings?: SiteSettings;
  isolated?: boolean;
}) {
  const s = settings ?? (await getSettings());
  return (
    <>
      <SiteHeader settings={s} isolated={isolated} />
      <main>{children}</main>
      <SiteFooter settings={s} />
    </>
  );
}
