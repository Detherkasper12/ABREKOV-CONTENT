import type { SiteSettings } from "@/lib/settings-schema";

// The offer after a free guide: full access to the library, handled in a chat with Dima for now
// (no checkout is connected). Instagram's ig.me link opens the DM directly.
function memberLink(settings: SiteSettings) {
  const handle = settings.instagramHandle.replace(/^@/, "");
  if (handle) return { href: `https://ig.me/m/${encodeURIComponent(handle)}`, external: true, method: "instagram" };
  if (settings.contactEmail) return { href: `mailto:${settings.contactEmail}`, external: false, method: "email" };
  return null;
}

export function MembershipCta({ settings, slug }: { settings: SiteSettings; slug?: string }) {
  const link = memberLink(settings);
  if (!link || (!settings.memberTitle && !settings.memberText)) return null;
  return (
    <aside className="card grid content-start justify-items-start gap-3 p-6 sm:p-8">
      {settings.memberTitle && <h2 className="text-[clamp(22px,4vw,28px)] leading-tight font-extrabold text-forest">{settings.memberTitle}</h2>}
      {settings.memberText && <p className="max-w-[52ch] text-[17px] leading-relaxed">{settings.memberText}</p>}
      <a
        href={link.href}
        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        data-track="membership_click"
        data-track-slug={slug}
        data-track-place={slug ? "resource" : "home"}
        data-track-method={link.method}
        className="btn-primary mt-2"
      >
        {settings.memberButton || "לכתוב לי בצ'אט"}
      </a>
    </aside>
  );
}
