import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSettings } from "@/lib/data";

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
