/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ResourceSummary } from "@/lib/data";

export function formatPrice(price: number | null) {
  if (price == null) return "";
  return `₪${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

export function ResourceCard({ r, categoryLabel }: { r: ResourceSummary; categoryLabel?: string }) {
  return (
    <Link
      href={`/resources/${r.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition-[border-color,transform] hover:-translate-y-0.5 hover:border-forest"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-forest">
        {r.coverUrl ? (
          <img src={r.coverUrl} alt={r.coverAlt} loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-end p-4">
            <span className="font-display text-[54px] leading-[0.85] text-lime">{r.title}</span>
          </div>
        )}
        <span
          className={`absolute top-3 start-3 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold ${
            r.kind === "paid" ? "bg-ink text-lime" : "bg-lime text-ink"
          }`}
        >
          {r.kind === "paid" ? formatPrice(r.priceIls) || "בתשלום" : "חינם"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          {categoryLabel && <span className="text-[13px] font-extrabold text-forest">{categoryLabel}</span>}
          {r.label && <span className="ltr font-mono text-[11.5px] text-muted">{r.label}</span>}
        </div>
        <h3 className="text-[19px] leading-snug font-extrabold text-balance">{r.title}</h3>
        {r.description && <p className="line-clamp-3 text-[15px] text-muted">{r.description}</p>}
      </div>
    </Link>
  );
}
