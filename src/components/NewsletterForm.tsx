"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribe, type SubscribeState } from "@/app/(site)/newsletter-actions";

export function NewsletterForm({ title, text }: { title: string; text: string }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  // Time the form appeared, for the server-side "submitted too fast" bot check.
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, [state]);

  return (
    <section className="grid gap-4 rounded-[20px] bg-forest p-6 text-[#eef1ec] sm:p-8" aria-labelledby="nl-title">
      <h2 id="nl-title" className="text-[26px] leading-tight font-extrabold text-balance">
        {title}
      </h2>
      {text && <p className="text-mint">{text}</p>}
      {state?.ok ? (
        <p className="rounded-xl bg-forest-2 p-4 font-bold text-lime" role="status">
          {state.message}
        </p>
      ) : (
        <form action={action} className="grid gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">כתובת מייל</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                dir="ltr"
                placeholder="you@email.com"
                className="h-12 w-full rounded-full bg-white px-5 text-start text-ink outline-none placeholder:text-muted focus:ring-3 focus:ring-lime"
              />
            </label>
            <button disabled={pending} className="h-12 rounded-full bg-lime px-6 font-extrabold text-ink disabled:opacity-60">
              {pending ? "שולח…" : "אני בפנים"}
            </button>
          </div>
          {/* Honeypot: hidden from people, bots fill it. */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          <input ref={startedAt} type="hidden" name="t" defaultValue="0" />
          <label className="flex items-start gap-2 text-[14px] text-mint">
            <input type="checkbox" name="consent" required className="mt-1 size-4 accent-lime" />
            <span>אני מסכים לקבל מ־ABREKOV מיילים על משאבים חדשים. אפשר לבטל בכל רגע.</span>
          </label>
          {state && !state.ok && (
            <p className="font-bold text-lime" role="alert">
              {state.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
