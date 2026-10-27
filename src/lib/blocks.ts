import { z } from "zod";

// Links may be absolute http(s), mailto, or a site-relative path. Anything else
// (javascript:, data:, protocol-relative //) is rejected so stored content can't inject script.
export const safeUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^(https?:\/\/|mailto:)/i.test(v) || (v.startsWith("/") && !v.startsWith("//")), {
    message: "קישור לא תקין. התחל ב־https://",
  });

const id = z.string().min(1).max(40);
const short = (max = 200) => z.string().max(max).default("");
const long = (max = 20000) => z.string().max(max).default("");

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("heading"), text: short(200), level: z.union([z.literal(2), z.literal(3)]).default(2) }),
  z.object({
    id,
    type: z.literal("text"),
    text: long(),
    variant: z.enum(["plain", "tip", "note", "warning"]).default("plain"),
  }),
  z.object({
    id,
    type: z.literal("image"),
    url: safeUrl.default(""),
    alt: short(300),
    caption: short(300),
    width: z.number().int().positive().max(20000).optional(),
    height: z.number().int().positive().max(20000).optional(),
  }),
  z.object({ id, type: z.literal("code"), title: short(120), language: short(40), code: long(50000) }),
  z.object({ id, type: z.literal("prompt"), title: short(120), text: long() }),
  z.object({ id, type: z.literal("link"), title: short(200), url: safeUrl.default(""), description: short(500) }),
  z.object({
    id,
    type: z.literal("file"),
    label: short(200),
    url: safeUrl.default(""),
    fileName: short(200),
    size: z.number().int().nonnegative().optional(),
  }),
  z.object({ id, type: z.literal("video"), url: safeUrl.default(""), caption: short(300) }),
  z.object({ id, type: z.literal("divider") }),
  z.object({
    id,
    type: z.literal("cta"),
    title: short(200),
    text: short(1000),
    buttonLabel: short(60),
    url: safeUrl.default(""),
  }),
]);

export const blocksSchema = z.array(blockSchema).max(300);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: "heading", label: "כותרת" },
  { type: "text", label: "טקסט" },
  { type: "image", label: "תמונה" },
  { type: "code", label: "קוד" },
  { type: "prompt", label: "פרומפט" },
  { type: "link", label: "קישור" },
  { type: "file", label: "קובץ" },
  { type: "video", label: "וידאו" },
  { type: "divider", label: "קו מפריד" },
  { type: "cta", label: "CTA" },
];

export function newBlockId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function emptyBlock(type: BlockType): Block {
  const id = newBlockId();
  switch (type) {
    case "heading":
      return { id, type, text: "", level: 2 };
    case "text":
      return { id, type, text: "", variant: "plain" };
    case "image":
      return { id, type, url: "", alt: "", caption: "" };
    case "code":
      return { id, type, title: "", language: "", code: "" };
    case "prompt":
      return { id, type, title: "", text: "" };
    case "link":
      return { id, type, title: "", url: "", description: "" };
    case "file":
      return { id, type, label: "", url: "", fileName: "" };
    case "video":
      return { id, type, url: "", caption: "" };
    case "divider":
      return { id, type };
    case "cta":
      return { id, type, title: "", text: "", buttonLabel: "", url: "" };
  }
}

// Heading anchors for the table of contents. Hebrew letters are kept so URLs stay readable.
export function headingAnchor(block: BlockOf<"heading">) {
  const base = block.text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base ? `${base}-${block.id.slice(0, 4)}` : block.id;
}

// YouTube / Vimeo URLs become privacy-friendly embeds; direct .mp4/.webm play in <video>.
export function videoEmbed(url: string): { kind: "iframe" | "file"; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
      if (v) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${v}` };
    }
    if (host === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${v}` };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const v = u.pathname.match(/(\d{5,})/)?.[1];
      if (v) return { kind: "iframe", src: `https://player.vimeo.com/video/${v}` };
    }
    if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { kind: "file", src: url };
  } catch {
    return null;
  }
  return null;
}
