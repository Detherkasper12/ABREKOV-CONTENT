"use client";

import { useEffect, useRef } from "react";

// A quiet drifting starfield in the section's --accent and --fg colours (agents course page).
export function Stars() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const x = c?.getContext("2d");
    if (!c || !x) return;
    const cs = getComputedStyle(c);
    const accent = cs.getPropertyValue("--accent").trim() || "#D6FF3A";
    const fg = cs.getPropertyValue("--fg").trim() || "#EFEDE8";
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let st: { x: number; y: number; z: number; l: boolean }[] = [];
    let raf = 0;
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect();
      c.width = r.width * d;
      c.height = r.height * d;
      x.setTransform(d, 0, 0, d, 0, 0);
      st = Array.from({ length: 220 }, () => ({ x: Math.random() * r.width, y: Math.random() * r.height, z: 0.2 + Math.random() * 0.8, l: Math.random() < 0.12 }));
    };
    const draw = (t: number) => {
      const r = c.getBoundingClientRect();
      x.clearRect(0, 0, r.width, r.height);
      for (const s of st) {
        const tw = RM ? 1 : 0.55 + 0.45 * Math.sin(t * 0.002 * s.z * 3 + s.x);
        x.globalAlpha = s.l ? 0.85 * tw : 0.6 * tw * s.z;
        x.fillStyle = s.l ? accent : fg;
        x.beginPath();
        x.arc(s.x, (s.y - t * 0.006 * s.z + r.height * 10) % r.height, s.z * 1.4, 0, 6.283);
        x.fill();
      }
      if (!RM) raf = requestAnimationFrame(draw);
    };
    size();
    addEventListener("resize", size);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);
  return <canvas ref={ref} className="stars" aria-hidden />;
}
