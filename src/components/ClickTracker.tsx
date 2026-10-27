"use client";

import { track } from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/next";
import { useEffect } from "react";

// Vercel Web Analytics: cookieless page views, referrers and UTM tags. Admin pages are left out.
export function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={(e) => (new URL(e.url).pathname.startsWith("/admin") ? null : e)} />
      <ClickTracker />
    </>
  );
}

// One delegated listener instead of wiring analytics into every link and button.
// Elements opt in with data-track="event" plus data-track-* properties. Outbound links
// are tracked automatically by hostname. Only ids and hostnames are sent, never copied
// text or email addresses.
function ClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track], a[href]");
      if (!el || location.pathname.startsWith("/admin")) return;
      const name = el.dataset.track;
      if (name) {
        const props: Record<string, string> = {};
        for (const [k, v] of Object.entries(el.dataset)) {
          if (k.startsWith("track") && k !== "track" && v) props[k.slice(5).toLowerCase()] = v;
        }
        track(name, { ...props, path: location.pathname });
        return;
      }
      const href = el.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) track("contact_click", { method: "email", path: location.pathname });
      else if (/^https?:\/\//.test(href)) {
        const host = new URL(href).hostname;
        if (host !== location.hostname) track("outbound_click", { host, path: location.pathname });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
