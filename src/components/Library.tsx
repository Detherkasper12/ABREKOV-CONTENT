"use client";

import { useMemo, useState } from "react";
import type { ResourceSummary } from "@/lib/data";
import { guidePalette, rowColors } from "@/lib/palette";
import { GuideRow } from "./GuideRow";

type Category = { slug: string; label: string };

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[֑-ׇ]/g, "");
}

// The guide list on /resources: topic chips in each topic's colour, and a search field.
export function Library({ resources, categories, initialCategory }: { resources: ResourceSummary[]; categories: Category[]; initialCategory: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories.some((c) => c.slug === initialCategory) ? initialCategory : "");
  const labels = useMemo(() => new Map(categories.map((c) => [c.slug, c.label])), [categories]);
  // Only categories that have guides get a chip, so no chip leads to an empty list.
  const used = categories.filter((c) => resources.some((r) => r.category === c.slug));

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return resources.filter((r) => {
      if (category && r.category !== category) return false;
      if (!q) return true;
      const hay = normalize([r.title, r.description, r.label, r.keyword, labels.get(r.category) ?? "", ...r.tags].join(" "));
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [resources, query, category, labels]);

  function pick(slug: string) {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <div className="filters">
        {used.length > 1 ? (
          <div className="chips" role="group" aria-label="סינון לפי נושא">
            <label className="chip">
              <input type="radio" name="cat" checked={!category} onChange={() => pick("")} />
              <span>הכל</span>
            </label>
            {used.map((c) => {
              const col = rowColors(guidePalette("", c.slug)) as Record<string, string>;
              return (
                <label className="chip" key={c.slug} style={{ "--c": col["--a"], "--ci": col["--ai"] } as React.CSSProperties}>
                  <input type="radio" name="cat" checked={category === c.slug} onChange={() => pick(c.slug)} />
                  <span>
                    <i />
                    {c.label}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        <label className="search">
          <span className="m">SEARCH</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חיפוש מדריך" aria-label="חיפוש מדריך" />
        </label>
      </div>
      {results.length > 0 ? (
        <div className="rows">
          {results.map((r) => (
            <GuideRow key={r.id} r={r} index={resources.indexOf(r)} tag={labels.get(r.category)} />
          ))}
        </div>
      ) : (
        <p className="empty" role="status">
          אין מדריך כזה עדיין. אולי בסרטון הבא.
        </p>
      )}
    </>
  );
}
