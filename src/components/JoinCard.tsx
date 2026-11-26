import type { SiteSettings } from "@/lib/settings-schema";

// The "join our community" card shown on the home page and under every guide. Everything about it is
// controlled from admin settings (link, logo, colours, texts, perks, the chat that plays inside the
// phone). It stays hidden until a link is set, so it never renders a dead button. The chat demo is
// CSS only: messages arrive and scroll up, a cursor moves to the join button and clicks it. It stops
// for prefers-reduced-motion.

const ICONS = {
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm4.9 13.6c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-2.3-.8-3.9-2.4-4.9-4.4-.3-.7-.5-1.5.3-2.3.3-.3.7-.4 1-.3l.6 1.4c.1.2 0 .4-.1.6l-.4.5c.6 1.1 1.4 1.9 2.5 2.4l.5-.6c.2-.2.4-.2.6-.1l1.4.7c.3.1.4.3.3.5Z",
  telegram:
    "M21.9 4.4 18.7 19.6c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.3c-.3.3-.5.5-1 .5l.4-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.6 13 1.9 11.5c-1-.3-1-1 .2-1.5L20.4 2.9c.9-.3 1.6.2 1.5 1.5Z",
  plain: "M4 4h16v12H8l-4 4V4Z",
} as const;

function Icon({ style, className }: { style: SiteSettings["joinStyle"]; className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd">
      <path d={ICONS[style]} />
    </svg>
  );
}

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

// "text | extra": the part after the bar is a code chip (line 3) or an inline button (line 5).
function split(line: string | undefined) {
  const [main = "", extra = ""] = (line ?? "").split("|").map((x) => x.trim());
  return { main, extra };
}

function Phone({ s }: { s: SiteSettings }) {
  const lines = s.joinChat.split("\n");
  const [m1, m2, m3, m4, m5] = [0, 1, 2, 3, 4].map((i) => split(lines[i]));
  const wa = s.joinStyle === "whatsapp";
  const me = (t: string) => (
    <p className="tgx-msg tgx-me">
      {t}
      {wa && <span className="tgx-ticks">✓✓</span>}
    </p>
  );
  return (
    <div aria-hidden className="tgx-phone mx-auto max-w-[340px]" style={{ "--screen-h": "340px" } as React.CSSProperties}>
      <div className="tgx-inner">
        <div className="tgx-head">
          <span className="tgx-ava">{s.joinLogo ? <img src={s.joinLogo} alt="" /> : "✦"}</span>
          <div className="leading-tight">
            <p className="text-[14px] font-extrabold">{s.joinHeaderName}</p>
            <p className="text-[12px] text-white/60">{s.joinHeaderSub}</p>
          </div>
        </div>
        <div className="tgx-screen">
          <div className="tgx-chat">
            {m1.main && (
              <Row id="m1">
                <p className="tgx-msg tgx-bot">{m1.main}</p>
              </Row>
            )}
            {m2.main && <Row id="m2">{me(m2.main)}</Row>}
            <Typing id="t1" />
            {m3.main && (
              <Row id="m3">
                <p className="tgx-msg tgx-bot">
                  {m3.main}
                  {m3.extra && <span className="tgx-code">{m3.extra}</span>}
                </p>
              </Row>
            )}
            {m4.main && <Row id="m4">{me(m4.main)}</Row>}
            <Typing id="t2" />
            {m5.main && (
              <Row id="m5">
                <p className="tgx-msg tgx-bot">
                  {m5.main}
                  {m5.extra && <span className="tgx-inline">{m5.extra}</span>}
                </p>
              </Row>
            )}
          </div>
          {s.joinToast && <div className="tgx-toast">{s.joinToast}</div>}
        </div>
        <div className="tgx-joinbar">
          <span className="tgx-join">{s.joinButton}</span>
        </div>
      </div>
      <svg className="tgx-cursor" viewBox="0 0 24 24">
        <path d="M4 2.5 19.5 12l-7 1.6L9 20.5 4 2.5Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function JoinCard({
  settings: s,
  place,
  compact = false,
  preview = false,
}: {
  settings: SiteSettings;
  place: "home" | "resource";
  compact?: boolean;
  preview?: boolean;
}) {
  if (!s.joinOn || !s.joinUrl || (!s.joinTitle && !s.joinText)) return null;
  const perks = s.joinPerks
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
  const vars = {
    "--j-bg": s.joinBg,
    "--j-g1": s.joinGlow1,
    "--j-g2": s.joinGlow2,
    "--j-b1": s.joinBtnFrom,
    "--j-b2": s.joinBtnTo,
    "--j-bt": s.joinBtnText,
    "--j-text": s.joinTextColor,
  } as React.CSSProperties;
  const link = {
    href: preview ? undefined : s.joinUrl,
    target: "_blank",
    rel: "noopener noreferrer",
    "data-track": "join_click",
    "data-track-place": compact ? `${place}-card` : place,
    "data-track-style": s.joinStyle,
  } as const;
  const logo = (size: string) =>
    s.joinLogo ? (
      <img src={s.joinLogo} alt="" className={`${size} shrink-0 rounded-full border-2 border-white/30 object-cover`} />
    ) : null;
  const cls = `tgx tgx-${s.joinStyle === "whatsapp" ? "wa" : s.joinStyle === "plain" ? "plain" : "tg"}`;

  if (compact) {
    // Tall card for the empty column beside the headline on wide screens.
    return (
      <aside aria-label={s.joinTitle || "הצטרפות לקהילה"} className={`${cls} grid gap-5 rounded-[30px] p-6`} style={vars}>
        <div className="flex items-center gap-3">
          {logo("size-14")}
          {s.joinTitle && <p className="font-display text-[clamp(40px,3.6vw,54px)] leading-[0.92]">{s.joinTitle}</p>}
        </div>
        {perks.length > 0 && (
          <ul className="grid gap-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[16px] font-bold">
                <span aria-hidden className="mt-[7px] size-2.5 shrink-0 rounded-full" style={{ background: "var(--j-b1)" }} />
                {p}
              </li>
            ))}
          </ul>
        )}
        <Phone s={s} />
        <div className="grid gap-2">
          <a {...link} className="tgx-cta w-full !text-[18px]">
            <Icon style={s.joinStyle} className="size-6" />
            {s.joinButton}
          </a>
          {s.joinNote && <p className="text-center text-[13px] opacity-70">{s.joinNote}</p>}
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label={s.joinTitle || "הצטרפות לקהילה"} className={`${cls} rounded-[32px]`} style={vars}>
      <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_.9fr] md:gap-12">
        <div className="grid content-start gap-5">
          {logo("size-16")}
          {s.joinTitle && <h2 className="font-display text-[clamp(44px,8vw,72px)] leading-[0.92]">{s.joinTitle}</h2>}
          {s.joinText && <p className="max-w-[46ch] text-[18px] leading-relaxed opacity-80">{s.joinText}</p>}
          {perks.length > 0 && (
            <ul className="grid gap-2.5">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[18px] font-bold">
                  <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center rounded-full"
                    style={{ background: "linear-gradient(135deg, var(--j-b1), var(--j-b2))", color: "var(--j-bt)" }}
                  >
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
              <Icon style={s.joinStyle} className="size-7" />
              {s.joinButton}
            </a>
            {s.joinNote && <p className="text-[15px] opacity-70">{s.joinNote}</p>}
          </div>
        </div>
        <Phone s={s} />
      </div>
    </aside>
  );
}
