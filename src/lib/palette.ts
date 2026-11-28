import type { CSSProperties } from "react";
import { PALETTES, type PaletteKey } from "./home-schema";

export const isPalette = (k: string): k is PaletteKey => Object.hasOwn(PALETTES, k);
export const palette = (k: string) => PALETTES[isPalette(k) ? k : "ink"];

// CSS custom properties that the .site styles read for a coloured block (scene, offer, tile, chip).
export function paletteVars(k: string): CSSProperties {
  const p = palette(k);
  return {
    "--bg": p.bg,
    "--fg": p.fg,
    "--accent": p.accent,
    "--accentInk": p.accentInk,
    "--soft": p.soft,
    "--softInk": p.softInk,
    "--pmu": p.mu,
    "--dot": p.dot,
  } as CSSProperties;
}

// Guide rows fill with the topic colour on hover: [fill, text on it].
export function rowColors(k: string): CSSProperties {
  const p = palette(k);
  const pair: Record<string, [string, string]> = {
    orange: [p.bg, p.fg],
    maroon: [p.fg, p.bg],
    paper: [p.accent, p.accentInk],
    space: [p.accent, p.accentInk],
    blue: [p.bg, p.fg],
    ink: [p.fg, p.bg],
  };
  const [a, ai] = pair[isPalette(k) ? k : "ink"];
  return { "--a": a, "--ai": ai } as CSSProperties;
}

// A guide without its own colour gets one from its category, so the library never looks monochrome.
const CATEGORY_PALETTE: Record<string, PaletteKey> = { ai: "space", design: "paper", development: "orange", tools: "maroon", templates: "orange" };
export function guidePalette(accent: string, category: string, index = 0): PaletteKey {
  if (isPalette(accent)) return accent;
  if (CATEGORY_PALETTE[category]) return CATEGORY_PALETTE[category];
  const cycle: PaletteKey[] = ["maroon", "paper", "orange", "space"];
  return cycle[index % cycle.length];
}
