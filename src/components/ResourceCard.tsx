import Link from "next/link";
import type { ResourceSummary } from "@/lib/data";
import { Cover } from "./Cover";

export function formatPrice(price: number | null) {
  if (price == null) return "";
  return `₪${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

export function ResourceCard({ r, categoryLabel }: { r: ResourceSummary; categoryLabel?: string }) {
  return (
    <Link
      href={`/resources/${r.slug}`}
      data-track="resource_card_click"
      data-track-slug={r.slug}
      className="card group flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] hover:border-forest hover:shadow-[0_6px_24px_-12px_rgb(18_51_42/0.35)] focus-visible:border-forest"
    >
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3] border-b border-line">
        <Cover r={r} categoryLabel={categoryLabel} className="transition-transform duration-300 group-hover:scale-[1.02]" />
        <span
          className={`absolute bottom-3 start-3 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold ${
            r.kind === "paid" ? "bg-ink text-lime" : "bg-surface text-ink"
          }`}
        >
          {r.kind === "paid" ? formatPrice(r.priceIls) || "בתשלום" : "חינם"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 text-[13px]">
          {categoryLabel && <span className="font-extrabold text-forest">{categoryLabel}</span>}
          {/* The generated cover already shows the post code. */}
          {r.label && r.coverUrl && <span className="ltr font-mono text-[11.5px] text-muted">{r.label}</span>}
        </div>
        <h3 className="text-[20px] leading-snug font-extrabold text-balance">{r.title}</h3>
        {r.description && <p className="line-clamp-3 text-[15px] leading-relaxed text-muted">{r.description}</p>}
        <span className="mt-auto pt-2 text-[14px] font-bold text-forest group-hover:underline">
          לפתוח את המשאב <span aria-hidden>←</span>
        </span>
      </div>
    </Link>
  );
}
