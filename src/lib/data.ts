import "server-only";
import { db } from "./db";
import { blocksSchema, type Block } from "./blocks";
import { DEFAULT_SETTINGS, settingsSchema, type SiteSettings } from "./settings-schema";

export type ResourceStatus = "draft" | "published" | "archived";

export type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  label: string;
  keyword: string;
  coverUrl: string;
  coverAlt: string;
  category: string;
  tags: string[];
  kind: "free" | "paid";
  priceIls: number | null;
  checkoutUrl: string;
  status: ResourceStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type ResourceSummary = Omit<Resource, "blocks" | "seoTitle" | "seoDescription" | "fileUrl" | "fileName" | "fileSize">;

type Row = Record<string, unknown>;

function toResource(row: Row): Resource {
  const parsed = blocksSchema.safeParse(row.blocks ?? []);
  return {
    ...(row as unknown as Resource),
    priceIls: row.priceIls == null ? null : Number(row.priceIls),
    // The file columns may not exist yet on a database that predates migration 0002.
    fileUrl: (row.fileUrl as string) ?? "",
    fileName: (row.fileName as string) ?? "",
    fileSize: Number(row.fileSize ?? 0),
    blocks: parsed.success ? parsed.data : [],
  };
}

function toSummary(row: Row): ResourceSummary {
  return { ...(row as unknown as ResourceSummary), priceIls: row.priceIls == null ? null : Number(row.priceIls) };
}

const SUMMARY_COLUMNS = [
  "id", "slug", "title", "description", "label", "keyword", "cover_url", "cover_alt", "category", "tags",
  "kind", "price_ils", "checkout_url", "status", "featured", "created_at", "updated_at", "published_at",
];

// Public queries only ever return published rows.
export async function listPublished(): Promise<ResourceSummary[]> {
  const sql = db();
  const rows = await sql`
    select ${sql(SUMMARY_COLUMNS)} from resources
    where status = 'published'
    order by featured desc, published_at desc nulls last`;
  return rows.map(toSummary);
}

export async function getPublishedBySlug(slug: string): Promise<Resource | null> {
  const sql = db();
  const [row] = await sql`select * from resources where slug = ${slug} and status = 'published'`;
  return row ? toResource(row) : null;
}

export async function listRelated(resource: Resource, limit = 3): Promise<ResourceSummary[]> {
  const sql = db();
  const rows = await sql`
    select ${sql(SUMMARY_COLUMNS)} from resources
    where status = 'published' and id <> ${resource.id}
    order by (category = ${resource.category} and category <> '')::int
           + coalesce(array_length(array(select unnest(tags) intersect select unnest(${resource.tags}::text[])), 1), 0) desc,
             published_at desc nulls last
    limit ${limit}`;
  return rows.map(toSummary);
}

// Admin queries.
export async function listAll(): Promise<ResourceSummary[]> {
  const sql = db();
  const rows = await sql`select ${sql(SUMMARY_COLUMNS)} from resources order by updated_at desc`;
  return rows.map(toSummary);
}

export async function getById(id: string): Promise<Resource | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = db();
  const [row] = await sql`select * from resources where id = ${id}`;
  return row ? toResource(row) : null;
}

export async function getSettings(): Promise<SiteSettings> {
  const sql = db();
  const [row] = await sql`select data from site_settings where id = 1`;
  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...((row?.data as object) ?? {}) });
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}
