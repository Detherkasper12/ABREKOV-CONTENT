import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { WAITLIST_CONSENT } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const TITLE = "ללמוד לבנות סוכנים עם Claude";
const DESCRIPTION = "מיני־קורס על בניית סוכנים שבונים בשבילך אתרים, מערכות ופלטפורמות. הקורס בדרך: תירשם לרשימת ההמתנה.";

// Reached from the Instagram DM funnel only, so it is kept out of search and the library chrome.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  alternates: { canonical: "/agents" },
  openGraph: { title: TITLE, description: DESCRIPTION },
};

export default function AgentsWaitlistPage() {
  return (
    <SiteShell isolated>
      <div className="mx-auto grid max-w-[720px] gap-8 px-4 py-12 sm:py-16">
        <header className="grid gap-4">
          <p className="flex items-center gap-2">
            <span className="eyebrow-mono">COURSE</span>
            <span className="rounded-full bg-lime px-3 py-0.5 text-[13px] font-extrabold text-ink">רשימת המתנה</span>
          </p>
          <h1 className="font-display text-[56px] leading-[0.9] text-balance text-forest sm:text-[84px]">{TITLE}</h1>
          <p className="text-[19px] text-pretty">
            המדריך החינמי מלמד איך לגרום ל־Claude להפסיק לנחש. בקורס נלך רחוק יותר: איך בונים סוכנים שבונים בשבילך אתרים,
            מערכות ופלטפורמות כמו אלה שאתה רואה אצלי.
          </p>
        </header>
        <ul className="grid gap-2 text-[17px]">
          <li className="flex gap-2">
            <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-forest" />
            הקורס עוד לא יצא. נרשמים לרשימה מקבלים הודעה ראשונים כשההרשמה נפתחת.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-forest" />
            תכתוב מה היית רוצה לבנות, ואבנה את הקורס סביב מה שבאמת חשוב לך.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-forest" />
            בלי ספאם. רק עדכון על הקורס.
          </li>
        </ul>
        <WaitlistForm consent={WAITLIST_CONSENT} />
        <p className="text-muted">
          עוד לא קראת את המדריך החינמי?{" "}
          <Link href="/resources/claude-stop-guessing" className="font-bold text-forest underline underline-offset-4">
            3 דרכים לגרום ל־Claude להפסיק לנחש
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
