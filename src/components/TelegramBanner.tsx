import type { SiteSettings } from "@/lib/settings-schema";

// Invitation to the Telegram channel. Shown on the home page and under every guide; hidden until
// a channel link is set in admin settings, so it never renders a dead button.
export function TelegramBanner({ settings, place }: { settings: SiteSettings; place: "home" | "resource" }) {
  const href = settings.telegramUrl;
  if (!href || (!settings.telegramTitle && !settings.telegramText)) return null;
  return (
    <aside
      aria-label="ערוץ הטלגרם"
      className="relative overflow-hidden rounded-[28px] border-2 border-lime/70 bg-forest p-6 text-white sm:p-8"
    >
      <div className="relative grid items-center gap-5 sm:grid-cols-[auto_1fr_auto] sm:gap-7">
        <span aria-hidden className="grid size-16 place-items-center rounded-full bg-lime text-forest sm:size-[72px]">
          <svg viewBox="0 0 24 24" className="size-8 sm:size-9" fill="currentColor">
            <path d="M21.9 4.4 18.7 19.6c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.3c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13 1.9 11.5c-1-.3-1-1 .2-1.5L20.4 2.9c.9-.3 1.6.2 1.5 1.5Z" />
          </svg>
        </span>
        <div className="grid gap-1.5">
          {settings.telegramTitle && (
            <h2 className="text-[clamp(22px,4vw,30px)] leading-tight font-extrabold text-white">{settings.telegramTitle}</h2>
          )}
          {settings.telegramText && <p className="max-w-[52ch] text-[17px] leading-relaxed text-white/80">{settings.telegramText}</p>}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-track="telegram_click"
          data-track-place={place}
          className="btn-lime min-h-12 w-full px-6 text-[17px] sm:w-auto"
        >
          {settings.telegramButton || "להצטרפות לערוץ"}
        </a>
      </div>
    </aside>
  );
}
