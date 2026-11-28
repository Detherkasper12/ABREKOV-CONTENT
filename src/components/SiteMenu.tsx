"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "./Icons";

// The site's navigation. On a phone: a dock at the bottom of the screen (thumb reach), which slides away
// while you scroll down and comes back when you scroll up. Everywhere: a "menu" that opens the whole map of
// the site as big coloured rows, one colour per section, the same colours the home story uses.

export type MenuItem = { href: string; label: string; note: string; c: string; ci: string; external?: boolean };

export const MENU: MenuItem[] = [
  { href: "/resources", label: "מדריכים", note: "חינם, בלי הרשמה", c: "#D6FF3A", ci: "#0B0B0B" },
  { href: "/agents", label: "קורס סוכנים", note: "בקרוב · רשימת המתנה", c: "#695AC6", ci: "#EFEDE8" },
  { href: "/video-editing", label: "קורס עריכת וידאו", note: "בקרוב · רשימת המתנה", c: "#FFD7D8", ci: "#86242C" },
  { href: "/learn", label: "ללמוד עוד", note: "מה בא לך ללמוד?", c: "#FD572A", ci: "#0B0B0B" },
  { href: "/#about", label: "עליי", note: "מי אני ומה אני בונה", c: "#EFEDE8", ci: "#0B0B0B" },
];

const DOCK = [
  { href: "/", label: "בית" },
  { href: "/resources", label: "מדריכים" },
  { href: "/agents", label: "קורסים" },
];

export function SiteMenu({ extra = [] }: { extra?: { label: string; url: string }[] }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const path = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Close on navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- route change closes the sheet
  useEffect(() => setOpen(false), [path]);

  // Esc closes; focus goes into the sheet and back to the button that opened it; the page under it does not scroll.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>("a,button")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [open]);

  // The dock steps aside while reading down and returns on the way up.
  useEffect(() => {
    let y = scrollY, raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = scrollY - y;
        if (Math.abs(d) > 8) { setHidden(d > 0 && scrollY > 120); y = scrollY; }
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const toggle = (e: React.MouseEvent<HTMLElement>) => {
    opener.current = e.currentTarget;
    setOpen((o) => !o);
  };
  const isCur = (href: string) => (href.includes("#") ? false : href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      <button type="button" className="mbtn" aria-expanded={open} aria-controls="site-menu" onClick={toggle}>
        <span className="burg" aria-hidden>
          <i />
          <i />
        </span>
        תפריט
      </button>

      <nav className={`dock${hidden && !open ? " away" : ""}`} aria-label="ניווט מהיר">
        {DOCK.map((d) => (
          <Link key={d.href} href={d.href} aria-current={isCur(d.href) ? "page" : undefined}>
            {d.label}
          </Link>
        ))}
        <button type="button" className="dk-menu" aria-expanded={open} aria-controls="site-menu" onClick={toggle}>
          <span className="burg" aria-hidden>
            <i />
            <i />
          </span>
          <span className="sr">תפריט</span>
        </button>
      </nav>

      <div id="site-menu" ref={panel} className={`sheet${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-label="תפריט האתר" hidden={!open} dir="rtl" lang="he">
        <div className="sh-top">
          <span className="m">ABREKOV · MAP</span>
          <button type="button" className="sh-x" onClick={() => setOpen(false)}>
            סגירה
          </button>
        </div>
        <ol className="sh-list">
          {MENU.map((m, i) => (
            <li key={m.href} style={{ "--i": i, "--c": m.c, "--ci": m.ci } as React.CSSProperties}>
              <Link href={m.href} aria-current={isCur(m.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                <span className="ix m">{String(i + 1).padStart(2, "0")}</span>
                <span className="lbl F">{m.label}</span>
                <span className="nt">{m.note}</span>
                <span className="go" aria-hidden>
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {extra.length > 0 && (
          <div className="sh-ext">
            {extra.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                <bdi>{l.label}</bdi>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
