import { notFound } from "next/navigation";
import { getById, getSettings } from "@/lib/data";
import type { ResourceInput } from "@/lib/resource-schema";
import { ResourceEditor } from "./ResourceEditor";

export const dynamic = "force-dynamic";

export default async function EditResourcePage(props: PageProps<"/admin/resources/[id]">) {
  const { id } = await props.params;
  const [r, settings] = await Promise.all([getById(id), getSettings()]);
  if (!r) notFound();
  const input: ResourceInput = {
    id: r.id, slug: r.slug, title: r.title, description: r.description, label: r.label, keyword: r.keyword,
    coverUrl: r.coverUrl, coverAlt: r.coverAlt, category: r.category, tags: r.tags, kind: r.kind,
    priceIls: r.priceIls, checkoutUrl: r.checkoutUrl, featured: r.featured, seoTitle: r.seoTitle,
    seoDescription: r.seoDescription, fileUrl: r.fileUrl, fileName: r.fileName, fileSize: r.fileSize, blocks: r.blocks,
  };
  return <ResourceEditor key={r.id} initial={input} status={r.status} categories={settings.categories} />;
}
