import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { WAITLIST_CONSENT, type WaitlistConfig } from "@/lib/waitlist";

// Reached from an Instagram DM funnel only, so it is kept out of search and the library chrome.
export function waitlistMetadata(w: WaitlistConfig): Metadata {
  return {
    title: w.title,
    description: w.description,
    robots: { index: false, follow: false },
    alternates: { canonical: w.path },
    openGraph: { title: w.title, description: w.description },
  };
}

function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-forest" />
      {children}
    </li>
  );
}

export function WaitlistPage({ w }: { w: WaitlistConfig }) {
  return (
    <SiteShell isolated>
      <div className="mx-auto grid max-w-[720px] gap-8 px-4 py-12 sm:py-16">
        <header className="grid gap-4">
          <p className="flex items-center gap-2">
            <span className="eyebrow-mono">COURSE</span>
            <span className="rounded-full bg-lime px-3 py-0.5 text-[13px] font-extrabold text-ink">רשימת המתנה</span>
          </p>
          <h1 className="font-display text-[56px] leading-[0.9] text-balance text-forest sm:text-[84px]">{w.title}</h1>
          <p className="text-[19px] text-pretty">{w.lead}</p>
        </header>
        <ul className="grid gap-2 text-[17px]">
          <Point>הקורס עוד לא יצא. נרשמים לרשימה מקבלים הודעה ראשונים כשההרשמה נפתחת.</Point>
          <Point>תכתוב מה היית רוצה ללמוד, ואבנה את הקורס סביב מה שבאמת חשוב לך.</Point>
          <Point>בלי ספאם. רק עדכון על הקורס.</Point>
        </ul>
        <WaitlistForm list={w.list} wishLabel={w.wishLabel} consent={WAITLIST_CONSENT} />
        <p className="text-muted">
          עוד לא קראת את המדריך החינמי?{" "}
          <Link href={w.guide.href} className="font-bold text-forest underline underline-offset-4">
            {w.guide.label}
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
