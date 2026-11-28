"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/settings-schema";
import { saveSettings } from "../../actions";
import { HomeEditor } from "./HomeEditor";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card grid gap-3 p-5">
      <h2 className="text-[17px] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[13px] font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (patch: Partial<SiteSettings>) => setS((p) => ({ ...p, ...patch }));

  function save() {
    start(async () => {
      const res = await saveSettings(s);
      setMsg(res.ok ? { ok: true, text: "נשמר. האתר מעודכן." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
    });
  }

  const text = (key: keyof SiteSettings, opts: { ltr?: boolean; area?: boolean; placeholder?: string } = {}) => {
    const props = {
      value: s[key] as string,
      onChange: (e: { target: { value: string } }) => set({ [key]: e.target.value } as Partial<SiteSettings>),
      className: `field ${opts.ltr ? "text-start" : ""}`,
      dir: opts.ltr ? "ltr" : undefined,
      placeholder: opts.placeholder,
    };
    return opts.area ? <textarea rows={3} {...props} /> : <input {...props} />;
  };

  return (
    <div className="mx-auto grid max-w-[820px] gap-5 px-4 py-8 pb-24">
      <div className="sticky top-14 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b border-line bg-bg/95 px-4 py-3">
        <h1 className="me-auto text-[24px] font-extrabold">הגדרות האתר</h1>
        {msg && (
          <span role={msg.ok ? "status" : "alert"} className={`text-[14px] font-bold ${msg.ok ? "text-forest" : "text-danger"}`}>
            {msg.text}
          </span>
        )}
        <button className="btn-primary" onClick={save} disabled={pending}>
          {pending ? "שומר…" : "שמירה"}
        </button>
      </div>

      <HomeEditor home={s.home} onChange={(home) => set({ home })} />

      <Group title="עליי ויצירת קשר">
        <F label="שם" hint="טקסט חלופי לתמונה ושם בקרדיטים">{text("aboutName", { ltr: true })}</F>
        <F label="Instagram" hint="בלי @">{text("instagramHandle", { ltr: true })}</F>
        <F label="קישור לפורטפוליו" hint="ריק = לא מוצג. מופיע בתחתית האתר">{text("portfolioUrl", { ltr: true, placeholder: "https://" })}</F>
        <F label="אימייל ליצירת קשר" hint="ריק = לא מוצג. מופיע בתחתית האתר">
          {text("contactEmail", { ltr: true, placeholder: "you@domain.com" })}
        </F>
      </Group>

      <Group title="קהילה בוואטסאפ">
        <F label="קישור לקבוצת וואטסאפ" hint="ריק = הקהילה לא מוצגת בשום מקום. למשל https://chat.whatsapp.com/…">{text("telegramUrl", { ltr: true, placeholder: "https://chat.whatsapp.com/" })}</F>
        <p className="text-[13px] text-muted">הכותרת והטקסט של הקהילה נערכים למעלה, ב&quot;דף הבית: הסקציות למטה&quot;.</p>
      </Group>

      <Group title="קישורים נוספים">
        {s.socials.map((l, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <input
              value={l.label}
              onChange={(e) => set({ socials: s.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              placeholder="שם, למשל Behance"
              className="field w-40"
            />
            <input
              value={l.url}
              onChange={(e) => set({ socials: s.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
              placeholder="https://"
              dir="ltr"
              className="field flex-1 text-start"
            />
            <button type="button" className="icon-btn" aria-label="הסר קישור" onClick={() => set({ socials: s.socials.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn justify-self-start" onClick={() => set({ socials: [...s.socials, { label: "", url: "" }] })}>
          + קישור
        </button>
      </Group>

      <Group title="קטגוריות">
        <p className="text-[13px] text-muted">מזהה באנגלית מופיע בכתובת (?category=ai). שינוי מזהה מנתק משאבים שכבר משויכים אליו.</p>
        {s.categories.map((c, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              value={c.label}
              onChange={(e) => set({ categories: s.categories.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              placeholder="שם"
              className="field w-44"
            />
            <input
              value={c.slug}
              onChange={(e) => set({ categories: s.categories.map((x, j) => (j === i ? { ...x, slug: e.target.value.toLowerCase() } : x)) })}
              placeholder="id"
              dir="ltr"
              className="field w-36 text-start font-mono text-[14px]"
            />
            <button
              type="button"
              className="icon-btn"
              disabled={i === 0}
              aria-label="הזז למעלה"
              onClick={() => {
                const next = [...s.categories];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                set({ categories: next });
              }}
            >
              ↑
            </button>
            <button type="button" className="icon-btn" aria-label="הסר קטגוריה" onClick={() => set({ categories: s.categories.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn justify-self-start" onClick={() => set({ categories: [...s.categories, { slug: "", label: "" }] })}>
          + קטגוריה
        </button>
      </Group>

    </div>
  );
}
