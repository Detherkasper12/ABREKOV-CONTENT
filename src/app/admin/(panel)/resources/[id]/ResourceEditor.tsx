/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { BLOCK_TYPES, emptyBlock, newBlockId, type Block, type BlockType } from "@/lib/blocks";
import type { ResourceStatus } from "@/lib/data";
import { markdownToResource } from "@/lib/markdown";
import { publishProblems, type ResourceInput } from "@/lib/resource-schema";
import { deleteResource, duplicateResource, saveResource, setStatus } from "../../../actions";
import { BlockFields } from "./BlockEditors";
import { UploadButton } from "./Upload";

const STATUS_LABEL: Record<ResourceStatus, string> = { draft: "טיוטה", published: "פורסם", archived: "בארכיון" };
const TYPE_LABEL = Object.fromEntries(BLOCK_TYPES.map((t) => [t.type, t.label])) as Record<BlockType, string>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card grid gap-3 p-4">
      <h2 className="text-[15px] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Labeled({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[13px] font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
    </label>
  );
}

function AddBlockMenu({ onAdd, compact }: { onAdd: (t: BlockType) => void; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  if (!open) {
    return (
      <div className="group relative flex h-6 items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative rounded-full border border-line bg-surface px-2.5 text-[12px] font-bold text-muted opacity-60 hover:opacity-100 focus:opacity-100"
          aria-label="הוסף בלוק כאן"
        >
          + בלוק
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-dashed border-line p-2">
      <span className="px-1 text-[13px] font-bold text-muted">הוסף:</span>
      {BLOCK_TYPES.map((t) => (
        <button
          key={t.type}
          type="button"
          className="btn min-h-8"
          onClick={() => {
            onAdd(t.type);
            if (compact) setOpen(false);
          }}
        >
          {t.label}
        </button>
      ))}
      {compact && (
        <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="סגור">
          ✕
        </button>
      )}
    </div>
  );
}

export function ResourceEditor({
  initial,
  status: initialStatus,
  categories,
}: {
  initial: ResourceInput;
  status: ResourceStatus;
  categories: { slug: string; label: string }[];
}) {
  const router = useRouter();
  const [r, setR] = useState<ResourceInput>(initial);
  const [status, setStatusState] = useState(initialStatus);
  const [savedSlug, setSavedSlug] = useState(initial.slug);
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const lastAdded = useRef<string | null>(null);

  const update = useCallback((patch: Partial<ResourceInput>) => {
    setR((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const setBlocks = useCallback((fn: (blocks: Block[]) => Block[]) => {
    setR((prev) => ({ ...prev, blocks: fn(prev.blocks) }));
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    const res = await saveResource(r);
    if (res.ok) {
      setDirty(false);
      setSavedSlug(res.slug ?? r.slug);
      setMessage({ kind: "ok", text: status === "published" ? "נשמר. הדף החי עודכן." : "נשמר כטיוטה." });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: res.error });
    }
    return res.ok;
  }, [r, status, router]);

  const runSave = useCallback(() => start(async () => void (await save())), [save]);

  // Ctrl/Cmd+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        runSave();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, runSave]);

  useEffect(() => {
    if (!lastAdded.current) return;
    const el = document.querySelector<HTMLElement>(`[data-block="${lastAdded.current}"] input, [data-block="${lastAdded.current}"] textarea`);
    el?.focus();
    lastAdded.current = null;
  }, [r.blocks]);

  function changeStatus(next: ResourceStatus) {
    start(async () => {
      if (dirty && !(await save())) return;
      const res = await setStatus(r.id, next);
      if (res.ok) {
        setStatusState(next);
        setMessage({ kind: "ok", text: next === "published" ? "פורסם. הדף באוויר." : next === "draft" ? "הדף הוסתר מהאתר." : "הועבר לארכיון." });
        router.refresh();
      } else {
        setMessage({ kind: "error", text: res.error });
      }
    });
  }

  function preview() {
    // Open the tab synchronously (popup blockers), then point it at the preview after saving.
    const tab = window.open("about:blank", "_blank");
    start(async () => {
      const ok = !dirty || (await save());
      if (tab) {
        if (ok) tab.location.href = `/admin/resources/${r.id}/preview`;
        else tab.close();
      }
    });
  }

  function insertAt(index: number, type: BlockType) {
    const block = emptyBlock(type);
    lastAdded.current = block.id;
    setBlocks((b) => [...b.slice(0, index), block, ...b.slice(index)]);
  }

  function move(index: number, delta: number) {
    setBlocks((b) => {
      const to = index + delta;
      if (to < 0 || to >= b.length) return b;
      const next = [...b];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  const problems = publishProblems(r);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24">
      {/* Sticky action bar */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin" className="icon-btn" aria-label="חזרה לרשימה">
            →
          </Link>
          <span className={`status status-${status}`}>{STATUS_LABEL[status]}</span>
          <span className="text-[13px] text-muted" aria-live="polite">
            {pending ? "שומר…" : dirty ? "יש שינויים שלא נשמרו" : "הכול שמור"}
          </span>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <button type="button" className="btn" onClick={preview} disabled={pending}>
              תצוגה מקדימה
            </button>
            {status === "published" && (
              <a href={`/resources/${savedSlug}`} target="_blank" className="btn inline-flex items-center">
                לדף החי ↗
              </a>
            )}
            {status === "published" ? (
              <button type="button" className="btn" onClick={() => changeStatus("draft")} disabled={pending}>
                הסתר מהאתר
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => changeStatus("published")}
                disabled={pending || problems.length > 0}
                title={problems.join(" · ")}
              >
                פרסם
              </button>
            )}
            <button type="button" className="btn-primary" onClick={runSave} disabled={pending || !dirty}>
              שמירה
            </button>
          </div>
        </div>
        {message && (
          <p role={message.kind === "error" ? "alert" : "status"} className={`mt-2 text-[14px] font-bold ${message.kind === "error" ? "text-danger" : "text-forest"}`}>
            {message.text}
          </p>
        )}
        {status !== "published" && problems.length > 0 && (
          <p className="mt-1 text-[13px] text-muted">לפני פרסום: {problems.join(" · ")}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Content */}
        <div className="grid min-w-0 content-start gap-4">
          <input
            value={r.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="כותרת המשאב"
            aria-label="כותרת"
            className="w-full bg-transparent font-display text-[40px] leading-[0.95] sm:text-[56px] text-forest outline-none placeholder:text-line"
          />
          <textarea
            value={r.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="תיאור קצר: למי זה ומה מקבלים. מופיע בכרטיס ובגוגל."
            aria-label="תיאור"
            rows={3}
            className="field text-[17px]"
          />

          <div className="grid gap-1">
            <p className="eyebrow mt-2">{r.kind === "paid" ? "תוכן · תצוגה מקדימה ציבורית" : "תוכן"}</p>
            {r.blocks.length === 0 && <p className="text-[14px] text-muted">הדף ריק. תתחיל מבלוק טקסט או כותרת.</p>}
            {r.blocks.map((block, i) => (
              <div key={block.id} className="grid gap-1">
                {i > 0 && <AddBlockMenu compact onAdd={(t) => insertAt(i, t)} />}
                <div data-block={block.id} className="card grid gap-3 p-3 sm:p-4">
                  <div className="flex items-center gap-1">
                    <span className="me-auto font-mono text-[12px] text-muted">
                      {String(i + 1).padStart(2, "0")} · {TYPE_LABEL[block.type]}
                    </span>
                    <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזז למעלה" title="הזז למעלה">
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => move(i, 1)}
                      disabled={i === r.blocks.length - 1}
                      aria-label="הזז למטה"
                      title="הזז למטה"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setBlocks((b) => [...b.slice(0, i + 1), { ...b[i], id: newBlockId() }, ...b.slice(i + 1)])}
                      aria-label="שכפל בלוק"
                      title="שכפל"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      className="icon-btn hover:!text-danger"
                      onClick={() => setBlocks((b) => b.filter((x) => x.id !== block.id))}
                      aria-label="מחק בלוק"
                      title="מחק"
                    >
                      ✕
                    </button>
                  </div>
                  <BlockFields
                    block={block}
                    onChange={(patch) => setBlocks((b) => b.map((x) => (x.id === block.id ? ({ ...x, ...patch } as Block) : x)))}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2">
              <AddBlockMenu onAdd={(t) => insertAt(r.blocks.length, t)} />
            </div>
          </div>
        </div>

        {/* Settings sidebar */}
        <aside className="grid content-start gap-4">
          <Section title="כתובת וקטגוריה">
            <Labeled label="כתובת הדף" hint={<span className="ltr font-mono">/resources/{r.slug || "…"}</span>}>
              <input
                value={r.slug}
                onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                dir="ltr"
                className="field text-start font-mono text-[14px]"
                placeholder="claude-skills"
              />
            </Labeled>
            <Labeled label="קטגוריה">
              <select value={r.category} onChange={(e) => update({ category: e.target.value })} className="field">
                <option value="">ללא</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="תגיות" hint="מופרדות בפסיק">
              <input
                value={tagsText}
                onChange={(e) => {
                  setTagsText(e.target.value);
                  update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) });
                }}
                className="field"
                placeholder="claude, skills"
              />
            </Labeled>
            <label className="flex items-center gap-2 text-[15px] font-bold">
              <input type="checkbox" checked={r.featured} onChange={(e) => update({ featured: e.target.checked })} className="size-4 accent-[#12332A]" />
              מומלץ בדף הבית
            </label>
          </Section>

          <Section title="Instagram">
            <Labeled label="קוד הפוסט" hint="מוצג קטן מעל הכותרת">
              <input value={r.label} onChange={(e) => update({ label: e.target.value })} dir="ltr" className="field text-start font-mono text-[14px]" placeholder="DROP / 001" />
            </Labeled>
            <Labeled label="מילת תגובה" hint="המילה שכותבים בתגובות כדי לקבל את הקישור">
              <input value={r.keyword} onChange={(e) => update({ keyword: e.target.value })} className="field" placeholder="SKILLS" />
            </Labeled>
          </Section>

          <Section title="תמונת שער">
            {r.coverUrl && <img src={r.coverUrl} alt="" className="aspect-video w-full rounded-lg border border-line object-cover" />}
            <div className="flex flex-wrap gap-2">
              <UploadButton
                accept="image/png,image/jpeg,image/webp,image/avif"
                label={r.coverUrl ? "החלף תמונה" : "העלאת תמונה"}
                onUploaded={(f) => update({ coverUrl: f.url })}
              />
              {r.coverUrl && (
                <button type="button" className="btn btn-danger" onClick={() => update({ coverUrl: "" })}>
                  הסר
                </button>
              )}
            </div>
            <Labeled label="טקסט חלופי">
              <input value={r.coverAlt} onChange={(e) => update({ coverAlt: e.target.value })} className="field" />
            </Labeled>
          </Section>

          <Section title="קובץ להורדה">
            {r.kind === "paid" ? (
              <p className="text-[14px] text-muted">למוצר בתשלום הקובץ נמסר בעמוד התשלום, לא מהאתר.</p>
            ) : (
              <>
                {r.fileUrl && (
                  <p className="ltr truncate text-start font-mono text-[13px]">
                    {r.fileName || r.fileUrl}
                    {r.fileSize > 0 && ` · ${Math.max(1, Math.round(r.fileSize / 1024))} KB`}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <UploadButton
                    label={r.fileUrl ? "החלף קובץ" : "העלאת קובץ"}
                    onUploaded={(f) => update({ fileUrl: f.url, fileName: f.fileName, fileSize: f.size })}
                  />
                  {r.fileUrl && (
                    <button type="button" className="btn btn-danger" onClick={() => update({ fileUrl: "", fileName: "", fileSize: 0 })}>
                      הסר
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-muted">מופיע בראש הדף ככפתור הורדה. בלי קובץ, הדף עצמו יורד כקובץ Markdown.</p>
              </>
            )}
          </Section>

          <Section title="ייבוא מקובץ">
            <label className="btn cursor-pointer justify-self-start">
              ייבוא מ־Markdown
              <input
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const imported = markdownToResource(await file.text());
                  // An empty resource takes its title and description from the file; otherwise they stay.
                  const fresh = r.blocks.length === 0;
                  update({
                    title: fresh || !r.title.trim() ? imported.title || file.name.replace(/\.\w+$/, "") : r.title,
                    description: fresh || !r.description.trim() ? imported.description || r.description : r.description,
                    blocks: [...r.blocks, ...imported.blocks],
                  });
                }}
              />
            </label>
            <p className="text-[13px] text-muted">במשאב ריק הקובץ ממלא גם כותרת ותיאור. אחרת הבלוקים נוספים בסוף. כותרות, טקסט, קוד ופרומפטים מזוהים לבד.</p>
          </Section>

          <Section title="חינם או בתשלום">
            <div className="flex gap-2" role="radiogroup" aria-label="סוג">
              {(["free", "paid"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={r.kind === k}
                  onClick={() => update({ kind: k })}
                  className={`flex-1 rounded-full border px-3 py-1.5 text-[14px] font-bold ${r.kind === k ? "border-forest bg-forest text-lime" : "border-line"}`}
                >
                  {k === "free" ? "חינם" : "בתשלום"}
                </button>
              ))}
            </div>
            {r.kind === "paid" && (
              <>
                <Labeled label="מחיר (₪)">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    inputMode="decimal"
                    value={r.priceIls ?? ""}
                    onChange={(e) => update({ priceIls: e.target.value === "" ? null : Number(e.target.value) })}
                    dir="ltr"
                    className="field text-start"
                  />
                </Labeled>
                <Labeled
                  label="קישור לעמוד התשלום"
                  hint="קישור Checkout מ־Lemon Squeezy או ספק אחר. בלי קישור, המוצר נשאר טיוטה ולא מוצג כפתור רכישה."
                >
                  <input
                    value={r.checkoutUrl}
                    onChange={(e) => update({ checkoutUrl: e.target.value })}
                    dir="ltr"
                    placeholder="https://….lemonsqueezy.com/buy/…"
                    className="field text-start"
                  />
                </Labeled>
                <p className="text-[12.5px] text-muted">הקבצים של המוצר עולים רק לספק התשלום, לא לאתר. כל הבלוקים בדף הזה ציבוריים ומשמשים כתצוגה מקדימה.</p>
              </>
            )}
          </Section>

          <Section title="גוגל ושיתוף">
            <Labeled label="כותרת לגוגל" hint="ריק = כותרת המשאב">
              <input value={r.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} className="field" />
            </Labeled>
            <Labeled label="תיאור לגוגל" hint="ריק = התיאור הקצר">
              <textarea value={r.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} rows={2} className="field" />
            </Labeled>
          </Section>

          <Section title="פעולות">
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn" disabled={pending} onClick={() => start(async () => void (await duplicateResource(r.id)))}>
                שכפל
              </button>
              {status !== "archived" ? (
                <button type="button" className="btn" disabled={pending} onClick={() => changeStatus("archived")}>
                  העבר לארכיון
                </button>
              ) : (
                <button type="button" className="btn" disabled={pending} onClick={() => changeStatus("draft")}>
                  שחזר מהארכיון
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger"
                disabled={pending}
                onClick={() => {
                  if (!confirm(`למחוק לצמיתות את "${r.title}"? אי אפשר לבטל.`)) return;
                  start(async () => {
                    const res = await deleteResource(r.id);
                    if (res.ok) {
                      setDirty(false);
                      router.push("/admin");
                    } else setMessage({ kind: "error", text: res.error });
                  });
                }}
              >
                מחק
              </button>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
