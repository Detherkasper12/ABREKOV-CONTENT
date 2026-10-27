"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { ResourceSummary } from "@/lib/data";
import { formatPrice } from "@/components/ResourceCard";
import { deleteResource, duplicateResource, setStatus, toggleFeatured } from "../actions";

const STATUS_LABEL = { draft: "טיוטה", published: "פורסם", archived: "בארכיון" } as const;
const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function ResourceTable({ resources, categories }: { resources: ResourceSummary[]; categories: { slug: string; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState<"active" | "draft" | "published" | "archived">("active");
  const [error, setError] = useState("");
  const labels = new Map(categories.map((c) => [c.slug, c.label]));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (status === "active" ? r.status === "archived" : r.status !== status) return false;
      return !q || `${r.title} ${r.slug} ${r.label} ${r.keyword}`.toLowerCase().includes(q);
    });
  }, [resources, query, status]);

  function run(fn: () => Promise<{ ok: boolean; error?: string } | void>) {
    setError("");
    start(async () => {
      const res = await fn();
      if (res && !res.ok) setError(res.error ?? "שגיאה");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם, כתובת או מילת מפתח"
          className="field max-w-[360px]"
        />
        <select value={status} onChange={(e) => setStatusFilter(e.target.value as typeof status)} className="field w-auto">
          <option value="active">טיוטות ופורסמו</option>
          <option value="published">פורסמו</option>
          <option value="draft">טיוטות</option>
          <option value="archived">ארכיון</option>
        </select>
      </div>
      {error && (
        <p role="alert" className="card border-danger p-3 font-bold text-danger">
          {error}
        </p>
      )}
      <div className={`card divide-y divide-line ${pending ? "opacity-70" : ""}`}>
        {rows.length === 0 && <p className="p-6 text-muted">אין משאבים בתצוגה הזאת.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
            <div className="grid min-w-[220px] flex-1 gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/resources/${r.id}`} className="text-[17px] font-extrabold hover:underline">
                  {r.title}
                </Link>
                <span className={`status status-${r.status}`}>{STATUS_LABEL[r.status]}</span>
                {r.kind === "paid" && <span className="status bg-ink text-lime">{formatPrice(r.priceIls) || "בתשלום"}</span>}
              </div>
              <div className="flex flex-wrap gap-x-3 text-[13px] text-muted">
                <span className="ltr font-mono">/resources/{r.slug}</span>
                {labels.get(r.category) && <span>{labels.get(r.category)}</span>}
                {r.keyword && <span>מילת תגובה: {r.keyword}</span>}
                <span>עודכן {dateFmt.format(new Date(r.updatedAt))}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className={`icon-btn ${r.featured ? "text-ink" : ""}`}
                title={r.featured ? "הסר ממומלצים" : "הוסף למומלצים"}
                aria-label={r.featured ? "הסר ממומלצים" : "הוסף למומלצים"}
                aria-pressed={r.featured}
                onClick={() => run(() => toggleFeatured(r.id))}
              >
                {r.featured ? "★" : "☆"}
              </button>
              <Link href={`/admin/resources/${r.id}`} className="btn inline-flex items-center">
                עריכה
              </Link>
              {r.status === "published" ? (
                <>
                  <a href={`/resources/${r.slug}`} target="_blank" className="btn inline-flex items-center">
                    צפייה ↗
                  </a>
                  <button type="button" className="btn" onClick={() => run(() => setStatus(r.id, "draft"))}>
                    הסתר
                  </button>
                </>
              ) : (
                <button type="button" className="btn" onClick={() => run(() => setStatus(r.id, "published"))}>
                  פרסם
                </button>
              )}
              <button type="button" className="btn" onClick={() => run(() => duplicateResource(r.id))}>
                שכפל
              </button>
              {r.status === "archived" ? (
                <>
                  <button type="button" className="btn" onClick={() => run(() => setStatus(r.id, "draft"))}>
                    שחזר
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      if (confirm(`למחוק לצמיתות את "${r.title}"? אי אפשר לבטל.`)) run(() => deleteResource(r.id));
                    }}
                  >
                    מחק
                  </button>
                </>
              ) : (
                <button type="button" className="btn" onClick={() => run(() => setStatus(r.id, "archived"))}>
                  לארכיון
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
