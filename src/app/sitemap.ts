import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/data";
import { siteUrl } from "@/lib/email";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const resources = await listPublished();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/resources`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn`, changeFrequency: "monthly", priority: 0.5 },
    ...resources.map((r) => ({ url: `${base}/resources/${r.slug}`, lastModified: r.updatedAt, priority: 0.8 })),
  ];
}
