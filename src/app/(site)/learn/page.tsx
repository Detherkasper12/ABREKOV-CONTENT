import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import { SiteShell } from "@/components/SiteShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { waitlistMetadata } from "@/components/WaitlistPage";
import { getSettings, listPublished } from "@/lib/data";
import { paletteVars } from "@/lib/palette";
import { consentFor, WAITLISTS } from "@/lib/waitlist";

// Static, rebuilt on every admin save (and at most hourly as a fallback).
export const revalidate = 3600;
const w = WAITLISTS.learn;
export const metadata = waitlistMetadata(w);

// "Learn more": every way to learn with Dima, each a real link (free guides, the courses in the works),
// and the interest form for anything else. Answers land in /admin/subscribers.
export default async function LearnPage() {
  const [settings, guides] = await Promise.all([getSettings(), listPublished()]);
  const paths = [
    { href: "/resources", palette: "blue", eyebrow: `FREE · ${String(guides.length).padStart(2, "0")} GUIDES`, title: "מדריכים חינם", text: "כל מה שאני מראה באינסטגרם, צעד אחרי צעד: פרומפטים להעתקה וקבצים להורדה." },
    { href: WAITLISTS["agents-course"].path, palette: WAITLISTS["agents-course"].palette, eyebrow: "COURSE · SOON", title: "קורס סוכנים", text: WAITLISTS["agents-course"].description },
    { href: WAITLISTS["video-course"].path, palette: WAITLISTS["video-course"].palette, eyebrow: "COURSE · SOON", title: "קורס עריכת וידאו", text: WAITLISTS["video-course"].description },
  ];
  return (
    <SiteShell settings={settings} current="learn" paper>
      <div className="lw">
        <header className="page-h">
          <span className="m">LEARN MORE</span>
          <h1 className="F">{w.title}</h1>
          <p>{w.lead}</p>
        </header>
        <div className="lg">
          <div className="paths">
            <h2 className="F">איך אפשר ללמוד איתי</h2>
            <ol>
              {paths.map((p, i) => (
                <li key={p.href}>
                  <Link className="path" href={p.href} style={paletteVars(p.palette)}>
                    <span className="m">
                      {String(i + 1).padStart(2, "0")} · {p.eyebrow}
                    </span>
                    <b className="F">{p.title}</b>
                    <span className="tx">{p.text}</span>
                    <span className="go" aria-hidden>
                      <ArrowIcon />
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a className="path other" href="#interest">
                  <span className="m">{String(paths.length + 1).padStart(2, "0")} · SOMETHING ELSE</span>
                  <b className="F">משהו אחר?</b>
                  <span className="tx">תגיד לי בטופס מה מעניין אותך. ככה אני יודע מה לבנות קודם.</span>
                </a>
              </li>
            </ol>
          </div>
          <div className="box" id="interest">
            <span className="m">INTEREST FORM</span>
            <h2 className="F">מה בא לך ללמוד?</h2>
            <WaitlistForm list={w.list} consent={consentFor(w)} wishLabel={w.wishLabel} topics={w.topics} button={w.button} />
          </div>
        </div>
        {settings.telegramUrl && (
          <p className="wa">
            רוצה רק לקבל מדריכים חדשים?{" "}
            <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" data-track="community_click">
              {settings.home.communityTitle || "הקהילה בוואטסאפ"}
            </a>
          </p>
        )}
      </div>
    </SiteShell>
  );
}
