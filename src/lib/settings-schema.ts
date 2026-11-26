import { z } from "zod";
import { safeUrl } from "./blocks";

const text = (max: number) => z.string().trim().max(max).default("");
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "צבע בפורמט #RRGGBB").default("#000000");

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
  memberTitle: text(160),
  memberText: text(600),
  memberButton: text(60),
  joinOn: z.boolean().default(true),
  joinStyle: z.enum(["whatsapp", "telegram", "plain"]).default("whatsapp"),
  joinUrl: safeUrl.default(""),
  joinLogo: safeUrl.default(""),
  joinTitle: text(160),
  joinText: text(400),
  joinPerks: text(400),
  joinButton: text(60),
  joinNote: text(160),
  joinHeaderName: text(60),
  joinHeaderSub: text(60),
  joinChat: text(900),
  joinToast: text(60),
  joinBg: color,
  joinGlow1: color,
  joinGlow2: color,
  joinBtnFrom: color,
  joinBtnTo: color,
  joinBtnText: color,
  joinTextColor: color,
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
  memberTitle: "רוצה גישה מלאה ליותר מ־100 מדריכים?",
  memberText: "מנוי: ‎$25 לחודש. כתוב לי בצ'אט ואסביר איך מצטרפים.",
  memberButton: "לכתוב לי בצ'אט",
  joinOn: true,
  joinStyle: "whatsapp",
  joinUrl: "https://chat.whatsapp.com/CV9HL7lo9pRJPZrXU1enMY",
  joinLogo: "",
  joinTitle: "הכי טוב קורה בקהילה שלנו",
  joinText: "מה שלא נכנס לאתר ולפוסטים, מחכה לך שם, בחינם.",
  joinPerks: "טיפים וכלים חדשים כל יום\nפרומפטים מוכנים להעתקה\nקורסים ומדריכים בחינם\nאפשר לשאול אותי ישירות",
  joinButton: "להצטרפות לקבוצה",
  joinNote: "לחיצה אחת בוואטסאפ, ואפשר לצאת בכל רגע",
  joinHeaderName: "AI PRO קהילה",
  joinHeaderSub: "קבוצה פתוחה, חינם",
  joinChat: "ברוכים הבאים! פה משתפים כלים, פרומפטים ומדריכים\nמישהו יודע איך להפוך את Claude לעורך וידאו?\nבטח! הנה הפרומפט, תעתיקו ותדביקו | edit my video…\nתודה, זה חסך לי שעות!\nיש עוד המון בקבוצה | לכל המדריכים",
  joinToast: "הצטרפת לקבוצה ✓",
  joinBg: "#0a1a17",
  joinGlow1: "#128c7e",
  joinGlow2: "#25d366",
  joinBtnFrom: "#25d366",
  joinBtnTo: "#b6f23a",
  joinBtnText: "#04170f",
  joinTextColor: "#ffffff",
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
