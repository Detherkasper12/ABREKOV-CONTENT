// Settings come from the database and are edited live, so nothing under this layout is prerendered at build time.
// Each page wraps itself in <SiteShell>, because a link-only guide renders a reduced header.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return children;
}
