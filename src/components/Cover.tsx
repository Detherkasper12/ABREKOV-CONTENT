/* eslint-disable @next/next/no-img-element */
import type { ResourceSummary } from "@/lib/data";

// Generated covers follow the post's content system (the first word of the label,
// e.g. "DROP / 001"), so every resource gets an on-brand cover without manual design.
const THEMES = {
  DROP: { bg: "bg-lime", fg: "text-forest", sub: "text-forest/70", pattern: "dots-forest" },
  LAB: { bg: "bg-forest", fg: "text-lime", sub: "text-[#e4e7e4]/70", pattern: "grid-lime" },
  EXPLAIN: { bg: "bg-mint", fg: "text-forest", sub: "text-forest/70", pattern: "grid-forest" },
  SHOWCASE: { bg: "bg-ink", fg: "text-lime", sub: "text-[#e4e7e4]/70", pattern: "dots-lime" },
} as const;
type ThemeKey = keyof typeof THEMES;

function themeFor(r: Pick<ResourceSummary, "label" | "slug">): ThemeKey {
  const system = r.label.trim().split(/[\s/]+/)[0]?.toUpperCase();
  if (system && system in THEMES) return system as ThemeKey;
  const keys = Object.keys(THEMES) as ThemeKey[];
  let h = 0;
  for (const ch of r.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return keys[h % keys.length];
}

export function Cover({
  r,
  categoryLabel,
  className = "",
}: {
  r: Pick<ResourceSummary, "label" | "slug" | "coverUrl" | "coverAlt">;
  categoryLabel?: string;
  className?: string;
}) {
  if (r.coverUrl) {
    return <img src={r.coverUrl} alt={r.coverAlt} loading="lazy" decoding="async" className={`size-full object-cover ${className}`} />;
  }
  const key = themeFor(r);
  const t = THEMES[key];
  const system = r.label.trim().split(/[\s/]+/)[0]?.toUpperCase() || key;
  const number = r.label.match(/\d+/)?.[0];
  return (
    <div aria-hidden className={`cover-${t.pattern} relative flex size-full flex-col justify-between p-4 sm:p-5 ${t.bg} ${className}`}>
      <div className={`flex items-center justify-between gap-2 ${t.sub}`}>
        <span className="ltr font-mono text-[12px] font-semibold tracking-[0.12em]">{system}</span>
        {categoryLabel && <span className="text-[13px] font-extrabold">{categoryLabel}</span>}
      </div>
      <span className={`ltr self-end font-display leading-[0.8] ${t.fg} ${number ? "text-[clamp(96px,22vw,132px)]" : "text-[64px]"}`}>
        {number ?? categoryLabel ?? "A"}
      </span>
    </div>
  );
}
