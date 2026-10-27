import { z } from "zod";
import { safeUrl } from "./blocks";

const text = (max: number) => z.string().trim().max(max).default("");

export const settingsSchema = z.object({
  heroTitle: text(160),
  heroText: text(600),
  instagramHandle: text(60),
  portfolioUrl: safeUrl.default(""),
  contactEmail: z.union([z.literal(""), z.email().max(254)]).default(""),
  aboutName: text(80),
  aboutText: text(1200),
  collabTitle: text(160),
  collabText: text(600),
  collabButton: text(60),
  resourceCtaTitle: text(160),
  resourceCtaText: text(600),
  resourceCtaButton: text(60),
  newsletterEnabled: z.boolean().default(false),
  newsletterTitle: text(160),
  newsletterText: text(400),
  categories: z
    .array(
      z.object({
        slug: z.string().trim().regex(/^[a-z0-9-]{1,30}$/, "מזהה קטגוריה: אותיות לטיניות קטנות, ספרות ומקף"),
        label: z.string().trim().min(1).max(40),
      }),
    )
    .max(30)
    .default([]),
  socials: z
    .array(z.object({ label: z.string().trim().min(1).max(40), url: safeUrl }))
    .max(10)
    .default([]),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

// Defaults hold only facts Dima supplied. Contact email and portfolio stay empty
// until he fills them in /admin/settings; empty fields are hidden on the site.
export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "כלים, פרומפטים ומדריכים שחוסכים לך שעות עבודה",
  heroText: "למעצבים, מפתחים ויוצרים שעובדים עם AI. כל משאב מהפוסטים של ‎@abrekov.design, מוכן להעתקה, בחינם ובלי הרשמה.",
  instagramHandle: "abrekov.design",
  portfolioUrl: "",
  contactEmail: "",
  aboutName: "Dima Abrekov",
  aboutText: "אני מעצב ובונה מוצרים דיגיטליים. אני עובד עם עיצוב אתרים, UI/UX, AI, פיתוח ואוטומציות, ומשתף פה את הכלים שאני משתמש בהם.",
  collabTitle: "יש לך פרויקט?",
  collabText: "אתרים, ממשקים, מוצרים דיגיטליים ואוטומציות עם AI. ספר לי מה אתה בונה.",
  collabButton: "בוא נדבר",
  resourceCtaTitle: "צריך אתר או מוצר דיגיטלי משלך?",
  resourceCtaText: "אני מעצב ומפתח אתרים ומוצרים דיגיטליים. יש לך רעיון? בוא נדבר.",
  resourceCtaButton: "בוא נדבר",
  newsletterEnabled: false,
  newsletterTitle: "רוצה לקבל כלים ומדריכים חדשים?",
  newsletterText: "מייל קצר כשעולה משאב חדש. בלי ספאם, אפשר לבטל בכל רגע.",
  categories: [
    { slug: "ai", label: "AI" },
    { slug: "design", label: "עיצוב" },
    { slug: "development", label: "פיתוח" },
    { slug: "tools", label: "כלים" },
    { slug: "templates", label: "תבניות" },
  ],
  socials: [],
};
