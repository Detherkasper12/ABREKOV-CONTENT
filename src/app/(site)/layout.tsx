// Pages render per request but read cached data (lib/data.ts), so nothing waits on the database,
// and nothing touches it at build time. Every admin save refreshes that cache.
// Each page wraps itself in <SiteShell>, because a link-only guide renders a reduced header.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return children;
}
