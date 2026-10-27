import type { SiteSettings } from "@/lib/settings-schema";
import { instagramUrl } from "./SiteChrome";

export function contactLink(settings: SiteSettings) {
  if (settings.contactEmail) return { href: `mailto:${settings.contactEmail}`, external: false, via: "" };
  if (settings.instagramHandle) return { href: instagramUrl(settings.instagramHandle), external: true, via: " ב־Instagram" };
  return null;
}

// The one collaboration block, used on the homepage and at the end of every resource page.
export function ContactCta({
  settings,
  title,
  text,
  button,
  place,
}: {
  settings: SiteSettings;
  title: string;
  text: string;
  button: string;
  place: "home" | "resource";
}) {
  const link = contactLink(settings);
  if (!link || (!title && !text)) return null;
  return (
    <aside className="grid content-start justify-items-start gap-3 rounded-[18px] bg-forest p-6 text-[#e4e7e4] sm:p-8">
      <span aria-hidden className="block size-3 bg-lime outline-2 outline-[#e4e7e4]" />
      {title && <h2 className="text-[clamp(24px,4vw,30px)] leading-tight font-extrabold text-white">{title}</h2>}
      {text && <p className="max-w-[52ch] text-[17px] leading-relaxed">{text}</p>}
      <a
        href={link.href}
        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        data-track="collab_cta_click"
        data-track-place={place}
        data-track-method={link.external ? "instagram" : "email"}
        className="btn-lime mt-2"
      >
        {button || "בוא נדבר"}
        {link.via}
      </a>
    </aside>
  );
}
