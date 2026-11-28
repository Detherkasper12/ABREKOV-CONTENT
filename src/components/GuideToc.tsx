"use client";

import { useEffect, useState } from "react";

// The steps of a guide: a sticky rail beside the text on a wide screen, a numbered list above it on a phone.
// The step being read is marked, and a thin bar at the top of the screen shows how far you are.
export function GuideToc({ items }: { items: { id: string; no: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = innerHeight * 0.3;
        let cur = items[0]?.id ?? "";
        for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
        setActive(cur);
        const body = document.querySelector(".gd .body");
        if (body) {
          const r = body.getBoundingClientRect();
          setProgress(Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height)));
        }
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <>
      <div className="rd-bar" aria-hidden style={{ transform: `scaleX(${progress})` }} />
      <nav className="toc" aria-label="שלבי המדריך">
        <span className="m">IN THIS GUIDE · {String(items.length).padStart(2, "0")}</span>
        <ol>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={i.id === active ? "step" : undefined}>
                <span className="n m">{i.no}</span>
                <span>{i.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
