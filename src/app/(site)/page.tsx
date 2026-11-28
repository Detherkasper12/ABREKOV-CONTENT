/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { GuideRow } from "@/components/GuideRow";
import { HomeSite, SCALE_SCRIPT } from "@/components/home/HomeSite";
import { Story } from "@/components/home/Story";
import { instagramUrl, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getSettings, listPublished } from "@/lib/data";
import { splitPairs } from "@/lib/home-schema";
import { consentFor, WAITLISTS } from "@/lib/waitlist";

// Static, rebuilt on every admin save (and at most hourly as a fallback).
export const revalidate = 3600;
export const metadata = { alternates: { canonical: "/" } };

const HOME_GUIDES = 6;

export default async function HomePage() {
  const [settings, resources] = await Promise.all([getSettings(), listPublished()]);
  const home = settings.home;
  const labels = new Map(settings.categories.map((c) => [c.slug, c.label]));
  const guides = resources.slice(0, HOME_GUIDES);
  const course = WAITLISTS["agents-course"];

  return (
    <HomeSite>
      <script dangerouslySetInnerHTML={{ __html: SCALE_SCRIPT }} />
      <a className="skiplink" href="#library">
        לכל המדריכים
      </a>
      <SiteHeader settings={settings} current="home" fixed />
      <main dir="rtl" lang="he">
        <Story home={home} />

        <section className="low" id="library" aria-labelledby="lib-h">
          <div className="lw">
            <header className="lh">
              <span className="m">FREE GUIDES · {String(resources.length).padStart(2, "0")}</span>
              <h2 className="F" id="lib-h">
                {home.libraryTitle}
              </h2>
              {home.libraryText && <p>{home.libraryText}</p>}
            </header>
            {guides.length > 0 ? (
              <div className="rows">
                {guides.map((r, i) => (
                  <GuideRow key={r.id} r={r} index={i} tag={labels.get(r.category)} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <p>המדריך הראשון בדרך.</p>
                <Link className="btn" href="/learn" style={{ marginTop: 24 }}>
                  לספר לי מה ללמד קודם
                </Link>
              </div>
            )}
            <div className="lib-more">
              <span>כל המדריכים חינם, בלי הרשמה.</span>
              <Link className="btn solid" href="/resources">
                {resources.length > guides.length ? `לכל ${resources.length} המדריכים` : "לכל המדריכים"} ←
              </Link>
            </div>
          </div>
        </section>

        <section className="low" id="about" aria-labelledby="about-h">
          <div className="lw ab">
            {home.aboutPhoto && (
              <div className="abph">
                <img src={home.aboutPhoto} alt={settings.aboutName || "דימה אברקוב"} loading="lazy" decoding="async" />
              </div>
            )}
            <div className="abtx">
              <span className="m">ABOUT</span>
              <h2 className="F" id="about-h">
                {home.aboutTitle}
              </h2>
              {home.aboutLine && <p className="say F">{home.aboutLine}</p>}
              <dl>
                {splitPairs(home.aboutRows).map((r, i) => (
                  <div key={i}>
                    <dt className="m">{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
                {settings.instagramHandle && (
                  <div>
                    <dt className="m">WHERE</dt>
                    <dd>
                      <a className="ltr" href={instagramUrl(settings.instagramHandle)} target="_blank" rel="noopener noreferrer">
                        @{settings.instagramHandle}
                      </a>{" "}
                      באינסטגרם
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>

        <section className="low" id="course" aria-labelledby="course-h">
          <div className="lw">
            <div className="lr">
              <div>
                <span className="m">{home.courseEyebrow}</span>
                <h2 className="F" id="course-h">
                  {home.courseTitle}
                </h2>
                {home.courseText && <p>{home.courseText}</p>}
                <Link className="more" href={course.path}>
                  מה ידוע על הקורס ←
                </Link>
              </div>
              <WaitlistForm list={course.list} consent={consentFor(course)} button="להירשם לרשימת ההמתנה" />
            </div>
          </div>
        </section>

        {settings.telegramUrl && (
          <section className="low" id="community" aria-labelledby="cm-h">
            <div className="lw">
              <div className="cm">
                <div>
                  <h3 className="F" id="cm-h">
                    {home.communityTitle}
                  </h3>
                  {home.communityText && <span>{home.communityText}</span>}
                </div>
                <a className="btn" href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" data-track="community_click">
                  להצטרף ←
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter settings={settings} />
    </HomeSite>
  );
}
