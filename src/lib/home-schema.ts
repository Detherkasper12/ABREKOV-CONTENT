import { z } from "zod";
import { safeUrl } from "./blocks";

// The home page story: a bad prompt, a chat reply, one scene per "answer", and a good prompt at the end.
// Everything here is edited by Dima in /admin/settings. Templates decide the composition and motion of
// a scene; palettes decide its colours. New scenes are added by picking a template and a palette.

export const SCENE_TEMPLATES = {
  fintech: { label: "פיננסי", hint: "מספר גדול שמתגלגל + כרטיסים שעפים פנימה" },
  timeline: { label: "טיימליין", hint: "סרט שזז הצידה מתחת לסמן, כתוביות וסמנים" },
  bento: { label: "בנטו", hint: "משבצות שננעלות אחת אחרי השנייה" },
  agent: { label: "גרף סוכן", hint: "כוכבים, ליבה זוהרת, משימות שמסתיימות ולוג" },
} as const;
export type SceneTemplate = keyof typeof SCENE_TEMPLATES;

// bg: scene background, fg: main ink, accent + accentInk: the highlight and the text on it,
// soft + softInk: a second surface and its text, mu: quiet text, dot: the colour that stands for the scene
// in the chat, the deck, the finale and the guide rows.
export const PALETTES = {
  orange: { label: "כתום", bg: "#FD572A", fg: "#0B0B0B", accent: "#0B0B0B", accentInk: "#FD572A", soft: "#EFEDE8", softInk: "#0B0B0B", mu: "rgba(11,11,11,.72)", dot: "#FD572A" },
  maroon: { label: "בורדו וורוד", bg: "#86242C", fg: "#FFD7D8", accent: "#FFD7D8", accentInk: "#86242C", soft: "#160407", softInk: "#FFD7D8", mu: "rgba(255,215,216,.82)", dot: "#FFD7D8" },
  paper: { label: "נייר וסגול", bg: "#EFEDE8", fg: "#0B0B0B", accent: "#695AC6", accentInk: "#EFEDE8", soft: "#0B0B0B", softInk: "#EFEDE8", mu: "#5f5c55", dot: "#695AC6" },
  space: { label: "חלל וליים", bg: "#050505", fg: "#EFEDE8", accent: "#D6FF3A", accentInk: "#0B0B0B", soft: "#141414", softInk: "#EFEDE8", mu: "#A3A099", dot: "#D6FF3A" },
  blue: { label: "כחול", bg: "#2747F5", fg: "#EFEDE8", accent: "#EFEDE8", accentInk: "#2747F5", soft: "#0B0B0B", softInk: "#EFEDE8", mu: "rgba(239,237,232,.82)", dot: "#2747F5" },
  ink: { label: "שחור ונייר", bg: "#0B0B0B", fg: "#EFEDE8", accent: "#EFEDE8", accentInk: "#0B0B0B", soft: "#1c1c1c", softInk: "#EFEDE8", mu: "#A3A099", dot: "#EFEDE8" },
} as const;
export type PaletteKey = keyof typeof PALETTES;

// Every field has a default, so content saved before a field existed still parses.
const t = (max: number) => z.string().trim().max(max).default("");
const lines = t;

export const sceneSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{1,30}$/),
  enabled: z.boolean().default(true),
  template: z.enum(Object.keys(SCENE_TEMPLATES) as [SceneTemplate, ...SceneTemplate[]]),
  palette: z.enum(Object.keys(PALETTES) as [PaletteKey, ...PaletteKey[]]),
  name: t(30), // the answer card in the chat
  prompt: t(60), // the pill at the top of the scene
  title: t(80),
  big: t(24), // the big number / timecode / core word
  value: t(240), // "THE VALUE" line
  ctaLabel: t(60),
  ctaHref: safeUrl.default(""),
  items: lines(600), // one per line: cards, captions, tiles or tasks, depending on the template
  images: lines(2000), // timeline only: one image URL per line, the frames of the film strip
});
export type Scene = z.infer<typeof sceneSchema>;

export const homeSchema = z.object({
  prompt: t(60),
  lead: t(300),
  hint: t(60),
  skipLabel: t(40),
  aiReply: t(240),
  aiNote: t(80),
  scenes: z.array(sceneSchema).max(8, "עד 8 סצנות").default([]),
  finalePrompt: t(600),
  finaleTitle: t(120),
  libraryTitle: t(40),
  libraryText: t(300),
  aboutTitle: t(60),
  aboutPhoto: safeUrl.default(""),
  aboutLine: t(160),
  aboutRows: lines(600), // "LABEL | text" per line
  courseEyebrow: t(60),
  courseTitle: t(80),
  courseText: t(400),
  communityTitle: t(60),
  communityText: t(160),
});
export type HomeContent = z.infer<typeof homeSchema>;

export const DEFAULT_HOME: HomeContent = {
  prompt: "תעשה לי אפליקציה",
  lead: "מדריכים חינם לבנייה עם AI, מדימה אברקוב. תחליק כדי לשלוח את הפרומפט הכי גרוע שיש, ותראה מה יוצא ממנו.",
  hint: "החלק או גלול כדי לשלוח",
  skipLabel: "לכל המדריכים",
  aiReply: "בטח. רק שתדע, עם פרומפט כזה יוצא בערך מה שתראה עכשיו.",
  aiNote: "הכנתי ארבע תשובות",
  scenes: [
    {
      id: "app",
      enabled: true,
      template: "fintech",
      palette: "orange",
      name: "אפליקציה",
      prompt: "תעשה לי אפליקציה",
      title: "שלוש מילים.\nאפליקציה אחת.",
      big: "₪12,480",
      value: "אפליקציה אמיתית מתוך רעיון, גם בלי רקע בקוד. במדריכים: איך מתארים מסכים, נתונים ומשתמש.",
      ctaLabel: "",
      ctaHref: "",
      items: "SPENT · NOV | ₪3,470 | ▼ 12% VS OCT\nהתראה כשהוצאה עוברת ₪500\nSAVINGS | +₪1,500",
      images: "",
    },
    {
      id: "video",
      enabled: true,
      template: "timeline",
      palette: "maroon",
      name: "מונטאז'",
      prompt: "תערוך לי סרטון",
      title: "",
      big: "00:01:00",
      value: "הסרטונים שלי נערכים ככה, בלי לגעת בטיימליין.",
      ctaLabel: "המדריך: Claude Code עורך לך וידאו",
      ctaHref: "/resources/claude-video-editing",
      items: "ערכתי לך את הסרטון הזה עם Claude Code, בלי לגעת בטיימליין אפילו פעם אחת.",
      images: ["v3", "v15", "v30", "step3", "v45", "dima", "v60", "v15", "v30", "v3", "v45", "step3", "v60", "v15"].map((f) => `/home/${f}.jpg`).join("\n"),
    },
    {
      id: "platform",
      enabled: true,
      template: "bento",
      palette: "paper",
      name: "פלטפורמה",
      prompt: "תבנה לי פלטפורמה",
      title: "פלטפורמה.",
      big: "1,284",
      value: "מערכת שלמה, חלק אחרי חלק.",
      ctaLabel: "",
      ctaHref: "",
      items: "מבוא לעיצוב מוצר | 412\nפרומפטים למעצבים | 388\nFigma למתחילים | 251",
      images: "",
    },
    {
      id: "agent",
      enabled: true,
      template: "agent",
      palette: "space",
      name: "סוכן",
      prompt: "תעשה לי סוכן",
      title: "סוכן שבונה\nבשבילך.",
      big: "סוכן",
      value: "הקורס עוד בדרך. ברשימת ההמתנה תשמע עליו ראשון.",
      ctaLabel: "רשימת המתנה לקורס סוכנים",
      ctaHref: "/agents",
      items: "מחקר מתחרים\nעיצוב מסכים\nכתיבת קוד\nבדיקות\nדיפלוי",
      images: "",
    },
  ],
  finalePrompt:
    "תבנה לי אפליקציית iOS למעקב הוצאות, לסטודנטים. שלושה מסכים: סקירה חודשית, הוספת הוצאה, התראות. כרטיסים מעוגלים, כתום על שחור, מספרים גדולים. תתחיל משלד ונתונים לדוגמה, ותשאל אותי מה לא ברור.",
  finaleTitle: "ההבדל בין שתי השורות\nהאלה, זה המדריכים.",
  libraryTitle: "מדריכים.",
  libraryText: "כל מדריך יוצא מסרטון באינסטגרם. בפנים: הפרומפטים להעתקה, הקבצים להורדה וכל השלבים.",
  aboutTitle: "אני דימה.",
  aboutPhoto: "/home/dima.jpg",
  aboutLine: "מעצב מוצר שבונה עם AI, ומלמד איך.",
  aboutRows:
    "WHAT | כל תהליך שעובד לי עם Claude הופך למדריך שאפשר לחזור עליו.\nFORMAT | סרטון קצר באינסטגרם, ומדריך מלא כאן באתר.",
  courseEyebrow: "COURSE · IN PROGRESS",
  courseTitle: "ללמוד לבנות סוכנים.",
  courseText: "קורס על סוכנים שבונים בשבילך פלטפורמות. הוא עוד בדרך: תשאיר פרטים ותשמע עליו ראשון. בלי ספאם, אפשר לצאת מתי שרוצים.",
  communityTitle: "קהילה בוואטסאפ",
  communityText: "כל מדריך חדש מגיע לשם קודם.",
};

// "LABEL | value" lines; a line without "|" has an empty label.
export function splitPairs(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      return i < 0 ? { label: "", value: l } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
    });
}
// "a | b | c" lines, every part trimmed.
export const splitParts = (text: string) => splitLines(text).map((l) => l.split("|").map((x) => x.trim()));

export const splitLines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
