import type { SiteSettings } from "@/lib/settings-schema";

// Invitation to the Telegram community, shown on the home page and under every guide. Hidden until a
// link is set in admin settings, so it never renders a dead button. It has its own aurora palette so
// it stands apart from the site, and a looping chat demo: messages arrive and scroll, a cursor moves
// to the join button and clicks it. Motion is CSS only and stops for prefers-reduced-motion.

const PLANE =
  "M21.9 4.4 18.7 19.6c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.3c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13 1.9 11.5c-1-.3-1-1 .2-1.5L20.4 2.9c.9-.3 1.6.2 1.5 1.5Z";

function Row({ id, children }: { id: string; children: React.ReactNode }) {
  return <div className={`tgx-row tgx-row-${id}`}>{children}</div>;
}

function Typing({ id }: { id: string }) {
  return (
    <Row id={id}>
      <p className="tgx-msg tgx-bot tgx-dots">
        <i />
        <i />
        <i />
      </p>
    </Row>
  );
}

function Phone({ tall = false }: { tall?: boolean }) {
  return (
    <div aria-hidden className="tgx-phone mx-auto max-w-[320px]" style={tall ? ({ "--screen-h": "330px" } as React.CSSProperties) : undefined}>
      <div className="tgx-inner">
        <div className="tgx-head">
          <span className="tgx-ava">✦</span>
          <div className="leading-tight">
            <p className="text-[14px] font-extrabold">AI PRO קהילה</p>
            <p className="text-[12px] text-white/60">בוט, קורסים וטיפים</p>
          </div>
        </div>
        <div className="tgx-screen">
          <div className="tgx-chat">
            <Row id="m1">
              <p className="tgx-msg tgx-bot">ברוך הבא! אני הבוט של AI PRO</p>
            </Row>
            <Row id="m2">
              <p className="tgx-msg tgx-me">תן לי פרומפט לעריכת וידאו</p>
            </Row>
            <Typing id="t1" />
            <Row id="m3">
              <p className="tgx-msg tgx-bot">
                הנה, תעתיק ותדביק:
                <span className="tgx-code">edit my video…</span>
              </p>
            </Row>
            <Row id="m4">
              <p className="tgx-msg tgx-me">ויש קורסים בחינם?</p>
            </Row>
            <Typing id="t2" />
            <Row id="m5">
              <p className="tgx-msg tgx-bot">
                בטח, יש הרבה!
                <span className="tgx-inline">לכל הקורסים</span>
              </p>
            </Row>
          </div>
          <div className="tgx-toast">הצטרפת לקהילה ✓</div>
        </div>
        <div className="tgx-joinbar">
          <span className="tgx-join">להצטרפות לקהילה</span>
        </div>
      </div>
      <svg className="tgx-cursor" viewBox="0 0 24 24">
        <path d="M4 2.5 19.5 12l-7 1.6L9 20.5 4 2.5Z" fill="#fff" stroke="#14082e" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function TelegramBanner({
  settings,
  place,
  compact = false,
}: {
  settings: SiteSettings;
  place: "home" | "resource";
  compact?: boolean;
}) {
  const href = settings.telegramUrl;
  if (!href || (!settings.telegramTitle && !settings.telegramText)) return null;
  const button = settings.telegramButton || "להצטרפות לקהילה";
  const perks = settings.telegramPerks
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
  const link = {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    "data-track": "telegram_click",
    "data-track-place": compact ? `${place}-card` : place,
  } as const;

  if (compact) {
    // Tall card for the empty column beside the headline on wide screens.
    return (
      <aside aria-label="הקהילה בטלגרם" className="tgx grid gap-5 rounded-[28px] p-5">
        {settings.telegramTitle && <p className="font-display text-[46px] leading-[0.92] text-white">{settings.telegramTitle}</p>}
        <Phone tall />
        <div className="grid gap-2">
          <a {...link} className="tgx-cta w-full !px-4 !text-[17px] whitespace-nowrap">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <path d={PLANE} />
            </svg>
            {button}
          </a>
          {settings.telegramNote && <p className="text-center text-[13px] text-white/65">{settings.telegramNote}</p>}
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="הקהילה בטלגרם" className="tgx rounded-[32px]">
      <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_.9fr] md:gap-12">
        <div className="grid content-start gap-5">
          {settings.telegramTitle && (
            <h2 className="font-display text-[clamp(44px,8vw,72px)] leading-[0.92] text-white">{settings.telegramTitle}</h2>
          )}
          {settings.telegramText && <p className="max-w-[46ch] text-[18px] leading-relaxed text-white/80">{settings.telegramText}</p>}
          {perks.length > 0 && (
            <ul className="grid gap-2.5">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[18px] font-bold">
                  <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffd23f] to-[#ff4f8b] text-[#1d0836]">
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 8.5 3.2 3L13 4.5" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="grid justify-items-start gap-2.5 pt-1">
            <a {...link} className="tgx-cta !min-h-16 !px-9 !text-[21px] max-sm:w-full">
              <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <path d={PLANE} />
              </svg>
              {button}
            </a>
            {settings.telegramNote && <p className="text-[15px] text-white/65">{settings.telegramNote}</p>}
          </div>
        </div>
        <Phone tall />
      </div>
    </aside>
  );
}
