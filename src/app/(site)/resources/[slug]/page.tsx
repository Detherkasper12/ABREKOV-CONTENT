import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/ResourceArticle";
import { SiteShell } from "@/components/SiteShell";
import { getPublishedBySlug, getSettings, listRelated } from "@/lib/data";

// Content is edited live from /admin, so pages render on request and never need a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [r, settings] = await Promise.all([getPublishedBySlug(slug), getSettings()]);
  if (!r) return { title: "לא נמצא" };
  const title = r.seoTitle || r.title;
  const description = r.seoDescription || r.description;
  return {
    title,
    description,
    // A link-only guide, or any guide while the library isn't public, must not be indexed or found through search engines.
    robots: r.unlisted || !settings.libraryPublic ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/resources/${r.slug}` },
    openGraph: { title, description, type: "article", images: r.coverUrl ? [{ url: r.coverUrl }] : undefined },
    twitter: { card: r.coverUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ResourcePage(props: PageProps<"/resources/[slug]">) {
  const { slug } = await props.params;
  const resource = await getPublishedBySlug(slug);
  if (!resource) notFound();
  const settings = await getSettings();
  const isolated = resource.unlisted || !settings.libraryPublic;
  const related = isolated ? [] : await listRelated(resource);
  return (
    <SiteShell settings={settings} isolated={isolated}>
      <ResourceArticle resource={resource} settings={settings} related={related} isolated={isolated} />
    </SiteShell>
  );
}
