import type { SiteSettings } from "@/lib/settings-schema";

// Invitation to the Telegram channel, shown on the home page and under every guide. Hidden until
// a channel link is set in admin settings, so it never renders a dead button.
// Built for hesitant visitors: it shows what is inside (a chat sample), lists what they get, and
// removes the worry at the point of the click ("one tap, leave any time").
export function TelegramBanner({ settings, place }: { settings: SiteSettings; place: "home" | "resource" }) {
  const href = settings.telegramUrl;
  if (!href || (!settings.telegramTitle && !settings.telegramText)) return null;
  const perks = settings.telegramPerks
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
  return (
    <aside
      aria-label="ערוץ הטלגרם"
      className="tg-banner relative isolate overflow-hidden rounded-[28px] bg-forest text-white"
    >
      <div className="tg-glow" aria-hidden />
      <div className="relative grid items-center gap-8 p-6 sm:p-9 md:grid-cols-[1.15fr_.85fr] md:gap-10">
        <div className="grid content-start gap-5">
          {settings.telegramTitle && (
            <h2 className="font-display text-[clamp(38px,7vw,60px)] leading-[0.95] text-lime">{settings.telegramTitle}</h2>
          )}
          {settings.telegramText && <p className="max-w-[46ch] text-[17px] leading-relaxed text-white/80">{settings.telegramText}</p>}
          {perks.length > 0 && (
            <ul className="grid gap-2.5">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[17px] font-bold">
                  <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-lime text-forest">
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 8.5 3.2 3L13 4.5" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="grid justify-items-start gap-2.5 pt-1">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-track="telegram_click"
              data-track-place={place}
              className="tg-cta"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <path d="M21.9 4.4 18.7 19.6c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.3c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13 1.9 11.5c-1-.3-1-1 .2-1.5L20.4 2.9c.9-.3 1.6.2 1.5 1.5Z" />
              </svg>
              {settings.telegramButton || "להצטרפות לערוץ"}
            </a>
            {settings.telegramNote && <p className="text-[15px] text-white/65">{settings.telegramNote}</p>}
          </div>
        </div>

        {/* A sample of the channel: a question and the bot typing its answer. Decorative. */}
        <div aria-hidden className="tg-phone mx-auto w-full max-w-[340px] md:max-w-none">
          <div className="flex items-center gap-3 border-b border-forest/10 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-forest font-bold text-lime">A</span>
            <div className="leading-tight">
              <p className="text-[15px] font-extrabold text-forest">ABREKOV AI</p>
              <p className="text-[13px] text-forest/60">בוט</p>
            </div>
          </div>
          <div className="grid gap-2.5 p-4">
            <p className="tg-bubble tg-bubble-me">תן לי פרומפט לעריכת וידאו</p>
            <p className="tg-bubble tg-bubble-bot">
              הנה, תעתיק ותדביק ב־Claude Code
              <span className="mt-2 block rounded-lg bg-forest/[.07] px-2.5 py-1.5 font-mono text-[13px] ltr" dir="ltr">
                edit my video…
              </span>
            </p>
            <p className="tg-bubble tg-bubble-bot tg-typing">
              <i /><i /><i />
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
