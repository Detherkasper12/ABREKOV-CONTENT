import type { SiteSettings } from "@/lib/settings-schema";

// Invitation to the WhatsApp community, shown on the home page and under every guide. Hidden until
// a channel link is set in admin settings, so it never renders a dead button.
// Built for hesitant visitors: it shows what is inside (a chat sample), lists what they get, and
// removes the worry at the point of the click ("one tap, leave any time").
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
  const perks = settings.telegramPerks
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (compact) {
    // The small card for the empty top corner beside the headline on wide screens.
    return (
      <aside aria-label="הקהילה בוואטסאפ" className="tg-banner relative isolate grid gap-4 overflow-hidden rounded-[24px] bg-forest p-5 text-white">
        <div className="tg-glow" aria-hidden />
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-lime text-forest">
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.07-1.85-.12-.43-.13-.97-.31-1.67-.61-2.93-1.27-4.84-4.2-4.99-4.4-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.25.58.83 2.02.9 2.17.07.15.12.32.02.5-.1.2-.15.32-.3.5l-.45.52c-.15.15-.3.3-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.3 2.36 1.45.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
          </svg>
        </span>
        {settings.telegramTitle && <p className="font-display text-[38px] leading-[0.95] text-lime">{settings.telegramTitle}</p>}
        {perks.length > 0 && (
          <ul className="grid gap-1.5 text-[15px] font-bold">
            {perks.slice(0, 3).map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-lime" />
                {p}
              </li>
            ))}
          </ul>
        )}
        <div aria-hidden className="tg-mini tg-loop grid gap-2 rounded-2xl bg-[#eef3ee] p-3">
          <p className="tg-bubble tg-bubble-me tg-b1 !max-w-[90%] !text-[14px]">איך Claude עורך לי וידאו?</p>
          <p className="tg-bubble tg-bubble-bot tg-b2 !max-w-[90%] !text-[14px]">
            הנה הפרומפט, תעתיק ותדביק
            <span className="mt-1.5 block rounded-lg bg-forest/[.07] px-2 py-1 font-mono text-[12px] ltr" dir="ltr">edit my video…</span>
          </p>
          <p className="tg-bubble tg-bubble-bot tg-typing tg-b3"><i /><i /><i /></p>
        </div>
        <div className="tg-loop relative">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-track="join_click"
            data-track-place={`${place}-corner`}
            className="tg-cta tg-cta-loop w-full !min-h-12 !px-5 !text-[17px]"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.07-1.85-.12-.43-.13-.97-.31-1.67-.61-2.93-1.27-4.84-4.2-4.99-4.4-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.25.58.83 2.02.9 2.17.07.15.12.32.02.5-.1.2-.15.32-.3.5l-.45.52c-.15.15-.3.3-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.3 2.36 1.45.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
            </svg>
            {settings.telegramButton || "להצטרפות לקהילה"}
          </a>
          <svg aria-hidden viewBox="0 0 24 24" className="tg-cursor" width="26" height="26">
            <path d="M5 3l14 8-6.2 1.6L9.7 19 5 3Z" fill="#fff" stroke="#12332a" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        {settings.telegramNote && <p className="-mt-1 text-[13px] text-white/60">{settings.telegramNote}</p>}
      </aside>
    );
  }
  return (
    <aside
      aria-label="הקהילה בוואטסאפ"
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
              data-track="join_click"
              data-track-place={place}
              className="tg-cta"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
                <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.07-1.85-.12-.43-.13-.97-.31-1.67-.61-2.93-1.27-4.84-4.2-4.99-4.4-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.25.58.83 2.02.9 2.17.07.15.12.32.02.5-.1.2-.15.32-.3.5l-.45.52c-.15.15-.3.3-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.3 2.36 1.45.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
              </svg>
              {settings.telegramButton || "להצטרפות לקהילה"}
            </a>
            {settings.telegramNote && <p className="text-[15px] text-white/65">{settings.telegramNote}</p>}
          </div>
        </div>

        {/* A sample of the channel: a question and the bot typing its answer. Decorative. */}
        <div aria-hidden className="tg-phone tg-loop mx-auto w-full max-w-[340px] md:max-w-none">
          <div className="flex items-center gap-3 border-b border-forest/10 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-forest font-bold text-lime">✦</span>
            <div className="leading-tight">
              <p className="text-[15px] font-extrabold text-forest">AI PRO קהילה</p>
              <p className="text-[13px] text-forest/60">קבוצה פתוחה, חינם</p>
            </div>
          </div>
          <div className="grid gap-2.5 p-4">
            <p className="tg-bubble tg-bubble-me tg-b1">תן לי פרומפט לעריכת וידאו</p>
            <p className="tg-bubble tg-bubble-bot tg-b2">
              הנה, תעתיק ותדביק ב־Claude Code
              <span className="mt-2 block rounded-lg bg-forest/[.07] px-2.5 py-1.5 font-mono text-[13px] ltr" dir="ltr">
                edit my video…
              </span>
            </p>
            <p className="tg-bubble tg-bubble-bot tg-typing tg-b3">
              <i /><i /><i />
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
