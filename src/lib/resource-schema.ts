import { z } from "zod";
import { blocksSchema, safeUrl } from "./blocks";

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const resourceInputSchema = z.object({
  id: z.uuid(),
  slug: z.string().trim().toLowerCase().max(80).regex(SLUG_RE, "כתובת: אותיות לטיניות קטנות, ספרות ומקפים בלבד"),
  title: z.string().trim().min(1, "חסרה כותרת").max(160),
  description: z.string().trim().max(600),
  label: z.string().trim().max(40),
  keyword: z.string().trim().max(40),
  coverUrl: safeUrl,
  coverAlt: z.string().trim().max(300),
  category: z.string().trim().max(30),
  tags: z.array(z.string().trim().min(1).max(30)).max(12),
  kind: z.enum(["free", "paid"]),
  priceIls: z.number().nonnegative().max(100000).nullable(),
  checkoutUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https:\/\//i.test(v), "קישור התשלום חייב להתחיל ב־https://"),
  featured: z.boolean(),
  seoTitle: z.string().trim().max(160),
  seoDescription: z.string().trim().max(300),
  fileUrl: safeUrl,
  fileName: z.string().trim().max(200),
  fileSize: z.number().int().nonnegative(),
  blocks: blocksSchema,
});

export type ResourceInput = z.infer<typeof resourceInputSchema>;

// A paid listing goes live only with a price and a real hosted checkout link,
// so the site never shows a purchase button that leads nowhere.
export function publishProblems(r: Pick<ResourceInput, "title" | "slug" | "kind" | "priceIls" | "checkoutUrl">) {
  const problems: string[] = [];
  if (!r.title.trim()) problems.push("חסרה כותרת");
  if (!SLUG_RE.test(r.slug)) problems.push("כתובת הדף לא תקינה");
  if (r.kind === "paid") {
    if (r.priceIls == null || r.priceIls <= 0) problems.push("למוצר בתשלום חסר מחיר");
    if (!/^https:\/\//i.test(r.checkoutUrl)) problems.push("למוצר בתשלום חסר קישור לעמוד תשלום (למשל Lemon Squeezy)");
  }
  return problems;
}
