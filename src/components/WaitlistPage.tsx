import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Stars } from "@/components/Stars";
import { WaitlistForm } from "@/components/WaitlistForm";
import { paletteVars } from "@/lib/palette";
import { consentFor, type WaitlistConfig } from "@/lib/waitlist";

// Course pages are reached from Instagram DM funnels, so they stay out of search.
export function waitlistMetadata(w: WaitlistConfig): Metadata {
  return {
    title: w.title,
    description: w.description,
    robots: w.isPublic ? undefined : { index: false, follow: false },
    alternates: { canonical: w.path },
    openGraph: { title: w.title, description: w.description },
  };
}

// Honest about the state of the course: no date, no price yet, the list is free and can be left.
const FAQ = [
  { q: "מתי הקורס יוצא?", a: "עוד אין תאריך. מי שברשימת ההמתנה יקבל הודעה ראשון, ברגע שיהיה." },
  { q: "כמה הוא יעלה?", a: "המחיר עוד לא נקבע. ההרשמה לרשימה חינם ולא מחייבת לכלום." },
  { q: "מה קורה עם הפרטים שלי?", a: "הם נשמרים רק כדי לעדכן אותך על הקורס. אפשר לבקש להימחק מהרשימה מתי שרוצים." },
];

export function WaitlistPage({ w }: { w: WaitlistConfig }) {
  return (
    <SiteShell current={w.list === "agents-course" ? "agents" : ""}>
      <section className="wl-hero" style={paletteVars(w.palette)}>
        {w.palette === "space" && <Stars />}
        <div className="lw wlg">
          <div>
            <span className="m">COURSE · WAITLIST</span>
            <h1 className="F">{w.title}</h1>
            <p className="sub">{w.lead}</p>
            <div className="stat">
              <i aria-hidden />
              <span className="m">IN PROGRESS · NO RELEASE DATE YET</span>
            </div>
            {w.guide && (
              <p className="wl-guide">
                עוד לא קראת את המדריך החינמי? <Link href={w.guide.href}>{w.guide.label}</Link>
              </p>
            )}
          </div>
          <div className="wcard">
            <span className="m">JOIN THE WAITLIST</span>
            <h2 className="F">רשימת המתנה</h2>
            <WaitlistForm list={w.list} wishLabel={w.wishLabel} consent={consentFor(w)} button={w.button ?? "להירשם"} />
          </div>
        </div>
      </section>
      <section className="lw faq" aria-labelledby="faq-h">
        <span className="m">QUESTIONS</span>
        <h2 className="F" id="faq-h">
          מה כבר ידוע.
        </h2>
        <div className="qa">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                {f.q}
                <span className="pl" aria-hidden>
                  +
                </span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
