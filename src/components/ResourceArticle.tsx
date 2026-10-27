/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { headingAnchor, type BlockOf } from "@/lib/blocks";
import type { Resource, ResourceSummary } from "@/lib/data";
import type { SiteSettings } from "@/lib/settings-schema";
import { ContactCta } from "./ContactCta";
import { BlockList } from "./blocks/BlockRenderer";
import { formatPrice, ResourceCard } from "./ResourceCard";

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });

export function ResourceArticle({
  resource: r,
  settings,
  related,
}: {
  resource: Resource;
  settings: SiteSettings;
  related: ResourceSummary[];
}) {
  const categories = new Map(settings.categories.map((c) => [c.slug, c.label]));
  const headings = r.blocks.filter((b): b is BlockOf<"heading"> => b.type === "heading" && b.level === 2 && !!b.text);
  const canBuy = r.kind === "paid" && /^https:\/\//.test(r.checkoutUrl) && (r.priceIls ?? 0) > 0;

  return (
    <article className="mx-auto max-w-[1080px] px-4 pt-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[14px] text-muted" aria-label="פירורי לחם">
        <Link href="/#library" className="font-bold hover:text-ink">
          משאבים
        </Link>
        {r.category && categories.get(r.category) && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/?category=${r.category}#library`} className="hover:text-ink">
              {categories.get(r.category)}
            </Link>
          </>
        )}
      </nav>

      <header className="grid max-w-[760px] gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {r.label && <span className="ltr font-mono text-[12.5px] tracking-[0.06em] text-muted">{r.label}</span>}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[13px] font-extrabold ${r.kind === "paid" ? "bg-ink text-lime" : "bg-lime text-ink"}`}
          >
            {r.kind === "paid" ? "מוצר דיגיטלי" : "חינם"}
          </span>
        </div>
        <h1
          className={`font-display leading-[0.88] text-balance text-forest ${
            // Karantina is condensed, but long Hebrew titles still need a smaller step on phones.
            r.title.length > 48 ? "text-[clamp(40px,8vw,72px)]" : "text-[clamp(52px,12vw,92px)]"
          }`}
        >
          {r.title}
        </h1>
        {r.description && <p className="text-[19px] leading-relaxed font-semibold text-ink/85">{r.description}</p>}
        <p className="text-[14px] text-muted">
          עודכן ב־{dateFmt.format(r.updatedAt)}
          {r.tags.length > 0 && (
            <>
              {" · "}
              {r.tags.map((t) => (
                <bdi key={t} className="me-2">
                  #{t}
                </bdi>
              ))}
            </>
          )}
        </p>
      </header>

      {r.coverUrl && (
        <img
          src={r.coverUrl}
          alt={r.coverAlt}
          className="mt-8 aspect-[16/9] w-full max-w-[760px] rounded-[18px] border border-line bg-forest object-cover"
        />
      )}

      {r.kind === "paid" && (
        <div className="card mt-8 flex max-w-[760px] flex-wrap items-center justify-between gap-4 p-5">
          <div className="grid gap-1">
            <span className="font-mono text-[26px] font-semibold">{formatPrice(r.priceIls)}</span>
            <span className="text-[14px] text-muted">התשלום והמשלוח של הקבצים מתבצעים בעמוד תשלום מאובטח.</span>
          </div>
          {canBuy ? (
            <a
              href={r.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-forest px-6 py-3 font-extrabold text-lime hover:bg-forest-2"
            >
              לרכישה
            </a>
          ) : (
            <span className="rounded-full border border-line px-5 py-2.5 font-bold text-muted">הרכישה תיפתח בקרוב</span>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,760px)_1fr]">
        <div className="min-w-0">
          {r.kind === "paid" && r.blocks.length > 0 && <p className="eyebrow mb-4">תצוגה מקדימה</p>}
          <BlockList blocks={r.blocks} />
        </div>
        {headings.length > 2 && (
          <aside className="order-first lg:order-none">
            <nav
              className="card p-4 lg:sticky lg:top-20 lg:border-0 lg:bg-transparent lg:p-0"
              aria-label="תוכן העניינים"
            >
              <p className="eyebrow mb-2">בדף הזה</p>
              <ol className="grid gap-1.5 text-[15px]">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${headingAnchor(h)}`} className="text-muted hover:text-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
      </div>

      <div className="mt-16 max-w-[760px]">
        <ContactCta
          settings={settings}
          title={settings.resourceCtaTitle}
          text={settings.resourceCtaText}
          button={settings.resourceCtaButton}
          place="resource"
        />
      </div>

      {related.length > 0 && (
        <section className="mt-16 grid gap-5 border-t border-line pt-10">
          <h2 className="text-[24px] font-extrabold">עוד משאבים</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((x) => (
              <ResourceCard key={x.id} r={x} categoryLabel={categories.get(x.category)} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
