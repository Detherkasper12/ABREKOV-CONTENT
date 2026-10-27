/* eslint-disable @next/next/no-img-element -- media lives in Supabase Storage; plain <img> keeps it simple and fast */
import { headingAnchor, videoEmbed, type Block } from "@/lib/blocks";
import { CopyButton } from "../CopyButton";
import { RichText } from "./RichText";

const CALLOUT_LABEL = { tip: "טיפ", note: "שים לב", warning: "זהירות" } as const;

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function displayHost(url: string) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "")).slice(0, 70);
  } catch {
    return url;
  }
}

function isExternal(url: string) {
  return /^https?:/i.test(url);
}

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      if (!block.text) return null;
      const Tag = block.level === 3 ? "h3" : "h2";
      return <Tag id={headingAnchor(block)}>{block.text}</Tag>;
    }
    case "text": {
      if (!block.text.trim()) return null;
      if (block.variant === "plain") return <RichText text={block.text} />;
      return (
        <aside className={`callout callout-${block.variant}`}>
          <span className="callout-label">{CALLOUT_LABEL[block.variant]}</span>
          <RichText text={block.text} />
        </aside>
      );
    }
    case "image":
      if (!block.url) return null;
      return (
        <figure className="grid gap-2">
          <img
            src={block.url}
            alt={block.alt}
            width={block.width}
            height={block.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-[14px] border border-line bg-surface"
          />
          {block.caption && <figcaption className="text-[14px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    case "code":
      if (!block.code) return null;
      return (
        <div className="codebox">
          <div className="codebox-head">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span>{block.title || "קוד"}</span>
              {block.language && <span className="ltr font-mono text-[12px] font-normal opacity-70">{block.language}</span>}
            </span>
            <CopyButton text={block.code} />
          </div>
          <pre>
            <code>{block.code}</code>
          </pre>
        </div>
      );
    case "prompt":
      if (!block.text) return null;
      return (
        <div className="codebox prompt">
          <div className="codebox-head">
            <span>{block.title || "פרומפט"}</span>
            <CopyButton text={block.text} label="העתק פרומפט" kind="prompt" />
          </div>
          <pre dir="auto">{block.text}</pre>
        </div>
      );
    case "link":
      if (!block.url) return null;
      return (
        <a
          href={block.url}
          {...(isExternal(block.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="card group flex items-center justify-between gap-4 p-4 transition-colors hover:border-forest"
        >
          <span className="grid min-w-0 gap-1">
            <span className="font-extrabold">{block.title || displayHost(block.url)}</span>
            {block.description && <span className="text-[15px] text-muted">{block.description}</span>}
            <span className="ltr truncate text-start font-mono text-[12.5px] text-forest">{displayHost(block.url)}</span>
          </span>
          <span aria-hidden className="text-xl text-forest transition-transform group-hover:-translate-x-1">
            ←
          </span>
        </a>
      );
    case "file":
      if (!block.url) return null;
      return (
        <a href={block.url} download={block.fileName || true} className="card flex items-center gap-4 p-4 hover:border-forest">
          <span aria-hidden className="grid size-11 flex-none place-items-center rounded-xl bg-forest font-mono text-[11px] font-bold text-lime">
            {(block.fileName.split(".").pop() || "FILE").slice(0, 4).toUpperCase()}
          </span>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="font-extrabold">{block.label || block.fileName || "הורדה"}</span>
            <span className="ltr truncate text-start font-mono text-[12.5px] text-muted">
              {[block.fileName, formatSize(block.size)].filter(Boolean).join(" · ")}
            </span>
          </span>
          <span className="flex-none rounded-full bg-lime px-4 py-2 text-[14px] font-extrabold">הורדה</span>
        </a>
      );
    case "video": {
      const embed = block.url ? videoEmbed(block.url) : null;
      if (!embed) {
        return block.url ? (
          <a className="link-inline" href={block.url} target="_blank" rel="noopener noreferrer">
            {block.caption || "לצפייה בווידאו"}
          </a>
        ) : null;
      }
      return (
        <figure className="grid gap-2">
          {embed.kind === "iframe" ? (
            <div className="relative aspect-video overflow-hidden rounded-[14px] bg-forest">
              <iframe
                src={embed.src}
                title={block.caption || "וידאו"}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 size-full"
              />
            </div>
          ) : (
            <video src={embed.src} controls preload="metadata" playsInline className="w-full rounded-[14px] bg-forest" />
          )}
          {block.caption && <figcaption className="text-[14px] text-muted">{block.caption}</figcaption>}
        </figure>
      );
    }
    case "divider":
      return <hr className="my-2 border-line" />;
    case "cta":
      return (
        <section className="grid gap-3 rounded-[18px] bg-forest p-6 text-[#f1f3ef]">
          {block.title && <p className="text-[24px] leading-tight font-extrabold">{block.title}</p>}
          {block.text && <p className="text-mint">{block.text}</p>}
          {block.url && block.buttonLabel && (
            <a
              href={block.url}
              {...(isExternal(block.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="justify-self-start rounded-full bg-lime px-5 py-2.5 font-extrabold text-ink"
            >
              {block.buttonLabel}
            </a>
          )}
        </section>
      );
  }
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="doc">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}
