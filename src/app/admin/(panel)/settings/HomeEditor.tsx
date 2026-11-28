"use client";

import { useState, type ReactNode } from "react";
import { PALETTES, SCENE_TEMPLATES, type HomeContent, type PaletteKey, type Scene, type SceneTemplate } from "@/lib/home-schema";
import { UploadButton } from "../resources/[id]/Upload";

// Editor for the home page story: the bad prompt, the chat reply, one scene per answer, the good prompt,
// and the sections under it. Every word on the home page lives here, so nothing needs code to change.

function F({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[13px] font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
    </label>
  );
}

// What each field means in each template, so the same fields read naturally for every kind of scene.
const FIELD_HELP: Record<SceneTemplate, { title: string; big: string; items: string; itemsHint: string }> = {
  fintech: {
    title: "כותרת קטנה (אפשר שתי שורות)",
    big: "המספר הגדול שמתגלגל, למשל ₪12,480",
    items: "כרטיסים שעפים פנימה",
    itemsHint: "שורה לכל כרטיס, עד 3. כרטיס עם ערך: \"כותרת | ערך | שורה קטנה\". השורה השנייה היא כרטיס עם מתג.",
  },
  timeline: {
    title: "כותרת (לא מוצגת בתבנית הזאת)",
    big: "אורך הסרטון לטיימקוד, למשל 00:01:00",
    items: "הכתובית שרצה מתחת לסרט",
    itemsHint: "משפט אחד. כל מילה הופכת לכתובית נפרדת.",
  },
  bento: {
    title: "הכותרת במשבצת הגדולה",
    big: "המספר במשבצת הסגולה, למשל 1,284",
    items: "שורות ברשימה השחורה",
    itemsHint: "שורה לכל פריט, עד 4: \"שם | מספר\".",
  },
  agent: {
    title: "כותרת (השורה האחרונה בצבע הבולט)",
    big: "המילה בתוך הליבה הזוהרת",
    items: "המשימות של הסוכן",
    itemsHint: "משימה בכל שורה, עד 5. כל משימה נדלקת בתורה.",
  },
};

const blankScene = (n: number): Scene => ({
  id: `scene-${n}`,
  enabled: true,
  template: "fintech",
  palette: "blue",
  name: "תשובה חדשה",
  prompt: "תעשה לי…",
  title: "",
  big: "",
  value: "",
  ctaLabel: "",
  ctaHref: "",
  items: "",
  images: "",
});

function Swatch({ k }: { k: PaletteKey }) {
  const p = PALETTES[k];
  return (
    <span className="inline-flex overflow-hidden rounded-full border border-line" aria-hidden>
      <i className="block size-4" style={{ background: p.bg }} />
      <i className="block size-4" style={{ background: p.fg }} />
      <i className="block size-4" style={{ background: p.accent }} />
    </span>
  );
}

function SceneCard({
  s,
  i,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  s: Scene;
  i: number;
  count: number;
  onChange: (patch: Partial<Scene>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const help = FIELD_HELP[s.template];
  const input = (key: keyof Scene, opts: { area?: boolean; ltr?: boolean; rows?: number; placeholder?: string } = {}) => {
    const props = {
      value: s[key] as string,
      onChange: (e: { target: { value: string } }) => onChange({ [key]: e.target.value } as Partial<Scene>),
      className: `field ${opts.ltr ? "text-start" : ""}`,
      dir: opts.ltr ? "ltr" : undefined,
      placeholder: opts.placeholder,
    };
    return opts.area ? <textarea rows={opts.rows ?? 3} {...props} /> : <input {...props} />;
  };
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <span className="size-4 rounded-full border border-line" style={{ background: PALETTES[s.palette].dot }} aria-hidden />
        <button type="button" className="me-auto text-start font-extrabold" onClick={() => setOpen(!open)} aria-expanded={open}>
          {i + 1}. {s.name || "בלי שם"} <span className="font-normal text-muted">· {SCENE_TEMPLATES[s.template].label} · {s.prompt}</span>
        </button>
        <label className="flex items-center gap-1.5 text-[14px] font-bold">
          <input type="checkbox" checked={s.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} className="size-4 accent-[#12332A]" />
          מוצג
        </label>
        <button type="button" className="icon-btn" disabled={i === 0} aria-label="הזז למעלה" onClick={() => onMove(-1)}>
          ↑
        </button>
        <button type="button" className="icon-btn" disabled={i === count - 1} aria-label="הזז למטה" onClick={() => onMove(1)}>
          ↓
        </button>
        <button type="button" className="btn" onClick={() => setOpen(!open)}>
          {open ? "סגירה" : "עריכה"}
        </button>
      </div>
      {open && (
        <div className="grid gap-3 border-t border-line p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="תבנית" hint={SCENE_TEMPLATES[s.template].hint}>
              <select value={s.template} onChange={(e) => onChange({ template: e.target.value as SceneTemplate })} className="field">
                {(Object.keys(SCENE_TEMPLATES) as SceneTemplate[]).map((k) => (
                  <option key={k} value={k}>
                    {SCENE_TEMPLATES[k].label}
                  </option>
                ))}
              </select>
            </F>
            <F label="צבעים" hint={<Swatch k={s.palette} />}>
              <select value={s.palette} onChange={(e) => onChange({ palette: e.target.value as PaletteKey })} className="field">
                {(Object.keys(PALETTES) as PaletteKey[]).map((k) => (
                  <option key={k} value={k}>
                    {PALETTES[k].label}
                  </option>
                ))}
              </select>
            </F>
            <F label="שם בכרטיס התשובה בצ'אט">{input("name")}</F>
            <F label="הפרומפט בראש הסצנה">{input("prompt")}</F>
            <F label={help.title}>{input("title", { area: true, rows: 2 })}</F>
            <F label={help.big}>{input("big")}</F>
          </div>
          <F label="הערך (THE VALUE)" hint="משפט אחד: מה אתה מקבל מהמדריכים בנושא הזה">
            {input("value", { area: true, rows: 2 })}
          </F>
          <F label={help.items} hint={help.itemsHint}>
            {input("items", { area: true, rows: 4 })}
          </F>
          {s.template === "timeline" && (
            <F label="תמונות לסרט" hint="שורה לכל תמונה (כתובת). כדאי 10 עד 14 תמונות אנכיות מהסרטון.">
              {input("images", { area: true, rows: 5, ltr: true })}
              <UploadButton
                accept="image/png,image/jpeg,image/webp,image/avif"
                label="+ העלאת תמונה"
                onUploaded={(f) => onChange({ images: [s.images.trim(), f.url].filter(Boolean).join("\n") })}
              />
            </F>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="טקסט הכפתור / הקישור" hint="ריק = בלי כפתור">
              {input("ctaLabel")}
            </F>
            <F label="לאן הוא מוביל" hint="למשל /agents או /resources/claude-video-editing">
              {input("ctaHref", { ltr: true, placeholder: "/resources/…" })}
            </F>
            <F label="מזהה הסצנה" hint="אותיות לטיניות קטנות, ספרות ומקף. מופיע בכתובת (#s-app)">
              {input("id", { ltr: true })}
            </F>
          </div>
          <button type="button" className="btn justify-self-start text-danger" onClick={onRemove}>
            מחיקת הסצנה
          </button>
        </div>
      )}
    </div>
  );
}

export function HomeEditor({ home, onChange }: { home: HomeContent; onChange: (h: HomeContent) => void }) {
  const set = (patch: Partial<HomeContent>) => onChange({ ...home, ...patch });
  const text = (key: keyof HomeContent, opts: { area?: boolean; rows?: number } = {}) => {
    const props = {
      value: home[key] as string,
      onChange: (e: { target: { value: string } }) => set({ [key]: e.target.value } as Partial<HomeContent>),
      className: "field",
    };
    return opts.area ? <textarea rows={opts.rows ?? 3} {...props} /> : <input {...props} />;
  };
  const scenes = home.scenes;
  const setScene = (i: number, patch: Partial<Scene>) => set({ scenes: scenes.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const move = (i: number, d: -1 | 1) => {
    const next = [...scenes];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set({ scenes: next });
  };

  return (
    <>
      <section className="card grid gap-3 p-5">
        <h2 className="text-[17px] font-extrabold">דף הבית: הפתיח</h2>
        <p className="text-[13px] text-muted">הפרומפט הגרוע שמחליקים כדי לשלוח, ותשובת ה־AI בצ&apos;אט.</p>
        <F label="הפרומפט הגרוע">{text("prompt")}</F>
        <F label="פתיח מתחת לפרומפט" hint="המשפט הראשון הוא הכותרת של הדף (מודגש)">
          {text("lead", { area: true })}
        </F>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="רמז להחלקה">{text("hint")}</F>
          <F label="כפתור דילוג למדריכים">{text("skipLabel")}</F>
        </div>
        <F label="תשובת ה־AI">{text("aiReply", { area: true, rows: 2 })}</F>
        <F label="שורה אפורה אחרי התשובה" hint="למשל: הכנתי ארבע תשובות">
          {text("aiNote")}
        </F>
      </section>

      <section className="card grid gap-3 p-5">
        <h2 className="text-[17px] font-extrabold">דף הבית: התשובות (סצנות)</h2>
        <p className="text-[13px] text-muted">
          כל תשובה היא סצנה עם צבע, קומפוזיציה ותנועה משלה. תבנית קובעת את הקומפוזיציה, צבעים קובעים את הצבעים. עד 8 סצנות. ארבע הראשונות מופיעות גם כחפיסת כרטיסים בפתיח.
        </p>
        {scenes.map((s, i) => (
          <SceneCard
            key={i}
            s={s}
            i={i}
            count={scenes.length}
            onChange={(p) => setScene(i, p)}
            onMove={(d) => move(i, d)}
            onRemove={() => {
              if (confirm(`למחוק את הסצנה "${s.name || s.title || i + 1}"? הטקסטים והתמונות שלה יימחקו מהדף אחרי השמירה.`))
                set({ scenes: scenes.filter((_, j) => j !== i) });
            }}
          />
        ))}
        {scenes.length < 8 && (
          <button type="button" className="btn justify-self-start" onClick={() => set({ scenes: [...scenes, blankScene(scenes.length + 1)] })}>
            + סצנה
          </button>
        )}
      </section>

      <section className="card grid gap-3 p-5">
        <h2 className="text-[17px] font-extrabold">דף הבית: הפרומפט הטוב</h2>
        <F label="הפרומפט הטוב שמוקלד בסוף">{text("finalePrompt", { area: true, rows: 4 })}</F>
        <F label="הכותרת אחריו" hint="שורה חדשה = שבירת שורה">
          {text("finaleTitle", { area: true, rows: 2 })}
        </F>
      </section>

      <section className="card grid gap-3 p-5">
        <h2 className="text-[17px] font-extrabold">דף הבית: הסקציות למטה</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="כותרת המדריכים" hint="גם בעמוד כל המדריכים">
            {text("libraryTitle")}
          </F>
          <F label="טקסט המדריכים">{text("libraryText", { area: true, rows: 2 })}</F>
          <F label="כותרת עליי">{text("aboutTitle")}</F>
          <F label="משפט עליי">{text("aboutLine")}</F>
        </div>
        <F label="שורות עליי" hint={'שורה לכל שורה: "LABEL | טקסט". שורת Instagram נוספת לבד.'}>
          {text("aboutRows", { area: true, rows: 3 })}
        </F>
        <F label="תמונה עליי" hint="כתובת התמונה, או העלאה">
          <input value={home.aboutPhoto} onChange={(e) => set({ aboutPhoto: e.target.value })} className="field text-start" dir="ltr" />
          <UploadButton accept="image/png,image/jpeg,image/webp,image/avif" label="העלאת תמונה" onUploaded={(f) => set({ aboutPhoto: f.url })} />
        </F>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="קורס: שורה קטנה למעלה">{text("courseEyebrow")}</F>
          <F label="קורס: כותרת">{text("courseTitle")}</F>
        </div>
        <F label="קורס: טקסט" hint="הטופס נשמר לרשימת ההמתנה של קורס הסוכנים">
          {text("courseText", { area: true })}
        </F>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="קהילה: כותרת" hint="מוצג רק אם יש קישור לוואטסאפ">
            {text("communityTitle")}
          </F>
          <F label="קהילה: טקסט">{text("communityText")}</F>
        </div>
      </section>
    </>
  );
}
