import "server-only";
import { unstable_cache } from "next/cache";
import { db, ensureSchema } from "./db";
import { blocksSchema, type Block } from "./blocks";
import { DEFAULT_SETTINGS, settingsSchema, type SiteSettings } from "./settings-schema";
import { DEFAULT_HOME } from "./home-schema";

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
  // Link-only: reachable by its direct URL, left out of the library, search, related and sitemap.
  unlisted: boolean;
  // Palette key for the guide's colour in the library rows and on its page ("" = from the category).
  accent: string;
  // Offer shown once at the end of the guide: "" = matched automatically, "none", or a waitlist list.
  offer: string;
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
    unlisted: Boolean(row.unlisted),
    accent: (row.accent as string) ?? "",
    offer: (row.offer as string) ?? "",
    // The file columns may not exist yet on a database that predates migration 0002.
    fileUrl: (row.fileUrl as string) ?? "",
    fileName: (row.fileName as string) ?? "",
    fileSize: Number(row.fileSize ?? 0),
    blocks: parsed.success ? parsed.data : [],
  };
}

function toSummary(row: Row): ResourceSummary {
  return {
    ...(row as unknown as ResourceSummary),
    priceIls: row.priceIls == null ? null : Number(row.priceIls),
    unlisted: Boolean(row.unlisted),
    accent: (row.accent as string) ?? "",
    offer: (row.offer as string) ?? "",
  };
}

const SUMMARY_COLUMNS = [
  "id", "slug", "title", "description", "label", "keyword", "cover_url", "cover_alt", "category", "tags",
  "kind", "price_ils", "checkout_url", "status", "featured", "unlisted", "accent", "offer", "created_at", "updated_at", "published_at",
];

// Public queries only ever return published rows. A link-only (unlisted) one is returned
// by slug alone, never by the list queries.
async function loadPublished(): Promise<ResourceSummary[]> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    select ${sql(SUMMARY_COLUMNS)} from resources
    where status = 'published' and not unlisted
    order by featured desc, published_at desc nulls last`;
  return rows.map(toSummary);
}

async function loadBySlug(slug: string): Promise<Resource | null> {
  // A DM link can be the first request a fresh instance gets, so make sure bundled guides exist.
  await ensureSchema();
  const sql = db();
  const [row] = await sql`select * from resources where slug = ${slug} and status = 'published'`;
  return row ? toResource(row) : null;
}

async function loadRelated(resource: Pick<Resource, "id" | "category" | "tags">, limit = 3): Promise<ResourceSummary[]> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    select ${sql(SUMMARY_COLUMNS)} from resources
    where status = 'published' and not unlisted and id <> ${resource.id}
    order by (category = ${resource.category} and category <> '')::int
           + coalesce(array_length(array(select unnest(tags) intersect select unnest(${resource.tags}::text[])), 1), 0) desc,
             published_at desc nulls last
    limit ${limit}`;
  return rows.map(toSummary);
}

// Admin queries.
export async function listAll(): Promise<ResourceSummary[]> {
  await ensureSchema();
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

const LEGACY_DEFAULTS: Record<string, string> = {
  telegramUrl: "https://t.me/PROAIABREKOVDESIGN",
  telegramPerks: "אפליקציה משלנו\nבוט AI שעונה על שאלות\nקורסים וטיפים בחינם",
  telegramNote: "לחיצה אחת, ואפשר לצאת בכל רגע",
};

async function loadSettings(): Promise<SiteSettings> {
  const sql = db();
  const [row] = await sql`select data from site_settings where id = 1`;
  const stored = { ...((row?.data as Record<string, unknown>) ?? {}) };
  // The settings form saved the old Telegram defaults into the database. Values that still equal
  // those defaults are replaced by the current ones; anything the owner edited is kept as is.
  for (const [key, old] of Object.entries(LEGACY_DEFAULTS)) if (stored[key] === old) delete stored[key];
  // Home content merges key by key, so a field added later gets its default instead of an empty value.
  const home = stored.home && typeof stored.home === "object" ? { ...DEFAULT_HOME, ...(stored.home as object) } : DEFAULT_HOME;
  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored, home });
  if (!parsed.success && stored.home) {
    // A broken home block must never take the rest of the settings down with it.
    const rest = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored, home: DEFAULT_HOME });
    if (rest.success) return rest.data;
  }
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

// ---------- Cached reads for the public site ----------
// Public pages read through the Next data cache, so a visit costs no database round trip.
// Every admin save calls updateTag(CONTENT_TAG) and the next visit sees the change at once.
// The cache stores JSON, so dates come back as strings and are turned back into Dates here.
export const CONTENT_TAG = "content";
const CACHE = { tags: [CONTENT_TAG], revalidate: 3600 };

function reviveDates<T>(x: T): T {
  if (!x || typeof x !== "object") return x;
  const o = x as Record<string, unknown>;
  for (const k of ["createdAt", "updatedAt", "publishedAt"]) if (typeof o[k] === "string") o[k] = new Date(o[k] as string);
  return x;
}

const cachedPublished = unstable_cache(loadPublished, ["published"], CACHE);
const cachedBySlug = unstable_cache(loadBySlug, ["by-slug"], CACHE);
const cachedRelated = unstable_cache(
  (id: string, category: string, tags: string[], limit: number) => loadRelated({ id, category, tags }, limit),
  ["related"],
  CACHE,
);
const cachedSettings = unstable_cache(loadSettings, ["settings"], CACHE);

export async function listPublished(): Promise<ResourceSummary[]> {
  return (await cachedPublished()).map(reviveDates);
}
export async function getPublishedBySlug(slug: string): Promise<Resource | null> {
  return reviveDates(await cachedBySlug(slug));
}
export async function listRelated(resource: Pick<Resource, "id" | "category" | "tags">, limit = 3): Promise<ResourceSummary[]> {
  return (await cachedRelated(resource.id, resource.category, resource.tags, limit)).map(reviveDates);
}
export function getSettings(): Promise<SiteSettings> {
  return cachedSettings();
}
