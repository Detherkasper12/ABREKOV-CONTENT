"use client";

import { useActionState, useState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null);
  // Controlled, because React resets uncontrolled fields after every form action.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-[14px] font-bold">אימייל</span>
        <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" dir="ltr" className="field text-start" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[14px] font-bold">סיסמה</span>
        <input name="password" type="password" required autoComplete="current-password" dir="ltr" className="field text-start" />
      </label>
      {state?.error && (
        <p role="alert" className="font-bold text-danger">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn-primary h-11">
        {pending ? "נכנס…" : "כניסה"}
      </button>
    </form>
  );
}
