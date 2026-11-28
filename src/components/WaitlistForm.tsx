"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { joinWaitlist, type WaitlistField, type WaitlistState } from "@/app/(site)/waitlist-actions";
import { rowColors } from "@/lib/palette";

// One form for every list: a course waitlist, the /learn interest form, and the short inline
// version at the end of a guide. Colours come from the block it sits in (.wcard, .lr, .offer, .box).
// Every field has a visible label above it. An error shows under the field it is about, and what
// the person typed stays in the form.
export function WaitlistForm({
  list,
  consent,
  wishLabel,
  topics,
  button = "לשמור לי מקום",
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
  // After a failed send, move focus to the field that needs fixing.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state && !state.ok && state.field) formRef.current?.querySelector<HTMLElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <p className="done" role="status">
        {state.message}
      </p>
    );
  }

  const v = state?.values;
  const bad = (f: WaitlistField) => !!state && !state.ok && state.field === f;
  const errId = `${id}-e`;
  const fieldProps = (f: WaitlistField) => (bad(f) ? { "aria-invalid": true, "aria-describedby": errId } : {});
  const fieldError = (f: WaitlistField) =>
    bad(f) ? (
      <span className="fe" id={errId} role="alert">
        {state!.message}
      </span>
    ) : null;

  const name = (
    <label className="f" htmlFor={`${id}-n`}>
      <span className="lb">{inline ? "שם" : "איך קוראים לך?"}</span>
      <input type="text" id={`${id}-n`} name="name" required maxLength={80} autoComplete="name" defaultValue={v?.name} {...fieldProps("name")} />
      {fieldError("name")}
    </label>
  );
  const contact = (
    <label className="f" htmlFor={`${id}-c`}>
      <span className="lb">וואטסאפ או מייל</span>
      <input
        type="text"
        id={`${id}-c`}
        name="contact"
        required
        maxLength={120}
        dir="ltr"
        inputMode="email"
        autoComplete="email"
        placeholder="050-1234567 / you@email.com"
        defaultValue={v?.contact}
        style={{ textAlign: "start" }}
        {...fieldProps("contact")}
      />
      {fieldError("contact")}
    </label>
  );
  const submit = (
    <button className="btn" disabled={pending} aria-busy={pending}>
      {pending ? "שומר…" : button}
    </button>
  );

  return (
    <form ref={formRef} action={action} className={`fm${inline ? " inline" : ""}`} aria-label="הרשמה">
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
                  <input type="checkbox" name="topic" value={t.label} defaultChecked={v?.topics.includes(t.label)} />
                  <span>
                    <i aria-hidden />
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
          {submit}
        </div>
      ) : (
        <>
          {name}
          {contact}
        </>
      )}
      {!inline && wishLabel && (
        <label className="f" htmlFor={`${id}-w`}>
          <span className="lb">
            {wishLabel} <small>(לא חובה)</small>
          </span>
          <textarea id={`${id}-w`} name="wish" maxLength={400} rows={3} defaultValue={v?.wish} {...fieldProps("wish")} />
          {fieldError("wish")}
        </label>
      )}
      {/* Honeypot: hidden from people, bots fill it. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden style={{ display: "none" }} />
      <input ref={startedAt} type="hidden" name="t" defaultValue="0" />
      <input type="hidden" name="list" value={list} />
      <label className="ck">
        <input type="checkbox" name="consent" required {...fieldProps("consent")} />
        <span>{consent}</span>
      </label>
      {fieldError("consent")}
      {!inline && submit}
      {state && !state.ok && !state.field && (
        <p className="err" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
