"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/(site)/waitlist-actions";
import { rowColors } from "@/lib/palette";

// One form for every list: a course waitlist, the /learn interest form, and the short inline
// version at the end of a guide. Colours come from the block it sits in (.wcard, .lr, .offer, .box).
export function WaitlistForm({
  list,
  consent,
  wishLabel,
  topics,
  button = "תשמור לי מקום",
  inline = false,
}: {
  list: string;
  consent: string;
  wishLabel?: string;
  topics?: { label: string; palette: string }[];
  button?: string;
  inline?: boolean;
}) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null);
  const id = useId();
  // Time the form appeared, for the server-side "submitted too fast" bot check.
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  if (state?.ok) {
    return (
      <p className="done" role="status">
        {state.message}
      </p>
    );
  }

  const name = (
    <label className="f" htmlFor={`${id}-n`}>
      {!inline && "איך קוראים לך?"}
      <input type="text" id={`${id}-n`} name="name" required maxLength={80} autoComplete="name" placeholder={inline ? "שם" : undefined} aria-label={inline ? "שם" : undefined} />
    </label>
  );
  const contact = (
    <label className="f" htmlFor={`${id}-c`}>
      {!inline && "וואטסאפ או מייל"}
      <input
        type="text"
        id={`${id}-c`}
        name="contact"
        required
        maxLength={120}
        dir="ltr"
        inputMode="email"
        autoComplete="email"
        placeholder={inline ? "וואטסאפ או מייל" : "050-1234567 / you@email.com"}
        aria-label={inline ? "וואטסאפ או מייל" : undefined}
        style={{ textAlign: "start" }}
      />
    </label>
  );

  return (
    <form action={action} className={`fm${inline ? " inline" : ""}`} aria-label="הרשמה">
      {topics && topics.length > 0 && (
        <>
          <div className="ql" id={`${id}-t`}>
            נושאים (אפשר כמה)
          </div>
          <div className="chips" role="group" aria-labelledby={`${id}-t`}>
            {topics.map((t) => {
              const c = rowColors(t.palette) as Record<string, string>;
              return (
                <label className="chip" key={t.label} style={{ "--c": c["--a"], "--ci": c["--ai"] } as React.CSSProperties}>
                  <input type="checkbox" name="topic" value={t.label} />
                  <span>
                    <i />
                    {t.label}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
      {inline ? (
        <div className="row2">
          {name}
          {contact}
          <button className="btn" disabled={pending}>
            {pending ? "שומר…" : button}
          </button>
        </div>
      ) : (
        <>
          {name}
          {contact}
        </>
      )}
      {!inline && wishLabel && (
        <label className="f" htmlFor={`${id}-w`}>
          <span>
            {wishLabel} <small>(לא חובה)</small>
          </span>
          <textarea id={`${id}-w`} name="wish" maxLength={400} rows={3} />
        </label>
      )}
      {/* Honeypot: hidden from people, bots fill it. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden style={{ display: "none" }} />
      <input ref={startedAt} type="hidden" name="t" defaultValue="0" />
      <input type="hidden" name="list" value={list} />
      <label className="ck">
        <input type="checkbox" name="consent" required />
        <span>{consent}</span>
      </label>
      {!inline && (
        <button className="btn" disabled={pending}>
          {pending ? "שומר…" : button}
        </button>
      )}
      {state && !state.ok && (
        <p className="err" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
