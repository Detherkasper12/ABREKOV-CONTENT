"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db, ensureSchema } from "@/lib/db";
import { WAITLISTS, consentFor, isWaitlistList } from "@/lib/waitlist";

export type WaitlistField = "name" | "contact" | "wish" | "consent";
// `field` points the error at the input it is about; `values` refill the form so nothing typed is lost.
export type WaitlistState = {
  ok: boolean;
  message: string;
  field?: WaitlistField;
  values?: { name: string; contact: string; wish: string; topics: string[] };
} | null;

const DONE = "נרשמת! אעדכן אותך ברגע שהקורס נפתח.";
const DONE_LEARN = "קיבלתי, תודה! ככה אני יודע מה לבנות קודם.";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const phone = /^\+?[\d\s\-()]{9,20}$/;
const schema = z.object({
  name: z.string().trim().min(2, "תכתוב את השם שלך.").max(80, "השם ארוך מדי."),
  contact: z
    .string()
    .trim()
    .max(120)
    .refine((v) => phone.test(v) || z.email().safeParse(v).success, "תכתוב מספר וואטסאפ או מייל תקין."),
  wish: z.string().trim().max(500, "קצת יותר קצר, בבקשה.").default(""),
});

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Bots usually fill every field and submit instantly.
  if (String(formData.get("company") ?? "") !== "") return { ok: true, message: DONE };
  const startedAt = Number(formData.get("t") ?? 0);

  const values = {
    name: String(formData.get("name") ?? "").slice(0, 80),
    contact: String(formData.get("contact") ?? "").slice(0, 120),
    wish: String(formData.get("wish") ?? "").slice(0, 400),
    topics: formData.getAll("topic").map(String).slice(0, 12),
  };
  const fail = (message: string, field?: WaitlistField): WaitlistState => ({ ok: false, message, field, values });
  const list = String(formData.get("list") ?? "");
  if (!isWaitlistList(list)) return fail("משהו לא תקין בטופס. נסה לרענן את הדף.");

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    wish: String(formData.get("wish") ?? ""),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? "משהו לא תקין בטופס.", issue?.path[0] as WaitlistField | undefined);
  }
  if (formData.get("consent") !== "on") return fail("צריך לסמן את ההסכמה כדי להירשם.", "consent");
  if (!startedAt || Date.now() - startedAt < 2500) return fail("רגע, נסה שוב בעוד כמה שניות.");

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = sha(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "abrekov"}`);
  await ensureSchema();
  const sql = db();

  const [{ count }] = await sql`
    select count(*)::int as count from waitlist where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
  if (count >= 5) return fail("יותר מדי ניסיונות. נסה שוב בעוד שעה.");

  const w = WAITLISTS[list];
  const { name, contact } = parsed.data;
  // Topic chips (only the ones the form offers) are kept at the start of the free text.
  const allowed = new Set(("topics" in w ? w.topics : []).map((t) => t.label));
  const topics = formData.getAll("topic").map(String).filter((t) => allowed.has(t));
  const wish = (topics.length ? `[${topics.join(", ")}] ${parsed.data.wish}` : parsed.data.wish).trim().slice(0, 500);
  await sql`
    insert into waitlist (list, name, contact, wish, consent_text, ip_hash)
    values (${list}, ${name}, ${contact}, ${wish}, ${consentFor(w)}, ${ipHash})`;
  return { ok: true, message: list === "learn" ? DONE_LEARN : DONE };
}
