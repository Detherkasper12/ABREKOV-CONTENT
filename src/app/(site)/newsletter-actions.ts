"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { confirmEmail, emailConfigured, sendEmail, siteUrl } from "@/lib/email";

export type SubscribeState = { ok: boolean; message: string } | null;

const CONSENT_TEXT = "אני מסכים לקבל מ־ABREKOV מיילים על משאבים חדשים. אפשר לבטל בכל רגע.";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const DONE = "שלחתי לך מייל אישור. לחץ על הקישור שבו כדי להצטרף.";

export async function subscribe(_prev: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const settings = await getSettings();
  if (!settings.newsletterEnabled || !emailConfigured()) return { ok: false, message: "ההרשמה סגורה כרגע." };

  // Bots usually fill every field and submit instantly.
  if (String(formData.get("company") ?? "") !== "") return { ok: true, message: DONE };
  const startedAt = Number(formData.get("t") ?? 0);
  if (!startedAt || Date.now() - startedAt < 2500) return { ok: false, message: "רגע, נסה שוב בעוד כמה שניות." };

  const email = z.email().max(254).safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { ok: false, message: "כתובת המייל לא נראית תקינה." };
  if (formData.get("consent") !== "on") return { ok: false, message: "צריך לסמן הסכמה כדי להירשם." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = sha(`${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? "abrekov"}`);
  const sql = db();

  const [{ count }] = await sql`
    select count(*)::int as count from subscribers where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'`;
  if (count >= 5) return { ok: false, message: "יותר מדי ניסיונות. נסה שוב מאוחר יותר." };

  const [existing] = await sql`select status from subscribers where email = ${email.data}`;
  // Same answer whether or not the address is already subscribed, so the form can't be used to check emails.
  if (existing?.status === "confirmed") return { ok: true, message: DONE };

  const token = randomBytes(32).toString("base64url");
  await sql`
    insert into subscribers (email, status, token_hash, consent_text, source, ip_hash)
    values (${email.data}, 'pending', ${sha(token)}, ${CONSENT_TEXT}, 'website', ${ipHash})
    on conflict (email) do update set status = 'pending', token_hash = excluded.token_hash,
      consent_text = excluded.consent_text, ip_hash = excluded.ip_hash, created_at = now(), unsubscribed_at = null`;

  const mail = confirmEmail(`${siteUrl()}/subscribe/confirm?token=${token}`);
  try {
    await sendEmail(email.data, mail.subject, mail.html, mail.text);
  } catch (e) {
    console.error("newsletter confirm email failed", e);
    return { ok: false, message: "לא הצלחתי לשלוח מייל אישור. נסה שוב מאוחר יותר." };
  }
  return { ok: true, message: DONE };
}

export async function confirmSubscription(_prev: boolean | null, formData: FormData): Promise<boolean> {
  const token = String(formData.get("token") ?? "");
  if (!/^[\w-]{20,100}$/.test(token)) return false;
  const sql = db();
  const rows = await sql`
    update subscribers set status = 'confirmed', confirmed_at = now()
    where token_hash = ${sha(token)} and status = 'pending' and created_at > now() - interval '7 days'
    returning id`;
  return rows.length > 0;
}
