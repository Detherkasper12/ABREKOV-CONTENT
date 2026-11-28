"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db, ensureSchema } from "@/lib/db";
import { WAITLIST_CONSENT } from "@/lib/waitlist";

export type WaitlistState = { ok: boolean; message: string } | null;

const DONE = "נרשמת! אעדכן אותך ברגע שהקורס נפתח.";
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
  if (!startedAt || Date.now() - startedAt < 2500) return { ok: false, message: "רגע, נסה שוב בעוד כמה שניות." };

  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    wish: String(formData.get("wish") ?? ""),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "משהו לא תקין בטופס." };
  if (formData.get("consent") !== "on") return { ok: false, message: "צריך לסמן הסכמה כדי להירשם." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = sha(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "abrekov"}`);
  await ensureSchema();
  const sql = db();

  const [{ count }] = await sql`
    select count(*)::int as count from waitlist where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
  if (count >= 5) return { ok: false, message: "יותר מדי ניסיונות. נסה שוב מאוחר יותר." };

  const { name, contact, wish } = parsed.data;
  await sql`
    insert into waitlist (list, name, contact, wish, consent_text, ip_hash)
    values ('agents-course', ${name}, ${contact}, ${wish}, ${WAITLIST_CONSENT}, ${ipHash})`;
  return { ok: true, message: DONE };
}
