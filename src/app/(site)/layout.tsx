// Public pages are prerendered and kept as static HTML, so they open instantly.
// Every save in the admin calls revalidatePath("/", "layout"), which rebuilds them with the new content.
// Each page wraps itself in <SiteShell>, because a link-only guide renders a reduced header.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return children;
}
