import { SiteShell } from "@/components/SiteShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { waitlistMetadata } from "@/components/WaitlistPage";
import { getSettings } from "@/lib/data";
import { paletteVars } from "@/lib/palette";
import { consentFor, WAITLISTS } from "@/lib/waitlist";

export const dynamic = "force-dynamic";
const w = WAITLISTS.learn;
export const metadata = waitlistMetadata(w);

// "Learn more": an honest interest form instead of a paid upsell. Answers land in /admin/subscribers.
export default async function LearnPage() {
  const settings = await getSettings();
  const tiles = settings.home.scenes.filter((s) => s.enabled).slice(0, 4);
  return (
    <SiteShell settings={settings} current="learn" paper>
      <div className="lw">
        <header className="page-h">
          <span className="m">LEARN MORE</span>
          <h1 className="F">{w.title}</h1>
          <p>{w.lead}</p>
        </header>
        <div className="lg">
          <div className="tiles" aria-hidden>
            {tiles.map((s) => (
              <div className="tile" key={s.id} style={paletteVars(s.palette)}>
                <span>{s.name}</span>
                <span className="m">{s.big}</span>
              </div>
            ))}
          </div>
          <div className="box">
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
