// Course waitlists reached from Instagram DM funnels. Each one is a link-only page at /<slug>.
export const WAITLIST_CONSENT = "אני מסכים ש־ABREKOV יפנה אליי לגבי הקורס. אפשר לבקש להסיר אותי בכל רגע.";

export type WaitlistConfig = {
  list: string;
  path: string;
  adminLabel: string;
  title: string;
  description: string;
  lead: string;
  wishLabel: string;
  guide: { href: string; label: string } | null;
  // The one offer card at the end of a guide that points here.
  offer: { eyebrow: string; title: string; text: string; button: string };
  // Palette key (see home-schema PALETTES) for the page and the offer card.
  palette: string;
  // A public page gets the full site header and can be indexed; a DM-only one stays out of search.
  isPublic?: boolean;
  // Topic chips on the form; the picked ones are saved at the start of the "wish" text.
  topics?: { label: string; palette: string }[];
  consent?: string;
  button?: string;
};

export const WAITLISTS = {
  "agents-course": {
    list: "agents-course",
    path: "/agents",
    adminLabel: "קורס סוכנים",
    title: "ללמוד לבנות סוכנים עם Claude",
    description: "מיני־קורס על בניית סוכנים שבונים בשבילך אתרים, מערכות ופלטפורמות. הקורס בדרך: תירשם לרשימת ההמתנה.",
    lead: "המדריך החינמי מלמד איך לגרום ל־Claude להפסיק לנחש. בקורס נלך רחוק יותר: איך בונים סוכנים שבונים בשבילך אתרים, מערכות ופלטפורמות כמו אלה שאתה רואה אצלי.",
    wishLabel: "מה היית רוצה לבנות עם סוכן?",
    guide: { href: "/resources/claude-stop-guessing", label: "3 דרכים לגרום ל־Claude להפסיק לנחש" },
    offer: {
      eyebrow: "NEXT STEP · COURSE IN PROGRESS",
      title: "רוצה ללמוד לבנות סוכנים שבונים בשבילך פלטפורמות?",
      text: "הקורס בדרך. תירשם לרשימת ההמתנה ותשמע עליו ראשון.",
      button: "לרשימת ההמתנה",
    },
    palette: "space",
  },
  "video-course": {
    list: "video-course",
    path: "/video-editing",
    adminLabel: "קורס עריכת וידאו",
    title: "ללמוד לערוך וידאו עם Claude",
    description: "מיני־קורס על עריכת וידאו עם Claude Code, מהחומר הגולמי ועד סרטון מוכן. הקורס בדרך: תירשם לרשימת ההמתנה.",
    lead: "המדריך החינמי מראה איך Claude Code עורך בשבילך וידאו. בקורס נלך רחוק יותר: איך בונים תהליך עריכה שלם בסגנון שלך, מהחומר הגולמי ועד סרטון מוכן לפרסום.",
    wishLabel: "איזה סרטונים היית רוצה לערוך עם Claude?",
    guide: { href: "/resources/claude-video-editing", label: "איך לגרום ל־Claude Code לערוך בשבילך וידאו" },
    offer: {
      eyebrow: "NEXT STEP · COURSE IN PROGRESS",
      title: "רוצה לבנות תהליך עריכה שלם עם Claude?",
      text: "קורס עריכת הווידאו בדרך. תירשם לרשימת ההמתנה ותשמע עליו ראשון.",
      button: "לרשימת ההמתנה",
    },
    palette: "maroon",
  },
  learn: {
    list: "learn",
    path: "/learn",
    adminLabel: "ללמוד עוד (טופס התעניינות)",
    title: "ללמוד עוד.",
    description: "המדריכים חינם. אם אתה רוצה ללמוד לעומק, תגיד לי מה מעניין אותך.",
    lead: "המדריכים חינם. אם אתה רוצה ללמוד לעומק, תגיד לי מה מעניין אותך. ככה אני יודע מה לבנות קודם.",
    wishLabel: "משהו שתרצה להוסיף?",
    guide: null,
    offer: {
      eyebrow: "LEARN MORE",
      title: "רוצה ללמוד את זה לעומק?",
      text: "תגיד לי מה מעניין אותך, ואדע מה לבנות קודם.",
      button: "ללמוד עוד",
    },
    palette: "paper",
    isPublic: true,
    topics: [
      { label: "אפליקציות", palette: "orange" },
      { label: "וידאו", palette: "maroon" },
      { label: "פלטפורמות", palette: "paper" },
      { label: "סוכנים", palette: "space" },
    ],
    consent: "אני מסכים ש־ABREKOV יפנה אליי לגבי לימודים. אפשר לבקש להסיר אותי בכל רגע.",
    button: "לשלוח",
  },
} satisfies Record<string, WaitlistConfig>;

export type WaitlistList = keyof typeof WAITLISTS;
export const isWaitlistList = (v: string): v is WaitlistList => Object.hasOwn(WAITLISTS, v);

export const consentFor = (w: WaitlistConfig) => w.consent ?? WAITLIST_CONSENT;

// The offer at the end of a guide. "" picks it automatically: the course whose free guide this is,
// otherwise the general "learn more" form. "none" shows nothing.
export const OFFER_CHOICES: { value: string; label: string }[] = [
  { value: "", label: "אוטומטי (לפי המדריך)" },
  ...Object.values(WAITLISTS).map((w) => ({ value: w.list, label: w.adminLabel })),
  { value: "none", label: "בלי הצעה" },
];

export function offerFor(slug: string, offer: string): WaitlistConfig | null {
  if (offer === "none") return null;
  if (isWaitlistList(offer)) return WAITLISTS[offer];
  const own = Object.values(WAITLISTS).find((w) => w.guide?.href === `/resources/${slug}`);
  return own ?? WAITLISTS.learn;
}
