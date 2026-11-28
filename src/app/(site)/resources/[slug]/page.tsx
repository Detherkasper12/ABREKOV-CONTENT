import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/ResourceArticle";
import { SiteShell } from "@/components/SiteShell";
import { getPublishedBySlug, getSettings, listRelated } from "@/lib/data";

// Content is edited live from /admin, so pages render on request and never need a redeploy.
// Static, rebuilt on every admin save (and at most hourly as a fallback).
export const revalidate = 3600;
// Guides are rendered on their first visit and then served from the cache.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = await getPublishedBySlug(slug);
  if (!r) return { title: "לא נמצא" };
  const title = r.seoTitle || r.title;
  const description = r.seoDescription || r.description;
  return {
    title,
    description,
    // A link-only guide must not be indexed or found through search engines.
    robots: r.unlisted ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/resources/${r.slug}` },
    openGraph: { title, description, type: "article", images: r.coverUrl ? [{ url: r.coverUrl }] : undefined },
    twitter: { card: r.coverUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ResourcePage(props: PageProps<"/resources/[slug]">) {
  const { slug } = await props.params;
  const resource = await getPublishedBySlug(slug);
  if (!resource) notFound();
  const [settings, related] = await Promise.all([getSettings(), resource.unlisted ? [] : listRelated(resource)]);
  return (
    <SiteShell settings={settings} quiet={resource.unlisted} current="library">
      <ResourceArticle resource={resource} settings={settings} related={related} />
    </SiteShell>
  );
}
