import { db, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short" });
const LABEL = { pending: "ממתין לאישור", confirmed: "מאושר", unsubscribed: "הוסר" } as const;

export default async function SubscribersPage() {
  const sql = db();
  const rows = await sql`select email, status, created_at, confirmed_at from subscribers order by created_at desc limit 1000`;
  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  await ensureSchema();
  const waitlist = await sql`select name, contact, wish, created_at from waitlist order by created_at desc limit 1000`;
  return (
    <div className="mx-auto grid max-w-[900px] gap-5 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="me-auto text-[26px] font-extrabold">נרשמים</h1>
        <span className="text-muted">{confirmed} מאושרים</span>
        <a href="/admin/subscribers-export" className="btn inline-flex items-center">
          הורדת CSV של המאושרים
        </a>
      </div>
      <p className="text-[14px] text-muted">
        נשמרים רק מי שסימן הסכמה. &quot;מאושר&quot; = לחץ על הקישור במייל האישור. לשליחת ניוזלטר, ייבא את ה־CSV לספק המיילים שלך.
      </p>
      <div className="card divide-y divide-line">
        {rows.length === 0 && <p className="p-5 text-muted">עוד אין נרשמים.</p>}
        {rows.map((r) => (
          <div key={r.email as string} className="flex flex-wrap items-center gap-3 p-3 text-[14px]">
            <span className="ltr me-auto font-mono">{r.email as string}</span>
            <span className={`status ${r.status === "confirmed" ? "status-published" : "status-draft"}`}>{LABEL[r.status as keyof typeof LABEL]}</span>
            <span className="text-muted">{fmt.format(r.confirmedAt ?? r.createdAt)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="me-auto text-[22px] font-extrabold">רשימת המתנה: קורס סוכנים</h2>
        <span className="text-muted">{waitlist.length} נרשמים</span>
        <a href="/agents" target="_blank" className="btn inline-flex items-center">
          לדף ההרשמה ↗
        </a>
      </div>
      <div className="card divide-y divide-line">
        {waitlist.length === 0 && <p className="p-5 text-muted">עוד אין נרשמים לרשימת ההמתנה.</p>}
        {waitlist.map((r, i) => (
          <div key={i} className="grid gap-1 p-3 text-[14px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold">{r.name as string}</span>
              <span className="ltr me-auto font-mono">{r.contact as string}</span>
              <span className="text-muted">{fmt.format(r.createdAt as Date)}</span>
            </div>
            {r.wish ? <p className="text-muted">{r.wish as string}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
