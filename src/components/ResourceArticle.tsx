/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { headingAnchor, stepNumber, type BlockOf } from "@/lib/blocks";
import type { Resource, ResourceSummary } from "@/lib/data";
import { guidePalette, paletteVars, rowColors } from "@/lib/palette";
import type { SiteSettings } from "@/lib/settings-schema";
import { consentFor, offerFor } from "@/lib/waitlist";
import { BlockList } from "./blocks/BlockRenderer";
import { GuideRow } from "./GuideRow";
import { GuideToc } from "./GuideToc";
import { formatPrice } from "./ResourceCard";
import { WaitlistForm } from "./WaitlistForm";

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });

// The reading page: content first and no motion. At the end, one offer that matches the topic,
// then a quiet way to the rest of the guides.
export function ResourceArticle({ resource: r, settings, related }: { resource: Resource; settings: SiteSettings; related: ResourceSummary[] }) {
  const categories = new Map(settings.categories.map((c) => [c.slug, c.label]));
  const headings = r.blocks.filter((b): b is BlockOf<"heading"> => b.type === "heading" && b.level === 2 && !!b.text);
  const canBuy = r.kind === "paid" && /^https:\/\//.test(r.checkoutUrl) && (r.priceIls ?? 0) > 0;
  const offer = r.kind === "free" ? offerFor(r.slug, r.offer) : null;
  const cat = r.category ? categories.get(r.category) : undefined;
  const steps = headings.map((h, i) => ({ id: headingAnchor(h), ...stepNumber(h.text, i) }));
  const eyebrow = ["GUIDE", r.label, r.kind === "paid" ? "DIGITAL PRODUCT" : "FREE"].filter(Boolean).join(" · ");

  return (
    <>
      <article className={`gd${steps.length > 1 ? " has-toc" : ""}`} style={rowColors(guidePalette(r.accent, r.category))}>
        <div className="gd-head">
        {!r.unlisted && (
          <nav className="crumbs" aria-label="פירורי לחם">
            <Link href="/resources">מדריכים</Link>
            {cat && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/resources?category=${r.category}`}>{cat}</Link>
              </>
            )}
          </nav>
        )}
        <span className="m">{eyebrow}</span>
        <h1>{r.title}</h1>
        {r.description && <p className="lead">{r.description}</p>}
        <p className="meta">
          עודכן ב־{dateFmt.format(r.updatedAt)}
          {r.tags.length > 0 && " · "}
          {r.tags.map((t) => (
            <bdi key={t} style={{ marginInlineEnd: 8 }}>
              #{t}
            </bdi>
          ))}
        </p>

        {r.kind === "free" && (
          <div className="dl">
            {r.fileUrl && (
              <a href={r.fileUrl} download={r.fileName || true} data-track="download_click" data-track-slug={r.slug} data-track-type="file" className="btn solid">
                <span aria-hidden>↓</span> הורדת הקובץ
                {r.fileName && <bdi className="ltr m" style={{ color: "inherit" }}>{r.fileName.split(".").pop()}</bdi>}
              </a>
            )}
            <a
              href={`/resources/${r.slug}/download`}
              download
              data-track="download_click"
              data-track-slug={r.slug}
              data-track-type="markdown"
              className={r.fileUrl ? "alt" : "btn"}
            >
              {r.fileUrl ? "או את כל הדף כקובץ Markdown" : "↓ הורדת המדריך כקובץ"}
            </a>
          </div>
        )}

        {r.coverUrl && <img className="cover" src={r.coverUrl} alt={r.coverAlt} />}

        {r.kind === "paid" && (
          <div className="buy">
            <div>
              <span className="pr">{formatPrice(r.priceIls)}</span>
              <small>התשלום והמשלוח של הקבצים מתבצעים בעמוד תשלום מאובטח.</small>
            </div>
            {canBuy ? (
              <a href={r.checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn solid">
                לרכישה
              </a>
            ) : (
              <span className="btn" aria-disabled>
                הרכישה תיפתח בקרוב
              </span>
            )}
          </div>
        )}

        </div>
        {steps.length > 1 && <GuideToc items={steps} />}

        <div className="body">
          {r.kind === "paid" && r.blocks.length > 0 && <p className="m pv">PREVIEW</p>}
          <BlockList blocks={r.blocks} steps />
        </div>
      </article>

      {offer && (
        <aside className="offer" style={paletteVars(offer.palette)} aria-labelledby="offer-h">
          <span className="m">{offer.offer.eyebrow}</span>
          <h3 id="offer-h">{offer.offer.title}</h3>
          <p>{offer.offer.text}</p>
          {offer.list === "learn" ? (
            <Link className="btn" href={offer.path} style={{ justifySelf: "start", background: "var(--accent)", color: "var(--accentInk)", borderColor: "var(--accent)" }}>
              {offer.offer.button} ←
            </Link>
          ) : (
            <>
              <WaitlistForm list={offer.list} consent={consentFor(offer)} button="להירשם לרשימה" inline />
              <Link className="alt" href={offer.path}>
                מה ידוע על הקורס ←
              </Link>
            </>
          )}
        </aside>
      )}

      <div className="gd-more">
        <span>זה רק מדריך אחד. באתר יש עוד, הכל חינם.</span>
        <Link href="/resources">לכל המדריכים ←</Link>
      </div>
      {settings.telegramUrl && (
        <div className="gd-more" style={{ borderTop: 0, paddingTop: 12 }}>
          <span>רוצה לקבל את המדריך הבא ראשון?</span>
          <a href={settings.telegramUrl} target="_blank" rel="noopener noreferrer" data-track="community_click">
            {settings.home.communityTitle || "קהילה בוואטסאפ"} ←
          </a>
        </div>
      )}

      {!r.unlisted && related.length > 0 && (
        <section className="related" aria-labelledby="rel-h">
          <h2 className="F" id="rel-h">
            עוד מדריכים
          </h2>
          <div className="rows">
            {related.map((x, i) => (
              <GuideRow key={x.id} r={x} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

