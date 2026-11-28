"use client";

import { useActionState, useEffect, useRef } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/(site)/waitlist-actions";

const field =
  "w-full rounded-2xl bg-white px-5 text-ink outline-none placeholder:text-muted focus:ring-3 focus:ring-lime";

export function WaitlistForm({ list, wishLabel, consent }: { list: string; wishLabel: string; consent: string }) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null);
  // Time the form appeared, for the server-side "submitted too fast" bot check.
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  if (state?.ok) {
    return (
      <p className="rounded-[20px] bg-forest p-6 text-[20px] font-extrabold text-lime" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4 rounded-[20px] bg-forest p-6 text-[#eef1ec] sm:p-8" aria-label="הרשמה לרשימת ההמתנה">
      <label className="grid gap-1.5">
        <span className="font-bold">איך קוראים לך?</span>
        <input name="name" required maxLength={80} autoComplete="name" className={`${field} h-12`} />
      </label>
      <label className="grid gap-1.5">
        <span className="font-bold">וואטסאפ או מייל</span>
        <input
          name="contact"
          required
          maxLength={120}
          dir="ltr"
          inputMode="email"
          placeholder="050-1234567 / you@email.com"
          className={`${field} h-12 text-start`}
        />
      </label>
      <label className="grid gap-1.5">
        <span className="font-bold">
          {wishLabel} <span className="font-normal text-mint">(לא חובה)</span>
        </span>
        <textarea name="wish" maxLength={500} rows={3} className={`${field} py-3`} />
      </label>
      {/* Honeypot: hidden from people, bots fill it. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <input ref={startedAt} type="hidden" name="t" defaultValue="0" />
      <input type="hidden" name="list" value={list} />
      <label className="flex items-start gap-2 text-[14px] text-mint">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-lime" />
        <span>{consent}</span>
      </label>
      <button disabled={pending} className="h-13 rounded-full bg-lime px-6 text-[18px] font-extrabold text-ink disabled:opacity-60">
        {pending ? "שומר…" : "תשמור לי מקום"}
      </button>
      {state && !state.ok && (
        <p className="font-bold text-lime" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
