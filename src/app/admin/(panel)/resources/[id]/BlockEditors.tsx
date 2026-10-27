/* eslint-disable @next/next/no-img-element */
"use client";

import type { ReactNode } from "react";
import { videoEmbed, type Block, type BlockOf } from "@/lib/blocks";
import { UploadButton } from "./Upload";

type Props<T extends Block["type"]> = { block: BlockOf<T>; onChange: (patch: Partial<BlockOf<T>>) => void };

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[13px] font-bold text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
    </label>
  );
}

function autoRows(text: string, min = 3, max = 24) {
  return Math.min(max, Math.max(min, text.split("\n").length + 1));
}

export function HeadingEditor({ block, onChange }: Props<"heading">) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="כותרת"
        className={`field min-w-[220px] flex-1 font-extrabold ${block.level === 2 ? "text-[20px]" : "text-[17px]"}`}
        aria-label="טקסט הכותרת"
      />
      <select
        value={block.level}
        onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 })}
        className="field w-auto"
        aria-label="רמת כותרת"
      >
        <option value={2}>H2 · נכנס לתוכן העניינים</option>
        <option value={3}>H3 · תת־כותרת</option>
      </select>
    </div>
  );
}

export function TextEditor({ block, onChange }: Props<"text">) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="סגנון">
        {(
          [
            ["plain", "רגיל"],
            ["tip", "טיפ"],
            ["note", "שים לב"],
            ["warning", "זהירות"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={block.variant === v}
            onClick={() => onChange({ variant: v })}
            className={`rounded-full border px-3 py-0.5 text-[13px] font-bold ${block.variant === v ? "border-forest bg-forest text-lime" : "border-line"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <textarea
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={autoRows(block.text)}
        placeholder="טקסט. שורה ריקה = פסקה חדשה."
        className="field"
        aria-label="טקסט"
      />
      <p className="text-[12.5px] text-muted">
        <code className="ltr">**מודגש**</code> · <code className="ltr">`קוד`</code> · <code className="ltr">[טקסט](https://...)</code> · שורות שמתחילות ב־
        <code className="ltr">- </code> או <code className="ltr">1. </code> הופכות לרשימה
      </p>
    </div>
  );
}

export function ImageEditor({ block, onChange }: Props<"image">) {
  return (
    <div className="grid gap-3">
      {block.url && <img src={block.url} alt="" className="max-h-64 w-auto justify-self-start rounded-lg border border-line" />}
      <div className="flex flex-wrap items-center gap-2">
        <UploadButton
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          label={block.url ? "החלף תמונה" : "העלאת תמונה"}
          onUploaded={(f) => onChange({ url: f.url, width: f.width, height: f.height })}
        />
        <span className="text-[13px] text-muted">או הדבק קישור:</span>
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value, width: undefined, height: undefined })}
          placeholder="https://"
          dir="ltr"
          className="field min-w-[200px] flex-1 text-start"
          aria-label="קישור לתמונה"
        />
      </div>
      <Field label="טקסט חלופי (לנגישות)" hint="מה רואים בתמונה, במשפט אחד">
        <input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} className="field" />
      </Field>
      <Field label="כיתוב (לא חובה)">
        <input value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} className="field" />
      </Field>
    </div>
  );
}

export function CodeEditor({ block, onChange }: Props<"code">) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="כותרת, למשל: התקנה · בטרמינל"
          className="field min-w-[200px] flex-1"
          aria-label="כותרת הקוד"
        />
        <input
          value={block.language}
          onChange={(e) => onChange({ language: e.target.value })}
          placeholder="bash"
          dir="ltr"
          className="field w-32 text-start"
          aria-label="שפה"
        />
      </div>
      <textarea
        value={block.code}
        onChange={(e) => onChange({ code: e.target.value })}
        rows={autoRows(block.code, 3, 30)}
        dir="ltr"
        spellCheck={false}
        placeholder="npx skills add ..."
        className="field mono text-start"
        aria-label="קוד"
      />
    </div>
  );
}

export function PromptEditor({ block, onChange }: Props<"prompt">) {
  return (
    <div className="grid gap-2">
      <input
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="כותרת, למשל: נסה את הפרומפט"
        className="field"
        aria-label="כותרת הפרומפט"
      />
      <textarea
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={autoRows(block.text)}
        dir="auto"
        placeholder="הטקסט שהגולש יעתיק"
        className="field"
        aria-label="פרומפט"
      />
    </div>
  );
}

export function LinkEditor({ block, onChange }: Props<"link">) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Field label="כתובת">
        <input value={block.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://" dir="ltr" className="field text-start" />
      </Field>
      <Field label="כותרת">
        <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} className="field" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="תיאור קצר (לא חובה)">
          <input value={block.description} onChange={(e) => onChange({ description: e.target.value })} className="field" />
        </Field>
      </div>
    </div>
  );
}

export function FileEditor({ block, onChange }: Props<"file">) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <UploadButton
          label={block.url ? "החלף קובץ" : "העלאת קובץ"}
          onUploaded={(f) => onChange({ url: f.url, fileName: f.fileName, size: f.size, label: block.label || f.fileName })}
        />
        {block.url && (
          <a href={block.url} target="_blank" className="ltr truncate font-mono text-[12.5px] text-forest underline">
            {block.fileName || block.url}
          </a>
        )}
      </div>
      <Field label="שם להצגה">
        <input value={block.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="הורד את התבנית" className="field" />
      </Field>
      <p className="text-[12.5px] text-muted">קבצים פה ציבוריים לכל מי שיש לו את הקישור. קבצים של מוצרים בתשלום מעלים רק לספק התשלום.</p>
    </div>
  );
}

export function VideoEditor({ block, onChange }: Props<"video">) {
  const embed = block.url ? videoEmbed(block.url) : null;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://youtube.com/watch?v=… או Vimeo"
          dir="ltr"
          className="field min-w-[220px] flex-1 text-start"
          aria-label="קישור לווידאו"
        />
        <UploadButton accept="video/mp4,video/webm" label="העלאת MP4" onUploaded={(f) => onChange({ url: f.url })} />
      </div>
      {block.url && !embed && <p className="text-[13px] font-bold text-danger">לא זיהיתי YouTube, Vimeo או קובץ MP4. באתר יוצג רק קישור.</p>}
      <input value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} placeholder="כיתוב (לא חובה)" className="field" aria-label="כיתוב" />
    </div>
  );
}

export function CtaEditor({ block, onChange }: Props<"cta">) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="כותרת">
          <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} className="field" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="טקסט">
          <textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} rows={2} className="field" />
        </Field>
      </div>
      <Field label="טקסט הכפתור">
        <input value={block.buttonLabel} onChange={(e) => onChange({ buttonLabel: e.target.value })} className="field" />
      </Field>
      <Field label="קישור הכפתור">
        <input value={block.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://" dir="ltr" className="field text-start" />
      </Field>
    </div>
  );
}

export function BlockFields({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
  const change = onChange as never;
  switch (block.type) {
    case "heading":
      return <HeadingEditor block={block} onChange={change} />;
    case "text":
      return <TextEditor block={block} onChange={change} />;
    case "image":
      return <ImageEditor block={block} onChange={change} />;
    case "code":
      return <CodeEditor block={block} onChange={change} />;
    case "prompt":
      return <PromptEditor block={block} onChange={change} />;
    case "link":
      return <LinkEditor block={block} onChange={change} />;
    case "file":
      return <FileEditor block={block} onChange={change} />;
    case "video":
      return <VideoEditor block={block} onChange={change} />;
    case "divider":
      return <hr className="border-line" />;
    case "cta":
      return <CtaEditor block={block} onChange={change} />;
  }
}
