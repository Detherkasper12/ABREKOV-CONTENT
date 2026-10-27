"use client";

import { useMemo, useState } from "react";
import type { ResourceSummary } from "@/lib/data";
import { ResourceCard } from "./ResourceCard";

type Category = { slug: string; label: string };

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[֑-ׇ]/g, "");
}

export function Library({
  resources,
  categories,
  initialCategory,
}: {
  resources: ResourceSummary[];
  categories: Category[];
  initialCategory: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories.some((c) => c.slug === initialCategory) ? initialCategory : "");
  const [price, setPrice] = useState<"all" | "free" | "paid">("all");
  const labels = useMemo(() => new Map(categories.map((c) => [c.slug, c.label])), [categories]);
  // Only offer categories that actually have resources, so no chip leads to an empty grid.
  const used = categories.filter((c) => resources.some((r) => r.category === c.slug));
  const hasPaid = resources.some((r) => r.kind === "paid");
  // A search box over a handful of cards is noise; it appears once the library grows.
  const showSearch = resources.length >= 6;

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return resources.filter((r) => {
      if (category && r.category !== category) return false;
      if (price !== "all" && r.kind !== price) return false;
      if (!q) return true;
      const hay = normalize([r.title, r.description, r.label, r.keyword, labels.get(r.category) ?? "", ...r.tags].join(" "));
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [resources, query, category, price, labels]);

  function pickCategory(slug: string) {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }

  const chip = (active: boolean) =>
    `min-h-10 rounded-full border px-3.5 py-1.5 text-[14px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
      active ? "border-forest bg-forest text-lime" : "border-line bg-surface hover:border-forest"
    }`;

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        {showSearch && (
          <label className="relative block">
            <span className="sr-only">חיפוש משאבים</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש סקיל, פרומפט, כלי…"
              className="h-12 w-full rounded-full border border-line bg-surface px-5 text-[16px] outline-none placeholder:text-muted focus:border-forest focus-visible:ring-2 focus-visible:ring-lime"
            />
          </label>
        )}
        {(used.length > 1 || hasPaid) && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="סינון לפי קטגוריה">
          <button type="button" className={chip(!category)} aria-pressed={!category} onClick={() => pickCategory("")}>
            הכול
          </button>
          {used.map((c) => (
            <button key={c.slug} type="button" className={chip(category === c.slug)} aria-pressed={category === c.slug} onClick={() => pickCategory(c.slug)}>
              {c.label}
            </button>
          ))}
          {hasPaid && (
            <span className="ms-auto flex gap-2" role="group" aria-label="סינון לפי מחיר">
              {(["all", "free", "paid"] as const).map((p) => (
                <button key={p} type="button" className={chip(price === p)} aria-pressed={price === p} onClick={() => setPrice(p)}>
                  {p === "all" ? "הכול" : p === "free" ? "חינם" : "בתשלום"}
                </button>
              ))}
            </span>
          )}
        </div>
        )}
      </div>

      <p className="text-[14px] text-muted" aria-live="polite">
        {results.length === 1 ? "משאב אחד" : `${results.length} משאבים`}
      </p>

      {results.length > 0 ? (
        <div className={`grid gap-4 sm:grid-cols-2 ${results.length > 2 ? "lg:grid-cols-3" : ""}`}>
          {results.map((r) => (
            <ResourceCard key={r.id} r={r} categoryLabel={labels.get(r.category)} />
          ))}
        </div>
      ) : (
        <div className="card grid justify-items-start gap-3 p-6">
          <p className="font-extrabold">לא מצאתי משאב שמתאים לחיפוש.</p>
          <button
            type="button"
            className="rounded-full bg-forest px-4 py-2 text-[14px] font-bold text-lime"
            onClick={() => {
              setQuery("");
              pickCategory("");
              setPrice("all");
            }}
          >
            נקה סינון
          </button>
        </div>
      )}
    </div>
  );
}
