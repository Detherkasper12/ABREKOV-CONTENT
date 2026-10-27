import { getAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const sql = db();
  const rows = await sql`
    select email, confirmed_at, consent_text from subscribers where status = 'confirmed' order by confirmed_at`;
  const csv = ["email,confirmed_at,consent_text", ...rows.map((r) => [r.email, r.confirmedAt?.toISOString(), r.consentText].map(cell).join(","))].join("\n");
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="abrekov-subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
