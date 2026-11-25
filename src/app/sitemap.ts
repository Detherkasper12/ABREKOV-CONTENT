import type { MetadataRoute } from "next";
import { getSettings, listPublished } from "@/lib/data";
import { siteUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // A guide that isn't in a public library must not be advertised to search engines either.
  const resources = (await getSettings()).libraryPublic ? await listPublished() : [];
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...resources.map((r) => ({ url: `${base}/resources/${r.slug}`, lastModified: r.updatedAt, priority: 0.8 })),
  ];
}
