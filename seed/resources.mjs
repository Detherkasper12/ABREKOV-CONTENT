// Content of the first two resources, carried over verbatim from the already
// verified lead magnets (DROP / 001 and LAB / 014). Used by scripts/seed.mjs.
let n = 0;
const id = () => `seed${String(++n).padStart(4, "0")}`;
const h = (text, level = 2) => ({ id: id(), type: "heading", text, level });
const t = (text, variant = "plain") => ({ id: id(), type: "text", text, variant });
const code = (title, c, language = "bash") => ({ id: id(), type: "code", title, language, code: c });
const prompt = (text, title = "נסה את הפרומפט") => ({ id: id(), type: "prompt", title, text });
const link = (url, title, description = "") => ({ id: id(), type: "link", url, title, description });

function skill(no, name, tag, desc, url, installTitle, install, tryPrompt) {
  // U+200F keeps "01" on the right of a Latin name in RTL text.
  return [h(`${no}\u200F · ${name}`), t(`**${tag}.** ${desc}`), link(url, name), code(installTitle, install), prompt(tryPrompt)];
}

export const claudeSkills = {
  slug: "claude-skills",
  title: "5 סקילים ל־Claude למעצבי מוצר",
  description: "כל פקודות ההתקנה, הקישורים ופרומפט לניסיון לכל סקיל. UI/UX Pro Max, Frontend Design, Emil Kowalski, App Store Screenshots ו־gstack.",
  label: "DROP / 001",
  keyword: "סקילים",
  category: "ai",
  tags: ["claude", "claude-code", "skills", "design"],
  kind: "free",
  featured: true,
  blocks: [
    t(
      "**צריך:** Claude Code מותקן. לפקודות `npx` צריך גם Node.js.\n**לפני כל התקנה:** תעבור על הקוד בריפו. סקילים ופלאגינים רצים אצלך במחשב.",
      "note",
    ),
    ...skill(
      "01",
      "UI/UX Pro Max",
      "מערכת עיצוב",
      "מלמד את Claude כללי עיצוב: היררכיה, צבעים, טיפוגרפיה ודפוסי UX, לפני שהוא כותב קוד.",
      "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
      "התקנה · בתוך סשן של Claude Code",
      "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill\n/plugin install ui-ux-pro-max@ui-ux-pro-max-skill",
      "תעצב דף הזמנות לצימר בגליל. תעבוד לפי כללי העיצוב שלך.",
    ),
    ...skill(
      "02",
      "Frontend Design",
      "נגד עיצוב גנרי",
      "הסקיל הרשמי של Anthropic לממשקים. בוחר כיוון אסתטי לפני הקוד ומתרחק מלייאאוטים גנריים של AI. נכנס לפעולה לבד כשאתה מבקש מ־Claude לבנות פרונטאנד.",
      "https://claude.com/plugins/frontend-design",
      "התקנה · בתוך סשן של Claude Code. המרקטפלייס הרשמי של Anthropic נוסף אוטומטית בסשן הראשון בטרמינל.",
      "/plugin install frontend-design@claude-plugins-official",
      "תבנה דשבורד לסטודיו פילאטיס. שירגיש מעוצב, לא כמו תבנית.",
    ),
    ...skill(
      "03",
      "Emil Kowalski",
      "אנימציה",
      "15 סקילים של Emil Kowalski, שעבד ב־Vercel וב־Linear ויצר את Sonner: בניית אנימציות, ביקורת easing ומשך, תיקון אנימציות שנתקעות ובדיקת UI עם דאטה קיצוני.",
      "https://github.com/emilkowalski/skills",
      "התקנה · בטרמינל. צריך Node.js.",
      "npx skills@latest add emilkowalski/skills",
      "תבדוק את האנימציה של המודאל ותתקן את ה־easing והמשך.",
    ),
    ...skill(
      "04",
      "App Store Screenshots",
      "השקה",
      "מקים עורך Next.js שמייצר צילומי מסך שיווקיים ל־App Store ול־Google Play.",
      "https://github.com/ParthJadhav/app-store-screenshots",
      "התקנה · בטרמינל. צריך Node.js.",
      "npx skills add ParthJadhav/app-store-screenshots -a claude-code",
      "תכין צילומי מסך ל־App Store לאפליקציית הרגלים. רגוע, חם, פרימיום.",
    ),
    ...skill(
      "05",
      "gstack",
      "ביקורת עיצוב",
      "ערכת הכלים של Garry Tan ל־Claude Code. `/plan-design-review` נותנת ציון 0–10 לכל ממד עיצובי בתוכנית, מסבירה איך נראה 10 ומתקנת את התוכנית. `/design-review` עושה את אותה בדיקה ומתקנת בעצמה את מה שמצאה.",
      "https://github.com/garrytan/gstack",
      "התקנה · בטרמינל. צריך Git ו־Bun (גרסה 1.3.3 ומעלה).",
      "git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup",
      "/plan-design-review\nתדרג את התוכנית 0–10 ותתקן כל מה שמתחת ל־10.",
    ),
    { id: id(), type: "divider" },
    h("מאיפה להתחיל"),
    t("1. **UI/UX Pro Max** בשביל הכללים\n2. **Emil Kowalski** בשביל התנועה\n3. **gstack** לביקורת לפני שמשחררים"),
    t("סקיל לא יעצב במקומך. הוא חוסך לך להסביר ל־Claude את אותם כללים בכל פעם.", "tip"),
    t("הפקודות נלקחו מה־README הרשמי של כל פרויקט (27.10.2026)."),
  ],
};

export function claudeMd(template, fileUrl, fileSize) {
  return {
    slug: "claude-md-template",
    title: "תבנית CLAUDE.md",
    description: "קובץ אחד בשורש הפרויקט ש־Claude Code טוען בתחילת כל סשן. תבנית מוכנה להעתקה ומדריך קצר בעברית.",
    label: "LAB / 014",
    keyword: "קלאוד",
    category: "development",
    tags: ["claude", "claude-code", "template"],
    kind: "free",
    featured: true,
    blocks: [
      h("מה זה בכלל"),
      t("Claude Code מתחיל כל סשן עם זיכרון ריק. הקובץ CLAUDE.md נטען בתחילת כל סשן, וככה Claude יודע מה הפקודות, מה הכללים ואיך נראה \"סיימתי\" בפרויקט שלך."),
      h("5 צעדים"),
      t(
        [
          "1. **שים את הקובץ בשורש הפרויקט**, ליד package.json. השם חייב להיות בדיוק `CLAUDE.md`.",
          "2. **תחליף כל מה שבסוגריים המרובעים** `[...]` בפרטים של הפרויקט שלך.",
          "3. **תמחק כל שורה שלא רלוונטית.** קובץ קצר עובד טוב יותר. התיעוד הרשמי ממליץ על פחות מ־200 שורות.",
          "4. **בדוק שהקובץ נטען:** פתח סשן, הרץ `/context` וחפש את הקובץ תחת Memory files.",
          "5. **תעדכן אותו תוך כדי עבודה.** תיקנת את Claude על אותו דבר פעמיים? תוסיף שורה ל־Known gotchas.",
        ].join("\n"),
      ),
      h("התבנית"),
      ...(fileUrl ? [{ id: id(), type: "file", label: "הורד את CLAUDE.md", url: fileUrl, fileName: "CLAUDE.md", size: fileSize }] : []),
      code("CLAUDE.md", template, "markdown"),
      h("עוד 3 דברים שכדאי לדעת"),
      t(
        [
          "- **רוצה טיוטה אוטומטית?** הרץ `/init` בתיקיית הפרויקט. Claude Code יסרוק את הקוד ויכתוב CLAUDE.md ראשוני. אם כבר יש לך קובץ, הוא יציע שיפורים במקום לדרוס אותו.",
          "- **העדפות אישיות** שלא צריכות להיכנס ל־git? שים אותן ב־`CLAUDE.local.md` ותוסיף אותו ל־`.gitignore`. העדפות לכל הפרויקטים שלך נכנסות ל־`~/.claude/CLAUDE.md`.",
          "- **כלל שאסור לשבור אף פעם** (למשל \"לא לגעת בתיקיית migrations\")? CLAUDE.md הוא הנחיה, לא חסימה. בשביל חסימה אמיתית משתמשים ב־hook.",
        ].join("\n"),
      ),
      h("איך לכתוב הוראות שעובדות"),
      t("תכתוב הוראות שאפשר לבדוק:\n❌ `Format code properly` ← ✅ `Use 2-space indentation`\n❌ `Test your changes` ← ✅ `Run npm test before committing`", "tip"),
      link("https://code.claude.com/docs/en/memory", "התיעוד הרשמי של Claude Code", "המקור לכל מה שכתוב בדף הזה"),
    ],
  };
}

// DROP-style lead magnet for the reel "how to make Claude Code edit your video" (comment keyword "עריכה").
// Link-only: it is delivered by DM and never listed in the library. Prompts 1-3 are the ones shown in the reel;
// the sample first-edit prompt is an addition and is labelled as such on the page.
export const claudeVideoEditing = (() => {
  const savedN = n;
  n = 100;
  const list = (items) => items.map((x) => `- ${x}`).join("\n");
  const blocks = [
      t("בסרטון הראיתי איך לגרום ל־Claude Code לערוך לך וידאו. פה יש הכול במקום אחד: כל שלב, כל פרומפט ואיך מגדירים סגנון משלך. תעתיק, תדביק ותתחיל."),
      t("**מה צריך:** Claude Code על המחשב והסרטונים שלך. את שאר הכלים Claude Code מתקין בעצמו, אתה רק נותן לו את הפרומפט.", "tip"),

      h("שלב 1: Claude Code ותיקייה אחת"),
      t("תוריד את Claude Code כאפליקציה למחשב ולא כדפדפן. אחרי זה תיצור תיקייה אחת בשם **עריכת AI**, עם שלוש תיקיות בפנים:"),
      t(
        list([
          "**חומר מקורי:** הסרטונים הגולמיים שלך",
          "**רפרנסים:** סרטונים שאתה אוהב את הסגנון שלהם",
          "**מוכן:** הסרטונים הערוכים",
        ]),
      ),
      t("תפתח צ'אט חדש ב־Claude Code ותצביע על התיקייה הזאת. זהו, Claude רואה את כל הקבצים שלך."),
      link("https://code.claude.com/docs/en/overview", "Claude Code", "ההוראות הרשמיות להתקנה"),

      h("שלב 2: הכלים לעריכה"),
      t("במה Claude יערוך את הסרטון? בכלים שקיימים כבר, והוא מתקין אותם בשבילך. תדביק לו את הפרומפט הזה:"),
      prompt(
        "אתה העורך וידאו שלי. תתקין על המחשב שלי את הכלים: Remotion, HyperFrames, FFmpeg, Whisper, yt-dlp (קישורים למטה). תבדוק כל אחד ותגיד לי כשהכול מוכן.",
        "פרומפט 1: להתקין את הכלים",
      ),
      t("Claude ישאל אותך אם לאשר את ההתקנות. תקרא מה הוא מבקש להריץ ורק אז תאשר.", "tip"),
      t("מה כל כלי עושה:"),
      t(
        list([
          "**Remotion:** יצירת וידאו מקוד",
          "**HyperFrames:** עוד כלי ליצירת וידאו מקוד",
          "**FFmpeg:** חיתוך, חיבור והמרה של וידאו ואודיו",
          "**Whisper:** תמלול דיבור לטקסט, בסיס לכתוביות",
          "**yt-dlp:** הורדת סרטונים מהרשת, למשל רפרנסים",
        ]),
      ),
      link("https://github.com/remotion-dev/remotion", "Remotion", "github.com/remotion-dev/remotion"),
      link("https://github.com/heygen-com/hyperframes", "HyperFrames", "github.com/heygen-com/hyperframes"),
      link("https://github.com/FFmpeg/FFmpeg", "FFmpeg", "github.com/FFmpeg/FFmpeg"),
      link("https://github.com/openai/whisper", "Whisper", "github.com/openai/whisper"),
      link("https://github.com/yt-dlp/yt-dlp", "yt-dlp", "github.com/yt-dlp/yt-dlp"),

      h("שלב 3: ללמד אותו את הסגנון שלך"),
      t("פה ההבדל בין עריכה גנרית לעריכה שנראית כמו שלך. תאסוף סרטונים שאתה אוהב את הסגנון שלהם ותשים אותם בתיקיית **רפרנסים**. אפשר גם לבקש מ־Claude להוריד אותם בשבילך עם yt-dlp."),
      prompt(
        "הנה עוד פרומפטים ורפרנסים. תלמד מהם את הסגנון שלי: פונטים, צבעים, כתוביות, מעברים וקצב. תבנה ברנדבוק.",
        "פרומפט 2: ללמד אותו את הסגנון",
      ),
      t("בכל מקרה תן לו גם פרומפטים ורפרנסים משלך. ככל שיש לו יותר חומר ממך, הסגנון שהוא לומד מדויק יותר.", "tip"),
      t("התוצאה היא **ברנדבוק**: מסמך שמסכם את הפונטים, הצבעים, הכתוביות, המעברים והקצב שלך. מעכשיו Claude עורך לפיו. תקרא אותו, ואם משהו לא נראה לך, תגיד לו מה לשנות."),

      h("עכשיו לערוך"),
      t("תשים סרטון בתיקיית **חומר מקורי** ותגיד ל־Claude מה לעשות איתו, כמו שמדברים עם עורך אמיתי. דוגמה לעריכה ראשונה (הפרומפט הזה לא מהסרטון, תתאים אותו לסרטון שלך):"),
      prompt(
        "תערוך את הסרטון שבתיקיית חומר מקורי לפי הברנדבוק. תוסיף כתוביות ותשמור את התוצאה בתיקיית מוכן.",
        "דוגמה: עריכה ראשונה",
      ),
      t("ואם משהו לא יצא טוב, לא מתחילים מחדש. פשוט תגיד לו מה לתקן, בדיוק כמו לעורך אמיתי:"),
      prompt("תתקן את זה, ואת זה, והפריים פה יותר גדול.", "פרומפט 3: תיקונים"),

      h("בקצרה"),
      t("1. תוריד את Claude Code ותיצור תיקיית **עריכת AI** עם חומר מקורי, רפרנסים ומוכן\n2. תדביק לו את הפרומפט הראשון והוא מתקין את הכלים\n3. תן לו רפרנסים ופרומפט שני, והוא בונה את הברנדבוק שלך\n4. תערוך, ותגיד לו מה לתקן עד שזה נראה כמו שלך"),
  ];
  n = savedN;
  return {
    slug: "claude-video-editing",
    title: "איך לגרום ל־Claude Code לערוך בשבילך וידאו",
    description: "שלושה שלבים והפרומפטים מהסרטון: להתקין את Claude Code, לתת לו את הכלים לעריכה וללמד אותו את הסגנון שלך.",
    label: "LAB",
    keyword: "עריכה",
    category: "ai",
    tags: ["claude-code", "video", "remotion"],
    kind: "free",
    featured: false,
    unlisted: true,
    blocks,
  };
})();
