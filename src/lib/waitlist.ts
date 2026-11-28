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
  guide: { href: string; label: string };
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
  },
} satisfies Record<string, WaitlistConfig>;

export type WaitlistList = keyof typeof WAITLISTS;
export const isWaitlistList = (v: string): v is WaitlistList => Object.hasOwn(WAITLISTS, v);
