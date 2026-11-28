/* eslint-disable @next/next/no-img-element -- frames are small local or Supabase images, moved by the scroll engine */
import Link from "next/link";
import { ArrowIcon } from "../Icons";
import type { CSSProperties } from "react";
import { splitLines, splitParts, type HomeContent, type Scene } from "@/lib/home-schema";
import { palette, paletteVars } from "@/lib/palette";

// Markup of the home story. Pure server markup: the scroll engine (engine.ts) moves it in the browser.
// Every visible word comes from settings.home, edited in /admin/settings.

const n2 = (i: number) => String(i + 1).padStart(2, "0");
const isExternal = (href: string) => /^https?:/i.test(href);
const linkProps = (href: string) => (isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {});

function Q({ s, i, total, demo = "DEMO DATA" }: { s: Scene; i: number; total: number; demo?: string }) {
  return (
    <div className="q">
      <span className="m demo">{demo}</span>
      <span className="m">
        ANSWER {n2(i)} / {String(total).padStart(2, "0")}
      </span>
      <span className="p">{s.prompt}</span>
    </div>
  );
}

function Value({ s, className = "val" }: { s: Scene; className?: string }) {
  if (!s.value && !s.ctaLabel) return null;
  return (
    <div className={className}>
      <span className="m">THE VALUE</span>
      {s.value}
      {s.ctaLabel && s.ctaHref && (
        <>
          <br />
          <a className="glink" href={s.ctaHref} {...linkProps(s.ctaHref)}>
            {s.ctaLabel} ←
          </a>
        </>
      )}
    </div>
  );
}

function Fintech({ s, i, total }: { s: Scene; i: number; total: number }) {
  const [c1, c3, c4] = splitParts(s.items);
  return (
    <div className="stage">
      <div className="sbg" style={{ clipPath: "circle(0 at 72% 62%)" }} />
      <div className="cv" style={{ opacity: 0 }}>
        <Q s={s} i={i} total={total} />
        {s.title && <p className="hl F">{s.title}</p>}
        {s.big && (
          <div className={`big F${s.big.length > 7 ? " long" : ""}`} data-big={s.big}>
            {s.big}
          </div>
        )}
        {c1 && (
          <div className="oc o1 dark" data-fly="-520,120,-28" data-r="-8">
            <span className="m">{c1.length > 1 ? c1[0] : ""}</span>
            <div className="v">{c1.length > 1 ? c1[1] : c1[0]}</div>
            {c1[2] && <span className="m">{c1[2]}</span>}
          </div>
        )}
        <div className="oc o2 light" data-fly="0,520,18" data-r="4" aria-hidden>
          <span className="m">BALANCE · 6 MONTHS</span>
          <svg viewBox="0 0 280 90" preserveAspectRatio="none">
            <polyline pathLength={1} fill="none" style={{ stroke: "var(--softInk)", strokeDasharray: 1, strokeDashoffset: 1 }} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points="0,80 45,70 90,74 135,48 180,56 225,24 280,14" />
            <circle cx="225" cy="24" r="9" style={{ fill: "var(--bg)", stroke: "var(--softInk)" }} strokeWidth="3" />
          </svg>
        </div>
        {c3 && (
          <div className="oc o3 dark" data-fly="560,-60,30" data-r="7">
            <span>{c3.join(" ")}</span>
            <span className="tgl" aria-hidden />
          </div>
        )}
        {c4 && (
          <div className="oc o4 light" data-fly="300,460,-24" data-r="-5">
            <span className="m">{c4.length > 1 ? c4[0] : ""}</span>
            <div className="v">{c4.length > 1 ? c4[1] : c4[0]}</div>
          </div>
        )}
        <Value s={s} className="val hide-m" />
      </div>
    </div>
  );
}

function Timeline({ s, i, total }: { s: Scene; i: number; total: number }) {
  const frames = splitLines(s.images);
  const words = s.items.split(/\s+/).filter(Boolean);
  return (
    <div className="stage">
      <div className="sbg" style={{ transform: "translateY(100%)" }} />
      <div className="cv" style={{ opacity: 0 }}>
        <Q s={s} i={i} total={total} demo="DEMO" />
        <div className="tc F">00:00:00:00</div>
        <div className="strip" aria-hidden>
          {frames.map((f, j) => (
            <div className="fr" key={j}>
              <img src={f} alt="" loading="lazy" decoding="async" />
              <span className="n">{n2(j)}</span>
            </div>
          ))}
        </div>
        <div className="caps" aria-hidden>
          {words.map((w, j) => (
            <span key={j}>{w}</span>
          ))}
        </div>
        {s.items && <p className="sr">{s.items}</p>}
        <div className="wave" aria-hidden />
        <div className="head" aria-hidden />
        <div className="curs" aria-hidden />
        <Value s={s} />
      </div>
    </div>
  );
}

function Bento({ s, i, total }: { s: Scene; i: number; total: number }) {
  const rows = splitParts(s.items).slice(0, 4);
  return (
    <div className="stage">
      <div className="sbg" style={{ clipPath: "inset(50% 50% round 200px)" }} />
      <div className="cv" style={{ opacity: 0 }}>
        <Q s={s} i={i} total={total} />
        {s.value && (
          <div className="val">
            <span className="m">THE VALUE</span>
            <span>{s.value}</span>
          </div>
        )}
        <div className="bento">
          <div className="b bk b1">
            <span className="m">ANSWER {n2(i)}</span>
            <h3>{s.title}</h3>
          </div>
          <div className="b bv b2">
            <span className="m">ACTIVE STUDENTS</span>
            <div className="n" data-to={s.big}>
              {s.big}
            </div>
            <div className="avs" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="b slot b3 x-m" aria-hidden>
            <span className="m">+ MODULE</span>
            <div className="new">מודול חדש</div>
          </div>
          <div className="b bo b4" aria-hidden>
            <span className="m">REVENUE</span>
            <div className="n" style={{ fontSize: 44 }} data-to="₪48.2K">
              ₪48.2K
            </div>
            <div className="bars">
              <i style={{ height: "30%" }} />
              <i style={{ height: "52%" }} />
              <i className="k" style={{ height: "88%" }} />
            </div>
          </div>
          <div className="b bo b5 x-m" aria-hidden>
            <span className="m">REVENUE · 7 MONTHS</span>
            <div className="bars" style={{ height: 170 }}>
              {[30, 45, 38, 60, 52, 74, 96].map((h, j) => (
                <i key={j} className={j === 6 ? "k" : undefined} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="b bk b6">
            <span className="m">COURSES</span>
            <div className="crs" style={{ marginTop: 8 }}>
              {rows.map((r, j) => (
                <div key={j}>
                  <span>{r[0]}</span>
                  {r[1] && <span className="m">{r[1]}</span>}
                </div>
              ))}
            </div>
          </div>
          {s.ctaLabel && s.ctaHref ? (
            <a className="b bv b7" href={s.ctaHref} {...linkProps(s.ctaHref)} style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
              <span className="F" style={{ fontSize: 20 }}>
                {s.ctaLabel} ←
              </span>
            </a>
          ) : (
            <div className="b bv b7" style={{ display: "grid", placeItems: "center" }} aria-hidden>
              <span className="F" style={{ fontSize: 22 }}>
                תשלום ←
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Agent({ s, i, total }: { s: Scene; i: number; total: number }) {
  const tasks = splitLines(s.items).slice(0, 5);
  const title = s.title.split("\n");
  const last = title.length > 1 ? title.pop() : "";
  return (
    <div className="stage">
      <canvas className="stars" aria-hidden />
      <div className="cv" style={{ opacity: 0 }}>
        <Q s={s} i={i} total={total} demo="DEMO" />
        <svg className="graph" aria-hidden />
        <div className="core">
          <div>
            <b>{s.big}</b>
            <span className="ltr tasks">0 / {tasks.length} TASKS</span>
          </div>
        </div>
        {tasks.map((t, j) => (
          <div className="node" key={j}>
            <i />
            {t}
          </div>
        ))}
        <div className="log" aria-hidden>
          <div className="mission on">
            <span className="w">MISSION · DEMO</span>
            <span className="clock">T+00:00</span>
          </div>
          <div>
            <span className="w">
              agent.run(&quot;<bdi>{s.prompt}</bdi>&quot;)
            </span>
          </div>
          {tasks.map((t, j) => (
            <div key={j}>
              <b>✓</b> <bdi>{t}</bdi>
            </div>
          ))}
        </div>
        {s.title && (
          <h2 className="hl F">
            {title.map((l, j) => (
              <span key={j}>
                {l}
                <br />
              </span>
            ))}
            {last && <em>{last}</em>}
          </h2>
        )}
        {s.ctaLabel && s.ctaHref && (
          <a className="wl" href={s.ctaHref} {...linkProps(s.ctaHref)}>
            {s.ctaLabel} ←
          </a>
        )}
        {s.value && <p className="val">{s.value}</p>}
      </div>
    </div>
  );
}

const TEMPLATE = { fintech: Fintech, timeline: Timeline, bento: Bento, agent: Agent };

function DeckCard({ s, i }: { s: Scene; i: number }) {
  const head = (
    <span className="m">
      ANSWER {n2(i)} · {s.template === "fintech" ? "APP" : s.template === "timeline" ? "VIDEO" : s.template === "bento" ? "PLATFORM" : "AGENT"}
    </span>
  );
  const style = { ...paletteVars(s.palette), zIndex: 4 - i } as CSSProperties;
  if (s.template === "timeline") {
    return (
      <div className="dk t-timeline" style={style}>
        {head}
        <div className="reel">
          {splitLines(s.images)
            .slice(0, 3)
            .map((f, j) => (
              <img key={j} src={f} alt="" />
            ))}
        </div>
        <b style={{ fontSize: ".62em" }}>{s.big}</b>
      </div>
    );
  }
  if (s.template === "bento") {
    return (
      <div className="dk t-bento" style={style}>
        {head}
        <div className="mini">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }
  if (s.template === "agent") {
    return (
      <div className="dk t-agent" style={style}>
        {head}
        <div className="orbc">{s.big}</div>
        <span className="m ltr">
          {splitLines(s.items).length} / {splitLines(s.items).length} TASKS
        </span>
      </div>
    );
  }
  return (
    <div className="dk t-fintech" style={style}>
      {head}
      <b>{s.big}</b>
    </div>
  );
}

export function Story({ home }: { home: HomeContent }) {
  const scenes = home.scenes.filter((s) => s.enabled);
  const total = scenes.length;
  const ink = { "data-hbg": "#0B0B0B", "data-hfg": "#EFEDE8" };
  // The first sentence of the lead is the page headline.
  const cut = home.lead.indexOf(". ");
  const lead = cut > 0 ? { head: home.lead.slice(0, cut + 1), rest: home.lead.slice(cut + 2) } : { head: "", rest: home.lead };
  return (
    <>
      <section className="s-hero" data-hero data-a={home.aiReply} data-b={home.aiNote} {...ink} aria-label="פתיח">
        <div className="stage">
          <div className="cv">
            <div className="pill">
              <div className="trail" />
              <div className="t dim" aria-hidden>
                {home.prompt}
              </div>
              <div className="t lit" aria-hidden>
                {home.prompt}
              </div>
              <button type="button" className="knob" aria-label={`שלח את הפרומפט: ${home.prompt}`}>
                <ArrowIcon />
              </button>
            </div>
            <div className="under" data-fade>
              <h1 className="sr">{lead.head || home.lead}</h1>
              <p>
                {lead.head && <b>{lead.head}</b>} {lead.rest}
              </p>
              {home.hint && (
                <span className="hint">
                  <span className="chev" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  {home.hint}
                </span>
              )}
            </div>
            {home.skipLabel && (
              <Link className="skip" href="/resources" data-fade>
                {home.skipLabel} <span className="ltr">←</span>
              </Link>
            )}
            <div className="deck" aria-hidden>
              {scenes.slice(0, 4).map((s, i) => (
                <DeckCard key={s.id} s={s} i={i} />
              ))}
            </div>
            <div className="bubble" aria-hidden>
              {home.prompt}
            </div>
            <div className="airow" aria-hidden>
              <span className="av">
                <i />
              </span>
              <div className="tx">
                <span className="aitx" />
                <br />
                <span className="mu aimu" />
              </div>
            </div>
            <p className="sr">
              {home.aiReply} {home.aiNote}
            </p>
            <div className="cards">
              {scenes.map((s, i) => (
                <a key={s.id} href={`#s-${s.id}`} style={{ opacity: 0 }}>
                  <i style={{ background: palette(s.palette).dot }} />
                  <b>{s.name}</b>
                  <span className="m">ANSWER {n2(i)}</span>
                </a>
              ))}
            </div>
            <span className="cue m" aria-hidden>
              SCROLL THROUGH THE ANSWERS ↓
            </span>
          </div>
        </div>
      </section>

      {scenes.map((s, i) => {
        const T = TEMPLATE[s.template];
        const p = palette(s.palette);
        return (
          <section
            key={s.id}
            id={`s-${s.id}`}
            className={`sc t-${s.template}`}
            data-tpl={s.template}
            data-dur={s.template === "timeline" ? s.big : undefined}
            data-hbg={p.bg}
            data-hfg={p.fg}
            // The scene arrives on the colour the previous one ended on, so no black frame shows between them.
            style={{ ...paletteVars(s.palette), "--prev": i ? palette(scenes[i - 1].palette).bg : "#0B0B0B" } as CSSProperties}
            aria-label={s.name || s.prompt}
          >
            <T s={s} i={i} total={total} />
          </section>
        );
      })}

      <section className="s-fin" data-fin data-good={home.finalePrompt} {...ink} aria-label="פרומפט טוב">
        <div className="stage">
          <div className="cv">
            <span className="fin-q">{home.prompt}</span>
            <div className="fin-col">
              <div className="fin-box">
                <div className="tx">
                  <span className="good" />
                  <span className="caret" />
                  <span className="sr">{home.finalePrompt}</span>
                </div>
                <div className="frow">
                  <span className="m">PROMPT 002 · WITH CONTEXT</span>
                  <span className="send" aria-hidden>
                    <ArrowIcon />
                  </span>
                </div>
              </div>
              <div className="fin-h">
                <div>
                  <h2 className="F">{home.finaleTitle}</h2>
                  <div className="dots4" aria-hidden>
                    {scenes.map((s) => (
                      <i key={s.id} style={{ background: palette(s.palette).dot }} />
                    ))}
                  </div>
                </div>
                <div className="ctas">
                  <Link className="btn solid" href="/resources">
                    לכל המדריכים
                  </Link>
                  <Link className="btn" href="/learn">
                    ללמוד עוד
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
