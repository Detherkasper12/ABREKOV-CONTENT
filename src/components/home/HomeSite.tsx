"use client";

import { useEffect, useRef } from "react";
import { Typo } from "../Typo";
import { startStory } from "./engine";

// The .site root of the home page. Starts the scroll engine once the story markup is on the page.
export function HomeSite({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? startStory(ref.current) : undefined), []);
  return (
    <div className="site" ref={ref}>
      {children}
      <Typo />
    </div>
  );
}

// Sets the canvas scale before the first paint, so the story never flashes at the wrong size.
export const SCALE_SCRIPT = `(function(){var w=innerWidth,h=innerHeight,m=w<760;document.documentElement.style.setProperty('--s',Math.min(w/(m?390:1440),h/(m?800:900)))})()`;
