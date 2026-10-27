"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/settings-schema";
import { saveSettings } from "../../actions";

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

export function SettingsForm({ initial, emailReady }: { initial: SiteSettings; emailReady: boolean }) {
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

      <Group title="דף הבית">
        <F label="כותרת ראשית">{text("heroTitle")}</F>
        <F label="פתיח">{text("heroText", { area: true })}</F>
      </Group>

      <Group title="עליי ויצירת קשר">
        <F label="שם">{text("aboutName", { ltr: true })}</F>
        <F label="טקסט קצר עליי">{text("aboutText", { area: true })}</F>
        <F label="Instagram" hint="בלי @">{text("instagramHandle", { ltr: true })}</F>
        <F label="קישור לפורטפוליו" hint="ריק = לא מוצג">{text("portfolioUrl", { ltr: true, placeholder: "https://" })}</F>
        <F label="אימייל ליצירת קשר" hint="ריק = כפתור שיתוף פעולה מוביל ל־Instagram">
          {text("contactEmail", { ltr: true, placeholder: "you@domain.com" })}
        </F>
        <F label="כותרת שיתוף פעולה">{text("collabTitle")}</F>
        <F label="טקסט שיתוף פעולה">{text("collabText", { area: true })}</F>
        <F label="טקסט הכפתור">{text("collabButton")}</F>
        <F label="כותרת בסוף דף משאב" hint="ריק = הבלוק לא מוצג">{text("resourceCtaTitle")}</F>
        <F label="טקסט בסוף דף משאב">{text("resourceCtaText", { area: true })}</F>
        <F label="כפתור בסוף דף משאב">{text("resourceCtaButton")}</F>
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

      <Group title="רשימת תפוצה">
        {!emailReady && (
          <p className="rounded-lg bg-[#fff7e8] p-3 text-[14px]">
            שליחת מיילים עוד לא מוגדרת (חסרים RESEND_API_KEY ו־NEWSLETTER_FROM_EMAIL). עד אז הטופס לא יוצג באתר גם אם הוא מופעל.
          </p>
        )}
        <label className="flex items-center gap-2 font-bold">
          <input type="checkbox" checked={s.newsletterEnabled} onChange={(e) => set({ newsletterEnabled: e.target.checked })} className="size-4 accent-[#12332A]" />
          הצג טופס הרשמה בדף הבית
        </label>
        <F label="כותרת">{text("newsletterTitle")}</F>
        <F label="טקסט">{text("newsletterText", { area: true })}</F>
      </Group>
    </div>
  );
}
