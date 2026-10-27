import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/ResourceArticle";
import { getPublishedBySlug, getSettings, listRelated } from "@/lib/data";

// Content is edited live from /admin, so pages render on request and never need a redeploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = await getPublishedBySlug(slug);
  if (!r) return { title: "לא נמצא" };
  const title = r.seoTitle || r.title;
  const description = r.seoDescription || r.description;
  return {
    title,
    description,
    alternates: { canonical: `/resources/${r.slug}` },
    openGraph: { title, description, type: "article", images: r.coverUrl ? [{ url: r.coverUrl }] : undefined },
    twitter: { card: r.coverUrl ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ResourcePage(props: PageProps<"/resources/[slug]">) {
  const { slug } = await props.params;
  const resource = await getPublishedBySlug(slug);
  if (!resource) notFound();
  const [settings, related] = await Promise.all([getSettings(), listRelated(resource)]);
  return <ResourceArticle resource={resource} settings={settings} related={related} />;
}
