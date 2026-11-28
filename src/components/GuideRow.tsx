/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ResourceSummary } from "@/lib/data";
import { guidePalette, rowColors } from "@/lib/palette";

// One guide in a list: fills with the guide's colour on hover and shows its cover.
export function GuideRow({ r, index, tag, search }: { r: ResourceSummary; index: number; tag?: string; search?: boolean }) {
  const pal = guidePalette(r.accent, r.category, index);
  return (
    <Link
      className="row"
      href={`/resources/${r.slug}`}
      style={rowColors(pal)}
      data-cat={r.category}
      data-q={search ? `${r.title} ${r.description} ${r.tags.join(" ")} ${r.keyword}`.toLowerCase() : undefined}
    >
      <span className="ix m">{String(index + 1).padStart(2, "0")}</span>
      <span className="tt F">{r.title}</span>
      <span className="ds">{r.description}</span>
      {tag ? <span className="tag">{tag}</span> : <span />}
      <span className="go" aria-hidden>
        <span className="ltr">←</span>
      </span>
      {r.coverUrl && <img src={r.coverUrl} alt="" loading="lazy" decoding="async" />}
    </Link>
  );
}
