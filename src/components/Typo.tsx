"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Hebrew micro-typography for every text on the public site, including text Dima types in the admin.
// - A short word (up to 2 letters, or a number) is glued to the word after it, so it never hangs at a line end.
// - A dash or an arrow is glued to the word before it.
// - The last two words of a block (and of each line before a <br>) are glued, so no line holds one word.
// CSS text-wrap: balance / pretty does the same in new browsers; this covers the rest and is deterministic.
// Runs after hydration and only rewrites text node values, so React's tree is untouched.

const NBSP = " ";
const BLOCKS =
  "p,li,h1,h2,h3,h4,h5,h6,dd,dt,summary,blockquote,figcaption,label,button,.btn,.ds,.tt,.lead,.say,.done,.err,.fe,.t,.hl,.val,.sub,.tx,.tile,.cards b,.offer h3,td,th,.codebox-head span,.card span";
const SKIP = "pre,code,script,style,textarea,input,select,[data-notypo],.big,.tc,.log,.ltr";
// The longest pair we glue at the end. Longer pairs could not fit a narrow column, so they stay breakable.
const MAX_TAIL = 22;

const short = (w: string) => {
  const bare = w.replace(/[^\p{L}\p{N}]/gu, "");
  return bare.length > 0 && (bare.length <= 2 || /^\d+$/.test(bare));
};

function glueShort(text: string) {
  // word + space + next word: glue when the first word is short. Also glue " ←", " —", " –" to the word before.
  // Split on plain spaces only; a non-breaking space already in the text stays inside its word.
  const words = text.split(" ");
  let out = words[0];
  let glued = false;
  for (let k = 1; k < words.length; k++) {
    const glue: boolean = !glued && short(words[k - 1]) && words[k] !== "";
    out += (glue ? NBSP : " ") + words[k];
    glued = glue;
  }
  return out
    .replace(/Claude Code/g, `Claude${NBSP}Code`)
    .replace(/ ([←→—–·:])/g, `${NBSP}$1`);
}

function textNodes(block: Element): Text[][] {
  // Text nodes of a block, split into lines at <br> and skipping nested blocks (they get their own pass).
  const lines: Text[][] = [[]];
  const walk = (el: Node) => {
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 3) lines[lines.length - 1].push(n as Text);
      else if (n.nodeType === 1) {
        const e = n as Element;
        if (e.tagName === "BR") lines.push([]);
        else if (!e.matches(BLOCKS) && !e.matches(SKIP)) walk(e);
      }
    }
  };
  walk(block);
  return lines;
}

function glueTail(nodes: Text[]) {
  // Find the last breakable space of the line and replace it, if the last two words are short enough.
  const full = nodes.map((n) => n.nodeValue ?? "").join("");
  const trimmed = full.replace(/\s+$/, "");
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace <= 0) return;
  const prevSpace = trimmed.slice(0, lastSpace).search(/ [^ ]*$/);
  const tail = trimmed.slice(prevSpace + 1);
  if (tail.length > MAX_TAIL) return;
  let offset = 0;
  for (const n of nodes) {
    const v = n.nodeValue ?? "";
    if (lastSpace >= offset && lastSpace < offset + v.length) {
      const i = lastSpace - offset;
      n.nodeValue = v.slice(0, i) + NBSP + v.slice(i + 1);
      return;
    }
    offset += v.length;
  }
}

// The text React rendered, and the text we last wrote. A node is redone from its original when the
// width changes, and taken as new when React (or the story engine) has written something else into it.
const orig = new WeakMap<Text, string>();
const done = new WeakMap<Text, string>();

export function typeset(root: ParentNode, force = false) {
  for (const block of Array.from(root.querySelectorAll(BLOCKS))) {
    if (block.closest(SKIP)) continue;
    for (const line of textNodes(block)) {
      if (!line.length) continue;
      const fresh = line.some((n) => done.get(n) !== n.nodeValue);
      if (!fresh && !force) continue;
      for (const n of line) {
        if (done.get(n) !== n.nodeValue) orig.set(n, n.nodeValue ?? "");
        n.nodeValue = glueShort(orig.get(n) ?? n.nodeValue ?? "");
      }
      glueTail(line);
      for (const n of line) unglueBroken(n);
      for (const n of line) done.set(n, n.nodeValue ?? "");
    }
  }
}

// A glued run wider than its column would be cut mid-word by the browser (a lone "." on a line).
// Each glued run is measured; one that no longer fits on a line breaks normally again, keeping only
// the glue on its last two words when those two fit.
function onOneLine(n: Text, from: number, to: number) {
  const r = document.createRange();
  r.setStart(n, from);
  r.setEnd(n, to);
  const rects = Array.from(r.getClientRects()).filter((x) => x.width > 0);
  if (!rects.length) return true;
  const tops = rects.map((x) => x.top);
  return Math.max(...tops) - Math.min(...tops) < rects[0].height * 0.5;
}

function unglueBroken(n: Text) {
  const v = n.nodeValue ?? "";
  if (!v.includes(NBSP)) return;
  const re = /[^ \t\n]*\u00A0[^ \t\n]*/g;
  const broken: [number, string][] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(v))) if (!onOneLine(n, m.index, m.index + m[0].length)) broken.push([m.index, m[0]]);
  if (!broken.length) return;
  let out = v;
  for (const [i, run] of broken) out = out.slice(0, i) + run.replaceAll(NBSP, " ") + out.slice(i + run.length);
  n.nodeValue = out;
  // Try to keep the last two words of each broken run together.
  for (const [i, run] of broken) {
    const sp = run.replaceAll(NBSP, " ").lastIndexOf(" ");
    const prev = run.replaceAll(NBSP, " ").lastIndexOf(" ", sp - 1);
    if (sp <= 0) continue;
    const cur: string = n.nodeValue ?? "";
    n.nodeValue = cur.slice(0, i + sp) + NBSP + cur.slice(i + sp + 1);
    if (!onOneLine(n, i + prev + 1, i + run.length)) n.nodeValue = cur;
  }
}

export function Typo() {
  const path = usePathname();
  useEffect(() => {
    const roots = () => Array.from(document.querySelectorAll(".site main, .site .top, .site .ft"));
    roots().forEach((r) => typeset(r));
    // Line breaks move once the web fonts arrive.
    document.fonts?.ready.then(() => roots().forEach((r) => typeset(r, true)));
    // New text (a form's thank-you line, filtered rows) gets the same treatment. The home story's
    // animated counters live in .sc and change every frame, so those mutations are ignored.
    let t = 0;
    const mo = new MutationObserver((list) => {
      if (list.every((m) => (m.target as Element).closest?.(".sc"))) return;
      clearTimeout(t);
      t = window.setTimeout(() => roots().forEach((r) => typeset(r)), 120);
    });
    roots().forEach((r) => mo.observe(r, { childList: true, subtree: true }));
    // A new width (rotating a phone, resizing a window) moves every line break: redo from the original text.
    let w = window.innerWidth;
    let rt = 0;
    const onResize = () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(rt);
      rt = window.setTimeout(() => roots().forEach((r) => typeset(r, true)), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      mo.disconnect();
      clearTimeout(t);
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
    };
  }, [path]);
  return null;
}
