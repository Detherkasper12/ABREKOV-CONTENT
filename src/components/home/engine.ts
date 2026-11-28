// Scroll engine for the home story. React renders the markup once; this file only moves it.
// Each scene is a tall section with a sticky stage; its progress p (0..1) drives everything.
// Scenes are found by template (data-tpl), so Dima can add, remove and reorder them in the admin.

type El = HTMLElement;
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, a: number, b: number) => cl((p - a) / (b - a));
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const back = (t: number) => {
  const c = 1.6;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// "₪12,480" -> prefix, number, suffix, decimals, grouping. Anything else stays as written.
export function parseBig(text: string) {
  const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { pre: m[1], to: Number(raw.replace(/,/g, "")), post: m[3], dec, group: raw.includes(",") };
}
const fmtNum = (n: number, dec: number, group: boolean) =>
  group ? n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) : n.toFixed(dec);

// "00:01:00" or "1:30" -> seconds of the clip the timecode counts through.
export function parseDuration(text: string) {
  const parts = text.split(":").map((x) => Number(x));
  if (parts.some((x) => Number.isNaN(x)) || !parts.length) return 60;
  const s = parts.reduce((acc, x) => acc * 60 + x, 0);
  return s > 0 ? Math.min(s, 3600) : 60;
}

const AG = {
  d: { c: [560, 460], nodes: [[200, 230], [150, 460], [220, 690], [860, 215], [880, 720]], orb: [[560, 460, 330, 120, -18], [560, 460, 420, 170, 12]] },
  m: { c: [195, 320], nodes: [[70, 160], [40, 320], [80, 470], [300, 170], [305, 470]], orb: [[195, 320, 150, 60, -18], [195, 320, 185, 90, 12]] },
};

export function startStory(site: El): () => void {
  const $ = <T extends Element = El>(s: string, r: ParentNode = site) => r.querySelector(s) as T;
  const $$ = <T extends Element = El>(s: string, r: ParentNode = site) => [...r.querySelectorAll(s)] as T[];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mob = false, CW = 1440, CH = 900, S = 1;
  let mx = 0, my = 0;
  let dragging = false, heroK = 0;
  let alive = true;
  const off: (() => void)[] = [];
  const on = (t: EventTarget, ev: string, fn: EventListener, opt?: AddEventListenerOptions) => {
    t.addEventListener(ev, fn, opt);
    off.push(() => t.removeEventListener(ev, fn, opt));
  };

  const top = $("[data-top]");
  const hero = $("[data-hero]");
  const fin = $("[data-fin]");
  const scenes = $$(".sc");
  const all = [hero, ...scenes, fin].filter(Boolean);

  const prog = (el: El) => {
    const r = el.getBoundingClientRect();
    return cl(-r.top / (r.height - innerHeight));
  };
  const inView = (el: El) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  };

  /* ---------- per scene: build the moving parts once ---------- */
  type Scene = { el: El; tpl: string; run: (p: number, t: number) => void; layout?: () => void; moving?: boolean; enter: number };
  const list: Scene[] = [];

  for (const el of scenes) {
    const tpl = el.dataset.tpl ?? "";
    if (tpl === "fintech") {
      const big = $("[data-big]", el);
      const nb = parseBig(big?.dataset.big ?? "");
      const flies = $$("[data-fly]", el);
      const line = $<SVGPolylineElement>("polyline", el);
      const tg = $(".tgl", el);
      const hl = $(".hl", el), val = $(".val", el), bg = $(".sbg", el), cv = $(".cv", el);
      list.push({
        el, tpl, enter: 0.12,
        run(p) {
          const w = eio(seg(p, 0, 0.22));
          bg.style.clipPath = `circle(${Math.hypot(innerWidth, innerHeight) * w}px at 72% 62%)`;
          cv.style.opacity = String(seg(p, 0.12, 0.2));
          if (big && nb) big.textContent = nb.pre + fmtNum(nb.to * eo(seg(p, 0.18, 0.6)), nb.dec, nb.group) + nb.post;
          if (big) big.style.transform = `translateY(${(1 - eo(seg(p, 0.14, 0.4))) * 80}px)`;
          flies.forEach((c, i) => {
            const [dx, dy, dr] = (c.dataset.fly ?? "0,0,0").split(",").map(Number), r = Number(c.dataset.r ?? 0);
            const t = eo(seg(p, 0.3 + i * 0.06, 0.5 + i * 0.06)), f = mob ? 0.45 : 1;
            const drift = Math.sin(p * 3 + i) * 6 * (RM ? 0 : 1);
            c.style.transform = `translate(${dx * (1 - t) * f}px,${dy * (1 - t) * f + drift}px) rotate(${r + dr * (1 - t)}deg)`;
            c.style.opacity = String(cl(t * 2));
          });
          if (line) line.style.strokeDashoffset = String(1 - eo(seg(p, 0.5, 0.72)));
          tg?.classList.toggle("on", p > 0.72);
          const h = seg(p, 0.22, 0.34);
          if (hl) { hl.style.opacity = String(h); hl.style.transform = `translateY(${(1 - h) * 20}px)`; }
          if (val) val.style.opacity = String(seg(p, 0.6, 0.7));
        },
      });
    } else if (tpl === "timeline") {
      const strip = $(".strip", el), caps = $(".caps", el), wave = $(".wave", el), tc = $(".tc", el);
      const bg = $(".sbg", el), cv = $(".cv", el), val = $(".val", el);
      const frames = $$(".fr", strip);
      const dur = parseDuration(el.dataset.dur ?? "");
      const R = rng(7);
      wave.innerHTML = Array.from({ length: 160 }, () => `<i style="height:${18 + R() * 82}%"></i>`).join("");
      const names = ["דנה", "yoni", "מיכל", "alex", "רון", "noa", "עידו", "sam", "ליה", "max", "tom", "שיר"];
      const curs: { x: number; y: number; ph: number; sp: number; a: number; d: number }[] = [];
      let ch = "";
      for (let i = 0; i < 64; i++) {
        ch += `<div class="cur"><svg viewBox="0 0 22 22" aria-hidden="true"><path d="M2 2 L2 18 L6.6 13.8 L9.8 20.5 L12.6 19.2 L9.5 12.6 L15.8 12.6 Z" style="fill:var(--fg);stroke:var(--bg)" stroke-width="1.5" stroke-linejoin="round"/></svg>${i % 6 === 0 ? `<span>${names[((i / 6) | 0) % 12]}</span>` : ""}</div>`;
        curs.push({ x: R(), y: R(), ph: R() * 6.28, sp: 0.4 + R() * 0.9, a: 8 + R() * 22, d: R() - 0.5 });
      }
      const cw = $(".curs", el);
      cw.innerHTML = ch;
      const curEls = $$(".cur", cw);
      const bars = [...wave.children] as El[];
      list.push({
        el, tpl, enter: 0.08, moving: true,
        run(p, t) {
          const c = eio(seg(p, 0, 0.12));
          bg.style.transform = `translateY(${(1 - c) * 100}%)`;
          cv.style.opacity = String(seg(p, 0.06, 0.12));
          const fw = mob ? 200 : 270, head = mob ? 195 : 720, n = frames.length;
          const h = eio(seg(p, 0.12, 0.92));
          const pos = h * Math.max(0, n - (mob ? 2 : 4));
          strip.style.transform = `translateX(${head - fw / 2 - pos * fw}px)`;
          frames.forEach((f, i) => f.classList.toggle("on", Math.round(pos) === i));
          const capW = caps.scrollWidth;
          caps.style.transform = `translateX(${head - h * capW}px)`;
          let acc = 0;
          const at = h * capW;
          for (const s of [...caps.children] as El[]) {
            const w = s.offsetWidth + 12;
            s.classList.toggle("on", at >= acc && at < acc + w);
            acc += w;
          }
          const lit = Math.round(h * bars.length);
          bars.forEach((b, i) => b.classList.toggle("on", i < lit));
          const sec = h * dur, fr = Math.floor((sec % 1) * 25);
          const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = Math.floor(sec % 60);
          tc.textContent = [hh, mm, ss, fr].map((x) => String(x).padStart(2, "0")).join(":");
          const topY = mob ? 200 : 300, hgt = mob ? 360 : 470;
          curEls.forEach((ce, i) => {
            const q = curs[i];
            const k = RM ? 0 : 1;
            const ox = Math.sin(t * 0.001 * q.sp + q.ph) * q.a * k, oy = Math.cos(t * 0.0013 * q.sp + q.ph) * q.a * 0.7 * k;
            ce.style.transform = `translate(${q.x * CW * 1.1 - CW * 0.05 + q.d * h * 300 + ox}px,${topY + q.y * hgt + oy}px)`;
            ce.style.opacity = String(seg(p, 0.1 + q.y * 0.1, 0.2 + q.y * 0.1));
          });
          if (val) val.style.opacity = String(seg(p, 0.5, 0.6));
        },
      });
    } else if (tpl === "bento") {
      const bg = $(".sbg", el), cv = $(".cv", el);
      const tiles = $$(".b", el);
      const newmod = $(".new", el);
      const R = rng(20);
      const fly = tiles.map(() => [(R() - 0.5) * 900, 300 + R() * 300, (R() - 0.5) * 40]);
      list.push({
        el, tpl, enter: 0.1,
        run(p) {
          const v = eio(seg(p, 0, 0.16));
          bg.style.clipPath = `inset(${(1 - v) * 50}% ${(1 - v) * 50}% round ${(1 - v) * 200}px)`;
          cv.style.opacity = String(seg(p, 0.1, 0.16));
          tiles.forEach((b, i) => {
            const [dx, dy, rr] = fly[i];
            const t = seg(p, 0.16 + i * 0.075, 0.3 + i * 0.075), e = back(t);
            b.style.transform = `translate(${dx * (1 - e) * (mob ? 0.4 : 1)}px,${dy * (1 - e)}px) rotate(${rr * (1 - e)}deg) scale(${0.7 + 0.3 * e})`;
            b.style.opacity = String(cl(t * 3));
            $$("[data-to]", b).forEach((n) => {
              const nb = parseBig(n.dataset.to ?? "");
              if (!nb) return;
              const c = eo(seg(p, 0.25 + i * 0.075, 0.55 + i * 0.075));
              n.textContent = nb.pre + fmtNum(nb.to * c, nb.dec, nb.group) + nb.post;
            });
            $$(".bars i", b).forEach((bar, j) => (bar.style.transform = `scaleY(${eo(seg(p, 0.3 + i * 0.075 + j * 0.015, 0.45 + i * 0.075 + j * 0.015))})`));
          });
          if (newmod) newmod.style.transform = `scale(${back(seg(p, 0.85, 0.95))})`;
        },
      });
    } else if (tpl === "agent") {
      const cvs = $<HTMLCanvasElement>("canvas", el), ctx = cvs.getContext("2d");
      const cv = $(".cv", el), g = $<SVGSVGElement>("svg.graph", el), core = $(".core", el), tasks = $(".tasks", el), clock = $(".clock", el);
      const nodes = $$(".node", el), logs = $$(".log div", el);
      const cs = getComputedStyle(el);
      const accent = cs.getPropertyValue("--accent").trim() || "#D6FF3A";
      const fg = cs.getPropertyValue("--fg").trim() || "#EFEDE8";
      let stars: { x: number; y: number; z: number; l: boolean }[] = [];
      let L = AG.d;
      const layout = () => {
        const base = mob ? AG.m : AG.d;
        // Keep every task pill inside the canvas: long task names would run off a phone screen.
        nodes.forEach((nd, i) => { nd.style.left = `${base.nodes[i][0]}px`; nd.style.top = `${base.nodes[i][1]}px`; });
        L = {
          ...base,
          nodes: base.nodes.map((n, i) => {
            const w = nodes[i] ? nodes[i].offsetWidth : 0;
            return [cl(n[0], w / 2 + 8, CW - w / 2 - 8), n[1]];
          }),
        };
        const [cx, cy] = L.c;
        g.setAttribute("viewBox", `0 0 ${CW} ${CH}`);
        g.innerHTML =
          L.orb.map((o) => `<ellipse class="orb" cx="${o[0]}" cy="${o[1]}" rx="${o[2]}" ry="${o[3]}" transform="rotate(${o[4]} ${o[0]} ${o[1]})"/>`).join("") +
          nodes.map((_, i) => { const n = L.nodes[i]; const mxp = (cx + n[0]) / 2, myp = (cy + n[1]) / 2 - 60; return `<path class="ln" pathLength="1" d="M${cx} ${cy} Q ${mxp} ${myp} ${n[0]} ${n[1]}"/>`; }).join("");
        nodes.forEach((nd, i) => { nd.style.left = `${L.nodes[i][0]}px`; nd.style.top = `${L.nodes[i][1]}px`; });
        const d = Math.min(devicePixelRatio || 1, 2);
        cvs.width = innerWidth * d; cvs.height = innerHeight * d;
        ctx?.setTransform(d, 0, 0, d, 0, 0);
        const R = rng(3);
        stars = Array.from({ length: mob ? 140 : 320 }, () => ({ x: R() * innerWidth, y: R() * innerHeight, z: 0.2 + R() * 0.8, l: R() < 0.12 }));
      };
      const total = nodes.length;
      list.push({
        el, tpl, enter: 0, moving: true, layout,
        run(p, t) {
          if (ctx) {
            const W = innerWidth, H = innerHeight, cx = W * (mob ? 0.5 : 0.39), cy = H * 0.5;
            ctx.clearRect(0, 0, W, H);
            const warp = 1 - eo(seg(p, 0, 0.22));
            for (const s of stars) {
              const dx = s.x - cx, dy = s.y - cy, k = 1 + warp * 1.2 * s.z;
              const x = cx + dx * k, y = cy + dy * k - p * 90 * s.z;
              const tw = RM ? 1 : 0.55 + 0.45 * Math.sin(t * 0.002 * s.z * 3 + s.x);
              ctx.globalAlpha = s.l ? 0.8 * tw : 0.65 * tw * s.z;
              ctx.strokeStyle = ctx.fillStyle = s.l ? accent : fg;
              if (warp > 0.02) {
                ctx.lineWidth = s.z * 1.6;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx * warp * 0.5 * s.z, y - dy * warp * 0.5 * s.z); ctx.stroke();
              } else {
                ctx.beginPath(); ctx.arc(x, y, s.z * 1.4, 0, 6.283); ctx.fill();
              }
            }
            ctx.globalAlpha = 1;
          }
          cv.style.opacity = String(seg(p, 0.12, 0.22));
          const lines = $$<SVGPathElement>(".ln", g), orbs = $$<SVGEllipseElement>(".orb", g);
          const step = total > 0 ? 0.5 / total : 0.1;
          let done = 0;
          lines.forEach((l, i) => {
            const s = 0.26 + i * step;
            l.style.strokeDashoffset = String(1 - eo(seg(p, s, s + 0.08)));
            const nd = nodes[i];
            nd.style.opacity = String(seg(p, s - 0.04, s));
            const ok = p > s + 0.08;
            nd.classList.toggle("done", ok);
            if (ok) done++;
          });
          logs.forEach((l, i) => { if (i > 0) l.classList.toggle("on", p > 0.22 + (i - 1) * step); });
          if (tasks) tasks.textContent = total && done === total ? "LIVE" : `${done} / ${total} TASKS`;
          const sec = Math.floor(p * 720);
          if (clock) clock.textContent = `T+${String((sec / 60) | 0).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
          orbs.forEach((o, i) => { const ob = L.orb[i]; o.setAttribute("transform", `rotate(${ob[4] + (RM ? 0 : t * 0.004 * (i ? 1 : -1)) + p * 40} ${ob[0]} ${ob[1]})`); });
          core.style.transform = `scale(${0.6 + 0.4 * back(seg(p, 0.14, 0.26))})`;
        },
      });
    }
  }

  /* ---------- hero: slide to send, the chat reply and the answer cards ---------- */
  const pill = hero && $(".pill", hero), knob = hero && $(".knob", hero);
  const lit = hero && $(".lit", hero), trail = hero && $(".trail", hero), bub = hero && $(".bubble", hero);
  const deck = hero ? $$(".dk", hero) : [];
  const fades = hero ? $$("[data-fade]", hero) : [];
  const airow = hero && $(".airow", hero), aitx = hero && $(".aitx", hero), aimu = hero && $(".aimu", hero);
  const cards = hero ? $$(".cards a", hero) : [];
  const cue = hero && $(".cue", hero);
  const aiA = hero?.dataset.a ?? "", aiB = hero?.dataset.b ?? "";

  function runHero(p: number) {
    if (!hero || !pill || !knob) return;
    const k = dragging ? heroK : eio(seg(p, 0, 0.34));
    heroK = k;
    const PW = mob ? 358 : 1312, KW = mob ? 76 : 160, pad = mob ? 12 : 30;
    const kx = PW - pad - KW - k * (PW - 2 * pad - KW);
    knob.style.left = `${kx}px`;
    knob.style.right = "auto";
    lit.style.clipPath = `inset(0 0 0 ${kx + KW / 2}px)`;
    trail.style.width = `${PW - kx}px`;
    const m = eio(seg(p, 0.36, 0.5));
    const tx = mob ? 40 : 164, ty = mob ? -65 : -112, sc = mob ? 0.6 : 0.42;
    pill.style.transform = `translate(${tx * m}px,${ty * m}px) scale(${1 - (1 - sc) * m})`;
    pill.style.opacity = String(1 - seg(p, 0.44, 0.5));
    const out = eio(seg(p, 0.32, 0.46));
    const D = mob ? { x: [214, 148, 82, 16], r: [9, 3, -3, -9], y: [18, 0, 6, 26] } : { x: [1010, 736, 462, 188], r: [8, 2.5, -2.5, -8], y: [30, 0, 10, 40] };
    const nd = deck.length;
    deck.forEach((d, i) => {
      const j = i + (4 - nd) / 2; // centre a deck of fewer than four
      const X0 = D.x[0] + (D.x[3] - D.x[0]) * (j / 3), R0 = D.r[0] + (D.r[3] - D.r[0]) * (j / 3), Y0 = D.y[Math.round(j)] ?? 0;
      const sp = (j - 1.5) * (mob ? 10 : 46) * k;
      const X = X0 + sp + mx * (mob ? 4 : 14) * (i + 1) / 2;
      const Y = Y0 - k * (mob ? 50 : 100) + my * (mob ? 4 : 10) * (i % 2 ? 1 : -1) + out * (700 + i * 90);
      d.style.transform = `translate(${X}px,${Y}px) rotate(${R0 * (1 + k * 0.6) + out * (j - 1.5) * 12}deg)`;
      d.style.opacity = String(1 - seg(p, 0.4, 0.48));
    });
    bub.style.opacity = String(seg(p, 0.45, 0.5));
    bub.style.transform = `scale(${0.92 + 0.08 * seg(p, 0.45, 0.52)})`;
    const fade = 1 - seg(p, 0.34, 0.42);
    fades.forEach((f) => {
      f.style.opacity = String(fade);
      f.style.visibility = fade < 0.02 ? "hidden" : "";
    });
    const a = seg(p, 0.5, 0.66);
    airow.style.opacity = String(seg(p, 0.5, 0.53));
    const n = Math.round(a * (aiA.length + aiB.length));
    aitx.textContent = aiA.slice(0, Math.min(n, aiA.length));
    aimu.textContent = n > aiA.length ? aiB.slice(0, n - aiA.length) : "";
    cards.forEach((c, i) => {
      const t = back(seg(p, 0.66 + i * 0.04, 0.76 + i * 0.04));
      c.style.opacity = String(cl(t * 1.5));
      c.style.transform = `translateY(${(1 - t) * 40}px)`;
      c.style.pointerEvents = t > 0.5 ? "" : "none";
    });
    cue.style.opacity = String(seg(p, 0.85, 0.92));
  }

  /* ---------- finale: the bad prompt is struck, the good one types out ---------- */
  const finq = fin && $(".fin-q", fin), good = fin && $(".good", fin), finh = fin && $(".fin-h", fin);
  const goodText = fin?.dataset.good ?? "";
  function runFin(p: number) {
    if (!fin) return;
    finq.style.setProperty("--x", String(eo(seg(p, 0.05, 0.2))));
    good.textContent = goodText.slice(0, Math.round(seg(p, 0.2, 0.7) * goodText.length));
    const h = seg(p, 0.72, 0.84);
    finh.style.opacity = String(h);
    finh.style.transform = `translateY(${(1 - h) * 30}px)`;
  }

  /* ---------- header mood ---------- */
  const moodOf = (el: El) => [el.dataset.hbg ?? "#0B0B0B", el.dataset.hfg ?? "#EFEDE8"];
  let mood = "";
  function frame(t = performance.now()) {
    if (!alive) return;
    if (hero && inView(hero)) runHero(prog(hero));
    for (const s of list) if (inView(s.el)) s.run(prog(s.el), t);
    if (fin && inView(fin)) runFin(prog(fin));
    let m = ["#0B0B0B", "#EFEDE8"];
    all.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.top <= 60 && r.bottom > 60) {
        m = moodOf(el);
        const sc = list.find((x) => x.el === el);
        if (sc && prog(el) < sc.enter && i > 0) m = moodOf(all[i - 1]);
      }
    });
    const inStory = all.some((el) => { const r = el.getBoundingClientRect(); return r.top <= 0 && r.bottom > 60; });
    top?.classList.toggle("solid", !inStory);
    const key = m.join();
    if (key !== mood) {
      mood = key;
      site.style.setProperty("--hbg", m[0]);
      site.style.setProperty("--hfg", m[1]);
    }
  }

  function layout() {
    mob = innerWidth < 760;
    CW = mob ? 390 : 1440;
    CH = mob ? 800 : 900;
    S = Math.min(innerWidth / CW, innerHeight / CH);
    document.documentElement.style.setProperty("--s", String(S));
    list.forEach((s) => s.layout?.());
    frame();
  }

  let ticking = false;
  on(window, "scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; frame(); });
  }, { passive: true });
  on(window, "resize", layout);
  on(window, "pointermove", ((e: PointerEvent) => { mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1; }) as EventListener, { passive: true });

  // Continuous motion only for what moves on its own (deck follows the pointer, cursors, stars).
  const loop = (t: number) => {
    if (!alive) return;
    if (!RM) {
      if (hero && inView(hero) && !dragging) runHero(prog(hero));
      for (const s of list) if (s.moving && inView(s.el)) s.run(prog(s.el), t);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* ---------- slide to send ---------- */
  if (hero && knob && pill) {
    const range = () => hero.offsetHeight - innerHeight;
    const send = () => scrollTo({ top: hero.offsetTop + 0.8 * range(), behavior: RM ? "auto" : "smooth" });
    // The whole pill is the slider: a finger anywhere on it drags the knob from where it is.
    on(pill, "pointerdown", ((e: PointerEvent) => {
      if (prog(hero) > 0.34 || e.button > 0) return;
      dragging = true;
      pill.setPointerCapture(e.pointerId);
      const pr = pill.getBoundingClientRect(), KW = knob.getBoundingClientRect().width, pad = (mob ? 12 : 30) * S;
      const span = pr.width - 2 * pad - KW, x0 = e.clientX, k0 = heroK;
      const onKnob = e.target instanceof Element && !!e.target.closest(".knob");
      let moved = false;
      const move = (ev: PointerEvent) => {
        if (Math.abs(ev.clientX - x0) > 4) moved = true;
        heroK = cl(k0 + (x0 - ev.clientX) / span);
        runHero(prog(hero));
      };
      const up = () => {
        dragging = false;
        pill.removeEventListener("pointermove", move);
        pill.removeEventListener("pointerup", up);
        pill.removeEventListener("pointercancel", up);
        // A drag past the middle sends; a plain tap on the knob sends too.
        if (heroK > 0.5 || (!moved && onKnob)) send();
        else { heroK = 0; runHero(prog(hero)); }
      };
      pill.addEventListener("pointermove", move);
      pill.addEventListener("pointerup", up);
      pill.addEventListener("pointercancel", up);
    }) as EventListener);
    on(knob, "click", ((e: MouseEvent) => { if (e.detail === 0) send(); }) as EventListener);
  }

  layout();
  return () => {
    alive = false;
    off.forEach((f) => f());
  };
}
