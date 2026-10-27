"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, isAdminEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { getById } from "@/lib/data";
import { publishProblems, resourceInputSchema, type ResourceInput } from "@/lib/resource-schema";
import { settingsSchema, type SiteSettings } from "@/lib/settings-schema";
import { createAuthClient, createStorageAdmin, MEDIA_BUCKET } from "@/lib/supabase/server";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

const idSchema = z.uuid();

function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  const path = issue?.path.join(".");
  return path ? `${issue.message} (${path})` : (issue?.message ?? "נתונים לא תקינים");
}

function refreshPublic(...slugs: string[]) {
  revalidatePath("/");
  for (const s of slugs) revalidatePath(`/resources/${s}`);
  revalidatePath("/sitemap.xml");
}

// ---------- Auth ----------

export type SignInState = { error: string } | null;

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "צריך אימייל וסיסמה" };
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "אימייל או סיסמה לא נכונים" };
  if (!isAdminEmail(data.user.email)) {
    await supabase.auth.signOut();
    return { error: "למשתמש הזה אין גישה לניהול" };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Resources ----------

async function uniqueSlug(base: string, excludeId?: string) {
  const sql = db();
  const clean = base.slice(0, 70) || "resource";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? clean : `${clean}-${i + 1}`;
    const [row] = await sql`select id from resources where slug = ${candidate}`;
    if (!row || row.id === excludeId) return candidate;
  }
  return `${clean}-${randomBytes(3).toString("hex")}`;
}

export async function createResource() {
  await requireAdmin();
  const sql = db();
  const slug = await uniqueSlug(`new-${randomBytes(2).toString("hex")}`);
  const [row] = await sql`
    insert into resources (slug, title) values (${slug}, 'משאב חדש') returning id`;
  redirect(`/admin/resources/${row.id}`);
}

export async function saveResource(input: ResourceInput): Promise<ActionResult & { slug?: string }> {
  await requireAdmin();
  const parsed = resourceInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const r = parsed.data;
  const current = await getById(r.id);
  if (!current) return { ok: false, error: "המשאב לא נמצא" };

  const sql = db();
  const [clash] = await sql`select id from resources where slug = ${r.slug} and id <> ${r.id}`;
  if (clash) return { ok: false, error: "הכתובת הזאת כבר תפוסה על ידי משאב אחר" };

  if (current.status === "published") {
    const problems = publishProblems(r);
    if (problems.length) return { ok: false, error: `הדף פורסם, אז אי אפשר לשמור אותו ככה: ${problems.join(", ")}` };
  }

  const tags = [...new Set(r.tags)];
  await sql`
    update resources set
      slug = ${r.slug}, title = ${r.title}, description = ${r.description}, label = ${r.label},
      keyword = ${r.keyword}, cover_url = ${r.coverUrl}, cover_alt = ${r.coverAlt}, category = ${r.category},
      tags = ${tags}, kind = ${r.kind}, price_ils = ${r.kind === "paid" ? r.priceIls : null},
      checkout_url = ${r.checkoutUrl}, featured = ${r.featured}, seo_title = ${r.seoTitle},
      seo_description = ${r.seoDescription}, blocks = ${sql.json(r.blocks as never)}, updated_at = now()
    where id = ${r.id}`;

  refreshPublic(r.slug, current.slug);
  revalidatePath("/admin");
  return { ok: true, slug: r.slug };
}

export async function setStatus(id: string, status: "draft" | "published" | "archived"): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success || !["draft", "published", "archived"].includes(status)) {
    return { ok: false, error: "בקשה לא תקינה" };
  }
  const current = await getById(id);
  if (!current) return { ok: false, error: "המשאב לא נמצא" };
  if (status === "published") {
    const problems = publishProblems(current);
    if (problems.length) return { ok: false, error: `אי אפשר לפרסם עדיין: ${problems.join(", ")}` };
  }
  const sql = db();
  await sql`
    update resources set status = ${status}, updated_at = now(),
      published_at = case when ${status} = 'published' then coalesce(published_at, now()) else published_at end
    where id = ${id}`;
  refreshPublic(current.slug);
  revalidatePath("/admin");
  return { ok: true };
}

export async function toggleFeatured(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "בקשה לא תקינה" };
  const sql = db();
  const [row] = await sql`update resources set featured = not featured where id = ${id} returning slug`;
  if (row) refreshPublic(row.slug as string);
  revalidatePath("/admin");
  return { ok: true };
}

export async function duplicateResource(id: string) {
  await requireAdmin();
  const current = await getById(id);
  if (!current) redirect("/admin");
  const sql = db();
  const slug = await uniqueSlug(`${current.slug}-copy`);
  const [row] = await sql`
    insert into resources (slug, title, description, label, keyword, cover_url, cover_alt, category, tags,
      kind, price_ils, checkout_url, seo_title, seo_description, blocks)
    select ${slug}, title || ' (עותק)', description, label, keyword, cover_url, cover_alt, category, tags,
      kind, price_ils, checkout_url, seo_title, seo_description, blocks
    from resources where id = ${id}
    returning id`;
  revalidatePath("/admin");
  redirect(`/admin/resources/${row.id}`);
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "בקשה לא תקינה" };
  const sql = db();
  const [row] = await sql`delete from resources where id = ${id} returning slug`;
  if (row) refreshPublic(row.slug as string);
  revalidatePath("/admin");
  return { ok: true };
}

// ---------- Uploads ----------

const MAX_UPLOAD = 50 * 1024 * 1024;
const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().max(120),
  size: z.number().int().positive().max(MAX_UPLOAD, "הקובץ גדול מ־50MB"),
});

// The browser uploads straight to Supabase Storage with a one-time signed URL,
// so large files never pass through a Vercel function.
export async function createUpload(
  input: z.input<typeof uploadSchema>,
): Promise<{ ok: true; path: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  await requireAdmin();
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { fileName } = parsed.data;
  if (/\.(html?|svg|xhtml|js|mjs)$/i.test(fileName)) {
    return { ok: false, error: "סוג הקובץ הזה לא נתמך מטעמי אבטחה" };
  }
  const dot = fileName.lastIndexOf(".");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "";
  const stem = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .toLowerCase();
  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(6).toString("hex")}-${stem || "file"}${ext ? `.${ext}` : ""}`;
  const storage = createStorageAdmin().storage.from(MEDIA_BUCKET);
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: `ההעלאה נכשלה: ${error?.message ?? "שגיאה"}` };
  const { data: pub } = storage.getPublicUrl(path);
  return { ok: true, path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

// ---------- Settings ----------

export async function saveSettings(input: SiteSettings): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const sql = db();
  await sql`
    insert into site_settings (id, data, updated_at) values (1, ${sql.json(parsed.data as never)}, now())
    on conflict (id) do update set data = excluded.data, updated_at = now()`;
  revalidatePath("/", "layout");
  return { ok: true };
}
