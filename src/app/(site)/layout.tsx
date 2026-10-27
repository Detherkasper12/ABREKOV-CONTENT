import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSettings } from "@/lib/data";

// Settings come from the database and are edited live, so nothing under this layout is prerendered at build time.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader settings={settings} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
