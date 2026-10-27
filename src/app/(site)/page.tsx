import { Library } from "@/components/Library";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ResourceCard } from "@/components/ResourceCard";
import { instagramUrl } from "@/components/SiteChrome";
import { getSettings, listPublished } from "@/lib/data";
import { emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function HomePage(props: PageProps<"/">) {
  const [settings, resources, sp] = await Promise.all([getSettings(), listPublished(), props.searchParams]);
  // Featured row only adds value when the library has more than what it shows.
  const featured = resources.length > 3 ? resources.filter((r) => r.featured).slice(0, 3) : [];
  const labels = new Map(settings.categories.map((c) => [c.slug, c.label]));
  const showNewsletter = settings.newsletterEnabled && emailConfigured();

  return (
    <div className="mx-auto grid max-w-[1080px] gap-16 px-4 pt-10 sm:pt-14">
      <section className="grid max-w-[760px] gap-4">
        <p className="eyebrow-mono ltr text-start">Resources · <span className="normal-case">@{settings.instagramHandle}</span></p>
        <h1 className="font-display text-[clamp(52px,11vw,88px)] leading-[0.86] text-balance text-forest">{settings.heroTitle}</h1>
        {settings.heroText && <p className="max-w-[60ch] text-[18px] text-ink/80">{settings.heroText}</p>}
      </section>

      {featured.length > 0 && (
        <section className="grid gap-5" aria-labelledby="featured-title">
          <h2 id="featured-title" className="flex items-center gap-2 text-[22px] font-extrabold">
            <span aria-hidden className="block size-3 bg-lime outline-2 outline-ink" />
            מומלצים
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <ResourceCard key={r.id} r={r} categoryLabel={labels.get(r.category)} />
            ))}
          </div>
        </section>
      )}

      <section id="library" className="grid scroll-mt-20 gap-5" aria-labelledby="library-title">
        <h2 id="library-title" className="text-[22px] font-extrabold">
          כל המשאבים
        </h2>
        {resources.length > 0 ? (
          <Library
            resources={resources}
            categories={settings.categories}
            initialCategory={typeof sp.category === "string" ? sp.category : ""}
          />
        ) : (
          <p className="card p-6 text-muted">עוד אין פה משאבים. הראשון בדרך.</p>
        )}
      </section>

      {showNewsletter && <NewsletterForm title={settings.newsletterTitle} text={settings.newsletterText} />}

      <section id="about" className="grid scroll-mt-20 gap-6 border-t border-line pt-12 md:grid-cols-[1fr_1fr]" aria-labelledby="about-title">
        <div className="grid content-start gap-3">
          <p className="eyebrow">עליי</p>
          <h2 id="about-title" className="ltr text-start text-[30px] font-extrabold">
            {settings.aboutName}
          </h2>
          {settings.aboutText && <p className="text-[17px] text-ink/85">{settings.aboutText}</p>}
          <ul className="mt-2 flex flex-wrap gap-2 text-[15px] font-bold">
            {settings.instagramHandle && (
              <li>
                <a href={instagramUrl(settings.instagramHandle)} target="_blank" rel="noopener noreferrer" className="card ltr inline-block px-4 py-2 font-mono text-[14px] hover:border-forest">
                  @{settings.instagramHandle}
                </a>
              </li>
            )}
            {settings.portfolioUrl && (
              <li>
                <a href={settings.portfolioUrl} target="_blank" rel="noopener noreferrer" className="card inline-block px-4 py-2 hover:border-forest">
                  פורטפוליו
                </a>
              </li>
            )}
            {settings.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="card inline-block px-4 py-2 hover:border-forest">
                  <bdi>{s.label}</bdi>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {(settings.collabTitle || settings.collabText) && (
          <div className="card grid content-start gap-3 p-6">
            <h3 className="text-[22px] font-extrabold">{settings.collabTitle}</h3>
            {settings.collabText && <p className="text-muted">{settings.collabText}</p>}
            {settings.contactEmail ? (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="mt-1 justify-self-start rounded-full bg-forest px-5 py-2.5 font-extrabold text-lime hover:bg-forest-2"
              >
                {settings.collabButton || "צור קשר"}
              </a>
            ) : (
              settings.instagramHandle && (
                <a
                  href={instagramUrl(settings.instagramHandle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 justify-self-start rounded-full bg-forest px-5 py-2.5 font-extrabold text-lime hover:bg-forest-2"
                >
                  {settings.collabButton || "צור קשר"} ב־Instagram
                </a>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
