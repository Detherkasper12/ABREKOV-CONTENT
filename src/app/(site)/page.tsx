import { Library } from "@/components/Library";
import { ContactCta } from "@/components/ContactCta";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ResourceCard } from "@/components/ResourceCard";
import { instagramUrl } from "@/components/SiteChrome";
import { getSettings, listPublished } from "@/lib/data";
import { emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage(props: PageProps<"/">) {
  const [settings, resources, sp] = await Promise.all([getSettings(), listPublished(), props.searchParams]);
  // Featured row only adds value when the library has more than what it shows.
  const featured = resources.length > 3 ? resources.filter((r) => r.featured).slice(0, 3) : [];
  const labels = new Map(settings.categories.map((c) => [c.slug, c.label]));
  const showNewsletter = settings.newsletterEnabled && emailConfigured();

  return (
    <div className="mx-auto grid max-w-[1080px] gap-16 px-4 pt-10 sm:gap-20 sm:pt-16">
      <section className="grid max-w-[780px] gap-5">
        <p className="eyebrow-mono ltr text-start">
          Resources · <span className="normal-case">@{settings.instagramHandle}</span>
        </p>
        <h1 className="font-display text-[clamp(56px,11vw,96px)] leading-[0.86] text-balance text-forest">{settings.heroTitle}</h1>
        {settings.heroText && <p className="max-w-[56ch] text-[18px] leading-relaxed text-ink/80 sm:text-[19px]">{settings.heroText}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href="#library" className="btn-primary min-h-12 px-6 text-[16px]">
            {resources.length > 1 ? `לכל ${resources.length} המשאבים` : "למשאבים"}
            <span aria-hidden>↓</span>
          </a>
          {settings.aboutName && (
            <a href="#about" className="text-[15px] text-muted hover:text-ink">
              מאת <bdi className="font-bold text-ink">{settings.aboutName}</bdi>, מעצב ומפתח מוצרים דיגיטליים
            </a>
          )}
        </div>
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
        <h2 id="library-title" className="text-[24px] font-extrabold">
          {featured.length > 0 ? "כל המשאבים" : "המשאבים"}
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

      <section id="about" className="grid scroll-mt-20 gap-8 border-t border-line pt-12 md:grid-cols-2 md:gap-10" aria-labelledby="about-title">
        <div className="grid content-start gap-3">
          <p className="eyebrow">מי מאחורי המשאבים</p>
          <h2 id="about-title" className="ltr text-start text-[32px] leading-tight font-extrabold">
            {settings.aboutName}
          </h2>
          {settings.aboutText && <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink/85">{settings.aboutText}</p>}
          <ul className="mt-2 flex flex-wrap gap-2 text-[15px] font-bold">
            {settings.instagramHandle && (
              <li>
                <a href={instagramUrl(settings.instagramHandle)} target="_blank" rel="noopener noreferrer" className="card ltr inline-flex min-h-11 items-center px-4 font-mono text-[14px] hover:border-forest">
                  @{settings.instagramHandle}
                </a>
              </li>
            )}
            {settings.portfolioUrl && (
              <li>
                <a href={settings.portfolioUrl} target="_blank" rel="noopener noreferrer" className="card inline-flex min-h-11 items-center px-4 hover:border-forest">
                  פורטפוליו
                </a>
              </li>
            )}
            {settings.socials.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="card inline-flex min-h-11 items-center px-4 hover:border-forest">
                  <bdi>{s.label}</bdi>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ContactCta settings={settings} title={settings.collabTitle} text={settings.collabText} button={settings.collabButton} place="home" />
      </section>
    </div>
  );
}
